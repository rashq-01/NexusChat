const redis = require("redis");

let redisClient = null;
let isRedisConnected = false;

async function connectRedis(){
    try{
        redisClient = redis.createClient();

        redisClient.on("connect",()=>{
            console.log("Redis Connected.");
            isRedisConnected = true;
        })

        redisClient.on("error",(err)=>{
            console.log("Redis Error : ",err.message);
            isRedisConnected = false;
        })

        await redisClient.connect();

        await redisClient.set("test:connection","working");
        const test = await redisClient.get("test:connection");
        console.log("Redis test : ",test);


        return true;
    }
    catch(err){
        console.log("Redis not available - using memory only.");
        isRedisConnected = false;
        return false;
    }
}


module.exports = {connectRedis}