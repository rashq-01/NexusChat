// Sample data for demonstration
const users = [
  {
    id: 1,
    name: "Jane Smith",
    avatar: "JS",
    status: "typing",
    lastSeen: "2 min ago",
    chatId: "#CHAT-001",
    verified: true,
  },
  {
    id: 2,
    name: "Alex Johnson",
    avatar: "AJ",
    status: "online",
    lastSeen: "Just now",
    chatId: "#CHAT-002",
    verified: false,
  },
  {
    id: 3,
    name: "Sarah Miller",
    avatar: "SM",
    status: "offline",
    lastSeen: "1 hour ago",
    chatId: "#CHAT-003",
    verified: true,
  },
  {
    id: 4,
    name: "Robert Chen",
    avatar: "RC",
    status: "online",
    lastSeen: "5 min ago",
    chatId: "#CHAT-004",
    verified: false,
  },
  {
    id: 5,
    name: "Team Alpha",
    avatar: "TA",
    status: "group",
    participants: 8,
    chatId: "#GRP-005",
    verified: false,
  },
  {
    id: 6,
    name: "Emily Davis",
    avatar: "ED",
    status: "offline",
    lastSeen: "Yesterday",
    chatId: "#CHAT-006",
    verified: true,
  },
  {
    id: 7,
    name: "Mike Wilson",
    avatar: "MW",
    status: "online",
    lastSeen: "10 min ago",
    chatId: "#CHAT-007",
    verified: false,
  },
  {
    id: 8,
    name: "Design Team",
    avatar: "DT",
    status: "group",
    participants: 12,
    chatId: "#GRP-008",
    verified: false,
  },
];

const messages = {
  1: [
    {
      id: 1,
      sender: "Jane Smith",
      senderId: 1,
      content: "Hey there! How's the distributed chat system coming along?",
      time: "09:30 AM",
      status: "read",
    },
    {
      id: 2,
      sender: "You",
      senderId: 0,
      content:
        "Going well! Just implemented the Redis Pub/Sub for cross-server communication",
      time: "09:32 AM",
      status: "read",
    },
    {
      id: 3,
      sender: "Jane Smith",
      senderId: 1,
      content: "That's impressive! How are you handling message deduplication?",
      time: "09:33 AM",
      status: "read",
    },
    {
      id: 4,
      sender: "You",
      senderId: 0,
      content:
        "Using unique message IDs with a Redis cache to track delivered messages",
      time: "09:35 AM",
      status: "read",
    },
    {
      id: 5,
      sender: "You",
      senderId: 0,
      content: "[FILE] design-system.pdf",
      time: "09:40 AM",
      status: "read",
    },
    {
      id: 6,
      sender: "Jane Smith",
      senderId: 1,
      content:
        "Perfect! Those are exactly the kind of scalability features FAANG interviews look for",
      time: "09:36 AM",
      status: "read",
    },
  ],
  5: [
    {
      id: 1,
      sender: "Alex Johnson",
      senderId: 2,
      content: "Team, we need to discuss the load testing results",
      time: "Yesterday",
      status: "read",
    },
    {
      id: 2,
      sender: "Sarah Miller",
      senderId: 3,
      content: "I'll share the performance metrics dashboard",
      time: "Yesterday",
      status: "read",
    },
    {
      id: 3,
      sender: "You",
      senderId: 0,
      content:
        "Our system handled 10,000 concurrent connections with <100ms latency at the 99th percentile",
      time: "Yesterday",
      status: "read",
    },
    {
      id: 4,
      sender: "Robert Chen",
      senderId: 4,
      content:
        "That's amazing! The horizontal scaling design is working perfectly",
      time: "10:15 AM",
      status: "read",
    },
    {
      id: 5,
      sender: "Alex Johnson",
      senderId: 2,
      content: "Let's schedule a demo for the stakeholders",
      time: "10:20 AM",
      status: "read",
    },
    {
      id: 6,
      sender: "You",
      senderId: 0,
      content: "[FILE] presentation-deck.pptx",
      time: "10:25 AM",
      status: "read",
    },
  ],
  8: [
    {
      id: 1,
      sender: "Emily Davis",
      senderId: 6,
      content: "Has anyone reviewed the new UI designs for the chat interface?",
      time: "11:30 AM",
      status: "read",
    },
    {
      id: 2,
      sender: "Mike Wilson",
      senderId: 7,
      content: "Yes, they look great! The real-time indicators are very clear",
      time: "11:45 AM",
      status: "read",
    },
    {
      id: 3,
      sender: "You",
      senderId: 0,
      content:
        "I've implemented typing indicators and read receipts. Also working on file sharing previews",
      time: "12:00 PM",
      status: "read",
    },
    {
      id: 4,
      sender: "Emily Davis",
      senderId: 6,
      content:
        "Can you add end-to-end encryption? That would be a killer feature",
      time: "12:05 PM",
      status: "read",
    },
    {
      id: 5,
      sender: "You",
      senderId: 0,
      content:
        "Already implemented! Using a double ratchet algorithm similar to Signal",
      time: "12:10 PM",
      status: "read",
    },
    {
      id: 6,
      sender: "Mike Wilson",
      senderId: 7,
      content: "[FILE] wireframes.fig",
      time: "12:15 PM",
      status: "read",
    },
  ],
};

// Current user data
const currentUSER = JSON.parse(localStorage.getItem("userCredentials"));
const currentUserData = {
  id: 0,
  name: "John Doe",
  avatar: "JD",
  status: "online",
  email: "john.doe@example.com",
  username: "@johndoe",
  userId: "USR-2024-001",
  joinedDate: "January 15, 2024",
  storageNode: "Database Shard #3",
  wsServer: "WS-Node-2",
  latency: "42ms",
  lastSync: "2 min ago",
  verified: true,
};

// Current state
let currentUser = currentUserData;
let activeChatId = 1;
let typingTimeout = null;
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
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const activeChatName = document.getElementById("active-chat-name");
const activeChatAvatar = document.getElementById("active-chat-avatar");
const activeChatParticipants = document.getElementById(
  "active-chat-participants",
);
const onlineUsersList = document.getElementById("online-users-list");
const searchInput = document.getElementById("search-input");
const overlay = document.getElementById("overlay");
const profileDropdownBtn = document.getElementById("profile-dropdown-btn");
const profileDropdown = document.getElementById("profile-dropdown");
const userProfile = document.getElementById("user-profile");
const username = document.querySelectorAll(".username");
const currentUserAvatarText = document.querySelectorAll(
  ".currentUserAvatarText",
);
const logoutBtn = document.getElementById("logout-btn");
const viewProfileBtn = document.getElementById("view-profile-btn");
const userProfileModal = document.getElementById("user-profile-modal");
const notification = document.getElementById("notification");
const attachBtn = document.getElementById("attach-btn");
const attachmentsModal = document.getElementById("attachments-modal");
const chatInfoBtn = document.getElementById("chat-info-btn");
const chatInfoModal = document.getElementById("chat-info-modal");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const darkModeBtn = document.getElementById("dark-mode-btn");
const helpBtn = document.getElementById("help-btn");
const privacyBtn = document.getElementById("privacy-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const newChatBtn = document.getElementById("new-chat-btn");
const backButton = document.getElementById("back-button");
const emojiBtn = document.getElementById("emoji-btn");
const smartReplies = document.getElementById("smart-replies");
const loginBtn = document.getElementById("login-btn");
const audioCallBtn = document.getElementById("audio-call-btn");
const videoCallBtn = document.getElementById("video-call-btn");

// Initialize the application
function init() {
  // Simulate loading
  setTimeout(() => {
    loadingScreen.classList.add("hidden");

    // Start with chat interface visible
    chatInterface.style.display = "flex";
    loginPage.style.display = "none";

    renderChatsList();
    renderMessages(activeChatId);
    renderOnlineUsers();
    setupEventListeners();
    updateCurrentUserInfo();

    // Simulate real-time updates
    simulateRealTimeFeatures();

    // Handle window resize
    window.addEventListener("resize", handleResize);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("nexuschat-theme");
    if (savedTheme === "dark") {
      toggleDarkMode();
    }
  }, 1);
}

// Handle window resize
function handleResize() {
  isMobile = window.innerWidth <= 768;
  if (!isMobile && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
}

// Toggle login/logout
function toggleLoginState() {
  isLoggedIn = !isLoggedIn;

  if (isLoggedIn) {
    // Show chat interface
    chatInterface.style.display = "flex";
    loginPage.classList.remove("active");
    showNotification(
      "Welcome back!",
      "success",
      "Successfully logged in to NexusChat.",
    );
  } else {
    // Show login page
    chatInterface.style.display = "none";
    loginPage.classList.add("active");
    showNotification(
      "Logged out",
      "success",
      "You have been logged out successfully.",
    );

    // Reset any open modals
    closeAllModals();
  }
}

// Render the chats list
function renderChatsList(filter = "") {
  chatsList.innerHTML = "";

  users.forEach((user) => {
    if (filter && !user.name.toLowerCase().includes(filter.toLowerCase())) {
      return;
    }

    const lastMessage = messages[user.id]
      ? messages[user.id][messages[user.id].length - 1]
      : null;
    const isActive = user.id === activeChatId;
    const unreadCount = user.id === 1 ? 0 : Math.floor(Math.random() * 5); // Simulate unread messages

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
                            <div class="chat-time">${lastMessage ? lastMessage.time : ""}</div>
                        </div>
                        <div class="chat-preview">
                            <div class="chat-last-message">
                                ${
                                  lastMessage
                                    ? (lastMessage.senderId === 0
                                        ? "You: "
                                        : "") +
                                      lastMessage.content.substring(0, 30) +
                                      (lastMessage.content.length > 30
                                        ? "..."
                                        : "")
                                    : "No messages yet"
                                }
                                ${user.id === 1 && isActive ? '<span style="color: var(--typing);"> is typing...</span>' : ""}
                            </div>
                            <div class="chat-meta">
                                ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ""}
                                ${
                                  !unreadCount &&
                                  lastMessage &&
                                  lastMessage.senderId === 0
                                    ? `<i class="fas ${getStatusIcon(lastMessage.status)} message-status ${lastMessage.status}"></i>`
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                `;

    chatItem.addEventListener("click", () => switchChat(user.id));
    chatsList.appendChild(chatItem);
  });
}

// Render messages for a specific chat
function renderMessages(chatId) {
  messagesContainer.innerHTML = "";

  const chatMessages = messages[chatId] || [];
  const activeChat = users.find((u) => u.id === chatId);

  // Update active chat info
  activeChatName.textContent = activeChat.name;
  activeChatAvatar.textContent = activeChat.avatar;
  activeChatAvatar.style.background = `linear-gradient(135deg, ${getAvatarColor(activeChat.avatar)}, ${getAvatarColor(activeChat.avatar)}80)`;

  if (activeChat.participants) {
    activeChatParticipants.textContent = `${activeChat.participants} participants`;
  } else {
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
  }

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

  // Add date separator
  const dateElement = document.createElement("div");
  dateElement.className = "message-date";
  dateElement.innerHTML = `<span class="date-label">Today</span>`;
  messagesContainer.appendChild(dateElement);

  chatMessages.forEach((message) => {
    const isSent = message.senderId === 0;
    const messageElement = document.createElement("div");
    messageElement.className = `message ${isSent ? "sent" : "received"}`;

    // Check if message has file attachment
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
      console.log(getStatusIcon(message.status));



    messageElement.innerHTML = `
                    <div class="message-avatar">
                        <div class="avatar-text" style="background: linear-gradient(135deg, ${getAvatarColor(senderAvatar.avatar)}, ${getAvatarColor(senderAvatar.avatar)}80)">${senderAvatar.avatar}</div>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            ${!isSent && message.senderId !== 0 ? `<div class="message-sender">${message.sender}</div>` : ""}
                            <div class="message-text">${hasFile ? "" : messageContent}</div>
                            ${filePreview}
                            <div class="message-time">
                                ${message.time}
                                ${isSent ? `<span class="message-status"><i class="${getStatusIcon(message.status)}"></i></span>` : ""}
                            </div>
                        </div>
                        ${
                          isSent && message.status === "read"
                            ? `
                            <div class="read-receipts">
                                <div class="read-avatar" style="background-color: ${getAvatarColor("JS")}">J</div>
                                <div class="read-avatar" style="background-color: ${getAvatarColor("AJ")}">A</div>
                            </div>
                        `
                            : ""
                        }
                        ${
                          isSent
                            ? `
                            <div class="message-status-timeline">
                                Sent ${message.time} • Delivered ${message.time} • Read ${message.time}
                            </div>
                        `
                            : ""
                        }
                    </div>
                `;

    messagesContainer.appendChild(messageElement);
  });

  // Show typing indicator for Jane Smith if it's the active chat
  if (chatId === 1) {
    typingIndicator.style.display = "flex";
  } else {
    typingIndicator.style.display = "none";
  }

  // Scroll to the bottom
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

// Render online users panel
function renderOnlineUsers() {
  onlineUsersList.innerHTML = "";

  const onlineUsers = users.filter(
    (user) =>
      (user.status === "online" || user.status === "typing") &&
      user.id !== activeChatId,
  );

  onlineUsers.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.className = "online-user";
    userElement.addEventListener("click", () => {
      switchChat(user.id);
    });

    const statusClass = user.status === "online" ? "online" : "typing";

    userElement.innerHTML = `
                    <div class="online-user-avatar" style="background: linear-gradient(135deg, ${getAvatarColor(user.avatar)}, ${getAvatarColor(user.avatar)}80)">
                        ${user.avatar}
                        <div class="chat-status ${statusClass}" style="border-color: var(--card-bg)"></div>
                    </div>
                    <div class="online-user-info">
                        <h4>${user.name}</h4>
                        <p>Connected to Server #${Math.floor(Math.random() * 4) + 1}</p>
                    </div>
                `;
    onlineUsersList.appendChild(userElement);
  });

  // Update online count
  document.getElementById("online-count").textContent = onlineUsers.length;
}

// Switch to a different chat
function switchChat(chatId) {
  activeChatId = chatId;
  renderChatsList();
  renderMessages(chatId);
  renderOnlineUsers();

  // Hide typing indicator when switching chats
  if (chatId !== 1) {
    typingIndicator.style.display = "none";
  }

  // Close mobile sidebar on mobile
  if (isMobile) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }

  // Show/hide smart replies
  if (chatId === 1) {
    smartReplies.style.display = "flex";
  } else {
    smartReplies.style.display = "none";
  }
}

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

// Simulate a reply from the other person
function simulateReply() {
  const replies = [
    "That sounds like a solid implementation!",
    "How are you handling database sharding?",
    "The monitoring dashboard looks great with those real-time metrics",
    "Have you considered adding end-to-end encryption?",
    "What's your strategy for handling server failures?",
    "The load balancing setup seems robust",
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  const replyMessage = {
    id: messages[activeChatId].length + 1,
    sender: "Jane Smith",
    senderId: 1,
    content: randomReply,
    time: getCurrentTime(),
    status: "read",
  };

  messages[activeChatId].push(replyMessage);
  renderMessages(activeChatId);
  renderChatsList(searchInput.value);
}

// Simulate reply for other chats
function simulateOtherReply() {
  const activeChat = users.find((u) => u.id === activeChatId);
  const senderName = activeChat.name.split(" ")[0];
  const replies = [
    "Thanks for the update!",
    "Let me review that and get back to you",
    "Great progress on the project",
    "Can you share more details about the implementation?",
    "Looking forward to the demo",
    "The system architecture looks solid",
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  const replyMessage = {
    id: messages[activeChatId].length + 1,
    sender: activeChat.name,
    senderId: activeChat.id,
    content: randomReply,
    time: getCurrentTime(),
    status: "read",
  };

  if (!messages[activeChatId]) {
    messages[activeChatId] = [];
  }

  messages[activeChatId].push(replyMessage);
  renderMessages(activeChatId);
  renderChatsList(searchInput.value);
}

// Attach file function
function attachFile(type) {
  const files = {
    document: [
      "design-system.pdf",
      "technical-specs.docx",
      "project-budget.xlsx",
      "presentation-deck.pptx",
    ],
    image: [
      "screenshot.png",
      "team-photo.jpg",
      "architecture-diagram.svg",
      "ui-mockup.png",
    ],
    audio: ["meeting-recording.mp3", "voice-message.m4a", "audio-note.wav"],
  };

  const randomFile =
    files[type][Math.floor(Math.random() * files[type].length)];

  const newMessage = {
    id: messages[activeChatId] ? messages[activeChatId].length + 1 : 1,
    sender: "You",
    senderId: 0,
    content: `[FILE] ${randomFile}`,
    time: getCurrentTime(),
    status: "sent",
  };

  if (!messages[activeChatId]) {
    messages[activeChatId] = [];
  }

  messages[activeChatId].push(newMessage);
  renderMessages(activeChatId);
  renderChatsList(searchInput.value);

  // Close modal and show notification
  attachmentsModal.classList.remove("active");
  overlay.classList.remove("active");
  showNotification(
    "File sent successfully",
    "success",
    `${randomFile} has been uploaded`,
  );
}

// Attach location
function attachLocation() {
  const locations = [
    "San Francisco, CA",
    "New York, NY",
    "London, UK",
    "Tokyo, Japan",
  ];

  const randomLocation =
    locations[Math.floor(Math.random() * locations.length)];

  const newMessage = {
    id: messages[activeChatId] ? messages[activeChatId].length + 1 : 1,
    sender: "You",
    senderId: 0,
    content: `📍 Shared location: ${randomLocation}`,
    time: getCurrentTime(),
    status: "sent",
  };

  if (!messages[activeChatId]) {
    messages[activeChatId] = [];
  }

  messages[activeChatId].push(newMessage);
  renderMessages(activeChatId);
  renderChatsList(searchInput.value);

  // Close modal
  attachmentsModal.classList.remove("active");
  overlay.classList.remove("active");
  showNotification(
    "Location shared",
    "success",
    `Location shared with ${users.find((u) => u.id === activeChatId).name}`,
  );
}

// Simulate real-time features
function simulateRealTimeFeatures() {
  // Randomly update system metrics
  setInterval(() => {
    const connections = Math.floor(Math.random() * 2000) + 9000;
    const latency = Math.floor(Math.random() * 30) + 20;
    const load = Math.floor(Math.random() * 30) + 15;
    const shard = Math.floor(Math.random() * 8) + 1;
    const wsNode = `WS-Node-${Math.floor(Math.random() * 5) + 1}`;

    document.getElementById("connections-count").textContent =
      connections.toLocaleString();
    document.getElementById("message-latency").textContent = `${latency}ms`;
    document.getElementById("server-load").textContent = `${load}%`;
    document.getElementById("database-shard").textContent = `#${shard}`;

    // Update current user's connection info
    if (isLoggedIn) {
      currentUser.latency = `${latency}ms`;
      currentUser.wsServer = wsNode;
      currentUser.storageNode = `Database Shard #${shard}`;
      currentUser.lastSync = `${Math.floor(Math.random() * 5) + 1} min ago`;

      // Update profile modal if open
      updateProfileModal();
    }
  }, 5000);

  // Randomly update user statuses
  setInterval(() => {
    const randomUserIndex = Math.floor(Math.random() * users.length);
    if (users[randomUserIndex].status === "online") {
      users[randomUserIndex].status = "offline";
      users[randomUserIndex].lastSeen = "Just now";
    } else {
      users[randomUserIndex].status = "online";
    }

    renderOnlineUsers();
    renderChatsList(searchInput.value);

    // Update active chat if needed
    if (activeChatId === users[randomUserIndex].id) {
      renderMessages(activeChatId);
    }
  }, 15000);

  // Simulate typing indicator for Jane Smith
  setInterval(() => {
    if (activeChatId === 1 && Math.random() > 0.7) {
      users[0].status = "typing";
      renderChatsList(searchInput.value);
      renderMessages(activeChatId);

      setTimeout(() => {
        users[0].status = "online";
        renderChatsList(searchInput.value);
        renderMessages(activeChatId);
      }, 3000);
    }
  }, 8000);
}

// Set up event listeners
function setupEventListeners() {
  // Send message
  sendBtn.addEventListener("click", sendMessage);

  // Message input events
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  messageInput.addEventListener("input", () => {
    adjustTextareaHeight();
    updateSendButton();

    // Show smart replies when typing
    if (messageInput.value.length > 0) {
      smartReplies.style.display = "flex";
    } else {
      smartReplies.style.display = "none";
    }
  });

  // Smart replies
  smartReplies.querySelectorAll(".smart-reply").forEach((reply) => {
    reply.addEventListener("click", () => {
      messageInput.value = reply.dataset.reply;
      adjustTextareaHeight();
      updateSendButton();
      messageInput.focus();
    });
  });

  // Mobile menu button
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  // Back button
  backButton.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
  });

  // Overlay click
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    closeAllModals();
  });

  // Profile dropdown toggle
  profileDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("active");
    userProfile.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userProfile.contains(e.target)) {
      profileDropdown.classList.remove("active");
      userProfile.classList.remove("active");
    }
  });

  // View profile button
  viewProfileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showUserProfile();
    profileDropdown.classList.remove("active");
    userProfile.classList.remove("active");
  });

  // Logout button
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // toggleLoginState();
    profileDropdown.classList.remove("active");
    userProfile.classList.remove("active");
    localStorage.removeItem("token");
    localStorage.removeItem("userCredentials");
    window.location.href = "/";
  });

  // Settings button
  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showSettingsModal();
    profileDropdown.classList.remove("active");
    userProfile.classList.remove("active");
  });

  // Dark mode button
  darkModeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleDarkMode();
    profileDropdown.classList.remove("active");
    userProfile.classList.remove("active");
  });

  // Help button
  helpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showNotification("Help & Support", "info", "Help center would open here.");
    profileDropdown.classList.remove("active");
    userProfile.classList.remove("active");
  });

  // Privacy button
  privacyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showNotification(
      "Privacy & Security",
      "info",
      "Privacy settings would open here.",
    );
    profileDropdown.classList.remove("active");
    userProfile.classList.remove("active");
  });

  // Login button (on login page)
  loginBtn.addEventListener("click", () => {
    toggleLoginState();
  });

  // Theme toggle button
  themeToggleBtn.addEventListener("click", toggleDarkMode);

  // New chat button
  newChatBtn.addEventListener("click", () => {
    showNotification("New Chat", "info", "New chat dialog would open here.");
  });

  // User profile modal
  document
    .getElementById("close-profile-modal")
    .addEventListener("click", () => {
      userProfileModal.classList.remove("active");
      overlay.classList.remove("active");
    });

  document.getElementById("close-profile-btn").addEventListener("click", () => {
    userProfileModal.classList.remove("active");
    overlay.classList.remove("active");
  });

  document.getElementById("edit-profile-btn").addEventListener("click", () => {
    showNotification(
      "Edit Profile",
      "info",
      "Profile editing feature would be implemented here.",
    );
    userProfileModal.classList.remove("active");
    overlay.classList.remove("active");
  });

  // Attach file button
  attachBtn.addEventListener("click", () => {
    attachmentsModal.classList.add("active");
    if (isMobile) overlay.classList.add("active");
  });

  // Close attachments modal
  document
    .getElementById("close-attach-modal")
    .addEventListener("click", () => {
      attachmentsModal.classList.remove("active");
      overlay.classList.remove("active");
    });

  // Attachment options
  document
    .getElementById("attach-document")
    .addEventListener("click", () => attachFile("document"));
  document
    .getElementById("attach-image")
    .addEventListener("click", () => attachFile("image"));
  document
    .getElementById("attach-audio")
    .addEventListener("click", () => attachFile("audio"));
  document
    .getElementById("attach-location")
    .addEventListener("click", attachLocation);

  // Emoji button
  emojiBtn.addEventListener("click", () => {
    const emojis = ["😀", "👍", "🚀", "💡", "🎯", "🔥", "❤️", "😂"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    messageInput.value += randomEmoji;
    messageInput.focus();
    adjustTextareaHeight();
    updateSendButton();
  });

  // Audio call button
  audioCallBtn.addEventListener("click", () => {
    showNotification(
      "Starting audio call...",
      "info",
      "WebRTC integration would be implemented here.",
    );
  });

  // Video call button
  videoCallBtn.addEventListener("click", () => {
    showNotification(
      "Starting video call...",
      "info",
      "WebRTC integration would be implemented here.",
    );
  });

  // Chat info button
  chatInfoBtn.addEventListener("click", showChatInfo);

  // Close chat info modal
  document
    .getElementById("close-chat-info-modal")
    .addEventListener("click", () => {
      chatInfoModal.classList.remove("active");
      overlay.classList.remove("active");
    });

  document.getElementById("close-chat-info").addEventListener("click", () => {
    chatInfoModal.classList.remove("active");
    overlay.classList.remove("active");
  });

  document.getElementById("view-chat-media").addEventListener("click", () => {
    showNotification("View Media", "info", "Media gallery would open here.");
    chatInfoModal.classList.remove("active");
    overlay.classList.remove("active");
  });

  // Settings modal
  document
    .getElementById("close-settings-modal")
    .addEventListener("click", () => {
      settingsModal.classList.remove("active");
      overlay.classList.remove("active");
    });

  document.getElementById("save-settings").addEventListener("click", () => {
    showNotification(
      "Settings Saved",
      "success",
      "Your preferences have been updated.",
    );
    settingsModal.classList.remove("active");
    overlay.classList.remove("active");
  });

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    renderChatsList(e.target.value);
  });

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
      overlay.classList.remove("active");
    }
  });
}
// Update current user info
function updateCurrentUserInfo() {
  username.forEach((e) => {
    e.innerHTML = `${currentUSER.firstName} ${currentUSER.lastName}`;
  });
  currentUserAvatarText.forEach((e) => {
    e.innerHTML = `${currentUSER.firstName[0]}${currentUSER.lastName[0]}`;
  });
  document.getElementById("currentUserEmail").innerHTML = currentUSER.email;
  currentUserAvatarText.forEach((e) => {
    e.innerHTML = `${currentUSER.firstName[0]}${currentUSER.lastName[0]}`;
    e.style.background = `linear-gradient(135deg, ${getAvatarColor(currentUSER.firstName[0] + currentUSER.lastName[0])}, ${getAvatarColor(currentUSER.firstName[0] + currentUSER.lastName[0])}80)`;
  });
}

// Show user profile modal
function showUserProfile() {
  // Update modal with current user data
  document.getElementById("profile-modal-avatar").textContent =
    currentUser.avatar;
  document.getElementById("profile-modal-avatar").style.background =
    `linear-gradient(135deg, ${getAvatarColor(currentUser.avatar)}, ${getAvatarColor(currentUser.avatar)}80)`;
  document.getElementById("profile-modal-name").textContent = currentUser.name;
  document.getElementById("profile-modal-email").textContent =
    currentUser.email;
  document.getElementById("profile-modal-status").textContent =
    currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1);
  document.getElementById("profile-modal-username").textContent =
    currentUser.username;
  document.getElementById("profile-modal-userid").textContent =
    currentUser.userId;
  document.getElementById("profile-modal-joined").textContent =
    currentUser.joinedDate;
  document.getElementById("profile-modal-storage").textContent =
    currentUser.storageNode;
  document.getElementById("profile-modal-ws").textContent =
    currentUser.wsServer;
  document.getElementById("profile-modal-latency").textContent =
    currentUser.latency;
  document.getElementById("profile-modal-sync").textContent =
    currentUser.lastSync;

  // Show modal
  userProfileModal.classList.add("active");
  if (isMobile) overlay.classList.add("active");
}

// Update profile modal with real-time data
function updateProfileModal() {
  if (userProfileModal.classList.contains("active")) {
    document.getElementById("profile-modal-latency").textContent =
      currentUser.latency;
    document.getElementById("profile-modal-ws").textContent =
      currentUser.wsServer;
    document.getElementById("profile-modal-storage").textContent =
      currentUser.storageNode;
    document.getElementById("profile-modal-sync").textContent =
      currentUser.lastSync;
  }
}

// Show chat info
function showChatInfo() {
  const activeChat = users.find((u) => u.id === activeChatId);
  const chatMessages = messages[activeChatId] || [];

  // Update modal content
  document.getElementById("chat-info-avatar").textContent = activeChat.avatar;
  document.getElementById("chat-info-avatar").style.background =
    `linear-gradient(135deg, ${getAvatarColor(activeChat.avatar)}, ${getAvatarColor(activeChat.avatar)}80)`;
  document.getElementById("chat-info-title").textContent = activeChat.name;

  if (activeChat.participants) {
    document.getElementById("chat-info-subtitle").textContent =
      `Group Chat • ${activeChat.participants} participants`;
  } else {
    document.getElementById("chat-info-subtitle").textContent =
      `Direct Message • ${activeChat.status === "online" ? "Online" : `Last seen ${activeChat.lastSeen}`}`;
  }

  document.getElementById("chat-message-count").textContent =
    chatMessages.length;

  // Show modal
  chatInfoModal.classList.add("active");
  if (isMobile) overlay.classList.add("active");
}

// Show settings modal
function showSettingsModal() {
  settingsModal.classList.add("active");
  if (isMobile) overlay.classList.add("active");
}

// Toggle dark mode
function toggleDarkMode() {
  darkMode = !darkMode;
  const htmlElement = document.documentElement;

  if (darkMode) {
    htmlElement.setAttribute("data-theme", "dark");
    document.getElementById("logo-icon").src = "/public/assets/lightMode.svg";
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    document.getElementById("theme-status").textContent = "Dark Mode";
    localStorage.setItem("nexuschat-theme", "dark");
    showNotification(
      "Dark Mode Enabled",
      "success",
      "Interface switched to dark theme.",
    );
  } else {
    htmlElement.setAttribute("data-theme", "light");
    document.getElementById("logo-icon").src = "/public/assets/favicon.svg";
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    document.getElementById("theme-status").textContent = "Light Mode";
    localStorage.setItem("nexuschat-theme", "light");
    showNotification(
      "Light Mode Enabled",
      "success",
      "Interface switched to light theme.",
    );
  }
}

// Close all modals
function closeAllModals() {
  userProfileModal.classList.remove("active");
  attachmentsModal.classList.remove("active");
  chatInfoModal.classList.remove("active");
  settingsModal.classList.remove("active");
  profileDropdown.classList.remove("active");
  userProfile.classList.remove("active");
}

// Show notification
function showNotification(title, type = "success", message = "") {
  const notificationIcon = notification.querySelector(".notification-icon");
  const notificationTitle = document.getElementById("notification-title");
  const notificationMessage = document.getElementById("notification-message");

  // Set icon and class based on type
  notification.className = `notification ${type}`;
  notificationIcon.className = `notification-icon ${type}`;
  let iconClass = "fas fa-check";
  if (type === "warning") iconClass = "fas fa-exclamation-triangle";
  if (type === "error") iconClass = "fas fa-times-circle";
  if (type === "info") iconClass = "fas fa-info-circle";

  notificationIcon.innerHTML = `<i class="${iconClass}"></i>`;
  notificationTitle.textContent = title;
  notificationMessage.textContent = message || title;

  notification.classList.add("active");

  setTimeout(() => {
    notification.classList.remove("active");
  }, 800);
}

// Download file function
function downloadFile(filename) {
  showNotification(
    "Downloading file",
    "info",
    `${filename} is being downloaded`,
  );
  // In a real app, this would trigger an actual download
  setTimeout(() => {
    showNotification(
      "Download complete",
      "success",
      `${filename} downloaded successfully`,
    );
  }, 1500);
}

// Update send button state
function updateSendButton() {
  sendBtn.disabled = messageInput.value.trim() === "";
}

// Helper functions
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getAvatarColor(avatarText) {
  const colors = [
    "#007AFF",
    "#5856D6",
    "#FF2D55",
    "#FF9500",
    "#34C759",
    "#5AC8FA",
    "#FFCC00",
    "#AF52DE",
  ];
  const index = avatarText.charCodeAt(0) % colors.length;
  return colors[index];
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

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", init);
