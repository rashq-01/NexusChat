

let isTyping = false;
let typingTimeout;

const TYPING_DELAY = 1000;

const messagesInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");

messagesInput.addEventListener("input",()=>{

    if(!isTyping){
        socket.emit("typing_start",{
            receiverId : currentChatUserId
        });
        
        isTyping = true;
    }


    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(()=>{
        socket.emit("typing_stop", {
            receiverId : currentChatUserId
        });
        isTyping = false;

    }, TYPING_DELAY);
});



socket.on("typing",({senderId,typing}) =>{
    if(senderId==currentChatUserId)return;

    if(typing){
        typingIndicator.innerHTML = "User is typing";
        typingIndicator.style.display = "block";
    }else{
        typingIndicator.style.display = "none";
    }
})