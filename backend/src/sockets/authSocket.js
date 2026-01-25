const verifyToken = require("../utils/verifyToken");
const User = require("../models/user");
async function authSocket(socket,next){
    const token = socket.handshake.auth?.token || socket.handshake?.headers.authorization;

    if(!token){
        return next(new Error("Unauthorized socket"));
    }

    let decoded;

    try{
        decoded = verifyToken(token);
    }
    catch(err){
        return next(new Error("Unauthorized socket"));
    }

    const user = await User.findById(decoded.userId);

    if(!user){
        return next(new Error("Unauthorized socket"));
    }

    socket.user = user;

    next();
}


module.exports = authSocket;