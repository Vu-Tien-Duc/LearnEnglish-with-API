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
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;700&display=swap');

  .aic-root { background: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; }
  .aic-container { max-width: 900px; margin: 0 auto; width: 100%; padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 24px; }
  
  /* Header */
  .aic-header { background: #fff; border: 2px solid #e5e7eb; border-bottom: 4px solid #d1d5db; border-radius: 24px; padding: 20px; display: flex; align-items: center; justify-content: space-between; }
  .aic-header-left { display: flex; align-items: center; gap: 16px; }
  .aic-icon-box { width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(135deg, #58cc02, #46a302); display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .aic-header-title { font-size: 24px; font-weight: 900; color: #1f2937; margin: 0; }
  .aic-header-sub { color: #16a34a; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
  .aic-badge { background: #f0fdf4; color: #15803d; border: 2px solid #bbf7d0; padding: 8px 16px; border-radius: 16px; font-weight: 900; font-size: 14px; display: flex; align-items: center; gap: 6px; }
  
  /* Chat Area */
  .aic-chatbox { background: #fff; border: 2px solid #e5e7eb; border-radius: 24px; flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 500px; max-height: 65vh; }
  .aic-messages { flex: 1; overflow-y: auto; padding: 24px; background: #f9fafb; display: flex; flex-direction: column; gap: 24px; }
  
  .aic-msg-row { display: flex; gap: 12px; }
  .aic-msg-row.user { justify-content: flex-end; }
  .aic-msg-row.ai { justify-content: flex-start; }
  
  .aic-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; flex-shrink: 0; margin-top: 4px; }
  .aic-avatar.ai { background: #dcfce7; border: 2px solid #bbf7d0; }
  .aic-avatar.user { background: #1cb0f6; border-bottom: 2px solid #1899d6; color: #fff; }
  
  .aic-bubble-wrap { display: flex; flex-direction: column; gap: 8px; max-width: 80%; }
  .aic-bubble { padding: 16px 20px; border-radius: 20px; font-size: 15px; font-weight: 700; line-height: 1.6; }
  .aic-msg-row.user .aic-bubble { background: #1cb0f6; border-bottom: 3px solid #1899d6; color: #fff; border-top-right-radius: 4px; }
  .aic-msg-row.ai .aic-bubble { background: #fff; border: 2px solid #e5e7eb; border-bottom: 3px solid #d1d5db; color: #374151; border-top-left-radius: 4px; }
  
  /* Feedback */
  .aic-correction { background: #fffbeb; border: 2px solid #fde68a; border-bottom: 3px solid #fbbf24; padding: 16px; border-radius: 18px; font-size: 14px; }
  .aic-corr-title { font-weight: 900; color: #b45309; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .aic-corr-text { font-weight: 700; color: #78350f; line-height: 1.5; }
  
  .aic-better { margin-top: 12px; background: #f0fdf4; border: 2px solid #bbf7d0; padding: 12px; border-radius: 12px; font-weight: 700; color: #166534; font-size: 14px; }
  .aic-better-title { font-weight: 900; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  
  /* Input Form */
  .aic-input-area { background: #fff; padding: 16px; border-top: 2px solid #f3f4f6; display: flex; gap: 12px; align-items: center; }
  .aic-mic-btn { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; border: 2px solid #e2e8f0; background: #f1f5f9; color: #64748b; transition: all 0.2s; }
  .aic-mic-btn.listening { background: #fef2f2; color: #ef4444; border-color: #fecaca; animation: pulseMic 1.5s infinite; }
  
  .aic-input { flex: 1; background: #f3f4f6; border-radius: 16px; padding: 0 20px; height: 48px; font-size: 15px; font-weight: 700; color: #374151; border: 2px solid transparent; outline: none; transition: all 0.2s; font-family: 'Nunito', sans-serif; }
  .aic-input:focus { border-color: #58cc02; background: #fff; }
  
  .aic-send-btn { width: 56px; height: 48px; border-radius: 16px; background: #58cc02; border-bottom: 4px solid #46a302; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; border-top: none; border-left: none; border-right: none; transition: all 0.2s; }
  .aic-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .aic-send-btn:active:not(:disabled) { transform: translateY(2px); border-bottom-width: 2px; }
  
  @keyframes pulseMic { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
  .mascot-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: mascotDot 1.4s infinite; margin: 0 3px; }
  .mascot-dot:nth-child(2) { animation-delay: 0.2s; }
  .mascot-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes mascotDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
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
            setMessages(p => [...p, { sender: 'ai', text: "Oops! I'm having a little trouble thinking right now. Can you say that again?", correction: "Lỗi kết nối đến Server AI mới." }]);
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
                                <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                Sẵn sàng sửa lỗi & trò chuyện
                            </div>
                        </div>
                    </div>
                    <div className="aic-badge">
                        <Sparkles size={16} /> AI Powered
                    </div>
                </div>

                {/* Chat Area */}
                <div className="aic-chatbox">
                    
                    <div className="aic-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`aic-msg-row ${msg.sender}`}>
                                
                                {msg.sender === 'ai' && <div className="aic-avatar ai">🦜</div>}
                                
                                <div className="aic-bubble-wrap">
                                    <div className="aic-bubble">
                                        {msg.text}
                                    </div>
                                    
                                    {msg.sender === 'ai' && msg.correction && (
                                        <div className="aic-correction">
                                            <div className="aic-corr-title">
                                                <AlertCircle size={16} /> Giải thích lỗi:
                                            </div>
                                            <div className="aic-corr-text">{msg.correction}</div>
                                            
                                            {msg.better_version && (
                                                <div className="aic-better">
                                                    <div className="aic-better-title">
                                                        <CheckCircle2 size={16} /> Cách nói tự nhiên hơn:
                                                    </div>
                                                    <div>"{msg.better_version}"</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {msg.sender === 'user' && <div className="aic-avatar user">{username.charAt(0).toUpperCase()}</div>}
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="aic-msg-row ai">
                                <div className="aic-avatar ai">🦜</div>
                                <div className="aic-bubble" style={{ padding: '16px 20px' }}>
                                    <span className="mascot-dot" /><span className="mascot-dot" /><span className="mascot-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="aic-input-area">
                        <button type="button" onClick={toggleMic} className={`aic-mic-btn ${isListening ? 'listening' : ''}`}>
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                        
                        <input 
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)}
                            placeholder={isListening ? "🎙️ Đang nghe..." : "Gõ tiếng Anh vào đây nhé..."}
                            className="aic-input"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isLoading} 
                        />
                        
                        <button type="submit" disabled={isLoading || !input.trim()} className="aic-send-btn">
                            <Send size={22} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AiChat;