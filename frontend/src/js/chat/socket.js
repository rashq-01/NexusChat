const currentUSER = JSON.parse(localStorage.getItem("userCredentials"));

import { HOST } from "/src/js/HOSTS.js";

const socket = io(HOST, {
  auth: {
    username: currentUSER.username,
  },
});

socket.on("connect", () => {
  console.log(
    `User ${currentUSER.username} connected  with socket ID ${socket.id}`,
  );
});

export default socket;
