
import {currentUSER} from "/src/js/chat/chat.js"



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