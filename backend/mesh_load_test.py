#!/usr/bin/env python3
"""
NEXUSCHAT MESH LOAD TEST
Every user talks to every other user!
"""

import asyncio
import socketio
import time
import sys
import os
import random
from datetime import datetime
from collections import defaultdict
import statistics

# Configuration
SERVER_URL = 'http://localhost:5000'
START_USERS = 100
MAX_USERS = 5000
INCREMENT = 250
HOLD_TIME = 15
MESSAGES_PER_USER = 5  # Each user sends 5 messages
MESSAGE_INTERVAL = 2   # Seconds between messages

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    END = '\033[0m'
    BOLD = '\033[1m'

class MessageMetrics:
    def __init__(self):
        self.sent = 0
        self.received = 0
        self.latencies = []
        self.failed = 0
        self.by_sender = defaultdict(int)
        self.by_receiver = defaultdict(int)
        self.latency_by_pair = defaultdict(list)
        
    def add_latency(self, sender, receiver, latency):
        self.latencies.append(latency)
        self.latency_by_pair[f"{sender}→{receiver}"].append(latency)
        
    def summary(self):
        if not self.latencies:
            return "No data"
        
        return {
            'avg': statistics.mean(self.latencies),
            'min': min(self.latencies),
            'max': max(self.latencies),
            'p95': statistics.quantiles(self.latencies, n=20)[18],
            'p99': statistics.quantiles(self.latencies, n=100)[98],
            'total': len(self.latencies)
        }

class ConnectionMetrics:
    def __init__(self):
        self.connected = 0
        self.peak = 0
        self.failed = 0
        self.attempts = 0
        self.users = {}
        
    def report(self):
        return {
            'current': self.connected,
            'peak': self.peak,
            'failed': self.failed,
            'success_rate': ((self.attempts - self.failed) / max(1, self.attempts)) * 100
        }

class LoadUser:
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = f"user_{user_id:04d}"
        self.sio = socketio.Client(reconnection=True, reconnection_attempts=3)
        self.connected = False
        self.received_count = 0
        self.sent_count = 0
        self.message_times = {}
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.sio.event
        def connect():
            self.connected = True
            conn_metrics.connected += 1
            if conn_metrics.connected > conn_metrics.peak:
                conn_metrics.peak = conn_metrics.connected
            conn_metrics.users[self.username] = self
            
        @self.sio.event
        def disconnect():
            if self.connected:
                self.connected = False
                conn_metrics.connected -= 1
                if self.username in conn_metrics.users:
                    del conn_metrics.users[self.username]
            
        @self.sio.on('receive_message')
        def on_message(data):
            msg_metrics.received += 1
            self.received_count += 1
            
            # Calculate latency if this was one of our sent messages
            message_id = data.get('_message_id')
            if message_id and message_id in self.message_times:
                send_time = self.message_times[message_id]
                latency = (time.time() * 1000) - send_time
                sender = data.get('senderId', 'unknown')
                msg_metrics.add_latency(sender, self.username, latency)
                del self.message_times[message_id]
    
    def connect(self):
        conn_metrics.attempts += 1
        try:
            self.sio.connect(
                SERVER_URL,
                auth={'username': self.username},
                transports=['websocket'],
                wait_timeout=10
            )
            return True
        except Exception as e:
            conn_metrics.failed += 1
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self, receiver_username):
        try:
            message_id = f"msg_{self.user_id}_{int(time.time()*1000)}_{random.randint(1000,9999)}"
            send_time = time.time() * 1000
            
            self.sio.emit('send_message', {
                'receiverUsername': receiver_username,
                'content': f"Hello from {self.username} to {receiver_username}",
                'type': 'text',
                '_message_id': message_id,
                '_send_time': send_time
            })
            
            self.message_times[message_id] = send_time
            msg_metrics.sent += 1
            self.sent_count += 1
            msg_metrics.by_sender[self.username] += 1
            msg_metrics.by_receiver[receiver_username] += 1
            
            return True
        except Exception as e:
            msg_metrics.failed += 1
            return False

conn_metrics = ConnectionMetrics()
msg_metrics = MessageMetrics()
all_users = {}
target = 0

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def print_dashboard():
    clear_screen()
    
    conn_stats = conn_metrics.report()
    msg_stats = msg_metrics.summary()
    
    print(f"\n{Colors.BOLD}{Colors.CYAN}╔{'═'*60}╗{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}║{' '*18}NEXUSCHAT MESH LOAD TEST{' '*19}║{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}╠{'═'*60}╣{Colors.END}")
    
    # Connections
    print(f"{Colors.BOLD}{Colors.GREEN}║  📊 CONNECTIONS{Colors.END}")
    print(f"║     Current: {conn_stats['current']:6d} users")
    print(f"║     Peak:    {conn_stats['peak']:6d} users")
    print(f"║     Failed:  {conn_stats['failed']:6d}")
    print(f"║     Success: {conn_stats['success_rate']:5.1f}%")
    
    # Messages
    print(f"\n{Colors.BOLD}{Colors.YELLOW}║  📨 MESSAGES{Colors.END}")
    print(f"║     Sent:     {msg_metrics.sent:6d}")
    print(f"║     Received: {msg_metrics.received:6d}")
    if msg_metrics.sent > 0:
        delivery = (msg_metrics.received / msg_metrics.sent) * 100
        color = Colors.GREEN if delivery > 99 else Colors.YELLOW if delivery > 95 else Colors.RED
        print(f"║     {color}Delivery:  {delivery:6.1f}%{Colors.END}")
    
    # Latency
    if msg_stats != "No data":
        print(f"\n{Colors.BOLD}{Colors.BLUE}║  ⚡ LATENCY STATISTICS{Colors.END}")
        print(f"║     Average: {msg_stats['avg']:6.1f}ms")
        print(f"║     Minimum: {msg_stats['min']:6.1f}ms")
        print(f"║     Maximum: {msg_stats['max']:6.1f}ms")
        print(f"║     95th %%:  {msg_stats['p95']:6.1f}ms")
        print(f"║     99th %%:  {msg_stats['p99']:6.1f}ms")
        print(f"║     Samples: {msg_stats['total']:6d}")
    
    # Message distribution
    if len(msg_metrics.by_sender) > 0:
        print(f"\n{Colors.BOLD}{Colors.MAGENTA}║  🔄 MESSAGE DISTRIBUTION{Colors.END}")
        top_senders = sorted(msg_metrics.by_sender.items(), key=lambda x: x[1], reverse=True)[:3]
        top_receivers = sorted(msg_metrics.by_receiver.items(), key=lambda x: x[1], reverse=True)[:3]
        
        print(f"║     Top senders: {', '.join([f'{s}({c})' for s,c in top_senders])}")
        print(f"║     Top receivers: {', '.join([f'{r}({c})' for r,c in top_receivers])}")
    
    # Test progress
    print(f"\n{Colors.BOLD}{Colors.CYAN}╠{'═'*60}╣{Colors.END}")
    print(f"║  ⏱️  Uptime: {(time.time() - start_time)/60:5.1f} minutes")
    print(f"║  📈 Target: {target}/{MAX_USERS} users")
    print(f"║  👥 Active users: {len(all_users)}")
    print(f"║  {Colors.RED}❌ Errors: {msg_metrics.failed + conn_metrics.failed:4d}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}╚{'═'*60}╝{Colors.END}")
    
    sys.stdout.flush()

async def message_worker(user):
    """Each user sends messages to random users periodically"""
    while user.connected and len(all_users) > 1:
        # Pick a random receiver (not self)
        receivers = [u for u in all_users.values() if u.username != user.username]
        if receivers:
            receiver = random.choice(receivers)
            user.send_message(receiver.username)
        
        # Wait before next message
        await asyncio.sleep(MESSAGE_INTERVAL + random.random())

async def run_mesh_test():
    global target, start_time, all_users
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}🔥 NEXUSCHAT MESH LOAD TEST 🔥{Colors.END}")
    print(f"{Colors.YELLOW}• Every user talks to random users{Colors.END}")
    print(f"{Colors.YELLOW}• Full bidirectional communication{Colors.END}")
    print(f"{Colors.YELLOW}• Real-world chat patterns{Colors.END}\n")
    
    start_time = time.time()
    all_users = {}
    message_tasks = []
    
    try:
        for target in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            print(f"\n{Colors.BOLD}{Colors.BLUE}🚀 Scaling to {target} users...{Colors.END}")
            
            # Add new users
            for i in range(len(all_users), target):
                user = LoadUser(i)
                if user.connect():
                    all_users[user.username] = user
                    # Start message worker for this user
                    task = asyncio.create_task(message_worker(user))
                    message_tasks.append(task)
                
                if (i + 1) % 50 == 0:
                    print_dashboard()
                
                await asyncio.sleep(0.02)
            
            # Stabilization period
            for _ in range(HOLD_TIME):
                await asyncio.sleep(1)
                print_dashboard()
            
            # Force a message burst from all users
            print(f"\n{Colors.YELLOW}📨 Message burst from all users...{Colors.END}")
            for user in list(all_users.values())[:50]:  # Burst from 50 users
                receivers = [u for u in all_users.values() if u.username != user.username]
                if receivers:
                    for _ in range(3):  # Send 3 quick messages
                        receiver = random.choice(receivers)
                        user.send_message(receiver.username)
                await asyncio.sleep(0.05)
            
            await asyncio.sleep(3)
            print_dashboard()
            
            # Check health
            if msg_metrics.sent > 100 and msg_metrics.received == 0:
                print(f"\n{Colors.RED}⚠️ No messages being received! Stopping.{Colors.END}")
                break
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}🛑 Test stopped by user{Colors.END}")
    
    finally:
        # Final report
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}📊 FINAL MESH TEST RESULTS{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        
        conn_stats = conn_metrics.report()
        msg_stats = msg_metrics.summary()
        
        print(f"\n{Colors.GREEN}📈 CONNECTIONS{Colors.END}")
        print(f"   Peak users:      {conn_stats['peak']}")
        print(f"   Success rate:    {conn_stats['success_rate']:.1f}%")
        print(f"   Failed connects: {conn_stats['failed']}")
        
        print(f"\n{Colors.YELLOW}📨 MESSAGES{Colors.END}")
        print(f"   Total sent:      {msg_metrics.sent}")
        print(f"   Total received:  {msg_metrics.received}")
        if msg_metrics.sent > 0:
            delivery = (msg_metrics.received / msg_metrics.sent) * 100
            print(f"   Delivery rate:   {delivery:.1f}%")
        
        if msg_stats != "No data":
            print(f"\n{Colors.BLUE}⚡ LATENCY{Colors.END}")
            print(f"   Average: {msg_stats['avg']:.1f}ms")
            print(f"   Minimum: {msg_stats['min']:.1f}ms")
            print(f"   Maximum: {msg_stats['max']:.1f}ms")
            print(f"   95th percentile: {msg_stats['p95']:.1f}ms")
            print(f"   99th percentile: {msg_stats['p99']:.1f}ms")
            
            # Find best and worst pairs
            if msg_metrics.latency_by_pair:
                best_pair = min(msg_metrics.latency_by_pair.items(), 
                               key=lambda x: statistics.mean(x[1]))
                worst_pair = max(msg_metrics.latency_by_pair.items(), 
                                key=lambda x: statistics.mean(x[1]))
                print(f"\n{Colors.CYAN}🔁 PAIR LATENCY{Colors.END}")
                print(f"   Best:  {best_pair[0]} → {statistics.mean(best_pair[1]):.1f}ms")
                print(f"   Worst: {worst_pair[0]} → {statistics.mean(worst_pair[1]):.1f}ms")
        
        print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.GREEN}✅ Test complete!{Colors.END}")
        
        # Cleanup
        print(f"\n🔌 Disconnecting {len(all_users)} users...")
        for task in message_tasks:
            task.cancel()
        for user in all_users.values():
            user.disconnect()
        
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(run_mesh_test())
