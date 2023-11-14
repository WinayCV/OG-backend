const {validationResult} = require('express-validator');
const _ = require('lodash');
const Auction = require('../models/auction-model');
const Artwork = require('../models/artwork-model');
const User = require('../models/user-model');

const auctionCltr = {};

auctionCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  const body = _.pick(req.body, [
    'auctionEnd',
    'auctionStart',
    'auctionType',
    'artworks',
  ]);
  try {
    let errorsArray = [];
    body.artist = req.user.id;
    const auction = new Auction(body);
    // here i dont have to push the auction id to the artworks
    // adding auction Id to the artworks
    auction.artworks.map(async (artworkId) => {
      const artwork = await Artwork.findOneAndUpdate(
        {_id: artworkId},
        {$set: {auction: auction._id}},
        {new: true, runValidators: true}
      );
    });
    const newAuction = await auction.save();
    const result = await Auction.findOne({
      _id: newAuction._id,
    }).populate('artworks');
    res.json({msg: 'auction has been created', result});
  } catch (error) {
    res.status(500).json({error});
  }
};

auctionCltr.delete = async (req, res) => {
  const auctionId = req.params.id;
  try {
    const artwork = await Auction.findOneAndDelete({_id: auctionId});
    res.json(artwork);
  } catch (error) {
    res.status(500).json({error});
  }
};
auctionCltr.edit = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({error});
  }
};

auctionCltr.bid = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  const artworkId = req.params.id;
  const userId = req.user.id;
  const body = _.pick(req.body, ['amount']);
  const bid = [body];
  try {
    body.user = userId;
    body.artwork = artworkId;
    const artwork = await Artwork.findOne({_id: artworkId});

    if (artwork.currentBidAmount >= parseInt(body.amount)) {
      return res.status(400).json({
        errors: [
          {
            msg: 'Bid amount is less than current bid,please verify your your bid amount',
          },
        ],
      });
    }
    const user = await User.findOne({_id: userId});
    if (user.credit < parseInt(body.amount)) {
      return res.status(400).json({
        errors: [
          {
            msg: 'You dont have enough credit to bid, please buy more credit',
          },
        ],
      });
    }
    await Artwork.findOneAndUpdate(
      {_id: artworkId},
      {$set: {currentBidAmount: body.amount}},
      {new: true, runValidators: true}
    );
    // im finding auction based on artworkID
    const auction = await Auction.findOneAndUpdate(
      {
        artworks: {$in: [artworkId]},
      },
      {$push: {bids: bid}},
      {new: true, runValidators: true}
    ).populate('artworks');
    // here debit the credit from the guy who bids
    const updatedUser = await User.findOneAndUpdate(
      {_id: userId},
      {$inc: {credit: -body.amount}},
      {new: true} // Return the updated document
    );

    // here credit back the amount to the guy who got out bided
    const result = await Auction.findOne({
      artworks: artworkId,
    }).populate('artworks');
    if (result) {
      const bids = result.bids;
      const secondLastBid =
        bids.length >= 2 ? bids[bids.length - 2] : null;
      if (secondLastBid) {
        const refundAmount = secondLastBid.amount;
        const refundUser = secondLastBid.user;
        const updatedUser = await User.findOneAndUpdate(
          {_id: refundUser},
          {$inc: {credit: refundAmount}},
          {new: true} // Return the updated document
        );
      }
    }

    res.json({auction, updatedUser});
  } catch (error) {
    res.status(500).json({error});
  }
};
auctionCltr.getBid = async (req, res) => {
  const userId = req.user.id;
  try {
    const auction = await Auction.findOne({
      bids: {$elemMatch: {user: userId}},
    });
    const bids = auction.bids.filter((bid) => {
      return bid.user == userId;
    });
    res.json(bids);
  } catch (error) {
    res.status(500).json([{error}]);
  }
};

//to get all auction
auctionCltr.active = async (req, res) => {
  try {
    const artworks = [];
    const auctions = await Auction.find({
      auctionEnd: {$gte: new Date()},
    }).populate('artworks');
    const artwork = await auctions.map((auction) => {
      return auction.artworks;
    });

    const result = artwork.flat().map((ele) => {
      const result = auctions.find(
        (auction) => toString(auction._id) === toString(ele.auction)
      );
      if (result) {
        return {...ele._doc, type: result.auctionType};
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({error});
  }
};
module.exports = auctionCltr;
