const Message = require("../models/message");
const Chat = require("../models/chat");
const { userToSocket, socketToUser } = require("./user-socketMap");

function registerMessageHandler(socket, io) {
  console.log(`🔌 Message handler registered for socket: ${socket.id}`);

  socket.on("send_message", async ({ receiverUsername, content, type }) => {
    console.log("\n" + "=".repeat(60));
    console.log("📨 MESSAGE RECEIVED ON SERVER");
    console.log("=".repeat(60));
    
    // Debug sender info
    console.log(`🔍 Sender socket user object:`, socket.user);
    
    if (!socket.user || !socket.user.username) {
      console.log("❌ ERROR: socket.user is undefined!");
      console.log(`   Socket handshake:`, socket.handshake?.auth);
      socket.emit("error", { message: "Authentication required" });
      return;
    }

    const senderUsername = socket.user.username.toString();
    console.log(`   From: ${senderUsername}`);
    console.log(`   To: ${receiverUsername}`);
    console.log(`   Content: ${content}`);
    console.log(`   Type: ${type}`);

    if (!content || !receiverUsername) {
      console.log("❌ Missing content or receiver");
      return;
    }

    try {
      // Check if receiver exists in userToSocket map
      console.log("\n📊 CURRENT USER MAP:");
      console.log("   userToSocket entries:");
      for (let [user, sockets] of userToSocket.entries()) {
        console.log(`   👤 ${user}: ${[...sockets].join(', ')}`);
      }
      
      console.log("\n   socketToUser entries:");
      for (let [socketId, user] of socketToUser.entries()) {
        console.log(`   🔌 ${socketId}: ${user}`);
      }

      // Find or create chat
      console.log(`\n🔍 Finding/Creating chat between ${senderUsername} and ${receiverUsername}`);
      let chat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [senderUsername, receiverUsername] }
      });

      if (!chat) {
        console.log("   Creating new chat...");
        chat = await Chat.create({
          participants: [senderUsername, receiverUsername],
          isGroup: false
        });
        console.log(`   ✅ Chat created with ID: ${chat._id}`);
      } else {
        console.log(`   ✅ Existing chat found: ${chat._id}`);
      }

      // Save message to database
      console.log("\n💾 Saving message to database...");
      const message = await Message.create({
        chatId: chat._id,
        senderId: senderUsername,
        type,
        content,
        status: "sent"
      });
      console.log(`   ✅ Message saved with ID: ${message._id}`);

      // Check if receiver is online
      const receiverSockets = userToSocket.get(receiverUsername);
      console.log(`\n📡 Receiver online status:`);
      console.log(`   Receiver '${receiverUsername}' has ${receiverSockets ? receiverSockets.size : 0} socket(s)`);

      if (receiverSockets && receiverSockets.size > 0) {
        // Send to all receiver's sockets
        console.log(`\n📤 Forwarding message to receiver's sockets:`);
        for (const socketId of receiverSockets) {
          console.log(`   → Socket: ${socketId}`);
          io.to(socketId).emit("receive_message", {
            _id: message._id,
            chatId: chat._id,
            senderId: senderUsername,
            content,
            status: "delivered",
            createdAt: message.createdAt,
            _testId: `test_${Date.now()}`,
            _sendTime: Date.now()
          });
        }

        // Update message status
        message.status = "delivered";
        await message.save();
        console.log(`   ✅ Message status updated to 'delivered'`);

        // Confirm to sender
        socket.emit("message_sent", {
          _id: message._id,
          chatId: chat._id,
          status: "delivered"
        });
        console.log(`   ✅ Delivery confirmation sent to sender`);

      } else {
        console.log(`\n⚠️ Receiver '${receiverUsername}' is OFFLINE`);
        console.log(`   Message saved to database for later delivery`);
        
        // Still confirm to sender that message was saved
        socket.emit("message_sent", {
          _id: message._id,
          chatId: chat._id,
          status: "sent"
        });
      }

      console.log("=".repeat(60) + "\n");

    } catch (err) {
      console.error("\n❌ ERROR in send_message:", err);
      console.error(err.stack);
      socket.emit("error", { message: "Failed to send message" });
    }
  });
}

module.exports = { registerMessageHandler };