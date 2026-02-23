#!/usr/bin/env python3
"""
WORKING NEXUSCHAT LOAD TEST
Based on successful simple test!
"""

import asyncio
import socketio
import time
import sys
import os
from datetime import datetime
import random

# Configuration
SERVER_URL = 'http://localhost:5000'
RECEIVER_USERNAME = 'rohan_tech'  # This works!
START_USERS = 100
MAX_USERS = 10000  # Let's find the limit
INCREMENT = 500
HOLD_TIME = 10

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'

class Metrics:
    def __init__(self):
        self.connected = 0
        self.peak = 0
        self.messages_sent = 0
        self.messages_received = 0
        self.errors = 0
        self.latencies = []
        self.start_time = time.time()
        self.failed_connections = 0
        
    def report(self):
        uptime = time.time() - self.start_time
        os.system('clear' if os.name == 'posix' else 'cls')
        
        print(f"\n{Colors.BLUE}╔{'═'*60}╗{Colors.END}")
        print(f"{Colors.BLUE}║{' '*18}WORKING NEXUSCHAT LOAD TEST{' '*18}║{Colors.END}")
        print(f"{Colors.BLUE}╠{'═'*60}╣{Colors.END}")
        
        print(f"{Colors.GREEN}║  📊 CONNECTIONS{Colors.END}")
        print(f"║     Current: {self.connected:6d} users")
        print(f"║     Peak:    {self.peak:6d} users")
        print(f"║     Failed:  {self.failed_connections:6d}")
        
        print(f"\n{Colors.GREEN}║  📨 MESSAGES{Colors.END}")
        print(f"║     Sent:     {self.messages_sent:6d}")
        print(f"║     Received: {self.messages_received:6d}")
        if self.messages_sent > 0:
            rate = (self.messages_received / self.messages_sent) * 100
            color = Colors.GREEN if rate > 99 else Colors.YELLOW if rate > 95 else Colors.RED
            print(f"║     {color}Delivery:  {rate:5.1f}%{Colors.END}")
        
        if self.latencies:
            avg = sum(self.latencies[-20:]) / min(20, len(self.latencies))
            print(f"\n{Colors.GREEN}║  ⚡ LATENCY{Colors.END}")
            print(f"║     Recent avg: {avg:5.1f}ms")
        
        print(f"\n{Colors.BLUE}╠{'═'*60}╣{Colors.END}")
        print(f"║  ⏱️  Uptime: {uptime/60:5.1f} minutes")
        print(f"║  📈 Target: {target}/{MAX_USERS} users")
        print(f"║  {Colors.RED}❌ Errors: {self.errors:4d}{Colors.END}")
        print(f"{Colors.BLUE}╚{'═'*60}╝{Colors.END}")

metrics = Metrics()
target = 0

class LoadUser:
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = f"load_{user_id}"
        self.sio = socketio.Client(reconnection=False)
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
            if self.connected:
                self.connected = False
                metrics.connected -= 1
            
        @self.sio.on('receive_message')
        def on_message(data):
            metrics.messages_received += 1
            if '_sendTime' in data:
                latency = (time.time() * 1000) - data['_sendTime']
                metrics.latencies.append(latency)
    
    def connect(self):
        try:
            self.sio.connect(
                SERVER_URL,
                auth={'username': self.username},
                transports=['websocket'],
                wait_timeout=5
            )
            return True
        except:
            metrics.failed_connections += 1
            metrics.errors += 1
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self):
        try:
            send_time = time.time() * 1000
            self.sio.emit('send_message', {
                'receiverUsername': RECEIVER_USERNAME,
                'content': f'Load test message {self.user_id}',
                'type': 'text',
                '_sendTime': send_time
            })
            metrics.messages_sent += 1
            return True
        except:
            metrics.errors += 1
            return False

async def run_test():
    global target
    
    print(f"\n{Colors.GREEN}🔥 WORKING LOAD TEST - Using receiver: {RECEIVER_USERNAME}{Colors.END}")
    print(f"{Colors.YELLOW}Make sure {RECEIVER_USERNAME} is logged in browser!{Colors.END}\n")
    
    input("Press Enter after logging in receiver...")
    
    # Start receiver in this script too
    receiver = LoadUser(999999)
    receiver.username = RECEIVER_USERNAME
    if receiver.connect():
        print(f"{Colors.GREEN}✅ Receiver connected{Colors.END}")
    else:
        print(f"{Colors.RED}❌ Receiver failed{Colors.END}")
        return
    
    users = [receiver]
    
    try:
        for target in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            print(f"\n{Colors.BLUE}🚀 Scaling to {target} users...{Colors.END}")
            
            # Add new users
            for i in range(len(users), target + 1):  # +1 for receiver
                if i == 0: continue
                user = LoadUser(i)
                if user.connect():
                    users.append(user)
                
                if i % 50 == 0:
                    metrics.report()
                
                await asyncio.sleep(0.01)
            
            # Stabilize
            await asyncio.sleep(HOLD_TIME)
            
            # Send test messages (from 20 random users)
            print(f"📨 Sending test messages...")
            test_users = random.sample([u for u in users if u.username != RECEIVER_USERNAME], 
                                     min(20, len(users)-1))
            
            for user in test_users:
                user.send_message()
                await asyncio.sleep(0.2)
            
            # Wait for messages to arrive
            await asyncio.sleep(3)
            metrics.report()
            
            # Check if working
            if metrics.messages_received == 0 and metrics.messages_sent > 0:
                print(f"\n{Colors.RED}⚠️ No messages received! Stopping.{Colors.END}")
                break
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}🛑 Test stopped{Colors.END}")
    
    finally:
        print(f"\n{Colors.GREEN}📊 FINAL RESULTS{Colors.END}")
        print(f"   Peak users: {metrics.peak}")
        print(f"   Msgs sent: {metrics.messages_sent}")
        print(f"   Msgs recv: {metrics.messages_received}")
        if metrics.messages_sent > 0:
            print(f"   Delivery: {(metrics.messages_received/metrics.messages_sent)*100:.1f}%")
        
        print(f"\n🔌 Disconnecting...")
        for user in users:
            user.disconnect()

if __name__ == "__main__":
    asyncio.run(run_test())
