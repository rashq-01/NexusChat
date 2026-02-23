#!/usr/bin/env python3
"""
NEXUSCHAT ULTIMATE LOAD TEST
Find the TRUE maximum capacity of your server
"""

import asyncio
import socketio
import time
import sys
import os
from datetime import datetime
import signal

# Import psutil for system metrics
try:
    import psutil
    HAS_PSUTIL = True
    print("✅ psutil loaded - System metrics available")
except ImportError:
    HAS_PSUTIL = False
    print("⚠️ psutil not available - install with: pip install psutil")

# Configuration - ADJUST THESE!
SERVER_URL = 'http://localhost:5000'
START_USERS = 100
MAX_USERS = 5000  # We'll go until failure
INCREMENT = 100
HOLD_TIME = 15  # seconds at each level
MESSAGE_TEST_SIZE = 50  # users to send test messages

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

class Metrics:
    def __init__(self):
        self.connected = 0
        self.peak = 0
        self.messages_sent = 0
        self.messages_received = 0
        self.errors = 0
        self.latencies = []
        self.start_time = time.time()
        self.connection_attempts = 0
        self.connection_failures = 0
        self.total_users_created = 0
        
    @property
    def success_rate(self):
        if self.connection_attempts == 0:
            return 100.0
        return ((self.connection_attempts - self.connection_failures) / self.connection_attempts) * 100
    
    def report(self):
        uptime = time.time() - self.start_time
        os.system('clear' if os.name == 'posix' else 'cls')
        
        print(f"\n{Colors.BOLD}{Colors.HEADER}╔{'═'*60}╗{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}║{' '*18}NEXUSCHAT ULTIMATE LOAD TEST{' '*18}║{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}╠{'═'*60}╣{Colors.END}")
        
        # Connection metrics
        print(f"{Colors.BOLD}{Colors.BLUE}║  📊 CONNECTIONS{Colors.END}")
        print(f"║     Current: {self.connected:6d} users")
        print(f"║     Peak:    {self.peak:6d} users")
        print(f"║     Total created: {self.total_users_created:6d}")
        print(f"║     Success rate:  {self.success_rate:5.1f}%")
        
        # Message metrics
        print(f"\n{Colors.BOLD}{Colors.GREEN}║  📨 MESSAGES{Colors.END}")
        print(f"║     Sent:     {self.messages_sent:6d}")
        print(f"║     Received: {self.messages_received:6d}")
        if self.messages_sent > 0:
            delivery_rate = (self.messages_received / self.messages_sent) * 100
            color = Colors.GREEN if delivery_rate > 99 else Colors.YELLOW if delivery_rate > 95 else Colors.RED
            print(f"║     {color}Delivery:   {delivery_rate:5.1f}%{Colors.END}")
        
        # Latency metrics
        if self.latencies:
            recent = self.latencies[-50:]
            avg_lat = sum(recent) / len(recent)
            p95 = sorted(recent)[int(len(recent) * 0.95)]
            print(f"\n{Colors.BOLD}{Colors.YELLOW}║  ⚡ LATENCY{Colors.END}")
            print(f"║     Average: {avg_lat:6.1f}ms")
            print(f"║     95th percentile: {p95:6.1f}ms")
        
        # System metrics
        if HAS_PSUTIL:
            cpu = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            print(f"\n{Colors.BOLD}{Colors.BLUE}║  💻 SYSTEM{Colors.END}")
            print(f"║     CPU:    {cpu:5.1f}%")
            print(f"║     RAM:    {memory.percent:5.1f}% ({memory.used/1024/1024/1024:.1f}GB/{memory.total/1024/1024/1024:.1f}GB)")
            
            # Network connections
            try:
                connections = len([c for c in psutil.net_connections() if c.status == 'ESTABLISHED' and c.laddr.port == 5000])
                print(f"║     ESTABLISHED connections: {connections:4d}")
            except:
                pass
        
        # Test progress
        print(f"\n{Colors.BOLD}{Colors.HEADER}╠{'═'*60}╣{Colors.END}")
        print(f"║  ⏱️  Uptime: {uptime/60:5.1f} minutes")
        print(f"║  📈 Current target: {current_target}/{MAX_USERS} users")
        print(f"║  {Colors.RED}❌ Errors: {self.errors:4d}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}╚{'═'*60}╝{Colors.END}")
        print(f"\n{Colors.YELLOW}Press Ctrl+C to stop test{Colors.END}")

metrics = Metrics()
current_target = 0

class LoadUser:
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = f"loaduser_{user_id}"
        self.sio = socketio.Client(
            reconnection=True,
            reconnection_attempts=3,
            reconnection_delay=1,
            reconnection_delay_max=5
        )
        self.connected = False
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.sio.event
        def connect():
            self.connected = True
            metrics.connected += 1
            if metrics.connected > metrics.peak:
                metrics.peak = metrics.connected
            
        @self.sio.event
        def disconnect():
            self.connected = False
            metrics.connected -= 1
            
        @self.sio.event
        def connect_error(data):
            metrics.errors += 1
            
        @self.sio.on('receive_message')
        def on_message(data):
            metrics.messages_received += 1
            if '_sendTime' in data:
                latency = (time.time() * 1000) - data['_sendTime']
                metrics.latencies.append(latency)
    
    def connect(self):
        metrics.connection_attempts += 1
        try:
            self.sio.connect(
                SERVER_URL,
                auth={'username': self.username},
                transports=['websocket'],
                socketio_path='/socket.io',
                wait_timeout=10
            )
            metrics.total_users_created += 1
            return True
        except Exception as e:
            metrics.connection_failures += 1
            metrics.errors += 1
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self):
        try:
            send_time = time.time() * 1000
            self.sio.emit('send_message', {
                'receiverUsername': 'receiver_user',
                'content': f'Load test message from {self.username}',
                'type': 'text',
                '_sendTime': send_time
            })
            metrics.messages_sent += 1
            return True
        except:
            metrics.errors += 1
            return False

async def run_test():
    global current_target
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}🔥 NEXUSCHAT ULTIMATE LOAD TEST 🔥{Colors.END}")
    print(f"{Colors.YELLOW}Server: {SERVER_URL}{Colors.END}")
    print(f"{Colors.YELLOW}Max users to test: {MAX_USERS}{Colors.END}")
    print(f"{Colors.YELLOW}Increment: {INCREMENT} users every {HOLD_TIME} seconds{Colors.END}\n")
    
    # Create receiver user
    print("📡 Creating receiver user...")
    receiver = LoadUser(999999)
    if receiver.connect():
        print(f"{Colors.GREEN}✅ Receiver connected{Colors.END}")
    else:
        print(f"{Colors.RED}❌ Receiver failed to connect{Colors.END}")
        return
    
    await asyncio.sleep(2)
    
    users = []
    breaking_point = None
    failure_mode = None
    
    try:
        for target in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            current_target = target
            print(f"\n{Colors.BOLD}{Colors.BLUE}🚀 Scaling to {target} users...{Colors.END}")
            
            # Add new users
            new_users_needed = target - len(users)
            successful = 0
            failed = 0
            
            for i in range(new_users_needed):
                user = LoadUser(len(users) + i)
                if user.connect():
                    users.append(user)
                    successful += 1
                else:
                    failed += 1
                
                # Show progress
                if (i + 1) % 50 == 0:
                    metrics.report()
                    print(f"   Progress: {len(users)}/{target} (✅ {successful} | ❌ {failed})")
                
                await asyncio.sleep(0.02)  # Prevent overwhelming
            
            # Check if too many failures
            if failed > target * 0.1:  # More than 10% failures
                breaking_point = target
                failure_mode = f"Connection failures ({failed}/{new_users_needed} failed)"
                break
            
            # Stabilization period
            print(f"⏳ Stabilizing at {target} users for {HOLD_TIME} seconds...")
            for i in range(HOLD_TIME):
                await asyncio.sleep(1)
                if i % 5 == 0:
                    metrics.report()
            
            # Test messages
            print(f"📨 Testing message delivery...")
            msg_success = 0
            test_users = users[:min(MESSAGE_TEST_SIZE, len(users))]
            
            for user in test_users:
                if user.send_message():
                    msg_success += 1
                await asyncio.sleep(0.01)
            
            delivery_rate = (msg_success / len(test_users)) * 100
            print(f"   Message send success: {delivery_rate:.1f}%")
            
            if delivery_rate < 90:
                breaking_point = target
                failure_mode = f"Message delivery degraded ({delivery_rate:.1f}%)"
                break
            
            # Check system resources
            if HAS_PSUTIL:
                cpu = psutil.cpu_percent()
                memory = psutil.virtual_memory().percent
                if cpu > 90:
                    breaking_point = target
                    failure_mode = f"CPU limit reached ({cpu}%)"
                    break
                if memory > 90:
                    breaking_point = target
                    failure_mode = f"Memory limit reached ({memory}%)"
                    break
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}🛑 Test stopped by user{Colors.END}")
    
    finally:
        # Final report
        print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}📊 FINAL TEST RESULTS{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}")
        
        print(f"\n{Colors.BOLD}📈 CONCURRENT USERS{Colors.END}")
        print(f"   Peak achieved:   {metrics.peak}")
        if breaking_point:
            print(f"   Breaking point:  {breaking_point} ({failure_mode})")
        else:
            print(f"   Breaking point:  Not reached (tested up to {MAX_USERS})")
        
        print(f"\n{Colors.BOLD}📊 CONNECTION STATS{Colors.END}")
        print(f"   Total attempts:  {metrics.connection_attempts}")
        print(f"   Successful:      {metrics.connection_attempts - metrics.connection_failures}")
        print(f"   Failed:          {metrics.connection_failures}")
        print(f"   Success rate:    {metrics.success_rate:.1f}%")
        
        print(f"\n{Colors.BOLD}📨 MESSAGE STATS{Colors.END}")
        print(f"   Sent:            {metrics.messages_sent}")
        print(f"   Received:        {metrics.messages_received}")
        if metrics.messages_sent > 0:
            delivery = (metrics.messages_received / metrics.messages_sent) * 100
            print(f"   Delivery rate:   {delivery:.1f}%")
        
        if metrics.latencies:
            avg_lat = sum(metrics.latencies) / len(metrics.latencies)
            p95 = sorted(metrics.latencies)[int(len(metrics.latencies) * 0.95)]
            print(f"\n{Colors.BOLD}⚡ LATENCY{Colors.END}")
            print(f"   Average:         {avg_lat:.1f}ms")
            print(f"   95th percentile: {p95:.1f}ms")
        
        print(f"\n{Colors.BOLD}⏱️  TEST DURATION{Colors.END}")
        print(f"   {time.time() - metrics.start_time:.0f} seconds ({((time.time() - metrics.start_time)/60):.1f} minutes)")
        
        # Safe operating limit
        safe_limit = int(metrics.peak * 0.8)
        print(f"\n{Colors.BOLD}{Colors.GREEN}✅ RECOMMENDATIONS{Colors.END}")
        print(f"   Safe operating limit: {safe_limit} users")
        print(f"   Maximum tested:       {metrics.peak} users")
        if breaking_point:
            print(f"   System broke at:      {breaking_point} users")
        
        print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}")
        
        # Save results to file
        with open('load_test_results.txt', 'w') as f:
            f.write(f"NEXUSCHAT LOAD TEST RESULTS\n")
            f.write(f"Date: {datetime.now()}\n")
            f.write(f"Peak users: {metrics.peak}\n")
            f.write(f"Safe limit: {safe_limit}\n")
            if breaking_point:
                f.write(f"Breaking point: {breaking_point}\n")
            f.write(f"Success rate: {metrics.success_rate:.1f}%\n")
            f.write(f"Messages sent: {metrics.messages_sent}\n")
            f.write(f"Messages received: {metrics.messages_received}\n")
        
        # Cleanup
        print(f"\n{Colors.YELLOW}🔌 Disconnecting {len(users)} users...{Colors.END}")
        for user in users:
            user.disconnect()
        
        receiver.disconnect()
        print(f"{Colors.GREEN}✅ Test complete! Results saved to load_test_results.txt{Colors.END}")

def signal_handler(sig, frame):
    print(f"\n\n{Colors.RED}⚠️  Test interrupted{Colors.END}")
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    asyncio.run(run_test())
