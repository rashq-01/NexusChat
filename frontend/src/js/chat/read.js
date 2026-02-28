// Assume these are already available
// socket              -> connected socket.io client
// currentUserId       -> logged-in user id
// activeChatId        -> currently open chat id
// messageList         -> container holding message DOM elements

import {currentUSER} from "/src/js/chat/chat.js"


//When chat window opens
function onChatOpen(chatId){
    activeChatId = chatId;

    socket.emit("mark_read",{
        chatId : activeChatId,
        seenBy : currentUSER.username
    });
}



socket.on("message_read",({messageId,readerId,chatId})=>{
    
    if(chatId !==activeChatId) return;

    const msgEl = document.querySelector(
        `[data-message-id=${messageId}]`
    );

    if(!msgEl)return;

    const statusEl = msgEl.querySelector(".message-status");

    if(statusEl){
        statusEl.innerHTML = "✓✓";//read
    }
})