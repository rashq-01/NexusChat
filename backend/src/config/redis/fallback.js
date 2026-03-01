class InMemorySocketManager{
    constructor(){
        this.userToSockets = new Map();
        this.socketToUser = new Map();
    }

    async addUserSocket(username,socketId){
        if(!this.userToSockets.has(username)){
            this.userToSockets.set(username,new Set());
        }

        this.userToSockets.get(username).add(socketId);
        this.socketToUser.set(socketId,username);

        return true;
    }

    async removeUserSocket(socketId){
        const username = this.socketToUser.get(socketId);

        if(username){
            const sockets = this.userToSockets.get(username);

            if(sockets){
                sockets.delete(socketId);

                if(sockets.size() == 0){
                    this.userToSockets.delete(username);
                }
            }

            this.socketToUser.delete(socketId);
            return {username,isOffline : !this.userToSockets.has(username)};
        }
        return null;
    }

    async getUserSockets(username){
        const sockets = this.userToSockets.get(username);

        return sockets ? Array.from(sockets) : [];
    }

    async getUsernameFromSocket(socketId){
        return this.socketToUser.get(socketId) || null;
    }

    async isUserOnline(username){
        return this.userToSockets.has(username);
    }

};


module.exports = new InMemorySocketManager();