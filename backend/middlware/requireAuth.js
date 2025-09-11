const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { AUTHORIZATION_REQUIRED } = require("../constants/errors");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: AUTHORIZATION_REQUIRED });

  const token = authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: AUTHORIZATION_REQUIRED });

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id }).select("_id");
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: AUTHORIZATION_REQUIRED });
  }
};

module.exports = requireAuth;
