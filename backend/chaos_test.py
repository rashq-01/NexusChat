#!/usr/bin/env python3
"""
NEXUSCHAT CHAOS TEST - FIXED VERSION!
All socket events, no errors!
"""

import asyncio
import socketio
import time
import sys
import os
import random
import threading
from datetime import datetime
from collections import defaultdict
import statistics

# CONFIGURATION
SERVER_URL = 'http://localhost:5000'
MAX_USERS = 5000
INCREMENT = 500
MESSAGES_PER_USER = 20
MIN_DELAY = 0.01
MAX_DELAY = 0.05

class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    END = '\033[0m'
    BOLD = '\033[1m'

class EventMetrics:
    def __init__(self):
        self.messages_sent = 0
        self.messages_received = 0
        self.message_latencies = []
        self.typing_start = 0
        self.typing_stop = 0
        self.typing_errors = 0
        self.read_events = 0
        self.read_confirmations = 0
        self.connections = 0
        self.disconnections = 0
        self.reconnections = 0
        self.errors = 0
        self.start_time = time.time()
        
    def get_event_rate(self):
        elapsed = time.time() - self.start_time
        total = (self.messages_sent + self.typing_start + self.typing_stop + 
                self.read_events + self.connections + self.disconnections)
        return total / elapsed if elapsed > 0 else 0

metrics = EventMetrics()
active_users = {}
user_list_lock = asyncio.Lock()

class ChaosUser:
    def __init__(self, user_id, loop):
        self.user_id = user_id
        self.username = f"chaos_{user_id:04d}"
        self.loop = loop
        self.sio = socketio.Client(reconnection=True, reconnection_attempts=3)
        self.connected = False
        self.message_count = 0
        self.received_count = 0
        self.message_times = {}
        self.current_typing = False
        self.read_messages = set()
        self.targets = []
        self.should_reconnect = True
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.sio.event
        def connect():
            self.connected = True
            metrics.connections += 1
            print(f"   ✅ {self.username} connected")
            
        @self.sio.event
        def disconnect(reason=None):
            if self.connected:
                self.connected = False
                metrics.disconnections += 1
                print(f"   ❌ {self.username} disconnected: {reason}")
                # Schedule reconnect
                if self.should_reconnect and random.random() < 0.3:
                    self.loop.call_soon_threadsafe(
                        asyncio.create_task, self.delayed_reconnect()
                    )
        
        @self.sio.on('receive_message')
        def on_message(data):
            metrics.messages_received += 1
            self.received_count += 1
            
            # Calculate latency
            message_id = data.get('_chaos_id')
            if message_id and message_id in self.message_times:
                send_time = self.message_times[message_id]
                latency = (time.time() * 1000) - send_time
                metrics.message_latencies.append(latency)
                del self.message_times[message_id]
                print(f"   📬 {self.username} received from {data.get('senderId')} ({latency:.1f}ms)")
            
            # Randomly mark as read
            if random.random() < 0.7:
                self.emit_read_receipt(data.get('senderId'))
        
        @self.sio.on('typing_start')
        def on_typing_start(data):
            metrics.typing_start += 1
            
        @self.sio.on('typing_stop')
        def on_typing_stop(data):
            metrics.typing_stop += 1
            
        @self.sio.on('message_read')
        def on_message_read(data):
            metrics.read_confirmations += 1
            print(f"   👁️ {self.username} read receipt from {data.get('username')}")
    
    async def delayed_reconnect(self):
        await asyncio.sleep(random.uniform(0.1, 0.5))
        if not self.connected and self.should_reconnect:
            try:
                self.sio.connect(
                    SERVER_URL, 
                    auth={'username': self.username},
                    transports=['websocket'],
                    wait_timeout=5
                )
                metrics.reconnections += 1
                print(f"   🔄 {self.username} reconnected")
            except Exception as e:
                metrics.errors += 1
                print(f"   ⚠️ {self.username} reconnect failed: {str(e)[:50]}")
    
    def connect(self):
        try:
            self.sio.connect(
                SERVER_URL,
                auth={'username': self.username},
                transports=['websocket'],
                wait_timeout=10
            )
            return True
        except Exception as e:
            metrics.errors += 1
            print(f"   ⚠️ {self.username} connect failed: {str(e)[:50]}")
            return False
    
    def disconnect(self):
        self.should_reconnect = False
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self):
        if not self.connected or not self.targets:
            return
        
        try:
            receiver = random.choice(self.targets)
            chaos_id = f"chaos_{self.user_id}_{int(time.time()*1000)}_{random.randint(1000,9999)}"
            
            self.sio.emit('send_message', {
                'receiverUsername': receiver,
                'content': f"CHAOS from {self.username}",
                'type': 'text',
                '_chaos_id': chaos_id
            })
            
            self.message_times[chaos_id] = time.time() * 1000
            metrics.messages_sent += 1
            self.message_count += 1
            print(f"   📨 {self.username} → {receiver}")
            
        except Exception as e:
            metrics.errors += 1
    
    def emit_typing(self):
        if not self.connected or not self.targets:
            return
        
        try:
            receiver = random.choice(self.targets)
            
            if random.random() < 0.5:
                self.sio.emit('typing_start', {
                    'username': self.username,
                    'receiverUsername': receiver
                })
                metrics.typing_start += 1
                print(f"   ⌨️  {self.username} typing to {receiver}")
                self.current_typing = True
            else:
                self.sio.emit('typing_stop', {
                    'username': self.username,
                    'receiverUsername': receiver
                })
                metrics.typing_stop += 1
                print(f"   ✋ {self.username} stopped typing")
                self.current_typing = False
                
        except Exception as e:
            metrics.typing_errors += 1
            metrics.errors += 1
    
    def emit_read_receipt(self, sender):
        if not self.connected or not sender:
            return
        
        try:
            self.sio.emit('message_read', {
                'username': self.username,
                'receiverUsername': sender
            })
            metrics.read_events += 1
            print(f"   👁️ {self.username} marked {sender}'s message as read")
            
        except Exception as e:
            metrics.errors += 1

async def chaos_worker(user):
    """Each user creates constant chaos"""
    while user.connected and user.username in active_users:
        # Random action
        action = random.random()
        
        if action < 0.4:  # 40% message
            user.send_message()
        elif action < 0.7:  # 30% typing
            user.emit_typing()
        else:  # 30% read receipt
            if user.targets and random.random() < 0.5:
                user.emit_read_receipt(random.choice(user.targets))
        
        await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

async def dashboard():
    """Real-time dashboard"""
    last_update = time.time()
    
    while True:
        await asyncio.sleep(0.5)
        
        if time.time() - last_update < 0.5:
            continue
            
        last_update = time.time()
        clear_screen()
        
        elapsed = time.time() - metrics.start_time
        active_count = len([u for u in active_users.values() if u.connected])
        
        print(f"\n{Colors.BOLD}{Colors.RED}╔{'═'*60}╗{Colors.END}")
        print(f"{Colors.BOLD}{Colors.RED}║{' '*16}🔥 CHAOS TEST - FIXED 🔥{' '*17}║{Colors.END}")
        print(f"{Colors.BOLD}{Colors.RED}╠{'═'*60}╣{Colors.END}")
        
        # Connections
        print(f"{Colors.BOLD}{Colors.CYAN}║  📊 CONNECTIONS{Colors.END}")
        print(f"║     Active:    {active_count:6d}")
        print(f"║     Total:     {len(active_users):6d}")
        print(f"║     Connects:  {metrics.connections:6d}")
        print(f"║     Disconnects: {metrics.disconnections:6d}")
        print(f"║     Reconnects: {metrics.reconnections:6d}")
        
        # Messages
        print(f"\n{Colors.BOLD}{Colors.GREEN}║  📨 MESSAGES{Colors.END}")
        print(f"║     Sent:     {metrics.messages_sent:6d}")
        print(f"║     Received: {metrics.messages_received:6d}")
        if metrics.messages_sent > 0:
            delivery = (metrics.messages_received / metrics.messages_sent) * 100
            color = Colors.GREEN if delivery > 99 else Colors.YELLOW
            print(f"║     {color}Delivery:  {delivery:6.1f}%{Colors.END}")
        
        # Latency
        if metrics.message_latencies:
            recent = metrics.message_latencies[-100:]
            avg = statistics.mean(recent)
            p95 = sorted(recent)[int(len(recent)*0.95)] if len(recent) > 20 else 0
            print(f"\n{Colors.BOLD}{Colors.MAGENTA}║  ⚡ LATENCY{Colors.END}")
            print(f"║     Average: {avg:6.1f}ms")
            print(f"║     95th:    {p95:6.1f}ms")
            print(f"║     Samples: {len(metrics.message_latencies):6d}")
        
        # Events
        print(f"\n{Colors.BOLD}{Colors.YELLOW}║  📈 EVENT RATES{Colors.END}")
        print(f"║     Rate:    {metrics.get_event_rate():6.1f}/s")
        print(f"║     Typing:  {metrics.typing_start + metrics.typing_stop:6d}")
        print(f"║     Reads:   {metrics.read_events:6d}")
        
        # Errors
        print(f"\n{Colors.BOLD}{Colors.RED}║  ❌ ERRORS: {metrics.errors:6d}{Colors.END}")
        
        # Progress
        print(f"\n{Colors.BOLD}{Colors.RED}╠{'═'*60}╣{Colors.END}")
        print(f"║  ⏱️  Duration: {elapsed:5.1f}s")
        print(f"║  👥 Target: {len(active_users)}/{MAX_USERS}")
        print(f"{Colors.BOLD}{Colors.RED}╚{'═'*60}╝{Colors.END}")

async def main():
    global active_users
    
    print(f"\n{Colors.BOLD}{Colors.RED}🔥🔥🔥 CHAOS TEST STARTING 🔥🔥🔥{Colors.END}\n")
    
    # Get event loop
    loop = asyncio.get_running_loop()
    
    # Start dashboard
    asyncio.create_task(dashboard())
    
    all_users = {}
    workers = []
    
    try:
        for target in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            print(f"\n{Colors.BOLD}{Colors.RED}🚀 Scaling to {target} users...{Colors.END}")
            
            # Add new users
            for i in range(len(all_users), target):
                user = ChaosUser(i, loop)
                if user.connect():
                    all_users[user.username] = user
                    active_users = all_users
                
                if (i + 1) % 100 == 0:
                    print(f"   {i+1}/{target} users connected")
                
                await asyncio.sleep(0.01)
            
            # Update targets for all users
            usernames = list(all_users.keys())
            for user in all_users.values():
                user.targets = [u for u in usernames if u != user.username]
            
            # Start chaos workers for new users
            for user in all_users.values():
                if not hasattr(user, 'worker_started'):
                    workers.append(asyncio.create_task(chaos_worker(user)))
                    user.worker_started = True
            
            # Let chaos happen while scaling
            await asyncio.sleep(2)
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}🛑 Stopping chaos...{Colors.END}")
    
    finally:
        # Final report
        elapsed = time.time() - metrics.start_time
        
        print(f"\n{Colors.BOLD}{Colors.RED}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.RED}📊 CHAOS TEST RESULTS{Colors.END}")
        print(f"{Colors.BOLD}{Colors.RED}{'='*60}{Colors.END}")
        
        print(f"\n{Colors.CYAN}📈 CONNECTIONS{Colors.END}")
        print(f"   Peak users:     {len(all_users)}")
        print(f"   Total connects: {metrics.connections}")
        print(f"   Reconnects:     {metrics.reconnections}")
        
        print(f"\n{Colors.GREEN}📨 MESSAGES{Colors.END}")
        print(f"   Sent:     {metrics.messages_sent}")
        print(f"   Received: {metrics.messages_received}")
        if metrics.messages_sent > 0:
            print(f"   Delivery: {(metrics.messages_received/metrics.messages_sent)*100:.1f}%")
        
        if metrics.message_latencies:
            print(f"\n{Colors.MAGENTA}⚡ LATENCY{Colors.END}")
            print(f"   Average: {statistics.mean(metrics.message_latencies):.1f}ms")
            print(f"   Min:     {min(metrics.message_latencies):.1f}ms")
            print(f"   Max:     {max(metrics.message_latencies):.1f}ms")
            print(f"   Samples: {len(metrics.message_latencies)}")
        
        print(f"\n{Colors.YELLOW}⌨️  TYPING EVENTS{Colors.END}")
        print(f"   Total: {metrics.typing_start + metrics.typing_stop}")
        
        print(f"\n{Colors.BLUE}👁️  READ RECEIPTS{Colors.END}")
        print(f"   Sent: {metrics.read_events}")
        print(f"   Confirmed: {metrics.read_confirmations}")
        
        print(f"\n{Colors.RED}❌ ERRORS: {metrics.errors}{Colors.END}")
        
        # Cleanup
        print(f"\n🔪 Cleaning up...")
        for worker in workers:
            worker.cancel()
        for user in all_users.values():
            user.disconnect()
        
        print(f"{Colors.GREEN}✅ Chaos test complete!{Colors.END}")

if __name__ == "__main__":
    asyncio.run(main())