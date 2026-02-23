// This should be a SINGLETON - shared across all files
const userToSocket = new Map();
const socketToUser = new Map();

module.exports = { userToSocket, socketToUser };