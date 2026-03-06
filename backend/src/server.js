require("dotenv").config();
const http = require("http");
const { initializeSocket } = require("./sockets/index.js");
const {createApp} = require("./app.js");
const connectDB = require("./config/db.js");
const redisClient = require("../src/config/redis/client.js");
const PubSubHandler = require("./config/redis/pubsubHandler.js");
const socketManager = require("./config/redis/socketManager.js");
const User = require("./models/user.js");
const { createLoginLimiter } = require("./middlewares/rateLimiter.js");
const PORT = process.env.PORT;

async function startServer() {
  try {
    // Connecting Redis first
    await redisClient.connect();

    const loginLimiter = createLoginLimiter();

    const app = createApp(loginLimiter);

    // creating HTTP server
    const server = http.createServer(app);

    // Initializing Socket.io
    const io = initializeSocket(server,{
      cors : {
        origin : "*",
        methods : ["GET","POST"],
      }
    });
    app.set("io", io);

    // Initializing Pub/Sub handler
    const pubsub = new PubSubHandler(io);
    await pubsub.init().catch(err=>{
      console.log("PubSub init failed : ",err);
    });

    const subscriber = pubsub.getSubscriber();

    // connecting to MongoDB
    await connectDB();
    console.log("MongoDB Connected");

    // starting server
    server.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
    let isShuttingDown = false;
    // 🔥 graceful shutdown function
    const gracefulShutdown = async (signal) => {
      if(isShuttingDown)return;
      isShuttingDown = true;
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

      try {
        await socketManager.shutdown({
          io,
          subscriber,
          User,
        });
        if(redisClient.client?.isOpen){
          await redisClient.disconnect();
        }

        console.log("👋 Server exited cleanly");
        process.exit(0);
      } catch (err) {
        console.error("❌ Shutdown failed:", err.message);
        process.exit(1);
      }
    };

    process.on("SIGINT",gracefulShutdown);
    process.on("SIGTERM",gracefulShutdown);

    // // for shutting down
    // process.on("SIGINT", async () => {
    //   console.log("\n Shutting down gracefully...");

    //   try {
    //     await socketManager.shutdown({ io, subscriber, User });
    //   } catch (err) {}
    //   await redisClient.disconnect();
    //   process.exit(0);
    // });
  } catch (err) {
    console.log("Failed to start the server...");
    process.exit(1);
  }
}

startServer();
