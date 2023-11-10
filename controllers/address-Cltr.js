const { validationResult } = require("express-validator");
const _ = require("lodash");
const Address = require("../models/address-model");

const addressCltr = {};

addressCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const body = _.pick(req.body, ["address"]);
  try {
    const address = new Address(body);
    address.user = req.user.id;
    await address.save();
    res.json({ msg: "Address saved sucessfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

addressCltr.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const address = await Address.findByIdAndDelete(id);
    res.json({ msg: "Address deleted sucessfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

addressCltr.list = async (req, res) => {
  const user = req.user.id;
  try {
    const address = await Address.find({ user: user });
    res.json(address);
  } catch (error) {
    res.json(500).json({ error });
  }
};

module.exports = addressCltr;
