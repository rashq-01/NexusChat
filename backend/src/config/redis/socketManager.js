const redisClient = require("./client");

class SocketManager{
    // Adding a socket to a user
    async addUserSocket(username,socketId){
        try{
            const client = redisClient.getClient();

            await client.sAdd(`user:sockets:${username}`,socketId);

            await client.set(`socket:user:${socketId}`,username);

            //setting expiry
            await client.expire(`user:sockets:${username}`,604800)
            await client.expire(`socket:user:${socketId}`,604800)

            console.log(`Mapped ${username}<----->${socketId}`);

            return true;
        }
        catch(err){
            console.log("Error adding user socket : ",err.message);
            return false;
        }
    }

    //Removing a socket (disconnect)
    async removeUserSocket(socketId){
        try{
            const client = redisClient.getClient();

            const username = await client.get(`socket:user:${socketId}`);

            if(username){
                await client.sRem(`user:sockets:${username}`,socketId);

                await client.del(`socket:user:${socketId}`);

                console.log(`Removed mapping for ${username}<---->${socketId}`);

                const remainingSockets = await client.sCard(`user:sockets:${username}`);
                if(remainingSockets==0){
                    console.log(`${username} is now completely offline`);

                    return {username,isOffline:true};
                }
                else{
                    console.log(`${username} is still online with another device`);
                    return {username,isOffline:false};
                }

            }
            return null;
        }
        catch(err){
            console.error("Error removing user socket : ",err.message);
            return null;
        }
    }

    // method to get all sockets of user
    async getUserSockets(username){
        try{
            const clinet = redisClient.getClient();
            const sockets = await clinet.sMembers(`user:sockets:${username}`);
            return sockets || [];
        }
        catch(err){
            console.log("Error getting user sockets : ",err.message);
            return [];
        }
    }

    // method to get username from socketId
    async getUsernameFromSocket(socketId){
        try{
            const client = redisClient.getClient();

            return await client.get(`socket:user:${socketId}`);
        }
        catch(err){
            console.log("Error getting username from socketId : ",err.message);
        }
    }

    async isUserOnline(username){
        try{
            const client = redisClient.getClient();
            const sockets = await client.sMembers(`user:sockets:${username}`);
            return sockets && sockets.length>0;
        }
        catch(err){
            console.error("Error checking online status : ",err.message);
            return false;
        }
    }

    async getAllOnlineUsers(){
        try{
            const client = redisClient.getClient();
            const keys = await client.keys('user:sockets:*');
            const onlineUsers = [];
            for(const key of keys){
                const username = key.replace('user:socket:','');
                const sockets = await client.sMembers(key);
                onlineUsers.push({
                    username,
                    socketCount : socket.length,
                    sockets
                });
            }
            return onlineUsers;
        }
        catch(err){
            console.log("Error getting online users.");
            return [];
        }
    }


    // Clean up for stale entries
    async cleanup(){
        try{
            const client = redisClient.getClient();
            const socketKeys = await client.keys("socket:user:*");
            for(const key of socketKeys){
                const socketId = key.replace("socket:user:","");
                const username = await client.get(key); // key->"socket:user:${username}"

                if(username){
                    const stillExists = await client.sIsMember(`user:sockets:${username}`,socketId)
                    if(!stillExists){
                        //Orphaned socket Mapping
                        await client.del(key);
                        console.log(`Cleaned up orphaned socket : ${socketId}`);
                    }
                }
            }
        }
        catch(err){
            console.log("Error during cleanup",err.message);
        }
    }
};

module.exports = new SocketManager;