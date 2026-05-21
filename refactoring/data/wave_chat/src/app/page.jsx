import { useState, useEffect, useRef } from 'react';

export default function WaveChat() {
  const [isDark, setIsDark] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeView, setActiveView] = useState('chats');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReply, setCurrentReply] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [loginForm, setLoginForm] = useState('login');
  const [loginError, setLoginError] = useState('');
  const messagesRef = useRef(null);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('waveTheme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    } else if (savedTheme) {
      setIsDark(false);
    } else {
      localStorage.setItem('waveTheme', 'light');
      setIsDark(false);
    }

    // Check for existing user
    const savedUser = localStorage.getItem('waveUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setShowLoginModal(false);
      loadChats();
    }
  }, []);

  // Mock data functions (replace with Firebase in production)
  const loadChats = () => {
    // Mock chat data
    const mockChats = [
      {
        id: '1',
        name: 'Ivan Petrov',
        lastMessage: 'Hello! How are you?',
        lastMessageTime: Date.now() - 1000 * 60 * 5,
        avatar: 1,
        online: true,
        unread: 2,
      },
      {
        id: '2',
        name: 'Maria Sidorova',
        lastMessage: 'See you tomorrow',
        lastMessageTime: Date.now() - 1000 * 60 * 30,
        avatar: 2,
        online: false,
        unread: 0,
      },
    ];
    setChats(mockChats);
  };

  const login = async () => {
    const username = document.getElementById('loginUsername')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!username || !password) {
      setLoginError('Fill all fields');
      return;
    }

    // Mock login
    const user = {
      id: Date.now().toString(),
      username,
      name: username,
      avatar: 1,
      isDeveloper: username === 'Developer',
    };

    setCurrentUser(user);
    localStorage.setItem('waveUser', JSON.stringify(user));
    setShowLoginModal(false);
    loadChats();
  };

  const register = async () => {
    const name = document.getElementById('registerName')?.value?.trim();
    const username = document.getElementById('registerUsername')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;

    if (!name || !username || !password) {
      setLoginError('Fill all fields');
      return;
    }

    if (name.length < 2) {
      setLoginError('Name must be at least 2 characters long');
      return;
    }

    // Mock register
    const user = {
      id: Date.now().toString(),
      username,
      name,
      avatar: 1,
      isDeveloper: username === 'Developer',
    };

    setCurrentUser(user);
    localStorage.setItem('waveUser', JSON.stringify(user));
    setShowLoginModal(false);
    loadChats();
  };

  const openChat = (chatUser) => {
    setCurrentChatUser(chatUser);
    setSidebarOpen(false);

    // Mock messages
    const mockMessages = [
      {
        id: '1',
        userId: chatUser.id,
        userName: chatUser.name,
        text: 'Hello! How are you?',
        timestamp: Date.now() - 1000 * 60 * 10,
        avatar: chatUser.avatar,
      },
      {
        id: '2',
        userId: currentUser?.id,
        userName: currentUser?.name,
        text: 'Hello! Everything is fine, thank you!',
        timestamp: Date.now() - 1000 * 60 * 5,
        avatar: currentUser?.avatar,
      },
    ];
    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !currentChatUser) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      text: messageInput,
      timestamp: Date.now(),
      avatar: currentUser.avatar,
      replyTo: currentReply,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
    setCurrentReply(null);

    // Update chat preview
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatUser.id
          ? { ...chat, lastMessage: messageInput, lastMessageTime: Date.now() }
          : chat
      )
    );
  };

  const clearChat = () => {
    if (!currentChatUser) return;

    if (confirm('Delete all messages in this chat?')) {
      setMessages([]);

      // Remove preview from chat list when chat is empty
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatUser.id
            ? { ...chat, lastMessage: '', lastMessageTime: 0 }
            : chat
        )
      );
    }
  };

  const searchUsers = () => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }

    // Mock search results
    const mockUsers = [
      {
        id: '3',
        name: 'Александр Новиков',
        username: 'alex_nov',
        avatar: 3,
        online: true,
      },
      {
        id: '4',
        name: 'Елена Волкова',
        username: 'elena_v',
        avatar: 4,
        online: false,
      },
    ];

    const results = mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.username.toLowerCase().includes(searchInput.toLowerCase())
    );

    setSearchResults(results);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diff < 172800000) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('waveTheme', newTheme ? 'dark' : 'light');
  };

  return (
    <>
      <div
        className={`h-screen w-full font-inter ${isDark ? 'dark-theme' : ''}`}
      >
        {/* Login Modal */}
        {showLoginModal && (
          <div className="login-modal">
            <div className="login-box">
              <h1 className="login-title">👋 Wave Chat</h1>
              <div className="login-tabs">
                <button
                  className={`login-tab ${loginForm === 'login' ? 'active' : ''}`}
                  onClick={() => setLoginForm('login')}
                >
                  Sign In
                </button>
                <button
                  className={`login-tab ${loginForm === 'register' ? 'active' : ''}`}
                  onClick={() => setLoginForm('register')}
                >
                  Sign Up
                </button>
              </div>

              {loginForm === 'login' ? (
                <div className="login-form">
                  <input
                    type="text"
                    className="input-field"
                    id="loginUsername"
                    placeholder="Username"
                    maxLength="20"
                  />
                  <input
                    type="password"
                    className="input-field"
                    id="loginPassword"
                    placeholder="password"
                    onKeyPress={(e) => e.key === 'Enter' && login()}
                  />
                  {loginError && (
                    <div className="login-error">{loginError}</div>
                  )}
                  <button className="btn-login" onClick={login}>
                    Login
                  </button>
                </div>
              ) : (
                <div className="register-form">
                  <input
                    type="text"
                    className="input-field"
                    id="registerName"
                    placeholder="Your name"
                    maxLength="30"
                  />
                  <input
                    type="text"
                    className="input-field"
                    id="registerUsername"
                    placeholder="Username (only English letters and numbers)"
                    maxLength="20"
                  />
                  <input
                    type="password"
                    className="input-field"
                    id="registerPassword"
                    placeholder="Password (minimum 3 characters)"
                    onKeyPress={(e) => e.key === 'Enter' && register()}
                  />
                  {loginError && (
                    <div className="login-error">{loginError}</div>
                  )}
                  <button className="btn-login" onClick={register}>
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div
            className="settings-modal"
            onClick={(e) =>
              e.target.className.includes('settings-modal') &&
              setShowSettings(false)
            }
          >
            <div className="settings-box">
              <div className="settings-header">
                <h2>Settings</h2>
                <button
                  className="settings-close-btn"
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </button>
              </div>
              <div className="settings-content">
                <div className="setting-item">
                  <div className="setting-label">
                    <span>🌙</span>
                    <span>Dark theme</span>
                  </div>
                  <label className="theme-switch">
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={toggleTheme}
                    />
                    <span className="theme-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer */}
        {showImageViewer && (
          <div
            className="image-viewer"
            onClick={() => setShowImageViewer(false)}
          >
            <div className="image-viewer-content">
              <button
                className="image-viewer-close"
                onClick={() => setShowImageViewer(false)}
              >
                ×
              </button>
              <img src={viewerImage} alt="" />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${showMobileNav ? 'show' : ''}`}>
          <button
            className={`nav-item ${activeView === 'chats' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('chats');
              setSidebarOpen(true);
            }}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">Chats</span>
          </button>
          <button
            className={`nav-item ${activeView === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('search');
              setSidebarOpen(true);
            }}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Search</span>
          </button>
          <button
            className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('profile');
              setShowProfile(true);
            }}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </div>

        {/* Mobile nav toggle button */}
        <button
          className={`mobile-nav-toggle ${currentChatUser ? 'in-chat' : ''}`}
          onClick={() => setShowMobileNav(!showMobileNav)}
        >
          <span className="toggle-icon">▲</span>
        </button>

        <div className="container">
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="app-title">
                <span>💬</span>
                <span>Wave Chat</span>
              </div>
              <button
                className="btn-icon settings-btn"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                ⚙️
              </button>
              {currentUser && (
                <div className="user-info" onClick={() => setShowProfile(true)}>
                  <div
                    className={`user-avatar avatar-gradient-${currentUser.avatar || 1}`}
                  >
                    <span>
                      {(currentUser.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="user-details">
                    <div className="user-name">
                      {currentUser.name || 'User'}
                    </div>
                    <div className="user-status">
                      <span className="status-dot" />
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  searchUsers();
                }}
              />
              <div className="search-results">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="search-result-item"
                    onClick={() => openChat(user)}
                  >
                    <div
                      className={`chat-item-avatar avatar-gradient-${user.avatar}`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="search-result-name">{user.name}</div>
                      <div className="search-result-username">
                        @{user.username}
                      </div>
                      <div className="search-result-status">
                        {user.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chats-list">
              <div className="chats-title">Chats</div>
              <div className="chats-container">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item ${currentChatUser?.id === chat.id ? 'active' : ''}`}
                    onClick={() => openChat(chat)}
                  >
                    <div
                      className={`chat-item-avatar avatar-gradient-${chat.avatar}`}
                    >
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-item-info">
                      <div className="chat-item-name">
                        {chat.name}
                        {chat.isDeveloper && (
                          <span className="developer-badge">DEV</span>
                        )}
                      </div>
                      <div className="chat-item-last-message">
                        {chat.lastMessage || ''}
                      </div>
                    </div>
                    <div className="chat-item-meta">
                      <div className="chat-item-time">
                        {formatTime(chat.lastMessageTime)}
                      </div>
                      {chat.unread > 0 && (
                        <div className="chat-item-unread">{chat.unread}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Chat Area */}
          <main className="chat-area">
            {currentChatUser ? (
              <>
                {/* Chat Header */}
                <header className="chat-header">
                  <button
                    className="btn-icon menu-toggle"
                    onClick={() => setSidebarOpen(true)}
                  >
                    ☰
                  </button>
                  <div className="chat-user-info">
                    <div
                      className={`chat-user-avatar avatar-gradient-${currentChatUser.avatar}`}
                    >
                      {currentChatUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-user-details">
                      <div className="chat-user-name">
                        {currentChatUser.name}
                        {currentChatUser.isDeveloper && (
                          <span className="developer-badge">DEV</span>
                        )}
                      </div>
                      <div className="chat-user-status">
                        {currentChatUser.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button
                      className="btn-icon"
                      onClick={clearChat}
                      title="Clear chat"
                    >
                      🗑️
                    </button>
                  </div>
                </header>

                {/* Messages */}
                <div className="messages-container" ref={messagesRef}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.userId === currentUser?.id ? 'own' : ''}`}
                    >
                      <div
                        className={`message-avatar avatar-gradient-${message.avatar}`}
                        onClick={() => setShowProfile(true)}
                      >
                        {message.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="message-content">
                        <div className="message-author">
                          {message.userName}
                          {message.isDeveloper && (
                            <span className="developer-badge">DEV</span>
                          )}
                        </div>
                        <div className="message-bubble">
                          {message.replyTo && (
                            <div className="message-reply">
                              <div className="message-reply-author">
                                {message.replyTo.author}
                              </div>
                              <div className="message-reply-text">
                                {message.replyTo.text}
                              </div>
                            </div>
                          )}
                          <div className="message-text">{message.text}</div>
                          <div className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Container */}
                {currentReply && (
                  <div className="reply-container">
                    <div className="reply-header">
                      <div>
                        <div className="reply-to">
                          Reply for <span>{currentReply.author}</span>
                        </div>
                        <div className="reply-text">{currentReply.text}</div>
                      </div>
                      <button
                        className="btn-close-reply"
                        onClick={() => setCurrentReply(null)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="message-input-container">
                  <div className="message-input-wrapper">
                    <label className="media-upload-btn">
                      📎
                      <input type="file" accept="image/*" />
                    </label>
                    <div className="input-group">
                      <textarea
                        className="message-input"
                        placeholder="Enter message..."
                        rows="1"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                    </div>
                    <button className="send-btn" onClick={sendMessage}>
                      <span>➤</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="welcome-screen">
                <div className="welcome-content">
                  <div className="welcome-icon">💬</div>
                  <h2>Welcome to Wave Chat!</h2>
                  <p>Find friends through search and start chatting</p>
                </div>
              </div>
            )}
          </main>
        </div>

        <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --vh: 1vh;
          --bg-primary: #ffffff;
          --bg-secondary: #f5f5f7;
          --bg-tertiary: #f0f0f2;
          --bg-overlay: rgba(255, 255, 255, 0.8);
          --bg-blur: rgba(255, 255, 255, 0.85);
          --text-primary: #1d1d1f;
          --text-secondary: #86868b;
          --text-tertiary: #a1a1a6;
          --border-color: #d2d2d7;
          --accent-color: #32d74b;
          --accent-hover: #30d158;
          --danger-color: #ff3b30;
          --warning-color: #ff9500;
          --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.12);
          --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.15);
          --shadow-heavy: 0 10px 40px rgba(0, 0, 0, 0.2);
          --blur-backdrop: blur(20px);
        }

        .dark-theme {
          --bg-primary: #1c1c1e;
          --bg-secondary: #2c2c2e;
          --bg-tertiary: #3a3a3c;
          --bg-overlay: rgba(28, 28, 30, 0.8);
          --bg-blur: rgba(28, 28, 30, 0.85);
          --text-primary: #f2f2f7;
          --text-secondary: #98989d;
          --text-tertiary: #636366;
          --border-color: #48484a;
          --accent-color: #32d74b;
          --accent-hover: #30d158;
          --danger-color: #ff453a;
          --warning-color: #ff9f0a;
          --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.3);
          --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.4);
          --shadow-heavy: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        /* Layout */
        .container {
          display: flex;
          height: 100vh;
          max-height: calc(var(--vh, 1vh) * 100);
        }

        .sidebar {
          width: 320px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          transition: transform 0.3s ease;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          min-width: 0;
        }

        /* Sidebar Header */
        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-blur);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
        }

        .app-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .settings-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-btn:hover {
          background: var(--border-color);
          transform: scale(1.05);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 8px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }

        .user-info:hover {
          background: var(--bg-overlay);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-color);
        }

        /* Search */
        .search-container {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(50, 215, 75, 0.1);
        }

        .search-results {
          margin-top: 8px;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .search-result-item:hover {
          background: var(--bg-overlay);
        }

        .search-result-name {
          font-weight: 600;
          font-size: 14px;
        }

        .search-result-username {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .search-result-status {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        /* Chats List */
        .chats-list {
          flex: 1;
          overflow-y: auto;
        }

        .chats-title {
          padding: 16px;
          font-weight: 600;
          font-size: 16px;
          color: var(--text-secondary);
        }

        .chats-container {
          padding: 0 8px;
        }

        .chat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .chat-item:hover {
          background: var(--bg-overlay);
        }

        .chat-item.active {
          background: var(--accent-color);
          color: white;
        }

        .chat-item-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
        }

        .chat-item-info {
          flex: 1;
          min-width: 0;
        }

        .chat-item-name {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chat-item-last-message {
          font-size: 13px;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chat-item.active .chat-item-last-message {
          color: rgba(255, 255, 255, 0.8);
        }

        .chat-item-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .chat-item-time {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .chat-item.active .chat-item-time {
          color: rgba(255, 255, 255, 0.7);
        }

        .chat-item-unread {
          background: var(--danger-color);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        /* Welcome Screen */
        .welcome-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          text-align: center;
        }

        .welcome-content {
          max-width: 400px;
          padding: 40px;
        }

        .welcome-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .welcome-content h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .welcome-content p {
          font-size: 16px;
          color: var(--text-secondary);
        }

        /* Chat Header */
        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-blur);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
        }

        .menu-toggle {
          display: none;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          cursor: pointer;
        }

        .chat-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .chat-user-name {
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chat-user-status {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .chat-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          background: var(--bg-tertiary);
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .btn-icon:hover {
          background: var(--border-color);
          transform: scale(1.05);
        }

        /* Messages */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: var(--bg-primary);
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          align-items: flex-start;
        }

        .message.own {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .message-content {
          max-width: 70%;
          min-width: 0;
        }

        .message.own .message-content {
          align-items: flex-end;
        }

        .message-author {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .message.own .message-author {
          text-align: right;
        }

        .message-bubble {
          background: var(--bg-secondary);
          border-radius: 16px;
          padding: 10px 14px;
          position: relative;
          box-shadow: var(--shadow-light);
          transition: all 0.2s ease;
        }

        .message.own .message-bubble {
          background: var(--accent-color);
          color: white;
        }

        .message-bubble:hover {
          box-shadow: var(--shadow-medium);
          transform: translateY(-1px);
        }

        .message-text {
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 4px;
          text-align: right;
        }

        .message.own .message-time {
          color: rgba(255, 255, 255, 0.7);
        }

        .message-reply {
          background: var(--bg-overlay);
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 8px;
          border-left: 3px solid var(--accent-color);
        }

        .message-reply-author {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-color);
          margin-bottom: 2px;
        }

        .message-reply-text {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Reply Container */
        .reply-container {
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
        }

        .reply-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .reply-to {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-color);
          margin-bottom: 2px;
        }

        .reply-text {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .btn-close-reply {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .btn-close-reply:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        /* Message Input */
        .message-input-container {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-blur);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
        }

        .message-input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: var(--bg-secondary);
          border-radius: 20px;
          padding: 8px;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .message-input-wrapper:focus-within {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(50, 215, 75, 0.1);
        }

        .media-upload-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .media-upload-btn:hover {
          background: var(--border-color);
          transform: scale(1.05);
        }

        .media-upload-btn input {
          display: none;
        }

        .input-group {
          flex: 1;
        }

        .message-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-size: 14px;
          font-family: inherit;
          color: var(--text-primary);
          min-height: 20px;
          max-height: 100px;
          overflow-y: auto;
          line-height: 1.4;
        }

        .message-input::placeholder {
          color: var(--text-secondary);
        }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-color);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .send-btn:hover {
          background: var(--accent-hover);
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-blur);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          border-top: 1px solid var(--border-color);
          padding: 8px 16px;
          padding-bottom: calc(8px + env(safe-area-inset-bottom));
          display: none;
          justify-content: space-around;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          z-index: 1000;
        }

        .mobile-nav.show {
          transform: translateY(0);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
          min-width: 60px;
        }

        .nav-item:hover {
          background: var(--bg-overlay);
        }

        .nav-item.active {
          color: var(--accent-color);
          background: rgba(50, 215, 75, 0.1);
        }

        .nav-icon {
          font-size: 20px;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
        }

        .mobile-nav-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-color);
          border: none;
          color: white;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1001;
          box-shadow: var(--shadow-heavy);
        }

        .mobile-nav-toggle:hover {
          background: var(--accent-hover);
          transform: scale(1.05);
        }

        .mobile-nav-toggle.in-chat {
          bottom: 100px;
        }

        .toggle-icon {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .mobile-nav.show + .mobile-nav-toggle .toggle-icon {
          transform: rotate(180deg);
        }

        /* Avatar Gradients */
        .avatar-gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .avatar-gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .avatar-gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .avatar-gradient-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .avatar-gradient-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

        /* Developer Badge */
        .developer-badge {
          background: var(--warning-color);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        /* Login Modal */
        .login-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-overlay);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .login-box {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-heavy);
          border: 1px solid var(--border-color);
        }

        .login-title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 32px;
        }

        .login-tabs {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .login-tab {
          flex: 1;
          background: none;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-secondary);
        }

        .login-tab.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          box-shadow: var(--shadow-light);
        }

        .input-field {
          width: 100%;
          padding: 16px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 16px;
          margin-bottom: 16px;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-field:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(50, 215, 75, 0.1);
        }

        .input-field::placeholder {
          color: var(--text-secondary);
        }

        .login-error {
          color: var(--danger-color);
          font-size: 14px;
          margin-bottom: 16px;
          padding: 8px;
          background: rgba(255, 59, 48, 0.1);
          border-radius: 8px;
        }

        .btn-login {
          width: 100%;
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-login:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-medium);
        }

        /* Settings Modal */
        .settings-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-overlay);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .settings-box {
          background: var(--bg-primary);
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-heavy);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .settings-header h2 {
          font-size: 20px;
          font-weight: 700;
        }

        .settings-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .settings-close-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .settings-content {
          padding: 24px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .setting-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .theme-switch {
          position: relative;
          display: inline-block;
          width: 52px;
          height: 28px;
        }

        .theme-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .theme-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-tertiary);
          border-radius: 28px;
          transition: 0.3s;
          border: 1px solid var(--border-color);
        }

        .theme-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 2px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
          box-shadow: var(--shadow-light);
        }

        .theme-switch input:checked + .theme-slider {
          background: var(--accent-color);
        }

        .theme-switch input:checked + .theme-slider:before {
          transform: translateX(24px);
        }

        /* Image Viewer */
        .image-viewer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .image-viewer-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }

        .image-viewer-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .image-viewer-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .image-viewer img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 12px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .container {
            position: relative;
          }

          .sidebar {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            width: 280px;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .chat-area {
            width: 100%;
          }

          .menu-toggle {
            display: flex;
          }

          .mobile-nav {
            display: flex;
          }

          .mobile-nav-toggle {
            display: flex;
          }

          .settings-btn {
            top: 24px;
          }

          .message {
            margin-bottom: 12px;
          }

          .message-content {
            max-width: 85%;
          }

          .message-bubble {
            padding: 8px 12px;
          }

          .messages-container {
            padding: 12px;
            padding-bottom: calc(120px + env(safe-area-inset-bottom));
          }

          .message-input-container {
            padding-bottom: calc(16px + env(safe-area-inset-bottom));
          }

          .login-box {
            margin: 20px;
            padding: 24px;
          }

          .login-title {
            font-size: 28px;
            margin-bottom: 24px;
          }

          .settings-box {
            margin: 20px;
          }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .message {
          animation: fadeIn 0.3s ease;
        }

        .mobile-nav.show {
          animation: slideUp 0.3s ease;
        }

        /* Focus states */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid var(--accent-color);
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          :root {
            --border-color: #000000;
            --text-secondary: #333333;
          }
          
          .dark-theme {
            --border-color: #ffffff;
            --text-secondary: #cccccc;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      </div>
    </>
  );
}
