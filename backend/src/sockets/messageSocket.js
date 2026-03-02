const Message = require("../models/message");
const User = require("../models/user");
const Chat = require("../models/chat");
const redis = require("../config/redis/client");
const socketManager = require("../config/redis/socketManager");
const { userToSocket, socketToUser } = require("./user-socketMap");

function registerMessageHandler(socket, io) {

    // Handling sending messages
    socket.on("send_message", async ({ receiverUsername, content, type }) => {

        const senderUsername = socket.user?.username.toString();

        if (!senderUsername || !content || !receiverUsername){
            console.log("Missing required fields (send_message).");
            return;
        }
        console.log(`${senderUsername}--->${receiverUsername} : ${content.substr(0,30)}`);


        try{
            //finding or creating chatId
            let chat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [senderUsername, receiverUsername] },
            });

            if (!chat) {
              chat = await Chat.create({
                participants: [senderUsername, receiverUsername],
                isGroup: false,
              });
              console.log(`New Chat created : ${chat._id}`);
            }

            //saving message to db
            let message = await Message.create({
              chatId: chat._id,
              senderId: senderUsername,
              receiverId: receiverUsername,
              type,
              content,
            });
            console.log(`Message Saved : ${message._id}`);


            //checking if receiver is online or not (via redis)
            const receiverSockets = await socketManager.getUserSockets(receiverUsername);
            console.log(`${receiverUsername} has ${receiverSockets.length} socket(s) on THIS server`);

            // Sending to local sockets (on this server)
            // if (receiverSockets && receiverSockets.length>0) {
            //     for(const socketId of receiverSockets){
            //         io.to(socketId).emit("receive_message", {
            //           _id: message._id,
            //           chatId: chat._id,
            //           senderId: senderUsername,
            //           content,
            //           status: "delivered",
            //           createdAt: message.createdAt,
            //           timestamp: message.createdAt,
            //         });
            //         console.log(`   ----> sent to local socket ${socketId}`);
            //     }
            //   if(receiverSockets?.length>0){
            //     message.status = "delivered";
            //     await message.save();
            //   }
            // }


            // Publishing to REDIS (for other servers)
            const client = redis.getClient();
            await client.publish("chat:messages",JSON.stringify({
                messageId : message._id,
                chatId : chat._id,
                senderId : senderUsername,
                recipients : [receiverUsername],
                message : {
                    _id: message._id,
                    chatId: chat._id,
                    senderId: senderUsername,
                    content,
                    status: "delivered",
                    createdAt: message.createdAt,
                    timestamp: message.createdAt,
                },
                timestamp : Date.now()
            }))
            console.log(`Published to Redis for other servers`);

            //Confirming to sender
            socket.emit("message_sent", {
              _id: message._id,
              chatId: chat._id,
              status: message.status,
            });
        }
        catch(err){
            console.log("Error sending messages : ",err.message);
            socket.emit("error",{message : "Failed to send message."});
        }
  });
}

module.exports = { registerMessageHandler };
