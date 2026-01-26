require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/authRoute");
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


//Unknown Routes (404)
// app.use((req,res,next)=>{
//     next(new AppError("Route not Found",404));
// })


//Global Error Handler
app.use(errorHandler);


module.exports = app;