const express = require("express");
const {loginUser, registerUser, verifyEmail, verifyToken} = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);
authRouter.get("/verify-email",verifyEmail);
authRouter.get("/verify-token",verifyToken);


module.exports = authRouter;