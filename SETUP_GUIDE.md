# Setup Guide - Real-Time Chat System

## Step 1: Install Node.js (Required)

Node.js is not currently installed on your system. You need to install it first.

### Download and Install Node.js:

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - Choose the appropriate installer (64-bit recommended)

2. **Run the Installer:**
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option (usually checked by default)
   - Complete the installation

3. **Verify Installation:**
   Open a new PowerShell or Command Prompt window and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers displayed.

## Step 2: Install Project Dependencies

Once Node.js is installed:

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\disha\websocket-chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install all required packages:
   - express
   - ws (WebSocket)
   - uuid
   - better-sqlite3
   - cookie-parser
   - cors

## Step 3: Start the Server

Run the server:
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
WebSocket server ready for connections
```

## Step 4: Use the Chat Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. Start chatting!

## Quick Start (After Node.js Installation)

Copy and paste these commands into PowerShell:

```powershell
cd C:\Users\disha\websocket-chat
npm install
npm start
```

## Alternative: Using Development Mode

For auto-reload during development (requires nodemon):
```bash
npm run dev
```

## Troubleshooting

### If npm commands fail:
- Make sure Node.js is installed correctly
- Try opening a new terminal/PowerShell window
- Check if Node.js is in your PATH: `echo $env:PATH`

### Port already in use:
If port 3000 is already in use, change the port:
```bash
$env:PORT=8080; npm start
```

### Database errors:
The SQLite database (chat.db) is created automatically on first run.

## Project Files

- `server.js` - Main server with WebSocket handling
- `public/index.html` - Chat interface
- `public/client.js` - WebSocket client logic
- `public/styles.css` - Styling
- `package.json` - Dependencies and scripts
- `README.md` - Full documentation

## Need Help?

Check the README.md file for detailed information about the project features and API documentation.

