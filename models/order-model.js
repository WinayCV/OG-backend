const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    artwork: {
      type: Schema.Types.ObjectId,
      ref: 'Artwork',
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    payment: String,
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'fullfiled'],
    },
  },
  {timestamps: true}
);
const Order = model('Order', orderSchema);

module.exports = Order;
