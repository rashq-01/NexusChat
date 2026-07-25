const currentUSER = JSON.parse(localStorage.getItem("nexuschat:userCredentials"));
const token = localStorage.getItem("nexuschat:token");
if(!token){
  window.location.href = '/';
}
import { HOST } from "/src/js/HOSTS.js";

const API_BASE_URL = "https://nexuschat-ppgc.onrender.com";

const socket = io(API_BASE_URL, {
  auth: {
    username: currentUSER.username,
    token : token,
  },
});

socket.on("connect", () => {
});

export default socket;
