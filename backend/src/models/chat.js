const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        isGroup : {
            type : Boolean,
            default : false,
            required : true,
        },
        participants  :[{
            type : String,
            ref : "User",
            required : true,
        }],
        lastMessage : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Message",
            default : null
        }
    },
    {
        timestamps : true // 
    }
)