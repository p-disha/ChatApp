const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
const db = new Database('chat.db');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    is_private INTEGER DEFAULT 0,
    recipient TEXT
  );
  
  CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
  );
`);

// Store active connections
const clients = new Map();
const sessions = new Map();

// WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  console.log(`New client connected: ${clientId}`);
  
  // Parse session cookie
  const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  const sessionId = cookies?.sessionId;
  let username = null;
  let actualSessionId = sessionId;
  
  // Check for existing session in database
  if (sessionId) {
    const sessionData = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
    if (sessionData) {
      username = sessionData.username;
      actualSessionId = sessionId;
      sessions.set(sessionId, username);
      
      // Update last seen
      db.prepare('UPDATE sessions SET last_seen = ? WHERE session_id = ?').run(Date.now(), sessionId);
    }
  }
  
  // If no valid session found, allow connection but mark as pending
  if (!username) {
    actualSessionId = sessionId || uuidv4();
    
    // Send request for login (client should handle this)
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'login_required'
        }));
      }
    }, 100);
    
    clients.set(clientId, { ws, username: null, sessionId: actualSessionId, pending: true });
    return;
  }
  
  clients.set(clientId, { ws, username, sessionId: actualSessionId });
  
  // Send welcome message with session info
  ws.send(JSON.stringify({
    type: 'session',
    username: username,
    sessionId: actualSessionId
  }));
  
  // Load recent GROUP messages from database only
  const recentMessages = db.prepare('SELECT * FROM messages WHERE is_private = 0 ORDER BY timestamp DESC LIMIT 50').all();
  ws.send(JSON.stringify({
    type: 'history',
    messages: recentMessages.reverse()
  }));
  
  // Handle messages
  ws.on('message', (data) => {
    try {
      const messageData = JSON.parse(data);
      
      // Handle username registration
      if (messageData.type === 'login' && messageData.username) {
        const username = messageData.username.trim().substring(0, 20) || `User${Math.floor(Math.random() * 10000)}`;
        const sessionId = uuidv4();
        
        // Store session in database
        const stmt = db.prepare('INSERT INTO sessions (session_id, username, created_at, last_seen) VALUES (?, ?, ?, ?)');
        stmt.run(sessionId, username, Date.now(), Date.now());
        
        sessions.set(sessionId, username);
        
        const clientData = clients.get(clientId);
        if (clientData) {
          clientData.username = username;
          clientData.sessionId = sessionId;
          clientData.pending = false;
        }
        
        // Send session confirmation
        ws.send(JSON.stringify({
          type: 'session',
          username: username,
          sessionId: sessionId
        }));
        
        // Load recent messages
        const recentMessages = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50').all();
        ws.send(JSON.stringify({
          type: 'history',
          messages: recentMessages.reverse()
        }));
        
        console.log(`User registered: ${username} (${sessionId})`);
        return;
      }
      
      if (messageData.type === 'message' && messageData.text) {
        const clientData = clients.get(clientId);
        if (!clientData || !clientData.username || clientData.pending) {
          return;
        }
        
        const isPrivate = !!messageData.recipient;
        const message = {
          id: uuidv4(),
          username: clientData.username,
          message: messageData.text,
          timestamp: Date.now(),
          isPrivate: isPrivate,
          recipient: messageData.recipient || null
        };
        
        // Save to database
        const stmt = db.prepare('INSERT INTO messages (id, username, message, timestamp, is_private, recipient) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(message.id, message.username, message.message, message.timestamp, isPrivate ? 1 : 0, message.recipient);
        
        if (isPrivate) {
          // Private message - send to specific recipient
          const broadcast = JSON.stringify({
            type: 'private_message',
            ...message
          });
          
          // Find recipient client
          let recipientSent = false;
          clients.forEach((clientInfo, cId) => {
            if (clientInfo.username === messageData.recipient && clientInfo.ws.readyState === WebSocket.OPEN) {
              clientInfo.ws.send(broadcast);
              recipientSent = true;
            }
          });
          
          // Always send back to sender
          ws.send(broadcast);
          
          console.log(`Private message from ${message.username} to ${messageData.recipient}`);
        } else {
          // Group message - broadcast to all
          const broadcast = JSON.stringify({
            type: 'message',
            ...message
          });
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcast);
            }
          });
          
          console.log(`Group message from ${message.username}: ${message.message}`);
        }
      }
      
      if (messageData.type === 'get_private_history') {
        const clientData = clients.get(clientId);
        if (!clientData || !clientData.username) return;
        
        const messages = db.prepare('SELECT * FROM messages WHERE is_private = 1 AND ((username = ? AND recipient = ?) OR (username = ? AND recipient = ?)) ORDER BY timestamp DESC LIMIT 100').all(
          clientData.username, 
          messageData.otherUser,
          messageData.otherUser,
          clientData.username
        );
        
        ws.send(JSON.stringify({
          type: 'private_history',
          messages: messages.reverse(),
          withUser: messageData.otherUser
        }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  // Handle disconnect
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(clientId);
  });
});

// API Routes
// Registration
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  if (!password || password.length < 3) {
    return res.status(400).json({ error: 'Password must be at least 3 characters' });
  }
  
  const cleanUsername = username.trim().substring(0, 20);
  
  // Check if user already exists
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  // Create user (simple storage - in production use bcrypt)
  const userId = uuidv4();
  const stmt = db.prepare('INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, ?)');
  stmt.run(userId, cleanUsername, password, Date.now());
  
  // Create session
  const sessionId = uuidv4();
  const sessionStmt = db.prepare('INSERT INTO sessions (session_id, username, created_at, last_seen) VALUES (?, ?, ?, ?)');
  sessionStmt.run(sessionId, cleanUsername, Date.now(), Date.now());
  
  sessions.set(sessionId, cleanUsername);
  
  res.cookie('sessionId', sessionId, { 
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  });
  
  res.json({ success: true, username: cleanUsername, sessionId });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const cleanUsername = username.trim();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Simple password check (in production use bcrypt)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Create session
  const sessionId = uuidv4();
  const sessionStmt = db.prepare('INSERT INTO sessions (session_id, username, created_at, last_seen) VALUES (?, ?, ?, ?)');
  sessionStmt.run(sessionId, cleanUsername, Date.now(), Date.now());
  
  sessions.set(sessionId, cleanUsername);
  
  res.cookie('sessionId', sessionId, { 
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  });
  
  res.json({ success: true, username: cleanUsername, sessionId });
});

// Logout
app.post('/api/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId) {
    sessions.delete(sessionId);
    db.prepare('DELETE FROM sessions WHERE session_id = ?').run(sessionId);
  }
  
  res.clearCookie('sessionId');
  res.json({ success: true });
});

app.get('/api/session', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return res.status(401).json({ authenticated: false });
  }
  
  const sessionData = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
  if (!sessionData) {
    return res.status(401).json({ authenticated: false });
  }
  
  // Update last seen
  db.prepare('UPDATE sessions SET last_seen = ? WHERE session_id = ?').run(Date.now(), sessionId);
  
  res.json({ authenticated: true, username: sessionData.username });
});

app.get('/api/messages', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  
  const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ? OFFSET ?').all(limit, offset);
  res.json(messages);
});

app.get('/api/users/online', (req, res) => {
  const users = Array.from(clients.values()).filter(c => c.username).map(c => c.username);
  const uniqueUsers = [...new Set(users)];
  res.json({ count: uniqueUsers.length, users: uniqueUsers });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

