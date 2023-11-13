const Payment = require('../models/payment-model');
const _ = require('lodash');
const User = require('../models/user-model');

const paymentCltr = {};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

paymentCltr.create = async (req, res) => {
  const body = _.pick(req.body, ['amount']);
  try {
    console.log(body);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'credits',
            },
            unit_amount: parseInt(body.amount) * 100,
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    const payment = new Payment();
    payment.userId = req.user.id;
    payment.amount = body.amount;
    payment.method = 'card';
    payment.transactionId = session.id;
    payment.status = 'pending';
    const paymentDoc = await payment.save();

    res.json({url: session.url, id: session.id});
  } catch (error) {
    res.status(500).json({error});
  }
};

paymentCltr.update = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedDoc = await Payment.findOneAndUpdate(
      {
        transactionId: id,
      },
      {status: 'paid'},
      {new: true}
    );
    // const user = await User.
    res.json({data: updatedDoc});
  } catch (error) {
    res.status(500).json({error});
  }
};

module.exports = paymentCltr;
