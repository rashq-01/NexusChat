import socket from "/src/js/chat/socket.js";
import {
  activeChatId,
} from "/src/js/auth/chatState.js";
import {updateUserStatus,messages,currentUSER} from "/src/js/chat/chat.js"

const messageInput = document.getElementById("message-input");

let isTyping = false;
let typingTimeout;

const TYPING_DELAY = 600;

messageInput.addEventListener("input", () => {
  if (!isTyping) {
    socket.emit("typing_start", {
      username: currentUSER.username,
      receiverUsername: activeChatId,
    });

    isTyping = true;
  }

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit("typing_stop", {
      username: currentUSER.username,
      receiverUsername: activeChatId,
    });
    isTyping = false;
  }, TYPING_DELAY);
});
socket.on("typing_start", (data) => {
  const { receiverUsername, username } = data;
  updateUserStatus(username, "typing");

  // <span style="color: var(--typing);"> is typing...</span>

  const chatItem = document.querySelector(`.chat-item[data-id="${username}"]`);
  if(!chatItem)return;

  const chatLastMessage = chatItem.querySelector(".chat-last-message");
  if (!chatLastMessage) return;
  let typingEl = chatLastMessage.querySelector(".userTyping");
  if (!typingEl) {
    typingEl = document.createElement("span");
    typingEl.classList.add("userTyping");
    typingEl.style.color = "#00b120";
    chatLastMessage.appendChild(typingEl);
  }
  typingEl.innerHTML = " is typing...";
});

socket.on("typing_stop", (data) => {
  const { receiverUsername, username } = data;
  updateUserStatus(username, "online");

  const chatItem = document.querySelector(`.chat-item[data-id="${username}"]`);

  if(!chatItem)return;

  const chatLastMessage = chatItem.querySelector(".chat-last-message");
  if (!chatLastMessage) return;
  let typingEl = chatLastMessage.querySelector(".userTyping");
  if (!typingEl) {
    typingEl = document.createElement("span");
    typingEl.classList.add("userTyping");
    typingEl.style.color = "#00b120";
    chatLastMessage.appendChild(typingEl);
  }
  typingEl.innerHTML = "";
});