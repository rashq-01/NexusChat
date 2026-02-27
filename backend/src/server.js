require("dotenv").config();
const http = require("http");
const { initializeSocket } = require("./sockets/index.js");
const app = require("./app.js");
const connectDB = require("./config/db.js");
const redis = require("../src/config/redis/client.js");
const PORT = process.env.PORT;

async function startServer() {
  try {
    await redis.connectRedis();
    const server = http.createServer(app);
    const io = initializeSocket(server);

    connectDB()
      .then(() => {
        console.log("MongoDB Connected");

        server.listen(PORT, () => {
          console.log(`Server started on http://localhost:${PORT}`);
        });
      })
      .catch((err) => {
        console.log("Connection to MongoDB Failed.");
        console.log(err.message);
      });
  } catch (err) {
    console.log("Failed to start the server : ",err.message);
    process.exit(1);
  }
}

startServer();
