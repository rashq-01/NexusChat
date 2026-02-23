#!/usr/bin/env python3
import socketio
import time

SENDER_USERNAME = "test_sender"
RECEIVER_USERNAME = "rohan_tech"
SERVER_URL = "http://localhost:5000"

sio = socketio.Client()

@sio.event
def connect():
    print(f"✅ Connected as {SENDER_USERNAME}")
    # Send a test message
    sio.emit('send_message', {
        'receiverUsername': RECEIVER_USERNAME,
        'content': 'Hello from simple test!',
        'type': 'text'
    })
    print("📨 Test message sent")

@sio.event
def disconnect():
    print("❌ Disconnected")

@sio.on('message_sent')
def on_message_sent(data):
    print(f"✅ Server confirmed: {data}")

print(f"🚀 Starting sender: {SENDER_USERNAME}")
sio.connect(SERVER_URL,
           auth={'username': SENDER_USERNAME},
           transports=['websocket'])

try:
    time.sleep(5)
except KeyboardInterrupt:
    pass
finally:
    sio.disconnect()
