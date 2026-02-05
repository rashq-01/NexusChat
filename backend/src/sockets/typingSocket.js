
const userSocket = require("./user-socketMap");

function registerTypingHandler(socket,io){

    // typing start
    socket.on("typing_start",({receiverId})=>{
        
        const senderId = socket.user._id.toString();

        const receiverSockets = userSocket.get(receiverId);

        if(!receiverSockets)return;

        receiverSockets.forEach((socketId)=>{
            io.to(socketId).emit("typing",{
                senderId,
                typing : true,
            });
        });
    });


    //typing stop
    socket.on("typing_stop",({receiverId})=>{

        const senderId = socket.user._id.toString();

        const receiverSockets = userSocket.get(receiverId);

        if(!receiverSockets)return;

        receiverSockets.forEach((socketId)=>{
            io.to(socketId).emit("typing",{
                senderId,
                typing : false
            });
        });
    });
}



module.exports = {registerTypingHandler};