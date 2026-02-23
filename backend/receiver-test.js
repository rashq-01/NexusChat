const io = require('socket.io-client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n🤖 NEXUSCHAT AUTO-RECEIVER\n");

rl.question('Enter receiver username: ', (username) => {
  rl.question('Enter JWT token (optional): ', (token) => {
    
    const SOCKET_URL = 'http://localhost:5000';
    let messageCount = 0;
    
    console.log(`\n🔄 Connecting as "${username}"...`);
    
    const socket = io(SOCKET_URL, {
      auth: { 
        username: username,
        token: token 
      },
      transports: ['websocket']
    });
    
    socket.on('connect', () => {
      console.log('✅ Receiver connected! Socket ID:', socket.id);
      console.log('🤖 Waiting for test messages...\n');
    });
    
    socket.on('receive_message', (msg) => {
      messageCount++;
      
      console.log(`\n📨 [${messageCount}] Received from ${msg.senderId}:`);
      console.log(`   Content: ${msg.content}`);
      
      // Auto-reply immediately
      if (msg.content.includes('Latency test')) {
        console.log(`   🤖 Auto-replying...`);
        
        socket.emit('send_message', {
          receiverUsername: msg.senderId,
          content: `Auto-reply to message ${messageCount}`,
          type: 'text'
        });
        
        console.log(`   ✅ Reply sent`);
      }
    });
    
    socket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
    });
    
    console.log('\n⏎ Press Enter to stop receiver\n');
    rl.on('line', () => {
      socket.disconnect();
      console.log('👋 Receiver stopped');
      process.exit(0);
    });
  });
});

