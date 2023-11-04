const { validationResult } = require("express-validator");
const _ = require("lodash");
const Auction = require("../models/auction-model");
const Artwork = require("../models/artwork-model");

const auctionCltr = {};

auctionCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const body = _.pick(req.body, [
    "auctionEnd",
    "auctionStart",
    "auctionType",
    "artworks",
  ]);
  try {
    body.artist = req.user.id;
    const auction = new Auction(body);
    auction.artworks.map(async (artworkId) => {
      const artwork = await Artwork.findOneAndUpdate(
        { _id: artworkId },
        { $set: { auction: auction._id } },
        { new: true, runValidators: true }
      );
    });
    await auction.save();
    res.json({ msg: "auction has been created", auction });
  } catch (error) {
    res.status(500).json({ error });
  }
};

auctionCltr.delete = async (req, res) => {
  const auctionId = req.params.id;
  try {
    const artwork = await Auction.findOneAndDelete({ _id: auctionId });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error });
  }
};
auctionCltr.edit = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ error });
  }
};

auctionCltr.bid = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const artworkId = req.params.id;
  const userId = req.user.id;
  const body = _.pick(req.body, ["amount"]);
  const bid = [body];
  try {
    body.user = userId;
    body.artwork = artworkId;
    const artwork = await Artwork.findOne({ _id: artworkId });
    if (artwork.currentBidAmount >= parseInt(body.amount)) {
      return res.status(400).json({
        error: {
          masg: "Bid amount is less than current bid,please verify your your bid amount",
        },
      });
    }
    await Artwork.findOneAndUpdate(
      { _id: artworkId },
      { $set: { currentBidAmount: body.amount } },
      { new: true, runValidators: true }
    );
    const auction = await Auction.findOneAndUpdate(
      {
        artworks: { $in: [artworkId] },
      },
      { $push: { bids: bid } },
      { new: true, runValidators: true }
    );
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error });
  }
};
auctionCltr.getBid = async (req, res) => {
  const userId = req.user.id;
  try {
    const auction = await Auction.findOne({
      bids: { $elemMatch: { user: userId } },
    });
    const bids = auction.bids.filter((bid) => {
      return bid.user == userId;
    });
    res.json(bids);
  } catch (error) {
    res.status(500).json([{ error }]);
  }
};
module.exports = auctionCltr;
