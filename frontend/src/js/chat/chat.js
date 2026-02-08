
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
        type : "text",

    });

    // messageInput.value() = "";
});

messageInput.addEventListener("keydown",(e)=>{
    if(e.key==="Enter"){
        sendBtn.click();
    }
});


socket.on("receive_message",(message)=>{
    const {senderId, content, chatId} = message;
    console.log(message);

    // if(senderId !== currentChatUserId){
    //     //notification here
    //     return;
    // }

    // appendMessage({
    //     senderId,
    //     content

    // })
})

// Send a new message
function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const newMessage = {
    id: messages[activeChatId] ? messages[activeChatId].length + 1 : 1,
    sender: "You",
    senderId: 0,
    content: content,
    time: getCurrentTime(),
    status: "sent",
  };

  if (!messages[activeChatId]) {
    messages[activeChatId] = [];
  }

  messages[activeChatId].push(newMessage);
  renderMessages(activeChatId);
  messageInput.value = "";
  adjustTextareaHeight();
  updateSendButton();

  // Update last message in chats list
  renderChatsList(searchInput.value);

  // Simulate reply for Jane Smith (chat ID 1)
  if (activeChatId === 1) {
    setTimeout(() => {
      simulateReply();
    }, 1000);
  }

  // Simulate reply for other chats
  if (activeChatId !== 1 && Math.random() > 0.5) {
    setTimeout(() => {
      simulateOtherReply();
    }, 2000);
  }
}