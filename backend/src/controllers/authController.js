require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const sendEmail = require("../utils/nodemailer");
const asyncHandler = require("../utils/asyncHandler");

const registerUser = asyncHandler(async function registerUser(req, res) {
  const { username, email, password } = req.body;

  //Fields Check
  if (!username || !email || !password) {
    throw new AppError("All fields required", 400);
  }
  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new AppError("User already exists", 409);
  }

  const user = new User({
    username,
    email,
    password, //Plain psw (hashing will be done in UserModel)
  });

  const token = crypto.randomBytes(32).toString("hex");

  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + (24 * 60 * 60 * 1000); //24hr

  const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  await user.save();

  await sendEmail({
    to: user.email,
    subject: "NexusChat Verification url",
    html: `
        <h2>Welcome to NexusChat"</h2>
        <p>Click below to verify your Email : </p><br>
        <a href="${verifyUrl}">Verify Email</a>
        `,
  });

  res.status(201).json({
    success: true,
    message: "User registered. Please verify your Email.",
  });
});

const loginUser = asyncHandler(async function loginUser(req, res) {
  const { userOrEmail, password } = req.body;

  if (!userOrEmail || !password) {
    throw new AppError("Invalid Credentials", 401);
  }

  const user = await User.findOne({
    $or: [{ username: userOrEmail }, { email: userOrEmail }],
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Email not verified", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid Credentials", 401);
  }

  const token = generateToken({ userId: user._id, username: user.username });

  res.status(200).json({
    success : true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});


async function verifyEmail(req,res){
  const {token} = req.query;

  const user =  await User.findOne({
    emailVerificationToken : token,
    emailVerificationExpires : {$gt : Date.now()}
  });

  if(!user){
    throw new AppError("Link Expired...",400);
  }

  user.isVerified = true;
  user.emailVerificationExpires = undefined;
  user.emailVerificationToken = undefined;

  await user.save();

  res.status(200).json({
    success : true,
    message : "Email verified successFully"
  });
}


module.exports = { registerUser, loginUser, verifyEmail};
