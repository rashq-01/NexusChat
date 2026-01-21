require("dotenv").config();
const http = require("http");
const app = require("./app.js");
const connectDB = require("./config/db.js");
const PORT = process.env.PORT;

connectDB().then(()=>{
    console.log("MongoDB Connected");

    app.listen(PORT,()=>{
        console.log(`Server started on http://localhost:${PORT}`)
    })
}).catch((err)=>{
    console.log("Connection to MongoDB Failed.");
    console.log(err.message);
})