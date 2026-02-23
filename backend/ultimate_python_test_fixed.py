#!/usr/bin/env python3
import asyncio
import socketio
import time
import threading
import os
import signal
import sys

# Try to import psutil, but don't fail if not available
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    print("⚠️  psutil not installed. Run: pip3 install psutil")

# Configuration
SERVER_URL = 'http://localhost:5000'
MAX_USERS = 5000  # Let's find the REAL limit
INCREMENT = 100
HOLD_TIME = 20

class Metrics:
    def __init__(self):
        self.connected = 0
        self.peak = 0
        self.messages_sent = 0
        self.messages_received = 0
        self.errors = 0
        self.latencies = []
        self.start_time = time.time()
        self.last_report = time.time()
        
    def report(self):
        uptime = time.time() - self.start_time
        print("\n" + "╔" + "═"*60 + "╗")
        print("║                    ULTIMATE LOAD TEST                         ║")
        print("╠" + "═"*60 + "╣")
        print(f"║  📈 Current users:   {self.connected:6d}                                    ║")
        print(f"║  📊 Peak users:      {self.peak:6d}                                    ║")
        print(f"║  📨 Messages sent:   {self.messages_sent:6d}                                    ║")
        print(f"║  📬 Messages recv:   {self.messages_received:6d}                                    ║")
        print(f"║  ❌ Errors:          {self.errors:6d}                                    ║")
        print(f"║  ⏱️  Uptime:          {uptime:5.0f}s                                    ║")
        
        if HAS_PSUTIL:
            print(f"║  💻 CPU:             {psutil.cpu_percent():5.1f}%                                    ║")
            print(f"║  🧠 RAM:             {psutil.virtual_memory().percent:5.1f}%                                    ║")
        else:
            print(f"║  💻 CPU:             N/A (install psutil)                      ║")
            print(f"║  🧠 RAM:             N/A (install psutil)                      ║")
        
        if self.latencies:
            avg_lat = sum(self.latencies[-50:]) / min(50, len(self.latencies))
            print(f"║  ⚡ Avg latency:     {avg_lat:5.1f}ms                                    ║")
        else:
            print(f"║  ⚡ Avg latency:     Waiting for messages...                      ║")
            
        print("╚" + "═"*60 + "╝\n")

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
            # Check for latency data
            if '_sendTime' in data:
                latency = (time.time() * 1000) - data['_sendTime']
                metrics.latencies.append(latency)
    
    def connect(self):
        try:
            self.sio.connect(
                SERVER_URL, 
                auth={'username': self.username},
                transports=['websocket'],
                socketio_path='/socket.io',
                wait_timeout=5
            )
            return True
        except Exception as e:
            metrics.errors += 1
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
    
    def send_message(self):
        try:
            send_time = time.time() * 1000
            self.sio.emit('send_message', {
                'receiverUsername': "receiver_user",
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
    print("\n" + "🔥" * 40)
    print("🔥     ULTIMATE LOAD TEST - FIND YOUR REAL LIMIT     🔥")
    print("🔥" * 40 + "\n")
    
    # First, create a receiver user
    print("📡 Starting receiver user...")
    receiver = LoadUser(999999)
    receiver.connect()
    await asyncio.sleep(2)
    
    users = []
    
    try:
        for level in range(INCREMENT, MAX_USERS + INCREMENT, INCREMENT):
            print(f"\n🚀 Scaling to {level} users...")
            
            # Add users
            successful = 0
            failed = 0
            
            for i in range(len(users), level):
                user = LoadUser(i)
                if user.connect():
                    users.append(user)
                    successful += 1
                else:
                    failed += 1
                
                # Show progress every 100 users
                if (i + 1) % 100 == 0:
                    print(f"   Progress: {i+1}/{level} (✅ {successful} | ❌ {failed})")
                
                # Small delay to prevent overwhelming
                await asyncio.sleep(0.02)
            
            # Let connections stabilize
            print(f"⏳ Stabilizing at {level} users...")
            for i in range(HOLD_TIME):
                await asyncio.sleep(1)
                if i % 5 == 0:
                    metrics.report()
            
            # Send test messages from first 100 users
            print(f"📨 Sending test messages...")
            msg_count = 0
            for user in users[:100]:
                if user.send_message():
                    msg_count += 1
                await asyncio.sleep(0.01)
            
            print(f"   ✅ Sent {msg_count} messages")
            await asyncio.sleep(3)
            
            # Check for failure condition (>10% errors)
            if metrics.errors > level * 0.1:
                print(f"\n💥 BREAKING POINT DETECTED at {level} users!")
                print(f"   Errors: {metrics.errors} ({metrics.errors/level*100:.1f}%)")
                break
            
            # Also check if connections are failing to add
            if failed > level * 0.1:
                print(f"\n💥 CONNECTION LIMIT REACHED at {level} users!")
                print(f"   Failed connections this batch: {failed}")
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
            p95 = sorted(metrics.latencies)[int(len(metrics.latencies) * 0.95)]
            print(f"   Average latency:        {avg_latency:.2f}ms")
            print(f"   95th percentile:        {p95:.2f}ms")
        
        print(f"   Test duration:          {time.time() - metrics.start_time:.0f}s")
        print("="*60)
        
        # Calculate safe operating limit
        safe_limit = int(metrics.peak * 0.8)
        print(f"\n✅ RECOMMENDED SAFE OPERATING LIMIT: {safe_limit} users")
        print(f"⚠️  ABSOLUTE MAXIMUM (breaking point): {metrics.peak} users")
        
        # Cleanup
        print("\n🔌 Disconnecting all users...")
        for user in users:
            user.disconnect()
        
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(run_ultimate_test())
