//Assuming 
//socket -> connected socket.io client
//currentUserId -> logged-in user id
//currentChatUser -> receiver id (open chat)
//messageList -> ul or div container for message


//Send message
sendBtn.addEventListener("click",()=>{
    const content = messageInput.value.trim();
    if(!content)return;

    socket.emit("send_message",{
        receiverId : currentChatUserId,
        content,
    });

    messageInput.value() = "";
});

messageInput.addEventListener("keydown",(e)=>{
    if(e.key==="Enter"){
        sendBtn.click();
    }
});

socket.on("receive_message",(message)=>{
    const {senderId, content, chatId} = message;

    if(senderId !== currentChatUserId){
        //notification here
        return;
    }

    appendMessage({
        senderId,
        content

    })
})


function appendMessage({senderId,content,status}){
    content = msgDiv = document.createElement("div");
    msgDiv.className = senderId===currentUserId ? "msg outgoing":"msg incoming";
    msgDiv.innerText = content;

    if(senderId===currentUserId){
        const statusSpan = document.createElement("span");
        statusSpan.className = "status";
        statusSpan.innerHTML = status;
        msgDiv.appendChild(statusSpan);
    }

    messageList.appendChild(msgDiv);
    messageList.scrollTop = messageList.scrollHeight;
}