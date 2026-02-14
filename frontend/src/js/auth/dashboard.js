const token = localStorage.getItem("token");
if (!token) {
  alert("Unauthorized. Please login again.");
  window.location.href = "/";
}
import {renderChatsList,renderMessages,getAvatarColor,sendMessage,updateCurrentUserInfo,isLoggedIn,handleResize,currentUser,isMobile,adjustTextareaHeight,messages,fetchMessages} from "/src/js/chat/chat.js"
import {activeChatId,users,setActiveChatId} from "/src/js/auth/chatState.js"


const currentUSER = JSON.parse(localStorage.getItem("userCredentials")) || {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com"
};

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
const activeChatParticipants = document.getElementById("active-chat-participants");
const onlineUsersList = document.getElementById("online-users-list");
const searchInput = document.getElementById("search-input");
const overlay = document.getElementById("overlay");
const profileDropdownBtn = document.getElementById("profile-dropdown-btn");
const profileDropdown = document.getElementById("profile-dropdown");
const userProfile = document.getElementById("user-profile");
const username = document.querySelectorAll(".username");
const currentUserAvatarText = document.querySelectorAll(".currentUserAvatarText");
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

// Current state
let typingTimeout = null;
let darkMode = false;
let typingInterval = null;

// Render online users panel
function renderOnlineUsers() {
  onlineUsersList.innerHTML = "";

  const onlineUsers = users.filter(
    (user) =>
      (user.status === "online" || user.status === "typing") &&
      user.id !== activeChatId
  );

  if (onlineUsers.length === 0) {
    onlineUsersList.innerHTML = `
      <div class="empty-chat">
        <div class="empty-chat-icon">
          <i class="far fa-user"></i>
        </div>
        <h3>No Online Users</h3>
        <p>All friends are offline</p>
      </div>
    `;
    document.getElementById("online-count").textContent = "0";
    return;
  }

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
        <p>${user.status === "online" ? "Online" : "Typing..."}</p>
      </div>
    `;
    onlineUsersList.appendChild(userElement);
  });

  document.getElementById("online-count").textContent = onlineUsers.length;
}

// Switch to a different chat
async function switchChat(chatId) {
  setActiveChatId(chatId);
  await fetchMessages(chatId);
  renderChatsList();
  renderMessages(chatId);
  renderOnlineUsers();
  console.log(activeChatId);
  if (isMobile) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }

  if (messageInput.value.length > 0) {
    smartReplies.style.display = "flex";
  } else {
    smartReplies.style.display = "none";
  }
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

      updateProfileModal();
    }
  }, 5000);

  // Randomly update user statuses
  // setInterval(() => {
  //   const randomUserIndex = Math.floor(Math.random() * users.length);
  //   if (users[randomUserIndex].status === "online") {
  //     users[randomUserIndex].status = "offline";
  //     users[randomUserIndex].lastSeen = "Just now";
  //   } else if (users[randomUserIndex].status === "offline" && Math.random() > 0.3) {
  //     users[randomUserIndex].status = "online";
  //   }

  //   renderOnlineUsers();
  //   renderChatsList(searchInput.value);

  //   // Update active chat if needed
  //   if (activeChatId === users[randomUserIndex].id) {
  //     renderMessages(activeChatId);
  //   }
  // }, 15000);

  // Simulate typing indicators
  // setInterval(() => {
  //   if (activeChatId && Math.random() > 0.7) {
  //     const activeChat = users.find(u => u.id === activeChatId);
  //     if (activeChat) {
  //       activeChat.status = "typing";
  //       renderChatsList(searchInput.value);
  //       renderMessages(activeChatId);

  //       setTimeout(() => {
  //         activeChat.status = "online";
  //         renderChatsList(searchInput.value);
  //         renderMessages(activeChatId);
  //       }, 3000);
  //     }
  //   }
  // }, 8000);
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
  document.getElementById("close-profile-modal").addEventListener("click", () => {
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
    if (!activeChatId) {
      showNotification("No Chat Selected", "error", "Please select a chat first.");
      return;
    }
    attachmentsModal.classList.add("active");
    if (isMobile) overlay.classList.add("active");
  });

  // Close attachments modal
  document.getElementById("close-attach-modal").addEventListener("click", () => {
    attachmentsModal.classList.remove("active");
    overlay.classList.remove("active");
  });

  // Attachment options
  document.getElementById("attach-document").addEventListener("click", () => attachFile("document"));
  document.getElementById("attach-image").addEventListener("click", () => attachFile("image"));
  document.getElementById("attach-audio").addEventListener("click", () => attachFile("audio"));
  document.getElementById("attach-location").addEventListener("click", attachLocation);

  // Emoji button
  emojiBtn.addEventListener("click", () => {
    if (!activeChatId) {
      showNotification("No Chat Selected", "error", "Please select a chat first.");
      return;
    }
    const emojis = ["😀", "👍", "🚀", "💡", "🎯", "🔥", "❤️", "😂"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    messageInput.value += randomEmoji;
    messageInput.focus();
    adjustTextareaHeight();
    updateSendButton();
  });

  // Audio call button
  audioCallBtn.addEventListener("click", () => {
    if (!activeChatId) {
      showNotification("No Chat Selected", "error", "Please select a chat first.");
      return;
    }
    showNotification(
      "Starting audio call...",
      "info",
      "WebRTC integration would be implemented here.",
    );
  });

  // Video call button
  videoCallBtn.addEventListener("click", () => {
    if (!activeChatId) {
      showNotification("No Chat Selected", "error", "Please select a chat first.");
      return;
    }
    showNotification(
      "Starting video call...",
      "info",
      "WebRTC integration would be implemented here.",
    );
  });

  // Chat info button
  chatInfoBtn.addEventListener("click", showChatInfo);

  // Close chat info modal
  document.getElementById("close-chat-info-modal").addEventListener("click", () => {
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
  document.getElementById("close-settings-modal").addEventListener("click", () => {
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

  const randomFile = files[type][Math.floor(Math.random() * files[type].length)];

  const newMessage = {
    id: Date.now(),
    sender: currentUSER.username,
    senderId: currentUSER.username,
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

  const randomLocation = locations[Math.floor(Math.random() * locations.length)];

  const newMessage = {
    id: Date.now(),
    sender: currentUSER.username,
    senderId: currentUSER.username,
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

  attachmentsModal.classList.remove("active");
  overlay.classList.remove("active");
  showNotification(
    "Location shared",
    "success",
    `Location shared with ${users.find((u) => u.id === activeChatId).name}`,
  );
}

// Update send button state
function updateSendButton() {
  sendBtn.disabled = messageInput.value.trim() === "" || !activeChatId;
}

// Show user profile modal
function showUserProfile() {
  document.getElementById("profile-modal-avatar").textContent = currentUser.avatar;
  document.getElementById("profile-modal-avatar").style.background =
    `linear-gradient(135deg, ${getAvatarColor(currentUser.avatar)}, ${getAvatarColor(currentUser.avatar)}80)`;
  document.getElementById("profile-modal-name").textContent = currentUser.name;
  document.getElementById("profile-modal-email").textContent = currentUser.email;
  document.getElementById("profile-modal-status").textContent =
    currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1);
  document.getElementById("profile-modal-username").textContent = currentUser.username;
  document.getElementById("profile-modal-userid").textContent = currentUser.userId;
  document.getElementById("profile-modal-joined").textContent = currentUser.joinedDate;
  document.getElementById("profile-modal-storage").textContent = currentUser.storageNode;
  document.getElementById("profile-modal-ws").textContent = currentUser.wsServer;
  document.getElementById("profile-modal-latency").textContent = currentUser.latency;
  document.getElementById("profile-modal-sync").textContent = currentUser.lastSync;

  userProfileModal.classList.add("active");
  if (isMobile) overlay.classList.add("active");
}

// Update profile modal with real-time data
function updateProfileModal() {
  if (userProfileModal.classList.contains("active")) {
    document.getElementById("profile-modal-latency").textContent = currentUser.latency;
    document.getElementById("profile-modal-ws").textContent = currentUser.wsServer;
    document.getElementById("profile-modal-storage").textContent = currentUser.storageNode;
    document.getElementById("profile-modal-sync").textContent = currentUser.lastSync;
  }
}

// Show chat info
function showChatInfo() {
  if (!activeChatId) {
    showNotification("No Chat Selected", "error", "Please select a chat first.");
    return;
  }

  const activeChat = users.find((u) => u.id === activeChatId);
  const chatMessages = messages[activeChatId] || [];

  document.getElementById("chat-info-avatar").textContent = activeChat.avatar;
  document.getElementById("chat-info-avatar").style.background =
    `linear-gradient(135deg, ${getAvatarColor(activeChat.avatar)}, ${getAvatarColor(activeChat.avatar)}80)`;
  document.getElementById("chat-info-title").textContent = activeChat.name;
  document.getElementById("chat-info-subtitle").textContent =
    `Direct Message • ${activeChat.status === "online" ? "Online" : `Last seen ${activeChat.lastSeen}`}`;
  document.getElementById("chat-message-count").textContent = chatMessages.length;

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
  }, 3000);
}

// Download file function
function downloadFile(filename) {
  showNotification(
    "Downloading file",
    "info",
    `${filename} is being downloaded`,
  );
  setTimeout(() => {
    showNotification(
      "Download complete",
      "success",
      `${filename} downloaded successfully`,
    );
  }, 1500);
}

// Toggle login/logout
function toggleLoginState() {
  isLoggedIn = !isLoggedIn;

  if (isLoggedIn) {
    chatInterface.style.display = "flex";
    loginPage.classList.remove("active");
    showNotification(
      "Welcome back!",
      "success",
      "Successfully logged in to NexusChat.",
    );
  } else {
    chatInterface.style.display = "none";
    loginPage.classList.add("active");
    showNotification(
      "Logged out",
      "success",
      "You have been logged out successfully.",
    );
    closeAllModals();
  }
}


// Initialize the application
async function init() {
  if (users.length === 0) {
    loadingScreen.innerHTML = `
      <div class="empty-chat">
        <div class="empty-chat-icon">
          <i class="far fa-comments"></i>
        </div>
        <h3>No Friends Found</h3>
        <p>Add some friends to start chatting!</p>
      </div>
    `;
    return;
  }

    loadingScreen.classList.add("hidden");
    chatInterface.style.display = "flex";
    loginPage.style.display = "none";

    renderChatsList();
    if (activeChatId) {
      await fetchMessages(activeChatId);
      renderMessages(activeChatId);
    }
    renderOnlineUsers();
    setupEventListeners();
    updateCurrentUserInfo();

    simulateRealTimeFeatures();

    window.addEventListener("resize", handleResize);

    const savedTheme = localStorage.getItem("nexuschat-theme");
    if (savedTheme === "dark") {
      toggleDarkMode();
    }
}


// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", init);



export {switchChat,updateSendButton,showNotification,renderOnlineUsers};