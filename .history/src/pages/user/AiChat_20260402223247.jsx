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

const AiChat = () => {
    const navigate = useNavigate();
    const user = getUser();
    const username = user?.Username || user?.username || "You";

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{
        sender: 'ai',
        text: "Hello there! Mình là EngBot 🦜 Bạn có thể gõ phím hoặc dùng micro để trò chuyện tiếng Anh với mình nhé!",
        correction: null,
        better_version: null
    }]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // Thêm State quản lý Focus của Form
    
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    // Bảo vệ route
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => { 
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [messages, isLoading]);

    // Khởi tạo Speech Recognition (Mic)
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
        e.preventDefault(); // CHẶN reload trang khi submit form
        if (!input.trim()) return;
        
        const msg = input.trim();
        setMessages(p => [...p, { sender: 'user', text: msg }]);
        setInput(''); 
        setIsLoading(true);
        
        try {
            // ĐÃ SỬA PORT THÀNH 5000 ĐỂ KHỚP VỚI FLASK
            const { data } = await axios.post('http://localhost:5000/api/ai/chat', { message: msg });
            setMessages(p => [...p, { 
                sender: 'ai', 
                text: data.reply, 
                correction: data.correction, 
                better_version: data.better_version 
            }]);
        } catch {
            setMessages(p => [...p, { sender: 'ai', text: "Oops! Kết nối đang gặp sự cố 😥 Thử lại sau nhé!" }]);
        } finally { 
            setIsLoading(false); 
        }
    };

    if (!user) return null;

    return (
        <div style={{ fontFamily: "'Nunito', 'DM Sans', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* CSS Animations */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
                @keyframes mascotDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
                .mascot-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #afafaf; animation: mascotDot 1.4s infinite; }
                .mascot-dot:nth-child(2) { animation-delay: 0.2s; }
                .mascot-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes pulseMic {
                    0% { box-shadow: 0 0 0 0 rgba(255, 75, 75, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 75, 75, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 75, 75, 0); }
                }
            `}</style>

            <div className="flex flex-col max-w-4xl mx-auto w-full p-6 gap-6 flex-1">
                
                {/* Header Style Duolingo */}
                <div className="bg-white rounded-[24px] p-5 flex items-center justify-between"
                    style={{ border: '2px solid #e5e7eb', borderBottom: '4px solid #d1d5db' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[18px] flex items-center justify-center text-3xl"
                            style={{ background: 'linear-gradient(135deg, #58cc02, #46a302)' }}>🦜</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800">EngBot Teacher</h2>
                            <div className="text-green-600 text-sm font-bold flex items-center gap-1.5 mt-1">
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                                Sẵn sàng sửa lỗi & trò chuyện
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-2xl"
                        style={{ background: '#f0fdf4', color: '#15803d', border: '2px solid #bbf7d0' }}>
                        <Sparkles size={16} /> AI Powered
                    </div>
                </div>

                {/* Chat Area */}
                <div className="bg-white rounded-[24px] flex-1 flex flex-col overflow-hidden"
                    style={{ border: '2px solid #e5e7eb', minHeight: '500px', maxHeight: '65vh' }}>
                    
                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                                
                                {msg.sender === 'ai' && (
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shrink-0 mt-1"
                                        style={{ border: '2px solid #bbf7d0' }}>🦜</div>
                                )}
                                
                                <div className={`flex flex-col gap-2 max-w-[85%]`}>
                                    <div className={`px-5 py-3.5 rounded-[20px] font-bold text-[15px] leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'text-white rounded-tr-sm'
                                            : 'text-gray-700 rounded-tl-sm'
                                    }`} style={msg.sender === 'user'
                                        ? { background: '#1cb0f6', borderBottom: '3px solid #1899d6' }
                                        : { background: '#ffffff', border: '2px solid #e5e7eb', borderBottom: '3px solid #d1d5db' }}>
                                        {msg.text}
                                    </div>
                                    
                                    {/* Khối giải thích ngữ pháp */}
                                    {msg.sender === 'ai' && msg.correction && (
                                        <div className="p-4 rounded-[18px] text-sm mt-1" 
                                             style={{ background: '#fffbeb', border: '2px solid #fde68a', borderBottom: '3px solid #fbbf24' }}>
                                            <p className="font-black text-amber-700 mb-1.5 flex items-center gap-1.5">
                                                <AlertCircle size={16} /> Giải thích lỗi:
                                            </p>
                                            <p className="font-bold text-amber-900 leading-relaxed">{msg.correction}</p>
                                            
                                            {/* Khối gợi ý câu mượt hơn */}
                                            {msg.better_version && (
                                                <div className="mt-3 p-3 rounded-xl font-bold text-green-800 text-sm"
                                                    style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                                                    <span className="font-black text-green-700 flex items-center gap-1.5 mb-1">
                                                        <CheckCircle2 size={16} /> Cách nói tự nhiên hơn:
                                                    </span>
                                                    <span className="italic">"{msg.better_version}"</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {msg.sender === 'user' && (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 font-black text-sm text-white"
                                        style={{ background: '#1cb0f6', borderBottom: '2px solid #1899d6' }}>
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shrink-0"
                                     style={{ border: '2px solid #bbf7d0' }}>🦜</div>
                                <div className="bg-white border-2 border-gray-200 px-5 py-4 rounded-[20px] rounded-tl-sm flex gap-1.5 items-center" 
                                     style={{ borderBottom: '3px solid #d1d5db' }}>
                                    <span className="mascot-dot" /><span className="mascot-dot" /><span className="mascot-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area CHUẨN REACT */}
                    <form onSubmit={handleSend} className="bg-white p-4 flex gap-3 items-center border-t-2 border-gray-100">
                        <button type="button" onClick={toggleMic}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0"
                            style={isListening
                                ? { background: '#fff1f0', color: '#ff4b4b', border: '2px solid #ffd6d3', animation: 'pulseMic 1.5s infinite' }
                                : { background: '#f1f5f9', color: '#64748b', border: '2px solid #e2e8f0' }}>
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                        
                        {/* Đã sửa onFocus / onBlur sử dụng State */}
                        <input 
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)}
                            placeholder={isListening ? "🎙️ Đang nghe..." : "Gõ tiếng Anh vào đây nhé..."}
                            className="flex-1 bg-gray-100 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none text-[15px] transition-all"
                            style={{ border: `2px solid ${isFocused ? '#58cc02' : 'transparent'}` }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isLoading} 
                        />
                        
                        <button type="submit" disabled={isLoading || !input.trim()}
                            className="w-14 h-14 rounded-2xl text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
                            style={{ background: '#58cc02', borderBottom: '4px solid #46a302' }}>
                            <Send size={22} strokeWidth={2.5} style={{ marginLeft: '4px' }} />
                        </button>
                    </form>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AiChat;