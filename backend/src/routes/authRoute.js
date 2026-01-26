const express = require("express");
const {loginUser, registerUser, verifyEmail} = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);
authRouter.get("/verify-email",verifyEmail);


module.exports = authRouter;