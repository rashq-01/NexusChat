require("dotenv").config();
const verifyToken = require("../utils/verifyToken");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

asyncHandler(async function authMiddleware(req, res, next) {
  // Extraction of header
  const header = req.headers.authorization;

  //Checking of header
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  // token spliting
  const token = header.split(" ")[1];

  //Verification of token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new AppError("Unauthorized", 401);
  }

  // Fetching user detail
  const user = await User.findById(decoded.userId);

  // Checking user Exists or not
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  // Attaching user info to req
  req.user = user;

  // Continue
  next();
});

module.exports = authMiddleware;
