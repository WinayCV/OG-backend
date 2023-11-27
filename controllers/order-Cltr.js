const {validationResult} = require('express-validator');
const _ = require('lodash');
const Order = require('../models/order-model');
const Address = require('../models/address-model');
const Artwork = require('../models/artwork-model');
const orderCltr = {};

orderCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  const orderDetails = req.body; // Assuming the request body contains an array of order details

  try {
    const createdOrders = await Promise.all(
      orderDetails.map(async (orderDetail) => {
        const addressInfo = await Address.findOne({
          user: orderDetail.user,
        });
        const order = new Order(orderDetail);
        order.address = addressInfo;
        order.buyer = orderDetail.user;
        order.payment = orderDetail.amount;
        const artwork = await Artwork.findByIdAndUpdate(
          {
            _id: orderDetail.artwork,
          },
          {status: 'sold'},
          {new: true, runValidators: true}
        );
        return await order.save();
      })
    );

    res.json({msg: 'Order has been created', order: createdOrders});
  } catch (error) {
    res.status(500).json({error});
  }
};

module.exports = orderCltr;
