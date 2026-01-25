const userSocket = require("./userSocket");
const User = require("../models/user");

function presenceSocket(socket,io){
    const userId = socket.user._id.toString();

    if(!userSocket.has(userId)){
        userSocket.set(userId,new Set());

        socket.broadcast.emit("user_online",{
            userId,
        });
    }

    userSocket.get(userId).add(socket.id);

    socket.on("disconnect",async()=>{
        const socketSet = userSocket.get(userId);

        if(!socketSet)return;

        socketSet.delete(socket.id);

        if(socketSet.size === 0){
            userSocket.delete(userId);
            
            try{
                await User.findByIdAndUpdate(userId,{
                    lastSeen : new Date(),
                });
            }catch(err){
                console.log("Failed to update lastSeen");
            }

            socket.broadcast.emit("user_offline",{
                userId,
            })
        }
    })
}

module.exports = presenceSocket;