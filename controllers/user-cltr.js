const userCltr = {};
const { validationResult } = require("express-validator");
const _ = require("lodash");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.G_MAIL,
    pass: process.env.G_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log(success, "ready for messages");
  }
});

userCltr.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const body = _.pick(req.body, [
    "firstName",
    "lastName",
    "email",
    "password",
    "mobileNum",
    "role",
  ]);
  try {
    const user = new User(body);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    const existingUser = await User.countDocuments();
    if (existingUser == 0) {
      user.role = "admin";
    }
    const savedUser = await user.save();
    // encrypt the userid and generate token and send as params when sending the mail
    const tokenData = { id: savedUser._id };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    transporter.sendMail({
      from: process.env.G_EMAIL, // sender address
      to: `${user.email}`, // list of receivers
      subject: "Verification Email", // Subject line
      text: "Hello! Welcome to our website.", // plain text body
      html: `<a href='http://localhost:5050/og/verifyEmail/${token}'>Click here to verify your email.</a>`,
    });
    res.json({
      msg: "Registraction Sucessful, to activate your account please check your mail and click on verification link.",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

userCltr.verify = async (req, res) => {
  const token = req.params.token;
  let id;
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    id = tokenData.id;
  } catch (error) {
    res.status(400).send("Sorry verification failed");
  }
  try {
    const user = await User.findByIdAndUpdate(id, { isVerified: true });
    res.redirect("http://localhost:5173/bid");
    // res.json({ msg: "verification confirmed" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

userCltr.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const body = _.pick(req.body, ["email", "password"]);
  try {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: "invalid email or password" }] });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        errors: [
          { msg: "Email not verified,please verify email before login" },
        ],
      });
    }
    const result = bcrypt.compare(body.password, user.password);
    if (!result) {
      return res
        .status(400)
        .json({ errors: [{ msg: "invalid email or password" }] });
    }
    const tokenData = { id: user._id, role: user.role };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token: `Bearer ${token}` });
  } catch (error) {
    res.status(500).json({ error });
  }
};

userCltr.account = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await User.findById({ _id: id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
};

userCltr.role = async (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["role"]);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findByIdAndUpdate(id, { role: body.role });
    res.json({ msg: "role updated" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
userCltr.edit = async (req, res) => {
  const id = req.user.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const body = _.pick(req.body, [
    "firstName",
    "lastName",
    "email",
    "mobileNum",
  ]);
  try {
    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
};
module.exports = userCltr;
