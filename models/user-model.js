const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const userSchmea = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    mobileNum: Number,
    credit: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["admin", "artist", "user"],
      default: "user",
    },
    myBids: {
      type: [Schema.Types.ObjectId],
      ref: "Auction",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = model("User", userSchmea);

module.exports = User;
