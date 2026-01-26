const Message = require("../models/message");
const userSocket = require("./userSocket");

function registerReadHandler(socket,io){

    socket.on("mark_read",async({chatId})=>{
        const readerId = socket.user._id.toString();
        if(!chatId)return;

        const unreadMessages = await Message.find({
            chatId,
            senderId : {$ne : readerId},
            status : {$ne : "read"}
        });

        if(unreadMessages.length ===0 )return;

        const messageIds = unreadMessages.map(m=>m._id);

        await Message.updateMany(
            {_id : {$in : messageIds}},
            {$set : {status : "read"}}
        );

        unreadMessages.forEach((msg)=>{
            const senderId = msg.senderId.toString();
            const senderSockets = userSocket.get(senderId);

            if(!senderSockets)return;

            senderSockets.forEach((socketId)=>{
                io.to(socketId).emit("message_read",{
                    messageIds : msg._id,
                    readerId,
                    chatId
                })
            })
        })
    })
}


module.exprts = {registerReadHandler};