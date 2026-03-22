const redisClient = require("./client");

class SocketManager {
  // Adding a socket to a user
  async addUserSocket(username, socketId) {
    try {
      const client = redisClient.getClient();
      const pipeline = client.multi();

      pipeline.sAdd(`user:sockets:${username}`, socketId);
      pipeline.set(`socket:user:${socketId}`, username);
      pipeline.sAdd(`online:user:`,username);
      //setting expiry
      pipeline.expire(`user:sockets:${username}`, 86400);
      pipeline.expire(`socket:user:${socketId}`, 86400);

      //Executing them at once
      await pipeline.exec();

      console.log(`Mapped ${username}<----->${socketId}`);

      return true;
    } catch (err) {
      console.log("Error adding user socket : ", err.message);
      return false;
    }
  }

  //Removing a socket (disconnect)
  async removeUserSocket(socketId) {
    try {
      const client = redisClient.getClient();

      const username = await client.get(`socket:user:${socketId}`);

      if (username) {
        await client.sRem(`user:sockets:${username}`, socketId);

        await client.del(`socket:user:${socketId}`);

        console.log(`Removed mapping for ${username}<---->${socketId}`);

        const remainingSockets = await client.sCard(`user:sockets:${username}`);
        if (remainingSockets == 0) {
          await client.del(`user:sockets:${username}`);
          await client.sRem("online:users",username);
          console.log(`${username} is now completely offline`);

          const onlineUsers = await this.getAllOnlineUsers();

          return { username, isOffline: true, onlineUsers };
        } else {
          console.log(`${username} is still online with another device`);

          const onlineUsers = await this.getAllOnlineUsers();
          return { username, isOffline: false, remainingSockets, onlineUsers };
        }
      }
      return null;
    } catch (err) {
      console.error("Error removing user socket : ", err.message);
      return null;
    }
  }

  // method to get all sockets of user
  async getUserSockets(username) {
    try {
      const client = redisClient.getClient();
      const sockets = await client.sMembers(`user:sockets:${username}`);
      console.log("Current Sockets : ", sockets);
      return sockets || [];
    } catch (err) {
      console.log("Error getting user sockets : ", err.message);
      return [];
    }
  }

  // method to get username from socketId
  async getUsernameFromSocket(socketId) {
    try {
      const client = redisClient.getClient();

      return await client.get(`socket:user:${socketId}`);
    } catch (err) {
      console.log("Error getting username from socketId : ", err.message);
    }
  }

  async isUserOnline(username) {
    try {
      const client = redisClient.getClient();
      const sockets = await client.sMembers(`user:sockets:${username}`);
      return sockets && sockets.length > 0;
    } catch (err) {
      console.error("Error checking online status : ", err.message);
      return false;
    }
  }

  async getAllOnlineUsers() {
    try {
      const client = redisClient.getClient();
      const usernames = await client.sMembers("online:users");
      
      return usernames.map(username => ({username}));
    } catch (err) {
      console.log("Error getting online users.");
      return [];
    }
  }

  async getCachedOnlineUsers() {
    const cacheKey = "online:users:count";
    const cached = await redisClient.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const users = await this.getAllOnlineUsers();
    await redisClient
      .getClient()
      .set(cacheKey, JSON.stringify(users), { EX: 5 });

    return users;
  }

  // Clean up for stale entries
  async cleanup() {
    try {
      const client = redisClient.getClient();
      const socketKeys = await client.keys("socket:user:*");
      for (const key of socketKeys) {
        const socketId = key.replace("socket:user:", "");
        const username = await client.get(key); // key->"socket:user:${username}"

        if (username) {
          const stillExists = await client.sIsMember(
            `user:sockets:${username}`,
            socketId,
          );
          if (!stillExists) {
            //Orphaned socket Mapping
            await client.del(key);
            console.log(`Cleaned up orphaned socket : ${socketId}`);
          }
        }
      }

      const userKeys = await client.keys("user:sockets:*");

      for (const key of userKeys) {
        const socketCount = await client.sCard(key);
        if (socketCount == 0) {
          await client.del(key);
          console.log(`🧹 Cleaned up empty user set: ${key}`);
        }
      }
    } catch (err) {
      console.log("Error during cleanup", err.message);
    }
  }

  async forceCleanup() {
    console.log("🧹 Running force cleanup...");
    await this.cleanup();
    console.log("✅ Cleanup complete");
  }

  // Graceful shutdown cleanup
  async shutdown({ io, subscriber, User }) {
    console.log("SocketManager shutdown started...");

    try {
      const client = redisClient.getClient();

      // 1. Getting all online users
      const onlineUsers = await this.getAllOnlineUsers();
      console.log(`Found ${onlineUsers.length} online users to cleanup`);

      //  2. Marking everyone offline + broadcast
      for (const user of onlineUsers) {
        const username = user.username;

        try {
          // update DB lastSeen
          if (User) {
            await User.updateOne(
              { username },
              { $set: { lastSeen: new Date() } },
            );
          }

          // publish presence offline
          await client.publish(
            "chat:presence",
            JSON.stringify({
              username,
              status: "offline",
              users: [],
            }),
          );

          // remove user socket set
          await client.del(`user:sockets:${username}`);

          console.log(`✅ Cleaned user: ${username}`);
        } catch (err) {
          console.error(`❌ Failed cleaning ${username}:`, err.message);
        }
      }

      // 3. removing all socket:user mappings
      const socketKeys = await client.keys("socket:user:*");
      if (socketKeys.length) {
        await client.del(socketKeys);
        console.log(`🧹 Removed ${socketKeys.length} socket mappings`);
      }

      //4. removing all online:users
      await client.del("online:users");

      //  5. closing socket.io server
      if (io) {
        await new Promise((resolve) => {
          io.close(() => {
            console.log("✅ Socket.IO closed");
            resolve();
          });
        });
      }

      //  6. unsubscribing pub/sub
      if (subscriber?.isOpen) {
        try {
          await subscriber.unsubscribe();
          await subscriber.quit();
          console.log("Redis subscriber closed");
        } catch (err) {
          console.warn("Subscriber close warning:", err.message);
        }
      }

      console.log("SocketManager shutdown complete");
    } catch (err) {
      console.error("Shutdown error:", err.message);
    }
  }
}

const socketMangerInstance = new SocketManager();
module.exports = socketMangerInstance;
setInterval(
  () => {
    if (redisClient.isReady()) {
      socketMangerInstance.cleanup();
    }
  },
  5 * 60 * 1000,
);
