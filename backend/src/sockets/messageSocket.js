const Message = require("../models/message")
const Chat = require("../models/chat");
const {userToSocket, socketToUser} = require("./user-socketMap");

function registerMessageHandler(socket, io) {
  socket.on("send_message", async ({receiverUsername,content,type}) => {

    const username = socket.user.username.toString();
    console.log(username,receiverUsername,content,type);

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
    console.log("Chat Created");

    let message = await Message.create({
        chatId : chat._id,
        senderId : username,
        type,
        content,
    });
    console.log("Message Created");

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
            });
        });

        message.status = "delivered";
        message.deliveredTo.push(receiverUsername);
        await message.save();
        console.log("Message delivered");
    }

    socket.emit("message_sent",{
        _id : message._id,
        chatId : chat._id,
        status : message.status,
    });

  });
}


module.exports = {registerMessageHandler};