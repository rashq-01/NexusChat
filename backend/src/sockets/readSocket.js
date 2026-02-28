
const {userToSocket,socketToUser} = require("../sockets/user-socketMap")
const {markAsRead} = require("../controllers/chatController")

async function messageReadHandler(socket,io){

    // typing start
    socket.on("message_read",({username,receiverUsername})=>{

        markAsRead(username,receiverUsername);
        const receiverSockets = userToSocket.get(receiverUsername);
        if(!receiverSockets)return;
        
        receiverSockets.forEach((socketId)=>{
            io.to(socketId).emit("message_read",{
                username,
                readStatus : true,
            });
        });
    });
}



module.exports = {messageReadHandler};