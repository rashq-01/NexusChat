const socketIO = require("socket.io");
const authSocket = require("./authSocket");
const {registerMessageHandler} = require("./messageSocket");
const presenceSocket = require("./presenceSocket");
const { registerTypingHandler } = require("./typingSocket");
const {messageReadHandler} = require("./readSocket");
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

  io.on("connection", (socket) => {
    //get username from auth
    const username = socket.user?.username;
    if(!username){
      console.log("No username provided, disconnecting......");
      socket.disconnect();
      return;
    }

    console.log(`User connecting : ${username} with socket ${socket.id}`);

    
    registerMessageHandler(socket, io); // For messages
    presenceSocket(socket, io); //for (offline,online)
    registerTypingHandler(socket, io); // For typing indicator
    messageReadHandler(socket,io); // For Message reading

    // socket.on("disconnect",()=>{
    //     console.log("User disconnected : ",socket.user._id, "Socket : ",socket.id);
    // });
  });

  return io;
}

module.exports = { initializeSocket };
