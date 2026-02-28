require("dotenv").config();
const http = require("http");
const { initializeSocket } = require("./sockets/index.js");
const app = require("./app.js");
const connectDB = require("./config/db.js");
const redisClient = require("../src/config/redis/client.js");
const PORT = process.env.PORT;

const server = http.createServer(app);


connectDB()
  .then(async () => {
    console.log("MongoDB Connected");

    // Connection to redis
    try{
      await redisClient.connect();

    }
    catch(err){
      console.warn("Redis connection failed - continuing without redis");
    }

    // socket initialization
    const io = initializeSocket(server);

    app.set("io",io);


    server.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Connection to MongoDB Failed.");
    console.log(err.message);
    process.exit(1);
  });


  //Shutdown
  process.on("SIGINT",async()=>{
    console.log("\n Shutting down gracefully....");
    await redisClient.disconnect();
    process.exit(0);
  })