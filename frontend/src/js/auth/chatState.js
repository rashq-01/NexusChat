const friends = JSON.parse(localStorage.getItem("friends")) || [];
// Helper functions
function getRandomStatus() {
  const statuses = ["online", "offline", "idle", "typing"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomLastSeen() {
  const lastSeenOptions = ["Just now", "2 min ago", "5 min ago", "10 min ago", "1 hour ago", "Yesterday"];
  return lastSeenOptions[Math.floor(Math.random() * lastSeenOptions.length)];
}

// Convert friends to users format and create dummy messages
const users = friends.map((friend) => ({
  id: friend.username,
  name: `${friend.firstName} ${friend.lastName}`,
  avatar: `${friend.firstName[0]}${friend.lastName[0]}`,
  status: "offline",
  lastSeen: getRandomLastSeen(),
  chatId: `#CHAT-${friend._id.slice(-3)}`,
  verified: Math.random() > 0.5,
}));


let activeChatId = users[0]?.id ?? null;

function setActiveChatId(id) {
  activeChatId = id;
}

export { users, activeChatId, setActiveChatId };
