const socketIO = require("socket.io");
const authSocket = require("./authSocket");
const { registerMessageHandler } = require("./messageSocket");
const User = require("../models/user");
const presenceSocket = require("./presenceSocket");
const { registerTypingHandler } = require("./typingSocket");
const { messageReadHandler } = require("./readSocket");
const redis = require("../config/redis/client");
const socketManager = require("../config/redis/socketManager");

function initializeSocket(httpServer) {
  const io = socketIO(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // auth Middleware
  io.use(authSocket);

  io.on("connection", async (socket) => {
    //get username from auth
    const username = socket.user?.username;
    if (!username) {
      console.log("No username provided, disconnecting......");
      socket.disconnect();
      return;
    }

    console.log(`User connecting : ${username} with socket ${socket.id}`);

    // // Setting up for PUB/SUB cross-server communication
    // const subscriber = redis.getSubscriber();

    // // Subscribe to messages channel
    // await subscriber.subscribe("chat:messages", (message) => {
    //   try {
    //     const data = JSON.parse(message);
    //     if (data.recipients && data.recipients.includes(username)) {
    //       socket.emit("receive_message", data.message);
    //     }
    //   } catch (err) {
    //     console.log("Error handling Pub/Sub messages. ", err.message);
    //   }
    // });

    registerMessageHandler(socket, io); // For messages
    presenceSocket(socket, io); //for (offline,online)
    registerTypingHandler(socket, io); // For typing indicator
    messageReadHandler(socket, io); // For Message reading

    socket.on("disconnect", async () => {
      try {
        console.log("DISCONNECT FIRED:", username, socket.id);
        console.log(
          `User disconnecting : ${username} with socket ${socket.id}`,
        );
        const sockets = await socketManager.getUserSockets(username);
        console.log("AFTER DISCONNECT sockets : ",sockets);
        const result = await socketManager.removeUserSocket(socket.id);

        // await subscriber.unsubscribe("chat:messages");
        if(result){
          const onlineUsers = result.onlineUsers || [];

          console.log(`update online users : `,onlineUsers.map(u=>u.username));
          
          io.emit("onlineUsersSnapshot",{
            users: onlineUsers.map((u)=> u.username),
          });

          if(result.isOffline){
            console.log(`${username} is completely offline.`);
            
            //Updating last seen in db
            try {
              await User.updateOne(
                { username },
                { $set: { lastSeen: new Date() } },
              );
            } catch (err) {
              console.error("Failed to update lastSeen:", err.message);
            }

            socket.broadcast.emit("userPresence", {
              username: result.username,
              data: "offline",
            });
            const client = redis.getClient();
            await client.publish(
              "chat:presence",
              JSON.stringify({
                username,
                status: "offline",
                users: onlineUsers,
              }),
            );
          }

        }
      } catch (err) {
        console.error("Error in disconnect handler:", err.message);
      }
    });
  });

  return io;
}

module.exports = { initializeSocket };
