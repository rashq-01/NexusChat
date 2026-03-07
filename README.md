# NexusChat 🚀

<div align="center">

<div align="center">
  <img src="https://raw.githubusercontent.com/rashq-01/NexusChat/main/frontend/public/assets/favicon.svg" width="60" />
</div>

### Distributed Real-Time Messaging Platform with Enterprise-Grade Architecture

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-black)
![Redis](https://img.shields.io/badge/Redis-7.2-red)
![Nginx](https://img.shields.io/badge/Nginx-1.24-green)
![k6](https://img.shields.io/badge/k6-Load%20Tested-7d64ff)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Performance](#-performance-metrics) • [Contributing](#-contributing)

</div>

## 📋 Overview

NexusChat is a **production-ready, distributed real-time messaging platform** built with horizontal scalability at its core. The platform handles **5,000+ concurrent users** with **14,500+ messages/sec** throughput, validated through rigorous k6 load testing.

### ✨ Why NexusChat?

- **🔒 Enterprise Security**: Email verification, JWT authentication, bcrypt password hashing (10 rounds)
- **⚡ Blazing Fast**: WebSocket clusters with **sub-110ms p95 latency** and **14ms connection setup**
- **📈 Horizontally Scalable**: Nginx load balancing across **5 Node.js instances** with Redis Pub/Sub
- **🔄 Distributed Architecture**: Redis-powered cross-server communication for seamless scaling
- **📊 Production Metrics**: Validated with k6 load tests at **5,000 concurrent users**
- **🎨 Modern UI/UX**: iOS-inspired design with dark/light mode and real-time system dashboard

## 🎯 Key Features

### Phase 1 Features (✅ Implemented)

<details>
<summary><b>🔐 User Authentication & Security</b></summary>

- JWT-based authentication with token refresh
- Email verification with Nodemailer
- Password strength validation with real-time feedback
- Bcrypt password hashing (10 rounds)
- Session management with Redis-ready architecture
- Rate limiting ready for brute-force protection
</details>

<details>
<summary><b>💬 Real-Time Messaging</b></summary>

- Instant message delivery via WebSockets
- Message status tracking (sent ✓, delivered ✓✓, read ✓✓)
- Typing indicators with 600ms debouncing
- Online/offline presence detection
- Message history persistence with pagination
- Read receipts with cross-server synchronization
</details>

<details>
<summary><b>👤 User Experience</b></summary>

- iOS-inspired modern UI with smooth animations
- Dark/Light theme toggle with persistent storage
- Mobile-responsive design (sidebar toggle on mobile)
- Smart reply suggestions based on message context
- File attachment UI with preview (backend ready)
- Real-time system metrics dashboard (connections, latency, load)
- Online users panel with status indicators
- Search conversations with real-time filtering
</details>

<details>
<summary><b>🏗️ Backend Architecture</b></summary>

- MVC pattern with clean separation of concerns
- Async error handling wrapper for all routes
- Custom AppError class for consistent error responses
- Socket.io event handlers modularized (message, typing, presence, read)
- MongoDB with Mongoose ODM and compound indexes
- Connection pooling (min:20, max:100) for database optimization
- Environment-based configuration with dotenv
- CORS enabled for secure cross-origin requests
</details>

### Phase 2 Features (🔄 Implemented & Tested)

<details open>
<summary><b>🌐 Distributed Systems & Load Balancing</b></summary>

- **Nginx Reverse Proxy**: Configured as load balancer distributing traffic across **5 Node.js server instances**
- **Round-Robin Load Balancing**: Even distribution of WebSocket and HTTP connections
- **Sticky Sessions**: Optional configuration for stateful connections
- **SSL/TLS Termination**: Ready for HTTPS deployment
- **Static Asset Serving**: Optimized static file delivery through Nginx
</details>

<details open>
<summary><b>📦 Redis Integration & Caching</b></summary>

- **Redis Pub/Sub**: Cross-server event propagation for messages, typing, presence, and read receipts
- **User Session Management**: Distributed socket-to-user mapping with Redis Sets
- **Presence Tracking**: Real-time online/offline status with **24-hour TTL** and auto-cleanup
- **Friend List Caching**: 5-minute TTL caching for frequently accessed data
- **Connection Pooling**: Optimized Redis connections with retry strategies
- **Automated Cleanup**: Background jobs removing stale sessions every 5 minutes
</details>

<details open>
<summary><b>⚡ Performance Optimization</b></summary>

- **Database Indexing**: Compound indexes on `participants:1, updatedAt:-1` and `chatId:1, createdAt:1`
- **Query Optimization**: Selective field projection and lean queries for MongoDB
- **Connection Pooling**: MongoDB minPoolSize:20, maxPoolSize:100 for concurrent requests
- **Graceful Shutdown**: SIGINT/SIGTERM handlers for clean connection termination
- **Exponential Backoff**: Redis reconnect strategy with progressive delays
- **Message Deduplication**: Prevention of duplicate message delivery across servers
</details>

<details open>
<summary><b>📊 Load Testing & Validation</b></summary>

- **k6 Performance Tests**: Validated with **5,000 concurrent virtual users**
- **Throughput**: Sustained **14,500+ WebSocket messages/sec**
- **Latency**: Sub-**110ms p95 HTTP response time**
- **Connection Speed**: **14ms p95 WebSocket connection establishment**
- **Session Handling**: Processed **104,000+ connection/disconnection events**
- **Success Rate**: **99% request success rate** under sustained load
</details>

### Phase 3 Roadmap (🚀 Coming Soon)

<details>
<summary><b>🔜 Planned Enhancements</b></summary>

- **Docker Containerization**: Containerized deployment with Docker Compose
- **Kubernetes Orchestration**: Auto-scaling with Horizontal Pod Autoscaler
- **Redis Cluster**: Multi-node Redis for high availability
- **Message Queues**: RabbitMQ/Kafka for offline message processing
- **CDN Integration**: CloudFront for file uploads and delivery
- **WebRTC**: Peer-to-peer video/audio calls with signaling server
- **End-to-End Encryption**: Signal Protocol implementation
- **Message Search**: Elasticsearch integration for full-text search
- **Analytics Dashboard**: Real-time metrics with Grafana/Prometheus
- **PWA Support**: Offline messaging and push notifications
</details>

## 🛠️ Tech Stack

### Backend Core

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime | ≥18.0.0 |
| **Express** | Web framework | 5.2.1 |
| **Socket.io** | Real-time communication | 4.8.3 |
| **MongoDB** | Primary database | 7.0 |
| **Mongoose** | ODM for MongoDB | 9.1.5 |

### Distributed Systems & Caching

| Technology | Purpose | Version |
|------------|---------|---------|
| **Redis** | Pub/Sub, session store, caching | 5.11.0 |
| **Nginx** | Reverse proxy, load balancer | 1.24+ |
| **Redis Sets** | User presence tracking | - |
| **Redis Pub/Sub** | Cross-server event propagation | - |

### Security & Authentication

| Technology | Purpose | Version |
|------------|---------|---------|
| **JWT** | Authentication tokens | 9.0.3 |
| **bcrypt.js** | Password hashing (10 rounds) | 3.0.3 |
| **Nodemailer** | Email verification | 7.0.12 |
| **express-rate-limit** | Rate limiting | 8.3.0 |
| **rate-limit-redis** | Distributed rate limiting | 4.3.1 |

### Frontend

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling with CSS variables |
| **JavaScript (ES6+)** | Dynamic interactions |
| **Socket.io Client** | Real-time communication |
| **Font Awesome** | Icons (v6.4.0) |
| **Google Fonts** | Inter typography |

### Testing & Validation

| Technology | Purpose |
|------------|---------|
| **k6** | Load testing (5,000 concurrent users) |
| **Postman** | API testing |
| **Nodemon** | Development auto-restart |

## 📊 Performance Metrics

<div>

| Metric | Value | Test Condition |
|--------|-------|----------------|
| **Concurrent Users** | 5,000 | k6 load test |
| **Messages/sec** | 14,500+ | Peak throughput |
| **HTTP p95 Latency** | <110ms | Under load |
| **WebSocket Connection** | 14ms p95 | Connection setup |
| **Session Events** | 104,000+ | Connect/disconnect |
| **Success Rate** | 99% | Sustained load |

</div>

### Development Tools

- **Nodemon** (v3.1.11) - Auto-restart during development
- **Git** - Version control
- **VS Code** - Recommended IDE

## 🏗️ Architecture

```
                ┌─────────────┐
                │   Client    │
                │  Browser    │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │    Nginx    │
                │ LoadBalancer│
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │   Node.js   │ │   Node.js   │ │   Node.js   │
  │ Instance 1  │ │ Instance 2  │ │ Instance 5  │
  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
         │                │                │
         └──────────┬─────┴─────┬─────────┘
                    ▼
            ┌─────────────────┐
            │   Redis Pub/Sub │
            │ Cross-Server    │
            │ Communication   │
            └────────┬────────┘
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   MongoDB   │ │    Redis    │ │    Redis    │
│  (Primary)  │ │  (Sessions) │ │ (Presence)  │
└─────────────┘ └─────────────┘ └─────────────┘
```


## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- MongoDB ≥ 7.0 (local or Atlas)
- Redis ≥ 7.2 (local or cloud)
- Nginx ≥ 1.24 (for multi-server setup)
- npm or yarn
- Git

### Quick Start (Single Server)

1. **Clone the repository**
   ```bash
   git clone https://github.com/rashq-01/NexusChat.git
   cd NexusChat
   
2. **Install dependencies**
   ```bash
   npm install

3. **Environment setup**
   Create a .env file in the root directory :
   ```bash
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/nexuschat

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Email Service (Gmail)
   EMAIL=your_email@gmail.com
   PASSWORD=your_app_password

   # Frontend URL
   CLIENT_URL=http://localhost:5000
4. **Start services**
   ```bash
   # Terminal 1: Start MongoDB
     mongod
   #Terminal 2: Start Redis
     redis-server
   # Terminal 3: Start application
     npm run dev
   
5. **Access the application**
    ```bash
   Main app: http://localhost:5000



## 🙏 Multi-Server Setup (with Nginx)

<details>
<summary><b>📘 Click for Nginx configuration</b></summary>

```bash
# /etc/nginx/nginx.conf

http {
    upstream backend_servers {
        server 127.0.0.1:5001;
        server 127.0.0.1:5002;
        server 127.0.0.1:5003;
        server 127.0.0.1:5004;
        server 127.0.0.1:5005;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

</details>


## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request.

### Steps to Contribute

1. **Fork the repository**

2. **Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**



## 🙏 Acknowledgements

<div align="center">

✨ **Frontend concept and initial design generated with AI assistance**  
🎨 **Icons by Font Awesome**  
🔤 **Font by Google Fonts (Inter)**  
💡 **Inspired by modern messaging platforms like iMessage, WhatsApp, and Telegram**

</div>

---

## 📊 Project Status

<div align="center">

| Phase | Status | Features |
|------|------|------|
| Phase 1 | ✅ Complete | Core messaging, auth, UI |
| Phase 2 | ✅ Complete | Redis, Nginx, load balancing, k6 testing |
| Phase 3 | 🚀 In Progress | Docker, Kubernetes, WebRTC |

</div>

## 📞 Contact & Support

<div align="center">

👨‍💻 **Author:** Rajesh Pandit  
🐙 **GitHub:** [@rashq-01](https://github.com/rashq-01)  
📧 **Email:** rashq122@gmail.com  
💼 **LinkedIn:** [linkedin.com/in/rashq](https://linkedin.com/in/rashq)  
🐛 **Issues:** [GitHub Issues](../../issues)

<br>

<hr>

⭐ **Star this repository if you find it useful!**

<br>

Made with ❤️ by **Rajesh Pandit**

</div>

<div align="center"> <sub>Built with Node.js, Socket.io, MongoDB, Redis, and Nginx</sub> </div> ```
