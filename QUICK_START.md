# 🚀 Quick Start Guide

## ✅ Installation Complete!

Your real-time chat system is now **installed and running**!

## 🎯 Access Your Chat

Open your web browser and go to:

### **http://localhost:3000**

The server is already running in the background.

---

## 📋 What's Been Installed

- ✅ Node.js v20.11.0
- ✅ npm v10.2.4
- ✅ All 139 project dependencies
- ✅ Real-time chat server (running on port 3000)

---

## 🎮 How to Use

### **Option 1: Current Session**
The server is running now! Just open http://localhost:3000 in your browser.

### **Option 2: Future Sessions**
1. Navigate to: `C:\Users\disha\websocket-chat`
2. Double-click **START.bat**
3. Open http://localhost:3000 in your browser

---

## 🧪 Test the Chat

1. **Open http://localhost:3000** in one browser window
2. **Open http://localhost:3000** in another window or incognito mode
3. Send messages between windows - they appear instantly!
4. Watch the online users list update in real-time

---

## 🛑 Stop the Server

Press **Ctrl+C** in the terminal/PowerShell window where the server is running.

---

## 🔄 Restart the Server

Open PowerShell in the project directory and run:
```powershell
cd C:\Users\disha\websocket-chat
npm start
```

Or simply double-click **START.bat**

---

## 📁 Project Location

```
C:\Users\disha\websocket-chat
├── server.js          # WebSocket server
├── package.json       # Project configuration
├── START.bat          # Quick start script
├── INSTALL.bat        # Dependency installer
├── public/            # Frontend files
│   ├── index.html    # Chat interface
│   ├── client.js     # WebSocket client
│   └── styles.css    # Styling
└── chat.db           # SQLite database (auto-created)
```

---

## ⚙️ Useful Commands

```powershell
# Start server
npm start

# Install/update dependencies
npm install

# Check server health
curl http://localhost:3000/health
```

---

## 🎨 Features

- **Real-Time Messaging** - Instant message delivery via WebSockets
- **Persistent Storage** - All messages saved to SQLite database
- **User Sessions** - Automatic user identification
- **Online Users** - See who's currently connected
- **Modern UI** - Beautiful, responsive design
- **Auto-Reconnect** - Automatically reconnects if connection is lost

---

## 🌐 API Endpoints

- `GET http://localhost:3000/` - Chat interface
- `GET http://localhost:3000/api/messages` - Message history
- `GET http://localhost:3000/api/users/online` - Online users list
- `GET http://localhost:3000/health` - Server health check

---

## 📝 Next Steps

1. **Try it out!** Open http://localhost:3000
2. **Share with friends** - They can connect to your IP address
3. **Customize** - Edit the files in the `public/` folder to customize the UI

---

## 🆘 Troubleshooting

### Server not responding?
```powershell
# Check if Node.js is installed
node --version

# Reinstall dependencies
npm install

# Start the server
npm start
```

### Port 3000 already in use?
```powershell
# Use a different port
$env:PORT=8080; npm start
# Then open: http://localhost:8080
```

---

## 📚 More Information

See **README.md** for detailed documentation.

---

**Enjoy your real-time chat system! 🎉**

