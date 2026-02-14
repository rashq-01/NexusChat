const express = require("express");
const {getUserChats, getMessages} = require("../controllers/chatController");

const chatRouter = express.Router();

chatRouter.get("",getMessages);


module.exports = {chatRouter};