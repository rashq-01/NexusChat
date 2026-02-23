#!/usr/bin/env python3
"""
NEXUSCHAT ULTIMATE LOAD TEST - FIXED VERSION
"""

import asyncio
import socketio
import time
import sys
import os
from datetime import datetime
import signal
import random

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

# CONFIGURATION - CHANGE THESE!
SERVER_URL = 'http://localhost:5000'
RECEIVER_USERNAME = 'rohan_tech'  # Use an ACTUAL user that exists!
START_USERS = 100
MAX_USERS = 5000
INCREMENT = 100
HOLD_TIME = 15
MESSAGE_TEST_SIZE = 50

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
        print(f"║     Success rate:  {(self.connection_attempts - self.connection_failures)/max(1,self.connection_attempts)*100:5.1f}%")
        
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
            print(f"║     RAM:    {memory.percent:5.1f}%")
        
        # Test progress
        print(f"\n{Colors.BOLD}{Colors.HEADER}╠{'═'*60}╣{Colors.END}")
        print(f"║  ⏱️  Uptime: {uptime/60:5.1f} minutes")
        print(f"║  📈 Target: {current_target}/{MAX_USERS} users")
        print(f"║  {Colors.RED}❌ Errors: {self.errors:4d}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}╚{'═'*60}╝{Colors.END}")

metrics = Metrics()
current_target = 0

class LoadUser:
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = f"loaduser_{user_id}"
        self.sio = socketio.Client(reconnection=True, reconnection_attempts=3)
        self.connected = False
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.sio.event
        def connect():
            self.connected = True
            metrics.connected += 1
            if metrics.connected > metrics.peak:
                metrics.peak = metrics.connected
            print(f"   ✅ {self.username} connected")
            
        @self.sio.event
        def disconnect():
            self.connected = False
            metrics.connected -= 1
            
        @self.sio.on('receive_message')
        def on_message(data):
            metrics.messages_received += 1
            print(f"   📬 Received message from {data.get('senderId', 'unknown')}")
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
                wait_timeout=10
            )
            metrics.total_users_created += 1
            return True
        except Exception as e:
            metrics.connection_failures += 1
            metrics.errors += 1
            print(f"   ❌ {self.username} failed: {str(e)[:50]}")
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self):
        try:
            send_time = time.time() * 1000
            self.sio.emit('send_message', {
                'receiverUsername': RECEIVER_USERNAME,  # Use REAL receiver
                'content': f'Load test message from {self.username}',
                'type': 'text',
                '_sendTime': send_time
            })
            metrics.messages_sent += 1
            return True
        except Exception as e:
            metrics.errors += 1
            print(f"   ❌ Send failed: {str(e)[:50]}")
            return False

async def run_test():
    global current_target
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}🔥 NEXUSCHAT ULTIMATE LOAD TEST 🔥{Colors.END}")
    print(f"{Colors.YELLOW}Server: {SERVER_URL}{Colors.END}")
    print(f"{Colors.YELLOW}Receiver: {RECEIVER_USERNAME}{Colors.END}")
    print(f"{Colors.YELLOW}Max users: {MAX_USERS}{Colors.END}\n")
    
    # IMPORTANT: Verify receiver exists
    print(f"📡 Checking if receiver '{RECEIVER_USERNAME}' exists...")
    print(f"{Colors.YELLOW}⚠️  Make sure this user is LOGGED IN via browser!{Colors.END}")
    input(f"{Colors.BOLD}Press Enter after logging in {RECEIVER_USERNAME} in a browser...{Colors.END}")
    
    users = []
    
    try:
        for target in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            current_target = target
            print(f"\n{Colors.BOLD}{Colors.BLUE}🚀 Scaling to {target} users...{Colors.END}")
            
            # Add new users
            for i in range(len(users), target):
                user = LoadUser(i)
                if user.connect():
                    users.append(user)
                
                if (i + 1) % 50 == 0:
                    metrics.report()
                
                await asyncio.sleep(0.02)
            
            # Stabilize
            print(f"⏳ Stabilizing...")
            await asyncio.sleep(HOLD_TIME)
            
            # Test messages
            print(f"📨 Sending test messages to {RECEIVER_USERNAME}...")
            test_users = users[:min(MESSAGE_TEST_SIZE, len(users))]
            
            for user in test_users:
                user.send_message()
                await asyncio.sleep(0.1)  # Slower to ensure delivery
            
            await asyncio.sleep(5)  # Wait for responses
            metrics.report()
            
            # Check if messages are being received
            if metrics.messages_received == 0 and metrics.messages_sent > 0:
                print(f"\n{Colors.RED}⚠️  WARNING: No messages received!{Colors.END}")
                print(f"{Colors.YELLOW}Check if {RECEIVER_USERNAME} is online in browser{Colors.END}")
                
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}🛑 Test stopped{Colors.END}")
    
    finally:
        # Final report
        print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}📊 FINAL RESULTS{Colors.END}")
        print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}")
        print(f"   Peak users:  {metrics.peak}")
        print(f"   Messages sent: {metrics.messages_sent}")
        print(f"   Messages recv: {metrics.messages_received}")
        if metrics.latencies:
            print(f"   Avg latency: {sum(metrics.latencies)/len(metrics.latencies):.1f}ms")
        
        # Cleanup
        print(f"\n🔌 Disconnecting...")
        for user in users:
            user.disconnect()
        
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(run_test())
