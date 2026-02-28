const currentUSER = JSON.parse(localStorage.getItem("userCredentials"));
const token = localStorage.getItem("token");
if(!token){
  window.location.href = '/';
}
import { HOST } from "/src/js/HOSTS.js";

const socket = io(HOST, {
  auth: {
    username: currentUSER.username,
    token : token,
  },
});

socket.on("connect", () => {
});

export default socket;
