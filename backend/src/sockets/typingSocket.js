
const {userToSocket,socketToUser} = require("../sockets/user-socketMap")

function registerTypingHandler(socket,io){

    // typing start
    socket.on("typing_start",({receiverUsername,username})=>{

        const receiverSockets = userToSocket.get(receiverUsername);
        
        if(!receiverSockets)return;
        
        receiverSockets.forEach((socketId)=>{
            io.to(socketId).emit("typing_start",{
                receiverUsername,
                username,
                typing : true,
            });
        });
    });


    //typing stop
    socket.on("typing_stop",({receiverUsername,username})=>{

        const receiverSockets = userToSocket.get(receiverUsername);

        if(!receiverSockets)return;

        receiverSockets.forEach((socketId)=>{
            io.to(socketId).emit("typing_stop",{
                receiverUsername,
                username,
                typing : false
            });
        });
    });
}



module.exports = {registerTypingHandler};