require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const {errorHandler} = require("./middlewares/errorMiddleware");

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"../../frontend")));


app.get("/",(req,res)=>{
    return res.sendFile(path.join(__dirname,"../../frontend/public/index.html"));
});


// register error handling middleware


module.exports = app;