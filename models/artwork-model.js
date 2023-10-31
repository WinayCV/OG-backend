const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const artworkSchema = new Schema({
  title: String,
  description: String,
  images: [{ url: String, key: String }],
  artist: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  searchTag: [{ name: String }],
  status: {
    type: String,
    enum: ["active", "sold"],
    default: "active",
  },
  currentBidAmount: { type: Number, default: 0 },
  startingBidAmount: Number,
  auction: {
    type: Schema.Types.ObjectId,
    ref: "Auction",
  },
});

const Artwork = model("Artwork", artworkSchema);

module.exports = Artwork;
