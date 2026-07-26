require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const asyncHandler = require("../utils/asyncHandler");
const redis = require("../config/redis/client");
const Chat = require("../models/chat");
const API_BASE_URL = process.env.API_BASE_URL;

const registerUser = asyncHandler(async function registerUser(req, res) {
  const { firstName, lastName, username, email, password } = req.body;

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
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; //24hr

  const verifyUrl = `${API_BASE_URL}/api/auth/verify-email?token=${token}`;

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
`,
  });

  await user.save();

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

  let friends = await redis.getCachedFriendsList(user._id.toString());

  if (!friends) {
    const recentChats = await Chat.find({
      participants: { $in: [user.username] },
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const chatParticipantsUsernames = [
      ...new Set(
        recentChats
          .flatMap((chat) => chat.participants)
          .filter((p) => p !== user.username),
      ),
    ];

    const chatFriends = await User.find({
      username: { $in: chatParticipantsUsernames },
    })
      .select("-password -__v")
      .lean();

    const remaining = 50 - chatFriends.length;
    let otherFriends = [];
    if (remaining > 0) {
      otherFriends = await User.find({
        _id: { $nin: [user._id, ...chatFriends.map((f) => f._id)] },
      })
        .select("-password -__v")
        .limit(remaining)
        .lean();
    }

    /*
    friends = await User.find({
    _id: { $ne: user._id },
    })
    .select("-password -__v")
    .limit(50)
    .sort({createdAt : -1})
    .lean();
    */
    friends = [...chatFriends, ...otherFriends];
    await redis.cacheFriendsList(user._id.toString(), friends, 300);
  }

  const token = generateToken({ userId: user._id, username: user.username });
  res.status(200).json({
    success: true,
    token,
    friends,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});

async function verifyEmail(req, res) {
  const { token } = req.query;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.redirect("/public/emailUnverified.html");
  }

  user.isVerified = true;
  user.emailVerificationExpires = undefined;
  user.emailVerificationToken = undefined;

  await user.save();

  return res.redirect("/public/emailVerified.html");
}

function verifyToken(req, res) {
  // Extraction of header
  const header = req.headers.authorization;

  //Checking of header
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // token splitting
  const token = header.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(401).json({ success: false });
  }
}

const forgotPassword = asyncHandler(async function registerUser(req, res) {
  const { usernameOrEmail } = req.body;

  //Fields Check
  if (!usernameOrEmail) {
    throw new AppError("All fields required", 400);
  }

  const userExists = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!userExists) {
    throw new AppError("User not exist.", 409);
  }


  const token = crypto.randomBytes(32).toString("hex");

  userExists.forgotPasswordToken = token;
  userExists.forgotPasswordTokenExpire = Date.now() + 1 * 60 * 60 * 1000; //1 hr

  const resetUrl = `${API_BASE_URL}/api/auth/forgot-password-link?token=${token}`;

  await sendEmail({
    to: userExists.email,
    subject: "NexusChat Password reset url",
    html: `
<div style="background:#f8fafc;padding:40px 20px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:28px 24px;text-align:center;">
      <h2 style="color:white;margin:0;font-size:22px;font-weight:600;">
        NexusChat 🔐
      </h2>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0 0;font-size:14px;">
        Password Reset Request
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;color:#1e293b;">
      <p style="margin:0 0 16px 0;font-size:16px;">
        Hey there,
      </p>

      <p style="margin:0 0 24px 0;font-size:15px;color:#64748b;line-height:1.6;">
        We received a request to reset your password. Click the button below to set a new password.
      </p>

      <!-- Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}"
           style="
             background:#2563eb;
             color:white;
             padding:14px 28px;
             border-radius:12px;
             text-decoration:none;
             font-weight:600;
             display:inline-block;
             box-shadow:0 10px 25px rgba(37,99,235,0.2);
           ">
          Reset Password
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />

      <p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
        This link will expire in <strong>1 hour</strong>.<br />
        If you didn't request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#64748b;">
      © ${new Date().getFullYear()} NexusChat — Secure messaging made simple
    </div>

  </div>
</div>
`,
  });

  await userExists.save();

  res.status(201).json({
    success: true,
    message: "Reset password link sent.",
  });
});


async function verifyForgotPasswordLink(req, res) {
  const { newPassword , confirmPassword , token} = req.body;

  if(!token || !newPassword || !confirmPassword){
    throw new AppError("Missing fields.", 409);
  }

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.redirect("/public/emailUnverified.html");
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpire = undefined;
  user.password = newPassword;

  await user.save();

  return res.redirect("/public/emailVerified.html");
}






async function redirectToSetPassword(req, res) {
  const { token  } = req.query;

  console.log(token);
  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpire: { $gt: Date.now() },
  });

  if (!user) {

    return res.redirect("/public/emailUnverified.html");
  }

  return res.redirect(`/public/setPassword.html?token=${token}`);
}

module.exports = { registerUser, loginUser, verifyEmail, verifyToken , forgotPassword , verifyForgotPasswordLink , redirectToSetPassword};
