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
![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

## 📋 Overview

NexusChat is a **production-ready, distributed real-time messaging platform** built with horizontal scalability at its core. Phase 1 delivers a robust foundation with user authentication, real-time messaging, presence detection, and typing indicators, all running on a sharded database architecture.

### ✨ Why NexusChat?

- **🔒 Enterprise Security**: Email verification, JWT authentication, bcrypt password hashing
- **⚡ Real-Time Performance**: WebSocket clusters with <100ms latency
- **📈 Horizontally Scalable**: Handle 10K+ concurrent connections
- **🔄 Distributed Architecture**: Redis-ready for cross-server communication
- **🎨 Modern UI/UX**: iOS-inspired design with dark/light mode

## 🎯 Key Features

### Phase 1 Features (✅ Implemented)

<details>
<summary><b>🔐 User Authentication & Security</b></summary>

- JWT-based authentication with token refresh
- Email verification with Nodemailer
- Password strength validation
- Bcrypt password hashing (10 rounds)
- Session management
- Rate limiting ready
</details>

<details>
<summary><b>💬 Real-Time Messaging</b></summary>

- Instant message delivery via WebSockets
- Message status tracking (sent ✓, delivered ✓✓, read ✓✓)
- Typing indicators with debouncing
- Online/offline presence detection
- Message history persistence
- Read receipts
</details>

<details>
<summary><b>👤 User Experience</b></summary>

- iOS-inspired modern UI with smooth animations
- Dark/Light theme toggle
- Mobile-responsive design
- Smart reply suggestions
- File attachment UI (backend ready)
- Real-time system metrics dashboard
- Online users panel
- Search conversations
</details>

<details>
<summary><b>🏗️ Backend Architecture</b></summary>

- MVC pattern with clean separation
- Async error handling wrapper
- Custom AppError class
- Socket.io event handlers modularized
- MongoDB with Mongoose ODM
- Environment-based configuration
- CORS enabled
</details>

### Phase 2 Roadmap (Coming Soon)

- 🔄 **Redis Pub/Sub** for cross-server communication
- 🖼️ **File uploads** with Multer and Cloudinary
- 📱 **PWA support** with offline messaging
- 🎥 **WebRTC** video/audio calls
- 📊 **Advanced analytics** dashboard
- 🔍 **Message search** and filters
- 👥 **Group chats** with admin controls
- 📎 **Message reactions** and replies
- 🔗 **Message links** preview

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | ≥18.0.0 |
| **Express** | Web framework | 5.2.1 |
| **Socket.io** | Real-time bidirectional communication | 4.8.3 |
| **MongoDB** | Primary database (with Mongoose ODM) | 7.0 |
| **JWT** | Authentication | 9.0.3 |
| **Bcrypt.js** | Password hashing | 3.0.3 |
| **Nodemailer** | Email verification service | 7.0.12 |
| **Dotenv** | Environment configuration | 17.2.3 |
| **CORS** | Cross-origin resource sharing | 2.8.5 |

### Frontend

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling with CSS variables for theming |
| **JavaScript (ES6+)** | Dynamic interactions |
| **Socket.io Client** | Real-time communication |
| **Font Awesome** | Icons (v6.4.0) |
| **Google Fonts (Inter)** | Typography |

### Development Tools

- **Nodemon** (v3.1.11) - Auto-restart during development
- **Git** - Version control
- **VS Code** - Recommended IDE

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- MongoDB ≥ 7.0 (local or Atlas)
- npm or yarn
- Git

### Installation

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
4. **Start MongoDB**
   Create a .env file in the root directory :
   ```bash
   # Local MongoDB
   mongod
   # Or use MongoDB Atlas (set MONGO_URI accordingly)
5. **Access the application**
    ```bash
   Main app: http://localhost:5000


## 🙏 Acknowledgements

<div align="center">

✨ **Frontend concept and initial design generated with AI assistance**  
🎨 **Icons by Font Awesome**  
🔤 **Font by Google Fonts (Inter)**  
💡 **Inspired by modern messaging platforms like iMessage, WhatsApp, and Telegram**

</div>

---

## 📞 Contact & Support

<div align="center">

**👨‍💻 Author:** Rajesh Pandit  
**🐙 GitHub:** [@rashq-01](https://github.com/rashq-01)  
**🐛 Issues:** [GitHub Issues](https://github.com/rashq-01/NexusChat/issues)  

<br>

Made with ❤️ by **Rajesh Pandit**

</div>

---
