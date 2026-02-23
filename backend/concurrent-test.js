const puppeteer = require('puppeteer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n🌐 NEXUSCHAT CONCURRENT USER TEST\n");

rl.question('Enter your username: ', (username) => {
  rl.question('Enter password: ', async (password) => {
    rl.question('Number of concurrent users to simulate: ', async (count) => {
      
      const CONCURRENT_USERS = parseInt(count) || 10;
      console.log(`\n🚀 Simulating ${CONCURRENT_USERS} concurrent users...\n`);
      
      const browser = await puppeteer.launch({ 
        headless: false, // Set to true for headless mode
        args: ['--window-size=400,300']
      });
      
      const pages = [];
      const results = {
        successful: 0,
        failed: 0,
        connections: []
      };
      
      console.log("⏳ Opening browser windows...");
      
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        try {
          const page = await browser.newPage();
          
          // Set viewport smaller to fit many windows
          await page.setViewport({ width: 400, height: 300 });
          
          // Navigate to dashboard
          await page.goto('http://localhost:5000/public/dashboard.html', {
            waitUntil: 'networkidle2',
            timeout: 10000
          });
          
          // Check if we need to login
          const needsLogin = await page.evaluate(() => {
            return !localStorage.getItem('token');
          });
          
          if (needsLogin) {
            // Go to login page
            await page.goto('http://localhost:5000', {
              waitUntil: 'networkidle2'
            });
            
            // Fill login form
            await page.type('#username', username);
            await page.type('#password', password);
            
            // Click login and wait for navigation
            await Promise.all([
              page.click('.login-button'),
              page.waitForNavigation({ waitUntil: 'networkidle2' })
            ]);
          }
          
          // Wait for dashboard to load
          await page.waitForSelector('#chats-list', { timeout: 5000 });
          
          pages.push(page);
          results.successful++;
          
          process.stdout.write(`\r✅ ${results.successful} users connected...`);
          
        } catch (err) {
          results.failed++;
          console.log(`\n❌ User ${i+1} failed:`, err.message);
        }
      }
      
      console.log(`\n\n📊 TEST RESULTS:`);
      console.log(`   ✅ Successful: ${results.successful}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      console.log(`   📈 PEAK: Look at your server terminal!\n`);
      
      console.log("⏳ Keeping connections open for 30 seconds...");
      await new Promise(r => setTimeout(r, 30000));
      
      console.log("🔚 Closing all connections...");
      await browser.close();
      
      rl.close();
      process.exit(0);
    });
  });
});
