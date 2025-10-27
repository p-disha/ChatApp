class ChatClient {
    constructor() {
        this.ws = null;
        this.username = null;
        this.sessionId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.isAuthenticated = false;
        this.isLoginMode = true;
        this.currentChatMode = 'group';
        this.privateChatUser = null;
        this.conversations = new Map(); // Map of username -> message container
        this.notificationCounts = new Map(); // Track unread messages
        
        this.initializeUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        this.loginModal = document.getElementById('loginModal');
        this.chatContainer = document.getElementById('chatContainer');
        this.statusText = document.getElementById('statusText');
        this.statusIndicator = document.querySelector('.status-indicator');
        this.groupMessages = document.getElementById('groupMessages');
        this.privateMessages = document.getElementById('privateMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.usernameDiv = document.getElementById('username');
        this.onlineUsersDiv = document.getElementById('onlineUsers');
        this.logoutButton = document.getElementById('logoutButton');
        this.groupTab = document.getElementById('groupTab');
        this.privateTab = document.getElementById('privateTab');
        this.privateChatInput = document.getElementById('privateChatUser');
        this.startPrivateButton = document.getElementById('startPrivateChat');
        this.conversationList = document.getElementById('conversationList');
        
        this.errorDiv = document.getElementById('authError');
        
        this.switchToGroupChat();
    }
    
    setupEventListeners() {
        document.getElementById('loginToggle').addEventListener('click', () => this.switchToLogin());
        document.getElementById('registerToggle').addEventListener('click', () => this.switchToRegister());
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        this.logoutButton.addEventListener('click', () => this.handleLogout());
        this.groupTab.addEventListener('click', () => this.switchToGroupChat());
        this.privateTab.addEventListener('click', () => this.switchToPrivateChat());
        this.startPrivateButton.addEventListener('click', () => this.startPrivateChat());
        this.privateChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startPrivateChat();
            }
        });
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        this.checkSession();
    }
    
    switchToGroupChat() {
        this.currentChatMode = 'group';
        this.groupTab.classList.add('active');
        this.privateTab.classList.remove('active');
        this.groupMessages.classList.add('active');
        this.privateMessages.classList.remove('active');
        this.messageInput.placeholder = "Type your message for everyone...";
    }
    
    switchToPrivateChat() {
        if (this.conversations.size === 0) {
            alert('Please start a private chat with a user first');
            this.groupTab.classList.add('active');
            this.privateTab.classList.remove('active');
            return;
        }
        
        this.currentChatMode = 'private';
        this.groupTab.classList.remove('active');
        this.privateTab.classList.add('active');
        this.groupMessages.classList.remove('active');
        this.privateMessages.classList.add('active');
        this.messageInput.placeholder = `Type a message to ${this.privateChatUser || 'them'}...`;
    }
    
    startPrivateChat() {
        const username = this.privateChatInput.value.trim();
        
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        if (username === this.username) {
            alert('You cannot chat with yourself');
            return;
        }
        
        // Open or create conversation
        this.openConversation(username);
        this.privateChatInput.value = '';
    }
    
    openConversation(username) {
        // Create message container if it doesn't exist
        if (!this.conversations.has(username)) {
            this.createConversationContainer(username);
            this.addConversationToList(username);
            
            // Load chat history
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'get_private_history',
                    otherUser: username
                }));
            }
        }
        
        // Set active conversation
        this.privateChatUser = username;
        this.switchToPrivateChat();
        this.updateConversationDisplay();
        
        // Clear notifications
        this.notificationCounts.set(username, 0);
        this.updateConversationUI();
    }
    
    createConversationContainer(username) {
        // Create a dedicated div for this conversation's messages
        const container = document.createElement('div');
        container.className = 'conversation-messages';
        container.setAttribute('data-username', username);
        container.style.display = 'none';
        this.privateMessages.appendChild(container);
        
        this.conversations.set(username, container);
    }
    
    addConversationToList(username) {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        conversationItem.setAttribute('data-username', username);
        conversationItem.innerHTML = `
            <span class="conversation-name">💬 ${username}</span>
            <span class="conversation-badge" style="display: none;">0</span>
        `;
        
        conversationItem.addEventListener('click', () => {
            this.openConversation(username);
        });
        
        this.conversationList.appendChild(conversationItem);
    }
    
    updateConversationDisplay() {
        // Hide all conversation containers
        this.conversations.forEach((container, username) => {
            container.style.display = 'none';
        });
        
        // Show active conversation
        if (this.privateChatUser && this.conversations.has(this.privateChatUser)) {
            this.conversations.get(this.privateChatUser).style.display = 'block';
        }
        
        // Update active state in list
        this.conversationList.querySelectorAll('.conversation-item').forEach(item => {
            const itemUsername = item.getAttribute('data-username');
            if (itemUsername === this.privateChatUser) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    switchToLogin() {
        this.isLoginMode = true;
        document.getElementById('loginToggle').classList.add('active');
        document.getElementById('registerToggle').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
        this.hideError();
    }
    
    switchToRegister() {
        this.isLoginMode = false;
        document.getElementById('registerToggle').classList.add('active');
        document.getElementById('loginToggle').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        this.hideError();
    }
    
    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.add('show');
    }
    
    hideError() {
        this.errorDiv.classList.remove('show');
    }
    
    async checkSession() {
        try {
            const response = await fetch('/api/session', { 
                credentials: 'include',
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.authenticated && data.username) {
                    this.username = data.username;
                    this.sessionId = data.username;
                    this.isAuthenticated = true;
                    this.showChat();
                    this.connect();
                    return;
                }
            }
        } catch (error) {
            console.log('No existing session');
        }
        
        this.showLogin();
    }
    
    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.username = data.username;
                this.sessionId = data.sessionId;
                this.isAuthenticated = true;
                this.showChat();
                this.connect();
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Connection failed. Please try again.');
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }
        
        if (password.length < 3) {
            this.showError('Password must be at least 3 characters');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.username = data.username;
                this.sessionId = data.sessionId;
                this.isAuthenticated = true;
                this.showChat();
                this.connect();
            } else {
                this.showError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError('Registration failed. Username may already exist.');
        }
    }
    
    async handleLogout() {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (this.ws) {
                this.ws.close();
            }
            
            this.username = null;
            this.sessionId = null;
            this.isAuthenticated = false;
            this.isLoginMode = true;
            this.privateChatUser = null;
            this.conversations.clear();
            this.notificationCounts.clear();
            
            this.showLogin();
            
            this.groupMessages.innerHTML = '';
            this.privateMessages.innerHTML = '';
            this.onlineUsersDiv.innerHTML = '';
            this.conversationList.innerHTML = '';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    showLogin() {
        this.loginModal.style.display = 'flex';
        this.chatContainer.style.display = 'none';
        this.switchToLogin();
        document.getElementById('loginUsername').focus();
    }
    
    showChat() {
        this.loginModal.style.display = 'none';
        this.chatContainer.style.display = 'flex';
        this.usernameDiv.textContent = this.username;
        this.messageInput.focus();
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        console.log('Connecting to:', wsUrl);
        this.updateStatus('Connecting...', false);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.updateStatus('Connected', true);
            this.reconnectAttempts = 0;
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateStatus('Disconnected', false);
            if (this.isAuthenticated) {
                this.attemptReconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('Connection Error', false);
        };
        
        setInterval(() => this.updateOnlineUsers(), 5000);
        this.updateOnlineUsers();
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'session':
                this.username = data.username;
                this.usernameDiv.textContent = this.username;
                break;
                
            case 'history':
                const groupMsgs = data.messages.filter(msg => !msg.isPrivate);
                groupMsgs.forEach(msg => this.displayMessage(msg, this.groupMessages));
                break;
                
            case 'private_history':
                data.messages.forEach(msg => this.displayMessageToConversation(msg, data.withUser));
                break;
                
            case 'message':
                if (!data.isPrivate) {
                    this.displayMessage(data, this.groupMessages);
                }
                break;
                
            case 'private_message':
                this.handlePrivateMessage(data);
                break;
                
            case 'login_required':
                this.showLogin();
                break;
                
            default:
                console.log('Unknown message type:', data);
        }
    }
    
    handlePrivateMessage(data) {
        // Determine the other user in the conversation
        const otherUser = data.username === this.username ? data.recipient : data.username;
        
        // Create conversation if it doesn't exist
        if (!this.conversations.has(otherUser)) {
            this.createConversationContainer(otherUser);
            this.addConversationToList(otherUser);
        }
        
        // Display the message
        this.displayMessageToConversation(data, otherUser);
        
        // Show notification if not in this conversation
        if (this.currentChatMode !== 'private' || this.privateChatUser !== otherUser) {
            const count = this.notificationCounts.get(otherUser) || 0;
            this.notificationCounts.set(otherUser, count + 1);
            this.updateConversationUI();
        }
    }
    
    displayMessageToConversation(message, username) {
        if (!this.conversations.has(username)) return;
        
        const container = this.conversations.get(username);
        this.displayMessage(message, container);
    }
    
    updateConversationUI() {
        this.notificationCounts.forEach((count, username) => {
            const item = this.conversationList.querySelector(`[data-username="${username}"]`);
            if (item) {
                const badge = item.querySelector('.conversation-badge');
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        });
    }
    
    displayMessage(message, container) {
        const existingMsg = container.querySelector(`[data-message-id="${message.id}"]`);
        if (existingMsg) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.setAttribute('data-message-id', message.id);
        
        const isOwnMessage = message.username === this.username;
        if (isOwnMessage) {
            messageDiv.classList.add('own');
        }
        
        const timestamp = new Date(message.timestamp);
        const timeString = timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-username">${this.escapeHtml(message.username)}</span>
                <span class="message-timestamp">${timeString}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.message)}</div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    sendMessage() {
        const text = this.messageInput.value.trim();
        
        if (!text || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }
        
        if (!this.username) {
            return;
        }
        
        const messageObj = {
            type: 'message',
            text: text
        };
        
        if (this.currentChatMode === 'private' && this.privateChatUser) {
            messageObj.recipient = this.privateChatUser;
        }
        
        this.ws.send(JSON.stringify(messageObj));
        
        this.messageInput.value = '';
        this.messageInput.focus();
    }
    
    async updateOnlineUsers() {
        if (!this.isAuthenticated) return;
        
        try {
            const response = await fetch('/api/users/online');
            const data = await response.json();
            
            this.onlineUsersDiv.innerHTML = '';
            
            if (data.users && data.users.length > 0) {
                data.users.forEach(username => {
                    const userDiv = document.createElement('div');
                    userDiv.className = 'user-item';
                    userDiv.textContent = username;
                    this.onlineUsersDiv.appendChild(userDiv);
                });
            } else {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'user-item';
                emptyDiv.textContent = 'No users online';
                this.onlineUsersDiv.appendChild(emptyDiv);
            }
        } catch (error) {
            console.error('Error fetching online users:', error);
        }
    }
    
    updateStatus(text, connected) {
        this.statusText.textContent = text;
        
        if (connected) {
            this.statusIndicator.classList.add('connected');
        } else {
            this.statusIndicator.classList.remove('connected');
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.isAuthenticated) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            
            setTimeout(() => {
                if (this.ws?.readyState === WebSocket.CLOSED) {
                    this.connect();
                }
            }, delay);
        } else if (this.isAuthenticated) {
            this.updateStatus('Connection Failed', false);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatClient();
});
