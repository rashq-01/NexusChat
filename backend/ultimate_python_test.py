#!/usr/bin/env python3
import asyncio
import socketio
import time
import threading
import psutil
import os
from datetime import datetime
import signal
import sys

# Configuration
SERVER_URL = 'http://localhost:5000'
MAX_USERS = 10000
INCREMENT = 100  # Add 100 users at a time
HOLD_TIME = 30  # Seconds to hold at each level

# Metrics
class Metrics:
    def __init__(self):
        self.connected = 0
        self.peak = 0
        self.messages_sent = 0
        self.messages_received = 0
        self.errors = 0
        self.latencies = []
        self.start_time = time.time()
        
    def report(self):
        uptime = time.time() - self.start_time
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ULTIMATE LOAD TEST                         ║
╠══════════════════════════════════════════════════════════════╣
║  📈 Current users:    {self.connected:6d}                                    ║
║  📊 Peak users:       {self.peak:6d}                                    ║
║  📨 Messages sent:    {self.messages_sent:6d}                                    ║
║  📬 Messages recv:    {self.messages_received:6d}                                    ║
║  ❌ Errors:           {self.errors:6d}                                    ║
║  ⏱️  Uptime:           {uptime:.0f}s                                    ║
║  💻 CPU:              {psutil.cpu_percent():5.1f}%                                    ║
║  🧠 RAM:              {psutil.virtual_memory().percent:5.1f}%                                    ║
╚══════════════════════════════════════════════════════════════╝
        """)

metrics = Metrics()

class LoadUser:
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = f"loaduser_{user_id}"
        self.sio = socketio.Client(reconnection=True, reconnection_attempts=3)
        self.connected = False
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.sio.on('connect')
        def on_connect():
            self.connected = True
            metrics.connected += 1
            if metrics.connected > metrics.peak:
                metrics.peak = metrics.connected
            
        @self.sio.on('disconnect')
        def on_disconnect():
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
            self.sio.connect(SERVER_URL, 
                           auth={'username': self.username},
                           transports=['websocket'],
                           socketio_path='/socket.io')
            return True
        except Exception as e:
            metrics.errors += 1
            print(f"❌ {self.username} failed: {str(e)[:50]}")
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self):
        try:
            send_time = time.time() * 1000
            self.sio.emit('send_message', {
                'receiverUsername': f"target_{self.user_id % 10}",
                'content': f"Load test from {self.username}",
                'type': 'text',
                '_sendTime': send_time
            })
            metrics.messages_sent += 1
            return True
        except:
            metrics.errors += 1
            return False

async def run_ultimate_test():
    print("\n" + "🔥" * 30)
    print("🔥     ULTIMATE LOAD TEST - FIND YOUR LIMIT     🔥")
    print("🔥" * 30 + "\n")
    
    users = []
    
    try:
        for level in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            print(f"\n🚀 Scaling to {level} users...")
            
            # Add users
            for i in range(len(users), level):
                user = LoadUser(i)
                if user.connect():
                    users.append(user)
                time.sleep(0.05)  # Stagger connections
            
            # Let connections stabilize
            print(f"⏳ Stabilizing at {level} users...")
            await asyncio.sleep(HOLD_TIME)
            
            # Send test messages
            print(f"📨 Sending test messages...")
            for user in users[:100]:  # Test with 100 users
                user.send_message()
            
            await asyncio.sleep(5)
            
            # Report status
            metrics.report()
            
            # Check for failures
            if metrics.errors > level * 0.1:  # More than 10% errors
                print(f"\n💥 BREAKING POINT DETECTED at {level} users!")
                print(f"   Errors: {metrics.errors}")
                break
            
            # Check system resources
            if psutil.virtual_memory().percent > 90:
                print(f"\n💥 MEMORY LIMIT REACHED at {level} users!")
                break
    
    except KeyboardInterrupt:
        print("\n\n🛑 Test stopped by user")
    
    finally:
        # Final report
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"   Peak concurrent users:  {metrics.peak}")
        print(f"   Total messages sent:    {metrics.messages_sent}")
        print(f"   Total messages recv:    {metrics.messages_received}")
        print(f"   Total errors:           {metrics.errors}")
        if metrics.latencies:
            avg_latency = sum(metrics.latencies) / len(metrics.latencies)
            print(f"   Average latency:        {avg_latency:.2f}ms")
        print(f"   Test duration:          {time.time() - metrics.start_time:.0f}s")
        print("="*60)
        
        # Cleanup
        print("\n🔌 Disconnecting all users...")
        for user in users:
            user.disconnect()
        
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(run_ultimate_test())
