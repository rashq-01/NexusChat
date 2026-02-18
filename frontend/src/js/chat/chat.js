import socket from "/src/js/chat/socket.js";
import {
  switchChat,
  updateSendButton,
  showNotification,
  renderOnlineUsers,
} from "/src/js/auth/dashboard.js";
import {
  activeChatId,
  users,
  setActiveChatId,
} from "/src/js/auth/chatState.js";
// Get data from localStorage
const currentUSER = JSON.parse(localStorage.getItem("userCredentials")) || {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
};

// Current user data
const currentUserData = {
  id: currentUSER.username,
  name: `${currentUSER.firstName} ${currentUSER.lastName}`,
  avatar: `${currentUSER.firstName[0]}${currentUSER.lastName[0]}`,
  status: "online",
  email: currentUSER.email || "john.doe@example.com",
  username: `@${(currentUSER.firstName + currentUSER.lastName).toLowerCase()}`,
  userId: "USR-2024-001",
  joinedDate: "January 15, 2024",
  storageNode: "Database Shard #3",
  wsServer: "WS-Node-2",
  latency: "42ms",
  lastSync: "2 min ago",
  verified: true,
};
let currentUser = currentUserData;

// Create dummy messages for each friend
const messages = {};
// users.forEach((user) => {
//   messages[user.id] = generateDummyMessages(user);
// });

async function fetchMessages(chatId) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:5000/api/messages?chatId=${chatId}&username=${currentUSER.username}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!data.success) {
    return;
  }

  messages[chatId] = data.messages.map((msg) => ({
    id: msg._id,
    sender: msg.senderId,
    senderId: msg.senderId,
    content: msg.content,
    time: msg.createdAt,
    status: msg.status,
  }));
}

async function initChats() {
  await Promise.all(users.map((u) => fetchMessages(u.id)));
  renderChatsList();
}

// Current state
let isMobile = window.innerWidth <= 768;
let isLoggedIn = true;
let darkMode = false;
let typingInterval = null;

// DOM Elements
const loadingScreen = document.getElementById("loading-screen");
const loginPage = document.getElementById("login-page");
const chatInterface = document.getElementById("chat-interface");
const sidebar = document.getElementById("sidebar");
const chatsList = document.getElementById("chats-list");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");
const activeChatName = document.getElementById("active-chat-name");
const activeChatAvatar = document.getElementById("active-chat-avatar");
const activeChatParticipants = document.getElementById(
  "active-chat-participants",
);
const searchInput = document.getElementById("search-input");
const overlay = document.getElementById("overlay");
const username = document.querySelectorAll(".username");
const currentUserAvatarText = document.querySelectorAll(
  ".currentUserAvatarText",
);

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getAvatarColor(avatarText) {
  const colors = [
    "#007AFF",
    "#5856D6",
    "#FF2D55",
    "#28b4c4",
    "#34C759",
    "#5AC8FA",
    "#35c4a0",
    "#AF52DE",
  ];
  const index = avatarText.charCodeAt(0) % colors.length;
  return colors[index];
}

function getNameColor(text) {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD93D",
    "#6C5CE7",
    "#00B894",
    "#FF9F43",
    "#E84393",
    "#0984E3",
  ];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

function getStatusIcon(status) {
  switch (status) {
    case "sent":
      return "fa-solid fa-check";
    case "delivered":
      return "fa-solid fa-check-double";
    case "read":
      return "fa-solid fa-check-double read";
    default:
      return "fa-solid fa-check";
  }
}

function getFileType(ext) {
  const types = {
    pdf: { icon: "file-pdf", type: "PDF Document" },
    docx: { icon: "file-word", type: "Word Document" },
    xlsx: { icon: "file-excel", type: "Excel Spreadsheet" },
    pptx: { icon: "file-powerpoint", type: "Presentation" },
    png: { icon: "file-image", type: "Image" },
    jpg: { icon: "file-image", type: "Image" },
    svg: { icon: "file-image", type: "Image" },
    mp3: { icon: "file-audio", type: "Audio File" },
    m4a: { icon: "file-audio", type: "Audio File" },
    wav: { icon: "file-audio", type: "Audio File" },
    mp4: { icon: "file-video", type: "Video File" },
    fig: { icon: "file-image", type: "Design File" },
  };
  return types[ext] || { icon: "file", type: "File" };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
}

function adjustTextareaHeight() {
  messageInput.style.height = "auto";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
}

function generateDummyMessages(user) {
  const messageContents = [
    `Hey ${currentUser.firstName}! How are you doing?`,
    `Did you see the latest project updates?`,
    `Can we schedule a meeting tomorrow?`,
    `I've sent you the design files.`,
    `The deadline is approaching, need your feedback.`,
    `Great work on the recent presentation!`,
    `Let's catch up for coffee sometime.`,
    `Check out this interesting article I found.`,
    `Are you available for a quick call?`,
    `Looking forward to working with you on this!`,
  ];

  const messagesArray = [];
  const messageCount = Math.floor(Math.random() * 6) + 2; // 2-7 messages

  for (let i = 0; i < messageCount; i++) {
    const isSent = Math.random() > 0.5;
    messagesArray.push({
      id: Date.now() + i,
      sender: isSent ? currentUSER.username : user.name,
      senderId: isSent ? currentUSER.username : user.id,
      content:
        messageContents[Math.floor(Math.random() * messageContents.length)],
      time: getCurrentTime(),
      status: isSent ? "read" : "read",
    });
  }

  // Sort by time (simulate chronological order)
  return messagesArray.sort((a, b) => a.id - b.id);
}

// Update current user info
function updateCurrentUserInfo() {
  username.forEach((e) => {
    e.innerHTML = `${currentUSER.firstName} ${currentUSER.lastName}`;
  });
  currentUserAvatarText.forEach((e) => {
    e.innerHTML = `${currentUSER.firstName[0]}${currentUSER.lastName[0]}`;
  });
  document.getElementById("currentUserEmail").innerHTML =
    currentUSER.email || "john.doe@example.com";
  currentUserAvatarText.forEach((e) => {
    e.innerHTML = `${currentUSER.firstName[0]}${currentUSER.lastName[0]}`;
    e.style.background = `linear-gradient(135deg, ${getAvatarColor(currentUSER.firstName[0] + currentUSER.lastName[0])}, ${getAvatarColor(currentUSER.firstName[0] + currentUSER.lastName[0])}80)`;
  });
}

// Handle window resize
function handleResize() {
  isMobile = window.innerWidth <= 768;
  if (!isMobile && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
}

// Render the chats list
function renderChatsList(filter = "") {
  chatsList.innerHTML = "";

  if (users.length === 0) {
    chatsList.innerHTML = `
      <div class="empty-chat">
        <div class="empty-chat-icon">
          <i class="far fa-user-friends"></i>
        </div>
        <h3>No Friends</h3>
        <p>Add friends to start chatting</p>
      </div>
    `;
    return;
  }

  users.forEach((user) => {
    if (filter && !user.name.toLowerCase().includes(filter.toLowerCase())) {
      return;
    }

    const chatMessages = messages[user.id] || [];
    const lastMessage =
      chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
    const isActive = user.id === activeChatId;
    let unreadCount = 0;
    chatMessages.forEach((msg) => {
      if (msg.status !== "read" && msg.senderId !== currentUSER.username)
        unreadCount++;
    });

    const chatItem = document.createElement("div");
    chatItem.className = `chat-item ${isActive ? "active" : ""}`;
    chatItem.dataset.id = user.id;

    const statusClass =
      user.status === "online"
        ? "online"
        : user.status === "typing"
          ? "typing"
          : user.status === "idle"
            ? "idle"
            : "offline";

    const onlineIndicator =
      user.status === "online" || user.status === "typing"
        ? `<div class="chat-status ${statusClass}"></div>`
        : "";

    const verifiedBadge = user.verified
      ? '<span class="verified-badge"><i class="fas fa-check-circle"></i></span>'
      : "";

    chatItem.innerHTML = `
      <div class="chat-avatar">
        <div class="avatar-text" style="background: linear-gradient(135deg, ${getAvatarColor(user.avatar)}, ${getAvatarColor(user.avatar)}80)">${user.avatar}</div>
        ${onlineIndicator}
      </div>
      <div class="chat-info">
        <div class="chat-header">
          <div class="chat-name">
            ${user.name}
            ${verifiedBadge}
          </div>
          <div class="chat-time">${lastMessage ? getDateLabel(lastMessage.time) : ""}</div>
        </div>
        <div class="chat-preview">
          <div class="chat-last-message">
            ${
              lastMessage
                ? (lastMessage.senderId === currentUSER.username
                    ? `${currentUSER.username}: `
                    : "") +
                  lastMessage.content.substring(0, 30) +
                  (lastMessage.content.length > 30 ? "..." : "")
                : "No messages yet"
            }
            ${user.id === activeChatId && user.status === "typing" ? '<span style="color: var(--typing);"> is typing...</span>' : ""}
          </div>
          <div class="chat-meta">
            ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ""}
            ${
              !unreadCount &&
              lastMessage &&
              lastMessage.senderId === currentUSER.username
                ? `<i class="fas ${getStatusIcon(lastMessage.status)} message-status ${lastMessage.status}"></i>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    chatItem.addEventListener("click", () => {
      socket.emit("typing_stop", {
        username: currentUSER.username,
        receiverUsername: activeChatId,
      });
      switchChat(user.id);
    });
    chatsList.appendChild(chatItem);
  });
}

// Render messages for a specific chat
function renderMessages(chatId) {
  messagesContainer.innerHTML = "";

  const chatMessages = messages[chatId] || [];
  const activeChat = users.find((u) => u.id === chatId);

  if (!activeChat) {
    messagesContainer.innerHTML = `
      <div class="empty-chat">
        <div class="empty-chat-icon">
          <i class="far fa-exclamation-circle"></i>
        </div>
        <h3>Chat Not Found</h3>
        <p>Select a valid chat</p>
      </div>
    `;
    return;
  }

  // Update active chat info
  activeChatName.textContent = activeChat.name;
  activeChatAvatar.textContent = activeChat.avatar;
  activeChatAvatar.style.background = `linear-gradient(135deg, ${getAvatarColor(activeChat.avatar)}, ${getAvatarColor(activeChat.avatar)}80)`;

  const statusText =
    activeChat.status === "online"
      ? "Online"
      : activeChat.status === "typing"
        ? "Typing..."
        : activeChat.status === "idle"
          ? "Idle"
          : `Last seen ${activeChat.lastSeen}`;

  activeChatParticipants.innerHTML = `
    <span class="status-indicator ${activeChat.status}"></span>
    ${statusText}
  `;

  if (chatMessages.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-chat";
    emptyState.innerHTML = `
      <div class="empty-chat-icon">
        <i class="far fa-comments"></i>
      </div>
      <h3>No messages yet</h3>
      <p>Start a conversation with ${activeChat.name}</p>
    `;
    messagesContainer.appendChild(emptyState);
    return;
  }
  function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    return d1.getTime() === d2.getTime();
  }

  // Add date separator
  let curr = null;
  chatMessages.forEach((message) => {
    if (curr == null || !isSameDay(curr, message.time)) {
      const dateElement = document.createElement("div");
      dateElement.className = "message-date";
      dateElement.innerHTML = `<span class="date-label">${getDateLabel(message.time)}</span>`;
      messagesContainer.appendChild(dateElement);
      curr = message.time;
    }

    const isSent = message.senderId === currentUSER.username;
    const messageElement = document.createElement("div");
    messageElement.className = `message ${isSent ? "sent" : "received"}`;

    const hasFile = message.content.includes("[FILE]");
    let messageContent = message.content;
    let filePreview = "";

    if (hasFile) {
      const fileName = message.content.replace("[FILE] ", "");
      const fileExt = fileName.split(".").pop().toLowerCase();
      const fileType = getFileType(fileExt);

      filePreview = `
        <div class="file-preview" onclick="downloadFile('${fileName}')">
          <div class="file-icon">
            <i class="fas fa-${fileType.icon}"></i>
          </div>
          <div class="file-info">
            <h5>${fileName}</h5>
            <p>${fileType.type} • ${formatFileSize(Math.floor(Math.random() * 5000000) + 100000)}</p>
          </div>
        </div>
      `;
      messageContent = messageContent.replace("[FILE] ", "");
    }
    const senderAvatar = isSent
      ? currentUser
      : users.find((u) => u.id === message.senderId);
    const avatarText = senderAvatar?.avatar || "??";
    messageElement.innerHTML = `
      <div class="message-avatar">
        <div class="avatar-text" style="background: linear-gradient(135deg, ${getAvatarColor(avatarText)}, ${getAvatarColor(avatarText)}80)">${senderAvatar.avatar}</div>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${!isSent && message.senderId !== "0" ? `<div class="message-sender" style="color: ${getNameColor(message.sender)}; font-weight: 600;">${message.sender}</div>` : ""}
          <div class="message-text">${hasFile ? "" : messageContent}</div>
          ${filePreview}
          <div class="message-time">
            ${formatTime(message.time)}
            ${isSent ? `<span class="message-status"><i class="${getStatusIcon(message.status)}"></i></span>` : ""}
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(messageElement);
  });

  // Show typing indicator if user is typing
  if (activeChat.status === "typing") {
    typingIndicator.style.display = "flex";
  } else {
    typingIndicator.style.display = "none";
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addNewMessage(chatId, messageData) {
  // Adding to msg obj
  if (!messages[chatId]) {
    messages[chatId] = [];
  }

  messages[chatId].push(messageData);

  if (chatId === activeChatId) {
    renderMessages(chatId);
  }
  renderChatsList(searchInput.value);
}

function updateUserStatus(userId, newStatus, lastSeen = null) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.status = newStatus;
    if (lastSeen) {
      user.lastSeen = lastSeen;
    }

    // Update UI
    renderChatsList(searchInput.value);
    renderOnlineUsers();

    // If this user is active chat, update their status
    if (userId === activeChatId) {
      const statusText =
        newStatus === "online"
          ? "Online"
          : newStatus === "typing"
            ? "Typing..."
            : newStatus === "idle"
              ? "Idle"
              : `Last seen ${lastSeen || user.lastSeen}`;

      activeChatParticipants.innerHTML = `
        <span class="status-indicator ${newStatus}"></span>
        ${statusText}
      `;
    }
  }
}

// Send a new message
function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || !activeChatId) return;

  const activeChat = users.find((u) => u.id === activeChatId);
  if (!activeChat) return;

  const newMessage = {
    id: Date.now(),
    sender: currentUser.name,
    senderId: currentUSER.username,
    content: content,
    time: new Date().toISOString(),
    status: "sent",
  };
  addNewMessage(activeChatId, newMessage);

  messageInput.value = "";
  adjustTextareaHeight();
  updateSendButton();

  socket.emit("send_message", {
    receiverUsername: activeChatId,
    content,
    type: "text",
  });

  socket.emit("typing_stop", {
    username: currentUSER.username,
    receiverUsername: activeChatId,
  });
}

// Simulate a reply from the other person
function simulateReply(activeChat) {
  const replies = [
    "Thanks for the message!",
    "That sounds good!",
    "Let me think about that...",
    "I'll get back to you on that.",
    "Can you explain more?",
    "That's interesting!",
    "Let's discuss this tomorrow.",
    "I agree with you.",
    "Have you considered...",
    "Great point!",
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  const replyMessage = {
    id: Date.now(),
    sender: activeChat.name,
    senderId: activeChat.id,
    content: randomReply,
    time: getCurrentTime(),
    status: "read",
  };

  messages[activeChatId].push(replyMessage);
  renderMessages(activeChatId);
  renderChatsList(searchInput.value);
}

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function getDateLabel(date) {
  const msgDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();

  // normalize time (very important)
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);

  const msgDay = new Date(msgDate);
  msgDay.setHours(0, 0, 0, 0);

  if (msgDay.getTime() === today.getTime()) {
    return "Today";
  }

  if (msgDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // otherwise return formatted date
  return msgDate.toLocaleDateString("en-GB"); // 20/02/2026
}
socket.on("receive_message", (message) => {
  const { senderId, content, chatId, timestamp, _id } = message;
  const newMessage = {
    id: _id || Date.now(),
    sender: users.find((u) => u.id === senderId)?.name || "Unknown",
    senderId: senderId,
    content: content,
    time: timestamp,
    status: senderId === activeChatId ? "read" : "delivered",
  };

  // socket.emit("message_delivered",{username})

  addNewMessage(senderId, newMessage);
  if (senderId === activeChatId) {
    markMessagesAsRead(senderId);

    socket.emit("message_read", {
      username: currentUSER.username,
      receiverUsername: senderId,
    });
  } else {
    showNotification(
      "New Message",
      "info",
      `New message from ${newMessage.sender}`,
    );
  }

  renderMessages(activeChatId);
});
console.log(messages);
socket.on("message_read", async ({ username }) => {
  await updateMessageStatus(username);
});

async function updateMessageStatus(chatId) {
  const chatMessages = messages[chatId];

  if (chatMessages) {
    await fetchMessages(chatId);
    if (chatId === activeChatId) {
      renderMessages(chatId);
    }
  }
  renderChatsList(searchInput.value);
}

function markMessagesAsRead(chatId) {
  const chatMessages = messages[chatId];
  if (chatMessages) {
    chatMessages.forEach((msg) => {
      if (msg.senderId !== currentUSER.username && msg.status !== "read") {
        msg.status = "read";
      }
    });
    if (chatId === activeChatId) {
      renderMessages(chatId);
    }
  }
  renderChatsList(searchInput.value);
}

export {
  renderChatsList,
  getAvatarColor,
  renderMessages,
  sendMessage,
  updateCurrentUserInfo,
  handleResize,
  isLoggedIn,
  currentUser,
  isMobile,
  adjustTextareaHeight,
  messages,
  fetchMessages,
  currentUSER,
  updateUserStatus,
  initChats,
  markMessagesAsRead,
};
