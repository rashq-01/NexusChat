const crypto = require('crypto');

module.exports = {
  setupUser: (context, events, done) => {
    // Generate unique username
    const userId = context.vars.$scenarioId;
    const randomId = crypto.randomBytes(4).toString('hex');
    
    context.vars.username = `loadtest_${userId}_${randomId}`;
    context.vars.targetUser = `target_${Math.floor(Math.random() * 10)}`; // Random target
    context.vars.timestamp = Date.now();
    
    // Track metrics
    if (!global.metrics) {
      global.metrics = {
        users: 0,
        messages: 0,
        errors: 0,
        startTime: Date.now()
      };
    }
    global.metrics.users++;
    
    // Log every 100 users
    if (global.metrics.users % 100 === 0) {
      console.log(`📊 Users created: ${global.metrics.users}`);
    }
    
    return done();
  },
  
  onError: (context, events, done) => {
    global.metrics.errors++;
    console.error(`❌ Error for user ${context.vars.username}:`, context.error);
    return done();
  }
};
