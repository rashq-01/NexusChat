require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const sendEmail = require("../utils/nodemailer");
const asyncHandler = require("../utils/asyncHandler");

const registerUser = asyncHandler(async function registerUser(req, res) {
  const { firstName,lastName,username, email, password } = req.body;

  //Fields Check
  if (!firstName || !lastName || !username || !email || !password) {
    throw new AppError("All fields required", 400);
  }
  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new AppError("User already exists", 409);
  }

  const user = new User({
    firstName,
    lastName,
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
<div style="background:#f8fafc;padding:40px 20px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:28px 24px;text-align:center;">
      <h2 style="color:white;margin:0;font-size:22px;font-weight:600;">
        Welcome to NexusChat 🚀
      </h2>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;color:#1e293b;">
      <p style="margin:0 0 16px 0;font-size:16px;">
        Hey there,
      </p>

      <p style="margin:0 0 24px 0;font-size:15px;color:#64748b;line-height:1.6;">
        Thanks for signing up! Please verify your email address to activate your account and start chatting.
      </p>

      <!-- Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${verifyUrl}"
           style="
             background:#2563eb;
             color:white;
             padding:14px 28px;
             border-radius:12px;
             text-decoration:none;
             font-weight:600;
             display:inline-block;
             box-shadow:0 10px 25px rgba(0,0,0,0.05);
           ">
          Verify Email
        </a>
      </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#64748b;">
      © ${new Date().getFullYear()} NexusChat — Secure messaging made simple
    </div>

  </div>
</div>
`

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
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Email not verified", 401);
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

function verifyToken(req,res){
  const token = req.headers.authorization;
  if(!token){
    return res.status(401).json({success : false});
  }

  try{
    jwt.verify(token,process.env.JWT_SECRET);
    res.status(200).json({success : true});

  }catch(err){
    res.status(401).json({success : false});
  }

}


module.exports = { registerUser, loginUser, verifyEmail,verifyToken};
