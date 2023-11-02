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
module.exports = auctionCltr;
