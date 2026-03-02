const redis = require("../config/redis/client")
const socketManager = require("../config/redis/socketManager");
const {userToSocket,socketToUser} = require("../sockets/user-socketMap")

function registerTypingHandler(socket,io){

    // typing start
    socket.on("typing_start",async ({receiverUsername,username})=>{
        const senderUsername = socket.user?.username;
        if(!senderUsername || !receiverUsername)return;

        console.log(`${senderUsername} typing to ${receiverUsername}`);

        const receiverSockets = await socketManager.getUserSockets(receiverUsername);
        
        for(const socketId of receiverSockets){
            io.to(socketId).emit("typing_start",{
                username : senderUsername,
                receiverUsername,
                typing : true,
            });
        }
        
        const client = redis.getClient();
        await client.publish("chat:typing",JSON.stringify({
            type : "start",
            sender : senderUsername,
            receiver : receiverUsername,
            timestamp : Date.now()
        }));
    });


    //typing stop
    socket.on("typing_stop",async ({receiverUsername,username})=>{
        const senderUsername = socket.user?.username;

        if(!senderUsername || !receiverUsername) return;

        console.log(`${senderUsername} stopped typing to ${receiverUsername}`);

        const receiverSockets = await socketManager.getUserSockets(receiverUsername);

        for(const socketId of receiverSockets){
            io.to(socketId).emit("typing_stop",{
                username : senderUsername,
                receiverUsername,
                typing : false
            });
        }

        //Publishing to Redis for other servers
        const client = redis.getClient();
        await client.publish("chat:typing",JSON.stringify({
            type : 'stop',
            sender : senderUsername,
            receiver : receiverUsername,
            timestamp : Date.now()
        }));
    });
}



module.exports = {registerTypingHandler};