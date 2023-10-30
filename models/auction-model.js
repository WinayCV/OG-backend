const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bidSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: Number,
  },
  { timestamps: ture }
);

const auctionSchema = new Schema(
  {
    artist: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    artwork: {
      type: Schema.Types.ObjectId,
      ref: "Artwork",
    },
    isLive: { type: Boolean, default: false },
    startingBid: Number,
    currentBid: Number,
    auctionStart: Date,
    auctionEnd: Date,
    bids: [bidSchema],
  },
  { timestamps: true }
);

const Auction = model("Auction", auctionSchema);

module.exports = Auction;
