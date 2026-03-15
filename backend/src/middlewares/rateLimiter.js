const rateLimit = require("express-rate-limit");
const {RedisStore} = require("rate-limit-redis");
const redis = require("../config/redis/client");

function createLoginLimiter(){
    const loginLimiter = rateLimit({
        store : new RedisStore({
            sendCommand : (...args)=>redis.getClient().sendCommand([...args]),
            prefix : 'rl:login:'
        }),
        windowMs : 60*1000,  // 1 minutes
        max : 30, // 30 login attempts per ip
        skipSuccessfulRequests : true,
        message : {success : false,message:'Too many login attempts'}
    })

    return loginLimiter;

}

module.exports = {createLoginLimiter};