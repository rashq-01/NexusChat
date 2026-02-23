const socketIO = require("socket.io");
const authSocket = require("./authSocket");
const { registerMessageHandler } = require("./messageSocket");
const presenceSocket = require("./presenceSocket");
const { registerTypingHandler } = require("./typingSocket");
const { messageReadHandler } = require("./readSocket");
const { userToSocket, socketToUser } = require("./user-socketMap");

function initializeSocket(httpServer) {
  const io = socketIO(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // IMPORTANT: Get username from handshake
    const username = socket.handshake.auth?.username;
    
    if (!username) {
      console.log("❌ No username provided, disconnecting");
      socket.disconnect();
      return;
    }

    // Set user on socket
    socket.user = { username };
    
    // Add to maps
    if (!userToSocket.has(username)) {
      userToSocket.set(username, new Set());
    }
    userToSocket.get(username).add(socket.id);
    socketToUser.set(socket.id, username);

    console.log(`\n✅ User connected: ${username} | Socket: ${socket.id}`);
    console.log(`📊 Active users: ${userToSocket.size}`);

    // Register handlers
    registerMessageHandler(socket, io);
    presenceSocket(socket, io);
    registerTypingHandler(socket, io);
    messageReadHandler(socket, io);

    // Broadcast online status
    socket.broadcast.emit("userPresence", {
      username,
      data: "online"
    });

    socket.on("disconnect", () => {
      // Remove from maps
      const userSockets = userToSocket.get(username);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          userToSocket.delete(username);
          socket.broadcast.emit("userPresence", {
            username,
            data: "offline"
          });
        }
      }
      socketToUser.delete(socket.id);
      
      console.log(`❌ User disconnected: ${username} | Socket: ${socket.id}`);
      console.log(`📊 Active users: ${userToSocket.size}`);
    });
  });

  return io;
}

module.exports = { initializeSocket };