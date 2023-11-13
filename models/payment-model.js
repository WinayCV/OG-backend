const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: Number,
    method: String,
    transactionId: String,
    status: String,
  },
  {timestamps: true}
);
const Payment = model('Payment', paymentSchema);

module.exports = Payment;
