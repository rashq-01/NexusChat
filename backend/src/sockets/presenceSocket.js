const { userToSocket, socketToUser } = require("./user-socketMap");
const User = require("../models/user");
const socketManager = require("../config/redis/socketManager");

async function presenceSocket(socket, io) {
  const username = socket.user.username;

  try {
    const wasOffline = !(await socketManager.isUserOnline(username));

    await socketManager.addUserSocket(username, socket.id);

    if (wasOffline) {
      socket.broadcast.emit("userPresence", { username, data: "online" });
    }

    const onlineUsers = await socketManager.getAllOnlineUsers();
    socket.emit("onlineUsersSnapshot", {
      users: onlineUsers.map((u) => u.username),
    });

    socket.on("disconnect", async () => {
      try {
        const result = await socketManager.removeUserSocket(socket.id);

        if (result && result.isOffline) {
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
        }
      } catch (err) {
        console.error("Error in disconnect handler:", err.message);
      }
    });
  } catch (err) {
    console.error("Error in presenceSocket:", err.message);
    socket.emit("error", { message: "Failed to handle presence" });
  }
}

module.exports = presenceSocket;
