const {validationResult} = require('express-validator');
const _ = require('lodash');
const Order = require('../models/order-model');
const orderCltr = {};

orderCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  // create first in the frontend
  const body = _.pick(req.body, ['buyer', 'artwork', 'address']);
  const order = new Order(body);
  try {
    res.json(order);
  } catch (error) {
    res.status(500).json({error});
  }
};

module.exports = orderCltr;
