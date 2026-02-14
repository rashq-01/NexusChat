require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const sendEmail = require("../utils/nodemailer");
const asyncHandler = require("../utils/asyncHandler");
const Chat = require("../models/chat");
const Message = require("../models/message");

const getUserChats = asyncHandler(async (req, res) => {
  const username = req.user.username.toString();

  const chats = await Chat.find({
    participants: username,
  }).sort({ updatedAt: -1 });

  if (!chats) {
    throw new AppError("No any chats", 404);
  }

  res.status(200).json({
    success: true,
    chats,
    message: "Chats Loaded",
  });
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatId , username} = req.query;
  const chats = await Chat.find({
    participants: {$all: [username,chatId]},
  }).select("_id").sort({ updatedAt: -1 });
  console.log(chatId,username);

  const chatIds = chats.map(chat=>chat._id);

  const messages = await Message.find({ chatId : {$in : chatIds} }).sort({ createdAt: 1 });

  res.status(201).json({
    success: true,
    messages,
  });
});


module.exports = {getUserChats,getMessages};