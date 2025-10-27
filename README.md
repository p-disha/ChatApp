# Real-Time Chat System

https://chatapp-g5qs.onrender.com/
A modern, full-featured real-time chat application built with WebSockets, featuring persistent message storage and user session management.

## Features

- ✨ **Real-Time Communication** - Instant message delivery using WebSockets
- 💾 **Persistent Storage** - All messages saved to SQLite database
- 👥 **User Sessions** - Automatic user identification and session management
- 🌐 **Online Users** - See who's currently online
- 📱 **Modern UI** - Beautiful, responsive interface with smooth animations
- 🔄 **Auto-Reconnect** - Automatic reconnection on connection loss

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (ws)
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Session Management**: Cookie-based sessions

## Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server:
```bash
npm start
```

Or run with auto-reload (requires nodemon):
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. You'll be automatically assigned a username
3. Start chatting! Open multiple browser windows to simulate multiple users

## API Endpoints

- `GET /api/messages` - Get message history
- `GET /api/users/online` - Get list of online users
- `GET /health` - Health check endpoint

## WebSocket Events

### Client to Server:
- `{ type: 'message', text: 'message content' }` - Send a message

### Server to Client:
- `{ type: 'session', username, sessionId }` - Session established
- `{ type: 'history', messages: [...] }` - Message history
- `{ type: 'message', id, username, message, timestamp }` - New message

## Database Schema

### Messages Table
```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
```

## Project Structure

```
├── server.js          # Main server with WebSocket handling
├── package.json       # Dependencies and scripts
├── public/            # Frontend files
│   ├── index.html    # Main HTML
│   ├── styles.css    # Styling
│   └── client.js     # WebSocket client logic
└── chat.db           # SQLite database (created automatically)
```

## Configuration

Default port: `3000`

To change the port, set the environment variable:
```bash
PORT=8080 npm start
```

## Features in Detail

### User Session Management
- Each user gets a unique session ID stored in cookies
- Sessions are persisted in the database
- Users are assigned random usernames on first connection

### Message Persistence
- All messages are saved to SQLite database
- Last 50 messages loaded on connection
- Messages include timestamp and username

### Real-Time Updates
- WebSocket for instant message delivery
- Online user list updates every 5 seconds
- Connection status indicator
- Auto-reconnect on disconnect

## Browser Support

Works on all modern browsers that support WebSockets:
- Chrome
- Firefox
- Safari
- Edge

## Security Considerations

This is a basic implementation suitable for development. For production use, consider:
- Authentication and authorization
- Input validation and sanitization
- Rate limiting
- HTTPS/WSS
- SQL injection prevention (already using prepared statements)

## License

MIT


