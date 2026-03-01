const redis = require("../config/redis/client");
const socketManager = require("../config/redis/socketManager");

// const userToSocket = new Map();
// const socketToUser = new Map();

const userToSocket = {

    // For getting all socket of a user
    get : async (username)=>{
        const sockets = await socketManager.getUserSockets(username);
        return new Set(sockets);
    },

    // for to check if user has any socket
    has : async (username)=>{
        return await socketManager.isUserOnline(username);
    },

    // delete user Entry
    delete : async (username)=>{
        //This will already handled by socketManager.removeUserSocket
        console.log(`userToSocket.delete called for ${username}--- handled by Redis`);
        return true;
    },
    
    keys : async()=>{
        const onlineUsers = await socketManager.getAllOnlineUsers();
        return onlineUsers.map(u=>u.username);
    },
    
    size : async()=>{
        const onlineUsers = await socketManager.getAllOnlineUsers();
        return onlineUsers.length;
    }

};


const socketToUser = {
    // for to get username from socketId
    get : async (socketId)=>{
        return await socketManager.getUsernameFromSocket(socketId);
    },

    // For to delete socket Entry
    delete : async(socketId)=>{
        console.log(`socketToUser.delete called for ${socketId}----handled by Redis`);
        return await socketManager.removeUserSocket(socketId);
    },

    size : async ()=>{
        const client = redis.getClient();
        const keys = await client.keys('socket:user:*');
        return keys.length;
    }
};

module.exports = {userToSocket,socketToUser};





module.exports = {userToSocket,socketToUser};