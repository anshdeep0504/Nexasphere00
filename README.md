# 🌐 Nexasphere – Real-Time MERN Social Platform

A full-stack, real-time social media web app where users can connect, share, chat, and engage — with features for content moderation, direct messaging, and rich profile interactions.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure login and signup using **JWT**
- Password protection with **bcrypt**
- Persistent sessions with **cookies/tokens**

### 🖼️ Media Sharing
- Upload posts with images via **Cloudinary**
- Like, comment, and share posts
- Save posts for later
- Edit and delete your own posts

### 💬 Real-Time Messaging
- WebSocket-based live chat using **Socket.IO**
- Delivered/Seen indicators
- “Delete for Me” & “Delete for Everyone”
- User online/offline status badges

### 🔔 Notifications
- Real-time alerts for likes, comments, and messages

### 🧑‍🤝‍🧑 User Profiles & Social Graph
- Follow/Unfollow other users
- View user bios and avatars
- Suggested users section with follow status

### 🛠️ Admin Panel
- Moderate reported posts
- Remove inappropriate content
- View all users and their post data

### 🔎 Smart Search
- Fuzzy search bar to find users instantly
- Partial name matching (e.g., “rom” finds “romrom”)

---

## 🧑‍💻 Tech Stack

### 🖥 Frontend
- **React.js** + **Vite**
- **Redux Toolkit** for state management
- **Tailwind CSS** for design
- **Axios** for API calls

### 🌐 Backend
- **Node.js**, **Express.js**
- **MongoDB** with **Mongoose**
- **Socket.IO** for real-time communication

### ☁️ Cloud & Deployment
- **Cloudinary** for media storage
- **MongoDB Atlas** for database
- **Render / Netlify / Vercel** for deployment

---

main/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   ├── node_modules/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── node_modules/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── .gitignore
│   ├── components.json
│   ├── eslint.config.js
│   ├── jsconfig.json
│   ├── vite.config.js
