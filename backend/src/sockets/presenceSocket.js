const { userToSocket, socketToUser } = require("./user-socketMap");
const User = require("../models/user");

function presenceSocket(socket, io) {
  const username = socket.user.username;

  if (!userToSocket.has(username)) {
    userToSocket.set(username, new Set());

    socket.broadcast.emit("user_online", { username });
  }

  // Mapping
  userToSocket.get(username).add(socket.id);
  socketToUser.set(socket.id, username);

  socket.on("disconnect", async () => {
    const socketSet = userToSocket.get(username);

    if (!socketSet) return;

    socketToUser.delete(socket.id);
    socketSet.delete(socket.id);

    if (socketSet.size === 0) {
      userToSocket.delete(username);

      //   try {
      //     await User.findByIdAndUpdate(username, {
      //       lastSeen: new Date(),
      //     });
      //   } catch (err) {
      //     console.log("Failed to update lastSeen");
      //   }

      socket.broadcast.emit("user_offline", {
        username,
      });
    }
  });
}

module.exports = presenceSocket;
