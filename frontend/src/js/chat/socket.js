const currentUSER = JSON.parse(localStorage.getItem("nexuschat:userCredentials"));
const token = localStorage.getItem("nexuschat:token");
if(!token){
  window.location.href = '/';
}
import { HOST , API_BASE_URL} from "/src/js/API.js";


const socket = io(API_BASE_URL, {
  auth: {
    username: currentUSER.username,
    token : token,
  },
});

socket.on("connect", () => {
});

export default socket;
