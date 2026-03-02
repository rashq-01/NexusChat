const redis = require("./client");
const socketManager = require("./socketManager");

class PubSubHandler {
  constructor(io) {
    this.io = io;
    this.subscriber = null;
  }

  async init() {
    this.subscriber = redis.getSubscriber();

    //Subscribing to all channels
    await this.subscriber.subscribe(
      "chat:messages",
      this.handleMessage.bind(this),
    );
    await this.subscriber.subscribe(
      "chat:typing",
      this.handleTyping.bind(this),
    );
    await this.subscriber.subscribe(
      "chat:read",
      this.handleReadReceipt.bind(this),
    );
    await this.subscriber.subscribe(
      "chat:presence",
      this.handlePresence.bind(this),
    );

    console.log(`Redis Pub/Sub handler initialized`);
  }

  async handleMessage(message) {
    try {
      const data = JSON.parse(message);

      const recipients = data.recipients || [];

      for (const recipient of recipients) {
        const sockets = await socketManager.getUserSockets(recipient);

        for (const socketId of sockets) {
          this.io.to(socketId).emit("receive_message", data.message);
        }
      }
      console.log(
        `Pub/Sub : Delivered messages to ${recipients.length} recipients`,
      );
    } catch (err) {
      console.log("Error handling Pub/Sub message : ", err.message);
    }
  }

  async handleTyping(message) {
    try {
      const data = JSON.parse(message);

      const sockets = await socketManager.getUserSockets(data.receiver);

      const eventName = data.type === "start" ? "typing_start" : "typing_stop";

      for (const socketId of sockets) {
        this.io.to(socketId).emit(eventName, {
          username: data.sender,
          typing: data.type == "start",
        });
      }
    } catch (err) {
      console.log("Error handling Pub/Sub typing : ", err.message);
    }
  }

  async handleReadReceipt(message) {
    try {
      const data = JSON.parse(message);
      const sockets = await socketManager.getUserSockets(data.reader);

      for (const socketId of sockets) {
        this.io.to(socketId).emit("message_read", {
          username: data.target,
          readStatus: true,
        });
      }
    } catch (err) {
      console.error("Error handling Pub/Sub read receipt:", err.message);
    }
  }

  async handlePresence(message) {
    try {
      const data = JSON.parse(message);

      this.io.emit("userPresence", {
        username: data.username,
        data: data.status,
      });

      if (data.users) {
        const usernames = data.users.map((u) =>
          typeof u === "string" ? u : u.username,
        );
        this.io.emit("onlineUsersSnapshot", {
          users: usernames,
        });
      }
    } catch (err) {
      console.error("Error handling Pub/Sub presence:", err.message);
    }
  }
  getSubscriber(){
    return this.subscriber;
  }
}

module.exports = PubSubHandler;
