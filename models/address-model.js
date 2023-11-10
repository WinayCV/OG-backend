const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const addressSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  address: String,
});

const Address = model("Address", addressSchema);

module.exports = Address;
