const mongoose = require("mongoose");

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize : 100,
            minPoolSize : 20,
            maxIdleTimeMS : 10000,
            connectTimeoutMS : 5000,
            socketTimeoutMS : 30000,
            serverSelectionTimeoutMS : 5000,
            heartbeatFrequencyMS : 10000,
            retryWrites: true,
            retryReads : true
        });
    }
    catch(err){
        console.log("MongoDB connection Failed......",err);
        throw err;
    }
};

module.exports = connectDB;