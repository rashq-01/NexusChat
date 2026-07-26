const express = require("express");
const {loginUser, registerUser, verifyEmail, verifyToken , forgotPassword , verifyForgotPasswordLink , redirectToSetPassword } = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);
authRouter.get("/verify-email",verifyEmail);
authRouter.get("/verify-token",verifyToken);
authRouter.post("/forgot-password",forgotPassword);
authRouter.get("/forgot-password-link",redirectToSetPassword);
authRouter.post("/forgot-password-link",verifyForgotPasswordLink);


module.exports = authRouter;