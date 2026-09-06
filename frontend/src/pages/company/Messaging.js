import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import StudentNavbar from '../../components/StudentNavbar';
import CompanyNavbar from '../../components/CompanyNavbar';
import { useActivity } from '../../context/ActivityContext';

function Messaging() {
  const { id } = useParams(); // The ID of the person/company being chatted with
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const { user } = useAuth();
  const { conversations, sendMessage } = useActivity();
  
  const queryParams = new URLSearchParams(location.search);
  const chatPartnerName = queryParams.get('name') || 'Chat';
  
  const activeConversation = conversations.find(c => String(c.partnerId) === String(id));
  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const role = user?.role === 'company' ? 'company' : 'student';
    sendMessage(id, chatPartnerName, inputText, role);
    setInputText('');
  };

  const styles = `
    ${globalStyles(isDark)}
    .chat-layout {
      display: flex;
      height: calc(100vh - 70px);
      margin-top: 70px;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }
    .chat-sidebar {
      flex: 0 0 320px;
      width: 320px;
      min-width: 0;
      background: ${t.bgCard};
      border-right: 1px solid ${t.border};
      display: flex; flex-direction: column;
    }
    .chat-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: ${t.bg};
      position: relative;
    }
    
    .sidebar-header {
      padding: 18px 24px;
      border-bottom: 1px solid ${t.border};
      min-height: 68px;
      display: flex;
      align-items: center;
    }
    .sidebar-title {
      font-size: 18px;
      font-weight: 700;
      color: ${t.textPrimary};
      margin: 0;
      line-height: 1.2;
      letter-spacing: 0.2px;
    }
    
    .chat-list { flex: 1; overflow-y: auto; padding: 12px; }
    .chat-item {
      display: flex; align-items: center; gap: 12px; padding: 12px;
      border-radius: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px;
    }
    .chat-item:hover { background: ${t.bgCardHover}; }
    .chat-item.active { background: ${t.accentMuted}; border: 1px solid ${t.border}; }
    
    .item-avatar {
      width: 44px; height: 44px; border-radius: 50%; background: ${t.accent};
      display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff;
    }
    .item-info { flex: 1; min-width: 0; }
    .item-name { font-size: 14px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 2px; }
    .item-last { font-size: 12px; color: ${t.textMuted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .chat-header {
      padding: 16px 32px; border-bottom: 1px solid ${t.border};
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
      background: ${t.navBg}; backdrop-filter: blur(8px);
    }
    .header-user { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .header-user-text { min-width: 0; }
    .header-user-name {
      font-size: 15px;
      font-weight: 600;
      color: ${t.textPrimary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .back-btn {
      border: none;
      background: transparent;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 18px;
      flex-shrink: 0;
      color: ${t.textPrimary};
    }
    .close-btn { padding: 6px 14px; font-size: 12px; flex-shrink: 0; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: ${t.success}; }

    .messages-container { flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 16px; }
    .message-bubble {
      max-width: 65%; padding: 12px 18px; border-radius: 18px; font-size: 14px; line-height: 1.5;
      position: relative; animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .msg-student {
      align-self: ${user?.role === 'student' ? 'flex-end' : 'flex-start'};
      background: ${user?.role === 'student' ? t.accent : t.bgCard};
      color: ${user?.role === 'student' ? '#fff' : t.textPrimary};
      border: 1px solid ${user?.role === 'student' ? 'transparent' : t.border};
      border-bottom-right-radius: ${user?.role === 'student' ? '4px' : '18px'};
      border-bottom-left-radius: ${user?.role === 'student' ? '18px' : '4px'};
    }
    .msg-company {
      align-self: ${user?.role === 'company' ? 'flex-end' : 'flex-start'};
      background: ${user?.role === 'company' ? t.accent : t.bgCard};
      color: ${user?.role === 'company' ? '#fff' : t.textPrimary};
      border: 1px solid ${user?.role === 'company' ? 'transparent' : t.border};
      border-bottom-right-radius: ${user?.role === 'company' ? '4px' : '18px'};
      border-bottom-left-radius: ${user?.role === 'company' ? '18px' : '4px'};
    }
    .msg-ts { font-size: 10px; margin-top: 4px; opacity: 0.7; text-align: right; display: block; }

    .chat-input-area { padding: 20px 32px; border-top: 1px solid ${t.border}; background: ${t.bgCard}; }
    .input-box {
      display: flex; gap: 12px; background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      padding: 8px 8px 8px 20px; border-radius: 100px; transition: border-color 0.2s;
    }
    .input-box:focus-within { border-color: ${t.accentLight}; }
    .chat-input {
      flex: 1; background: none; border: none; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif; font-size: 14px; outline: none;
    }
    .send-btn {
      width: 40px; height: 40px; border-radius: 50%; background: ${t.accent};
      color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    .send-btn:hover { transform: scale(1.05); background: ${t.accentHover}; }
    @media (max-width: 1024px) {
      .chat-sidebar { flex-basis: 280px; width: 280px; }
      .chat-header { padding: 14px 18px; }
      .messages-container { padding: 18px; }
      .chat-input-area { padding: 14px 18px; }
    }
    @media (max-width: 820px) {
      .chat-layout { flex-direction: column; height: auto; min-height: calc(100vh - 70px); overflow-x: hidden; }
      .chat-sidebar {
        width: 100%;
        flex-basis: auto;
        border-right: none;
        border-bottom: 1px solid ${t.border};
        max-height: 42vh;
      }
      .chat-main { min-height: 58vh; }
      .chat-header { padding: 12px 14px; }
      .close-btn { padding: 6px 10px; }
      .message-bubble { max-width: 82%; }
    }
    @media (max-width: 520px) {
      .chat-header { align-items: flex-start; }
      .header-user { gap: 8px; }
      .close-btn { align-self: flex-start; }
      .input-box { padding: 8px 8px 8px 14px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        {user?.role === 'company' ? <CompanyNavbar /> : <StudentNavbar />}
        
        <div className="ie-content chat-layout">
          {/* Chat Sidebar */}
          <aside className="chat-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">Messages</div>
            </div>
            <div className="chat-list">
              {conversations.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>No conversations yet</p>
                </div>
              ) : (
                conversations.map(c => (
                  <div key={c.partnerId} 
                    className={`chat-item ${String(c.partnerId) === String(id) ? 'active' : ''}`}
                    onClick={() => navigate(`/messages/${c.partnerId}?name=${c.partnerName}`)}>
                    <div className="item-avatar">{c.partnerName[0]}</div>
                    <div className="item-info">
                      <div className="item-name">{c.partnerName}</div>
                      <div className="item-last">{c.lastMessage}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Chat Main Area */}
          <main className="chat-main">
            <header className="chat-header">
              <div className="header-user">
                <button className="back-btn" onClick={() => navigate(-1)}>
                  ←
                </button>
                <div className="item-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{chatPartnerName[0]}</div>
                <div className="header-user-text">
                  <div className="header-user-name">{chatPartnerName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: t.textSecondary }}>
                    <div className="status-dot" /> Online
                  </div>
                </div>
              </div>
              <button className="ie-btn ie-btn-ghost close-btn"
                onClick={() => navigate(user?.role === 'company' ? '/company/dashboard' : '/student/dashboard')}>
                Close
              </button>
            </header>

            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.sender === 'student' ? 'msg-student' : 'msg-company'}`}>
                  {msg.text}
                  <span className="msg-ts">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="input-box">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Type your message..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend}>
                  ➤
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Messaging;
