const currentUSER = JSON.parse(localStorage.getItem("userCredentials"));

import { HOST } from "/src/js/HOSTS.js";

const socket = io(HOST, {
  auth: {
    username: currentUSER.username,
  },
});

socket.on("connect", () => {
});

export default socket;
