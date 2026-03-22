require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/authRoute");
const { chatRouter } = require("./routes/chatRoute");
const testRoute = require("./routes/testRoutes");
const AppError = require("./utils/AppError");
const { errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");
const authMiddleware = require("../src/middlewares/authMiddleware");

function createApp(loginLimiter) {
  const app = express();

  //Middlewares
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:80",
    methods: ["GET","POST"],
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const frontendPath = path.join(__dirname, "../../frontend");
  app.use(express.static(frontendPath));

  app.set("trust proxy", 1);

  app.use("/api/auth/login", loginLimiter);

  //Routes
  app.use("/api/auth", authRoute);
  app.use("/api/messages", authMiddleware, chatRouter);
  app.use("/api/test", testRoute);

  //Global Error Handler
  app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
