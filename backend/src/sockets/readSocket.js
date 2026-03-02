const { userToSocket, socketToUser } = require("../sockets/user-socketMap");
const { markAsRead } = require("../controllers/chatController");
const redis = require("../config/redis/client");
const socketManager = require("../config/redis/socketManager");

function messageReadHandler(socket, io) {
  // Message start
  socket.on("message_read", async ({ receiverUsername }) => {
    const senderUsername = socket.user?.username;

    if (!senderUsername || !receiverUsername) return;

    await markAsRead(senderUsername, receiverUsername);
    console.log(`${senderUsername} read message(s) of ${receiverUsername}`);

    const receiverSockets =
      await socketManager.getUserSockets(receiverUsername);

    if (receiverSockets?.length > 0) {
      for (const socketId of receiverSockets) {
        io.to(socketId).emit("message_read", {
          username: senderUsername,
          readStatus: true,
        });
      }
    }

    // Publishing to Redis
    const client = redis.getClient();
    await client.publish(
      "chat:read",
      JSON.stringify({
        target: senderUsername,
      }),
    );
  });
}

module.exports = { messageReadHandler };
