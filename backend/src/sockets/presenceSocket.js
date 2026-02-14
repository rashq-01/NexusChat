const { userToSocket, socketToUser } = require("./user-socketMap");
const User = require("../models/user");

function presenceSocket(socket, io) {
  const username = socket.user.username;

  if (!userToSocket.has(username)) {
    userToSocket.set(username, new Set());

    socket.broadcast.emit("userPresence", { username,data:"online" });
  }

  // Mapping
  userToSocket.get(username).add(socket.id);
  socketToUser.set(socket.id, username);
  console.log(userToSocket);
  console.log(socketToUser);

  socket.emit("onlineUsersSnapshot",{
    users : Array.from(userToSocket.keys()),
  })

  socket.on("disconnect", async () => {
    const socketSet = userToSocket.get(username);

    if (!socketSet) return;

    socketSet.delete(socket.id);
    socketToUser.delete(socket.id);

    if (socketSet.size === 0) {
      userToSocket.delete(username);

      //   try {
      //     await User.findByIdAndUpdate(username, {
      //       lastSeen: new Date(),
      //     });
      //   } catch (err) {
      //     console.log("Failed to update lastSeen");
      //   }
      console.log(userToSocket);
      console.log(socketToUser);

      socket.broadcast.emit("userPresence", {
        username,
        data : "offline"
      });
    }
  });
}

module.exports = presenceSocket;
