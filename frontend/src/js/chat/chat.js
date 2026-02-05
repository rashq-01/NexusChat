
import socket from "/src/js/chat/socket.js";


const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const currentUSER = JSON.parse(localStorage.getItem("userCredentials"));

sendBtn.addEventListener("click",()=>{
    const content = messageInput.value.trim();
    if(!content)return;

    socket.emit("send_message",{
        receiverUsername : currentUSER.username,
        content,
    });

    // messageInput.value() = "";
});

messageInput.addEventListener("keydown",(e)=>{
    if(e.key==="Enter"){
        sendBtn.click();
    }
});

// socket.on("receive_message",(message)=>{
//     const {senderId, content, chatId} = message;

//     if(senderId !== currentChatUserId){
//         //notification here
//         return;
//     }

//     appendMessage({
//         senderId,
//         content

//     })
// })


// function appendMessage({senderId,content,status}){
//     content = msgDiv = document.createElement("div");
//     msgDiv.className = senderId===currentUserId ? "msg outgoing":"msg incoming";
//     msgDiv.innerText = content;

//     if(senderId===currentUserId){
//         const statusSpan = document.createElement("span");
//         statusSpan.className = "status";
//         statusSpan.innerHTML = status;
//         msgDiv.appendChild(statusSpan);
//     }

//     messageList.appendChild(msgDiv);
//     messageList.scrollTop = messageList.scrollHeight;
// }