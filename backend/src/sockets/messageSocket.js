const Message = require("../models/message");
const Chat = require("../models/chat");
const userSocket = require("./userSocket");

function registerMessageHandler(socket, io) {
  socket.on("send_message", async ({receiverId,content}) => {

    const senderId = socket.user._id.toString();

    if(!content || !receiverId)return;

    let chat = await Chat.findOne({ 
        isGroup : false,
        participants : {$all : [senderId,receiverId]}
    });

    if (!chat) {
        chat = await Chat.create({
            participants : [senderId,receiverId],
            isGroup : false,
        });
    }

    let message = await Message.create({
        chatId : chat._id,
        senderId,
        receiverId,
        status : "sent"
    });

    const receiverSocket = userSocket.get(receiverId);

    if(receiverSocket){
        receiverSocket.forEach((socketId)=>{
            io.to(socketId).emit("receive_message",{
                _id : message._id,
                chatId : chat._id,
                senderId,
                content,
                status : "delivered",
                createdAt : message.createdAt,
            });
        });

        message.status = "delivered";
        await message.save();
    }

    socket.emit("message_sent",{
        _id : message._id,
        chatId : chat._id,
        status : message.status,
    });

  });
}


module.exports = {registerMessageHandler};