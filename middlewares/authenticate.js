const _ = require("lodash");
const jwt = require("jsonwebtoken");
const authenticateUser = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) {
    return res.status(400).json({ error: { msg: "authentication failed" } });
  }
  token = token.split(" ")[1];
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = _.pick(tokenData, ["id", "role"]);
    next();
  } catch (error) {
    res.status(500).json({ error });
  }
};

const authorizeUser = (roles) => {
  return function (req, res, next) {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res
        .status(403)
        .json({ error: "you are not permitted to access this route" });
    }
  };
};

module.exports = { authenticateUser, authorizeUser };
