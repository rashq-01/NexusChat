const redis = require("redis");
require("dotenv").config();
class RedisClient{
    constructor(){
        this.client = null;
        this.subscriber = null;
        this.isConnected = false;
    }

    async connect(){
        try{
            // Main client
            this.client = redis.createClient({
                url : process.env.REDIS_URL || 'redis://localhost:6379',
                socket : {
                    reconnectStrategy : (retries)=>{
                        if(retries>10){
                            console.log("Too many retries, giving up");
                            return new Error("Too many retries");
                        }
                        return Math.min(retries * 100,3000);
                    }
                }
            });


            //Subscriber Client
            this.subscriber = this.client.duplicate();

            // Handling errors

            this.client.on("error",(err)=>{
                console.log("Redis Client Error : ",err.message);
                this.isConnected = false;
            })

            this.subscriber.on("error",(err)=>{
                console.log("Redis Subscriber Error : ",err.message);
            })

            this.client.on("connect",()=>{
                console.log("Redis Client Connected.");
            })

            this.subscriber.on("connect",()=>{
                console.log("Redis Subscriber connected");
            })

            // Connecting both Clients
            await this.client.connect();
            await this.subscriber.connect();
            this.isConnected = true;

            console.log("Redis is Ready for the NexusChat");


            // Testing connection
            await this.client.set("test:connection","ok");
            const test = await this.client.get("test:connection");
            console.log(`Redis test : ${test=='ok' ? 'Passed' : 'Failed'}`);
        }
        catch(err){
            console.log("Failed to connect to Redis : ",err.message);
        }
    }


    // Method to check if Redis is connected or not

    isReady(){
        return this.isConnected && this.client?.isReady && this.subscriber?.isReady;
    }

    // Main client
    getClient(){
        if(!this.client || !this.isReady()){
            throw new Error("Redis client not connected");
        }
        return this.client;
    }

    // Subscriber client
    getSubscriber(){
        if(!this.isReady()){
            throw new Error("Redis client is not connected");
        }
        return this.subscriber;
    }

    //Shutdown
    async disconnect(){
        if(this.client)await this.client.quit();
        if(this.subscriber) await this.subscriber.quit();

        console.log("Redis Disconnected");
    }
};



module.exports = new RedisClient();