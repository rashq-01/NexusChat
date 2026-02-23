#!/usr/bin/env python3
import socketio
import time

RECEIVER_USERNAME = "rohan_tech"
SERVER_URL = "http://localhost:5000"

sio = socketio.Client()

@sio.event
def connect():
    print(f"✅ Connected as {RECEIVER_USERNAME}")

@sio.event
def disconnect():
    print("❌ Disconnected")

@sio.on('receive_message')
def on_message(data):
    print(f"\n📬 RECEIVED MESSAGE:")
    print(f"   From: {data.get('senderId')}")
    print(f"   Content: {data.get('content')}")
    print(f"   Time: {time.strftime('%H:%M:%S')}\n")

print(f"🚀 Starting receiver: {RECEIVER_USERNAME}")
sio.connect(SERVER_URL, 
           auth={'username': RECEIVER_USERNAME},
           transports=['websocket'])

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    sio.disconnect()
