const io = require('socket.io-client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n📊 NEXUSCHAT LATENCY TESTER\n");

let username = "";
let receiver = "";
let token = "";

// First ask for username
rl.question('Enter YOUR username: ', (user) => {
  username = user;
  
  rl.question('Enter receiver username: ', (rec) => {
    receiver = rec;
    
    rl.question('Enter JWT token (optional - press Enter to skip): ', (t) => {
      token = t || "";
      
      startTest();
    });
  });
});

function startTest() {
  const SOCKET_URL = 'http://localhost:5000';
  const latencies = [];
  const TEST_COUNT = 10;
  let sentCount = 0;
  let receivedCount = 0;
  const sendTimes = new Map();
  
  console.log(`\n🔄 Connecting to ${SOCKET_URL} as "${username}"...`);
  
  // Create socket connection with auth
  const socket = io(SOCKET_URL, {
    auth: { 
      username: username,
      token: token 
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 3
  });
  
  socket.on('connect', () => {
    console.log('✅ Connected! Socket ID:', socket.id);
    console.log(`📤 Will send ${TEST_COUNT} test messages to "${receiver}"...\n`);
    
    // Send first message after 2 seconds
    setTimeout(sendNextMessage, 2000);
  });
  
  function sendNextMessage() {
    if (sentCount >= TEST_COUNT) {
      console.log('\n⏳ All messages sent. Waiting for responses...');
      return;
    }
    
    sentCount++;
    const sendTime = Date.now();
    const messageId = `msg_${sendTime}_${sentCount}`;
    
    console.log(`   📨 Sending ${sentCount}/${TEST_COUNT}...`);
    
    socket.emit('send_message', {
      receiverUsername: receiver,
      content: `Latency test message ${sentCount}`,
      type: "text"
    });
    
    // Store send time
    sendTimes.set(messageId, sendTime);
    
    // Schedule next message
    setTimeout(sendNextMessage, 1500);
  }
  
  // Listen for incoming messages
  socket.on('receive_message', (msg) => {
    const receiveTime = Date.now();
    receivedCount++;
    
    // Calculate latency (approximate - using most recent send time)
    const recentSendTimes = Array.from(sendTimes.values());
    if (recentSendTimes.length > 0) {
      const latestSendTime = Math.max(...recentSendTimes);
      const latency = receiveTime - latestSendTime;
      latencies.push(latency);
      
      console.log(`   📬 Received ${receivedCount}/${TEST_COUNT} - Latency: ${latency}ms`);
    } else {
      console.log(`   📬 Received ${receivedCount}/${TEST_COUNT} - No send time reference`);
    }
    
    // Show message preview
    console.log(`      From: ${msg.senderId} | Content: ${msg.content.substring(0, 30)}...`);
    
    // When all messages received, show results
    if (receivedCount >= TEST_COUNT) {
      showResults();
    }
  });
  
  socket.on('message_sent', (data) => {
    // console.log(`   ✅ Server confirmed: ${data.chatId}`);
  });
  
  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('\n⚠️ Disconnected:', reason);
  });
  
  function showResults() {
    console.log("\n" + "═".repeat(50));
    console.log("📊 LATENCY TEST RESULTS");
    console.log("═".repeat(50));
    
    if (latencies.length === 0) {
      console.log("\n   ❌ No latency data collected");
      return;
    }
    
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    
    // Sort for percentiles
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    console.log(`\n   📈 Average: ${avg.toFixed(2)}ms`);
    console.log(`   📉 Minimum: ${min}ms`);
    console.log(`   📊 Maximum: ${max}ms`);
    console.log(`   🔵 95th percentile: ${p95 || 0}ms`);
    console.log(`   🔴 99th percentile: ${p99 || 0}ms`);
    console.log(`   📋 Sample size: ${latencies.length} messages`);
    
    console.log("\n" + "═".repeat(50));
    console.log("✅ Test complete! Press Ctrl+C to exit.");
    
    // Don't auto-exit, let user see results
  }
}

process.on('SIGINT', () => {
  console.log('\n\n👋 Test ended by user');
  process.exit(0);
});