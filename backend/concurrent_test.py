#!/usr/bin/env python3
import asyncio
import socketio
import time
import threading
from datetime import datetime

# Configuration
SERVER_URL = 'http://localhost:5000'
NUM_USERS = 20
TEST_DURATION = 30  # seconds

connected_users = 0
messages_sent = 0
messages_received = 0
latencies = []

class TestUser:
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = f"testuser_{user_id}"
        self.sio = socketio.Client()
        self.connected = False
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.sio.on('connect')
        def on_connect():
            global connected_users
            self.connected = True
            connected_users += 1
            print(f"✅ {self.username} connected ({connected_users}/{NUM_USERS})")
            
        @self.sio.on('disconnect')
        def on_disconnect():
            global connected_users
            self.connected = False
            connected_users -= 1
            
        @self.sio.on('receive_message')
        def on_message(data):
            global messages_received
            messages_received += 1
            
    def connect(self):
        try:
            self.sio.connect(SERVER_URL, 
                           auth={'username': self.username},
                           transports=['websocket'])
            return True
        except:
            return False
            
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
            
    def send_message(self, to_user):
        global messages_sent
        try:
            self.sio.emit('send_message', {
                'receiverUsername': to_user,
                'content': f'Test from {self.username}',
                'type': 'text'
            })
            messages_sent += 1
            return True
        except:
            return False

def run_test():
    print(f"\n🚀 Starting concurrent test with {NUM_USERS} users...\n")
    
    # Create users
    users = [TestUser(i) for i in range(NUM_USERS)]
    
    # Connect all users
    start_time = time.time()
    for user in users:
        user.connect()
        time.sleep(0.1)  # Stagger connections
    
    # Wait for peak connections
    time.sleep(5)
    peak = connected_users
    
    # Send some messages
    for i, user in enumerate(users):
        target = users[(i+1) % NUM_USERS].username
        user.send_message(target)
    
    time.sleep(5)
    
    # Disconnect
    for user in users:
        user.disconnect()
    
    end_time = time.time()
    
    print("\n" + "="*50)
    print("📊 CONCURRENT USER TEST RESULTS")
    print("="*50)
    print(f"   Target users:     {NUM_USERS}")
    print(f"   Peak connected:   {peak}")
    print(f"   Messages sent:    {messages_sent}")
    print(f"   Messages recv:    {messages_received}")
    print(f"   Test duration:    {end_time - start_time:.1f}s")
    print("="*50)

if __name__ == "__main__":
    run_test()
