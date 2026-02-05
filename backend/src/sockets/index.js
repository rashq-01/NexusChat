const socketIO = require("socket.io");
const authSocket = require("./authSocket");
const {registerMessageHandler} = require("./messageSocket");
const presenceSocket = require("./presenceSocket");
const { registerTypingHandler } = require("./typingSocket");

function initializeSocket(httpServer) {
  const io = socketIO(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

//   io.use(authSocket);

  io.on("connection", (socket) => {
    socket.user = socket.handshake.auth;
    console.log("User Connected : ", socket.user.username, " Socket : ", socket.id);

    registerMessageHandler(socket, io); // For messages
    presenceSocket(socket, io); //for (offline,online)
    // registerTypingHandler(socket, io); // For typing indicator

    // socket.on("disconnect",()=>{
    //     console.log("User disconnected : ",socket.user._id, "Socket : ",socket.id);
    // });
  });

  return io;
}

module.exports = { initializeSocket };
