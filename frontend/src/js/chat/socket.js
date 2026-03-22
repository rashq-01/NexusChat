const currentUSER = JSON.parse(localStorage.getItem("nexuschat:userCredentials"));
const token = localStorage.getItem("nexuschat:token");
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
