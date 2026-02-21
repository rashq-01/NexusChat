const activeChatParticipants = document.getElementById(
  "active-chat-participants",
);
import socket from "/src/js/chat/socket.js";
import {
  users,activeChatId,
} from "/src/js/auth/chatState.js";
import {
  switchChat,
  updateSendButton,
  showNotification,
  renderOnlineUsers,
} from "/src/js/auth/dashboard.js";

socket.on("userPresence", ({ username, data }) => {
  const chatItem = document.querySelector(`.chat-item[data-id="${username}"]`);
  
  if (!chatItem) return;
  const user = users.find(u=>u.id==username);
  if(user)user.status = data;
  renderOnlineUsers();

  let statusEl = chatItem.querySelector(".chat-status");
  const avatar = chatItem.querySelector(".chat-avatar");

  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = "chat-status";
    avatar.appendChild(statusEl);
  }
  statusEl.classList.remove("online", "offline");
  if (data === "online" || data == "typing") {
    statusEl.classList.add(data);
  } else {
    if (statusEl) statusEl.remove();
  }
  if(activeChatId===username){
    activeChatParticipants.innerHTML = data==='online' ? `
    <span class="status-indicator online"></span>
    ${"Online"}
  ` : "";
  }
});


socket.on("onlineUsersSnapshot", (data) => {
  data.users.forEach((usr) => {
    const userObj = users.find((u) => u.id == usr);
    if (userObj) {
      userObj.status = "online";
    }

    const chatItem = document.querySelector(`.chat-item[data-id="${usr}"]`);

    if (!chatItem) return;

    let statusEl = chatItem.querySelector(".chat-status");
    const avatar = chatItem.querySelector(".chat-avatar");

    if (!statusEl) {
      statusEl = document.createElement("div");
      statusEl.className = "chat-status";
      avatar.appendChild(statusEl);
    }
    statusEl.classList.remove("online", "offline");
    statusEl.classList.add("online");
  });
});