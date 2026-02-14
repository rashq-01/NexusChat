const Message = require("../models/message")
const User = require("../models/user")
const Chat = require("../models/chat");
const {userToSocket, socketToUser} = require("./user-socketMap");

function registerMessageHandler(socket, io) {
  socket.on("send_message", async ({receiverUsername,content,type}) => {
    console.log(receiverUsername,content,type);

    const username = socket.user.username.toString();

    if(!content || !receiverUsername)return;

    let chat = await Chat.findOne({ 
        isGroup : false,
        participants : {$all : [username,receiverUsername]}
    });

    if (!chat) {
        chat = await Chat.create({
            participants : [username,receiverUsername],
            isGroup : false,
        });
    }

    let message = await Message.create({
        chatId : chat._id,
        senderId : username,
        receiverId : receiverUsername,
        type,
        content,
    });

    const receiverSockets = userToSocket.get(receiverUsername);

    if(receiverSockets){
        receiverSockets.forEach((socketId)=>{
            io.to(socketId).emit("receive_message",{
                _id : message._id,
                chatId : chat._id,
                senderId : username,
                content,
                status : "delivered",
                createdAt : message.createdAt,
                timestamp : message.createdAt
            });
        });

        message.status = "delivered";
        await message.save();
    }

    socket.broadcast.emit("message_sent",{
        _id : message._id,
        chatId : chat._id,
        status : message.status,
    });

  });
}


module.exports = {registerMessageHandler};