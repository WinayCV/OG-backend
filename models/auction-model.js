const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bidSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    artwork: {
      type: Schema.Types.ObjectId,
      ref: "Artwork",
    },
    amount: Number,
  },
  { timestamps: true }
);

const auctionSchema = new Schema(
  {
    artist: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    artworks: [{ type: Schema.Types.ObjectId, ref: "Artwork" }],
    auctionStart: Date,
    auctionEnd: Date,
    auctionType: {
      type: String,
      enum: ["live", "regular"],
    },
    bids: [bidSchema],
  },
  { timestamps: true }
);

const Auction = model("Auction", auctionSchema);

module.exports = Auction;
