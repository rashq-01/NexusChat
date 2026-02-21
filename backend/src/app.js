require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/authRoute");
const {chatRouter} = require("./routes/chatRoute");
const AppError = require("./utils/AppError");
const {errorHandler} = require("./middlewares/errorMiddleware");
const path = require("path");


const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"../../frontend")));


//Routes
app.use("/api/auth",authRoute);
app.use("/api/messages",chatRouter);


//Global Error Handler
app.use(errorHandler);


module.exports = app;