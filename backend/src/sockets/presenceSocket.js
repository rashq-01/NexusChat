const User = require("../models/user");
const socketManager = require("../config/redis/socketManager");
const redis = require("../config/redis/client");

async function presenceSocket(socket, io) {
  const username = socket.user.username;

  try {
    const wasOffline = !(await socketManager.isUserOnline(username));

    await socketManager.addUserSocket(username, socket.id);

    await new Promise(resolve=>setTimeout(resolve,100));

    const onlineUsers = await socketManager.getAllOnlineUsers();

    io.emit("onlineUsersSnapshot", {
      users: onlineUsers.map((u) => u.username),
    });

    if(wasOffline){
      socket.broadcast.emit("userPresence",{
        username,
        data : "online"
      })
    }

    const client = redis.getClient();
    await client.publish(
      "chat:presence",
      JSON.stringify({
        username,
        status: "online",
        users: onlineUsers,
      }),
    );
  } catch (err) {
    console.error("Error in presenceSocket:", err.message);
    socket.emit("error", { message: "Failed to handle presence" });
  }
}

module.exports = presenceSocket;
