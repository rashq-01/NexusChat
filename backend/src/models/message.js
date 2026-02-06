const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true
    },

    senderId: {
      type: String,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "file", "audio"],
      default: "text"
    },

    content: {
      type: String, // text or file URL
      required: true
    },

    mediaMeta: {
      type: mongoose.Schema.Types.Mixed, // duration, size, etc
      default: {}
    },

    deliveredTo: [{
      type: String,
      ref: "User"
    }],

    seenBy: [{
      type: String,
      ref: "User"
    }],

    status: {
      type : String,
      enum : ["sent","delivered","seen"],
      default : "sent",
    },

    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Message", messageSchema);
