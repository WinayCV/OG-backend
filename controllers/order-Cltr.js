const {validationResult} = require('express-validator');
const _ = require('lodash');
const Order = require('../models/order-model');
const Address = require('../models/address-model');
const Artwork = require('../models/artwork-model');
const Auction = require('../models/auction-model');

const orderCltr = {};

orderCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  const id = req.body.artworkId;

  try {
    const order = new Order();
    const addressInfo = await Address.findOne({
      user: req.user.id,
    });
    order.address = addressInfo;

    const auction = await Auction.findOne({'bids.artwork': id});

    if (auction) {
      const bidsForArtwork = auction.bids.filter((bid) => {
        if (bid.artwork == id) {
          return bid;
        }
      });
      bidsForArtwork.sort((a, b) => b.amount - a.amount); // Sort in descending order
      const highestBid = bidsForArtwork[0]; // Highest bid will be the first element
      console.log(highestBid);
      order.buyer = highestBid.user;
      order.artwork = highestBid.artwork;
      order.payment = highestBid.amount;
      // const artwork = await Artwork.findByIdAndUpdate(
      //   {
      //     _id: highestBid.artwork,
      //   },
      //   {status: 'sold'},
      //   {new: true, runValidators: true}
      // );
      // await order.save();
      res.json({msg: 'Order created', order});
    }
  } catch (error) {
    res.status(500).json({error});
  }
};

module.exports = orderCltr;
