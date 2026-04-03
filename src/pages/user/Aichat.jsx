// src/pages/user/AiChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Mic, MicOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Navbar, { Footer } from '../../components/Navbar';

/* ─── Helpers ─── */
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

const AICHAT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap');

  :root {
    --white:       #ffffff;
    --bg:          #f6f8fa;
    --border:      #e4e9f0;
    --border-dark: #d0d7e2;
    --text-primary:   #0d1117;
    --text-secondary: #5a6473;
    --text-muted:     #9aa3af;
    --green:       #2da44e;
    --green-light: #f0fdf4;
    --green-border: #c3e6cb;
    --blue:        #1e72c8;
    --blue-user:   #1c6db5;
    --blue-bubble: #2478d4;
    --amber:       #c98a00;
    --amber-light: #fffdf0;
    --amber-border: #f0d080;
    --shadow-sm:   0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md:   0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
    --radius-lg:   20px;
    --radius-md:   14px;
    --radius-sm:   10px;
  }

  /* ── Root ── */
  .aic-root {
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Plus Jakarta Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .aic-container {
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
    padding: 28px 24px 32px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;
  }

  /* ── Header ── */
  .aic-header {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow-sm);
  }

  .aic-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .aic-icon-box {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(145deg, #2da44e, #1f7a38);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 4px 12px rgba(45,164,78,0.30);
    flex-shrink: 0;
  }

  .aic-header-title {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 3px;
    letter-spacing: -0.3px;
  }

  .aic-header-sub {
    color: var(--green);
    font-size: 12.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .aic-online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2da44e;
    box-shadow: 0 0 0 2px rgba(45,164,78,0.2);
    animation: pulseOnline 2.5s infinite;
  }

  @keyframes pulseOnline {
    0%, 100% { box-shadow: 0 0 0 2px rgba(45,164,78,0.2); }
    50%       { box-shadow: 0 0 0 5px rgba(45,164,78,0.0); }
  }

  .aic-badge {
    background: var(--white);
    color: var(--text-secondary);
    border: 1.5px solid var(--border);
    padding: 7px 14px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 12.5px;
    display: flex;
    align-items: center;
    gap: 5px;
    letter-spacing: 0.2px;
  }

  /* ── Chat area ── */
  .aic-chatbox {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 480px;
    max-height: 66vh;
    box-shadow: var(--shadow-md);
  }

  /* Messages scroll area */
  .aic-messages {
    flex: 1;
    overflow-y: auto;
    padding: 28px 24px;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: 20px;
    scroll-behavior: smooth;
  }

  .aic-messages::-webkit-scrollbar { width: 5px; }
  .aic-messages::-webkit-scrollbar-track { background: transparent; }
  .aic-messages::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: 99px; }

  /* Message row */
  .aic-msg-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .aic-msg-row.user { justify-content: flex-end; }
  .aic-msg-row.ai   { justify-content: flex-start; }

  /* Avatars */
  .aic-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 800;
    flex-shrink: 0;
    margin-top: 2px;
    border: 1.5px solid var(--border);
  }

  .aic-avatar.ai {
    background: var(--green-light);
    border-color: var(--green-border);
    font-size: 18px;
  }

  .aic-avatar.user {
    background: var(--blue-user);
    border-color: #1557a0;
    color: #fff;
    font-family: 'Sora', sans-serif;
    letter-spacing: -0.5px;
  }

  /* Bubble wrap */
  .aic-bubble-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 78%;
  }

  /* Bubbles */
  .aic-bubble {
    padding: 13px 18px;
    font-size: 14.5px;
    font-weight: 500;
    line-height: 1.65;
    border-radius: var(--radius-md);
    position: relative;
    word-break: break-word;
  }

  .aic-msg-row.user .aic-bubble {
    background: linear-gradient(135deg, #2478d4, #1a5fa8);
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 10px rgba(36,120,212,0.28);
  }

  .aic-msg-row.ai .aic-bubble {
    background: var(--white);
    border: 1.5px solid var(--border);
    color: var(--text-primary);
    border-top-left-radius: 4px;
    box-shadow: var(--shadow-sm);
  }

  /* Sender label */
  .aic-sender-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0 2px;
  }

  .aic-msg-row.user .aic-sender-label { text-align: right; }

  /* Correction card */
  .aic-correction {
    background: var(--amber-light);
    border: 1.5px solid var(--amber-border);
    padding: 14px 16px;
    border-radius: var(--radius-md);
    font-size: 13.5px;
  }

  .aic-corr-title {
    font-weight: 800;
    color: var(--amber);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 7px;
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .aic-corr-text {
    font-weight: 500;
    color: #6b4c00;
    line-height: 1.6;
  }

  .aic-better {
    margin-top: 10px;
    background: var(--green-light);
    border: 1.5px solid var(--green-border);
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-weight: 500;
    color: #155a2e;
    font-size: 13.5px;
    line-height: 1.55;
  }

  .aic-better-title {
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 4px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--green);
  }

  /* ── Input area ── */
  .aic-input-area {
    background: var(--white);
    padding: 14px 16px;
    border-top: 1.5px solid var(--border);
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .aic-mic-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text-secondary);
    transition: background 0.18s, border-color 0.18s, color 0.18s;
  }

  .aic-mic-btn:hover {
    background: #eef2f7;
    border-color: var(--border-dark);
  }

  .aic-mic-btn.listening {
    background: #fff1f1;
    color: #e03b3b;
    border-color: #f5b8b8;
    animation: pulseMic 1.5s infinite;
  }

  .aic-input {
    flex: 1;
    background: var(--bg);
    border-radius: var(--radius-sm);
    padding: 0 16px;
    height: 44px;
    font-size: 14.5px;
    font-weight: 500;
    color: var(--text-primary);
    border: 1.5px solid var(--border);
    outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-sizing: border-box;
  }

  .aic-input::placeholder { color: var(--text-muted); }

  .aic-input:focus {
    border-color: #2da44e;
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(45,164,78,0.10);
  }

  .aic-send-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: linear-gradient(145deg, #2da44e, #1f7a38);
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(45,164,78,0.30);
  }

  .aic-send-btn:not(:disabled):hover {
    box-shadow: 0 4px 14px rgba(45,164,78,0.38);
    transform: translateY(-1px);
  }

  .aic-send-btn:not(:disabled):active {
    transform: translateY(1px);
    box-shadow: 0 1px 4px rgba(45,164,78,0.20);
  }

  .aic-send-btn:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* ── Typing indicator ── */
  .aic-typing {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 12px 16px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    border-top-left-radius: 4px;
    box-shadow: var(--shadow-sm);
    width: fit-content;
  }

  .mascot-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--text-muted);
    animation: mascotDot 1.4s infinite;
  }

  .mascot-dot:nth-child(2) { animation-delay: 0.18s; }
  .mascot-dot:nth-child(3) { animation-delay: 0.36s; }

  @keyframes mascotDot {
    0%, 80%, 100% { transform: translateY(0);   opacity: 0.35; }
    40%            { transform: translateY(-5px); opacity: 1; }
  }

  @keyframes pulseMic {
    0%   { box-shadow: 0 0 0 0   rgba(224,59,59,0.35); }
    70%  { box-shadow: 0 0 0 8px rgba(224,59,59,0); }
    100% { box-shadow: 0 0 0 0   rgba(224,59,59,0); }
  }

  /* ── Fade-in for new messages ── */
  .aic-msg-row {
    animation: fadeInMsg 0.22s ease both;
  }

  @keyframes fadeInMsg {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Divider line between header and chat ── */
  .aic-chatbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 24px;
    border-bottom: 1.5px solid var(--border);
    background: var(--white);
  }

  .aic-chatbox-label span {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .aic-chatbox-label-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }
`;

const AiChat = () => {
    const navigate = useNavigate();
    const user = getUser();
    const username = user?.Username || user?.username || "Y";

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{
        sender: 'ai',
        text: "Hello there! Mình là EngBot 🦜 Bạn có thể gõ phím hoặc dùng micro để trò chuyện tiếng Anh với mình nhé!",
        correction: null,
        better_version: null
    }]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        const id = "aic-styles";
        if (!document.getElementById(id)) {
            const s = document.createElement("style");
            s.id = id; s.textContent = AICHAT_STYLE;
            document.head.appendChild(s);
        }
    }, []);

    useEffect(() => { 
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [messages, isLoading]);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            recognitionRef.current = new SR();
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.continuous = false;
            recognitionRef.current.onresult = (e) => { 
                const transcript = e.results[0][0].transcript;
                setInput(prev => prev + (prev ? " " : "") + transcript); 
                setIsListening(false); 
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleMic = () => {
        if (!recognitionRef.current) { 
            alert("Trình duyệt không hỗ trợ thu âm. Hãy dùng Chrome hoặc Edge nhé!"); 
            return; 
        }
        if (isListening) { 
            recognitionRef.current.stop(); 
        } else { 
            recognitionRef.current.start(); 
            setIsListening(true); 
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input.trim();
        setMessages(p => [...p, { sender: 'user', text: msg }]);
        setInput(''); 
        setIsLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/chat', { message: msg });
            setMessages(p => [...p, { 
                sender: 'ai', 
                text: data.reply, 
                correction: data.correction, 
                better_version: data.better_version 
            }]);
        } catch {
            setMessages(p => [...p, { 
                sender: 'ai', 
                text: "Oops! I'm having a little trouble thinking right now. Can you say that again?", 
                correction: "Lỗi kết nối đến Server AI." 
            }]);
        } finally { 
            setIsLoading(false); 
        }
    };

    if (!user) return null;

    return (
        <div className="aic-root">
            <Navbar />

            <div className="aic-container">
                
                {/* Header */}
                <div className="aic-header">
                    <div className="aic-header-left">
                        <div className="aic-icon-box">🦜</div>
                        <div>
                            <h2 className="aic-header-title">EngBot Teacher</h2>
                            <div className="aic-header-sub">
                                <span className="aic-online-dot"></span>
                                Sẵn sàng sửa lỗi &amp; trò chuyện
                            </div>
                        </div>
                    </div>
                    <div className="aic-badge">
                        <Sparkles size={14} strokeWidth={2.5} />
                        AI Powered
                    </div>
                </div>

                {/* Chat Box */}
                <div className="aic-chatbox">

                    {/* Label strip */}
                    <div className="aic-chatbox-label">
                        <span>Cuộc trò chuyện</span>
                        <div className="aic-chatbox-label-line" />
                    </div>

                    {/* Messages */}
                    <div className="aic-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`aic-msg-row ${msg.sender}`}>
                                
                                {msg.sender === 'ai' && (
                                    <div className="aic-avatar ai">🦜</div>
                                )}
                                
                                <div className="aic-bubble-wrap">
                                    <div className="aic-sender-label">
                                        {msg.sender === 'ai' ? 'EngBot' : username}
                                    </div>

                                    <div className="aic-bubble">{msg.text}</div>

                                    {msg.sender === 'ai' && msg.correction && (
                                        <div className="aic-correction">
                                            <div className="aic-corr-title">
                                                <AlertCircle size={13} /> Giải thích lỗi
                                            </div>
                                            <div className="aic-corr-text">{msg.correction}</div>

                                            {msg.better_version && (
                                                <div className="aic-better">
                                                    <div className="aic-better-title">
                                                        <CheckCircle2 size={12} /> Cách nói tự nhiên hơn
                                                    </div>
                                                    <div>"{msg.better_version}"</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="aic-avatar user">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="aic-msg-row ai">
                                <div className="aic-avatar ai">🦜</div>
                                <div className="aic-bubble-wrap">
                                    <div className="aic-sender-label">EngBot</div>
                                    <div className="aic-typing">
                                        <span className="mascot-dot" />
                                        <span className="mascot-dot" />
                                        <span className="mascot-dot" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="aic-input-area">
                        <button
                            type="button"
                            onClick={toggleMic}
                            className={`aic-mic-btn ${isListening ? 'listening' : ''}`}
                            title={isListening ? 'Dừng ghi âm' : 'Bật micro'}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>

                        <input 
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={isListening ? '🎙️ Đang nghe...' : 'Gõ tiếng Anh vào đây nhé...'}
                            className="aic-input"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isLoading}
                            autoComplete="off"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="aic-send-btn"
                            title="Gửi"
                        >
                            <Send size={18} strokeWidth={2.5} style={{ marginLeft: '1px' }} />
                        </button>
                    </form>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AiChat;