// src/pages/AiChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Mic, MicOff } from 'lucide-react';
import axios from 'axios';

const AiChat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{
        sender: 'ai',
        text: "Hello there! I'm your English teacher 🦜 You can type or use the microphone to speak with me! How can I help you today?",
        correction: null
    }]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            recognitionRef.current = new SR();
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleMic = () => {
        if (!recognitionRef.current) { alert("Trình duyệt không hỗ trợ. Dùng Chrome/Edge nhé!"); return; }
        if (isListening) { recognitionRef.current.stop(); } else { setInput(''); recognitionRef.current.start(); setIsListening(true); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input.trim();
        setMessages(p => [...p, { sender: 'user', text: msg }]);
        setInput(''); setIsLoading(true);
        try {
            const { data } = await axios.post('http://localhost:8000/api/ai/chat', { message: msg });
            setMessages(p => [...p, { sender: 'ai', text: data.reply, correction: data.correction, better_version: data.better_version }]);
        } catch {
            setMessages(p => [...p, { sender: 'ai', text: "Oops! I'm having trouble connecting to the server." }]);
        } finally { setIsLoading(false); }
    };

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif" }} className="flex flex-col max-w-4xl mx-auto w-full p-5 gap-4"
            style2={{ height: 'calc(100vh - 80px)' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
                @keyframes typingDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
                .typing-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#afafaf;animation:typingDot 1.4s infinite}
                .typing-dot:nth-child(2){animation-delay:0.2s}.typing-dot:nth-child(3){animation-delay:0.4s}
            `}</style>
{/* Header */}
            <div className="bg-white rounded-3xl p-5 flex items-center gap-4"
                style={{ border: '2px solid #e5e7eb', borderBottom: '4px solid #e0e0e0' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: 'linear-gradient(135deg, #ce82ff, #a855f7)' }}>🦜</div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">Luyện giao tiếp AI</h2>
                    <p className="text-sm font-bold text-gray-400">AI sẽ sửa lỗi ngữ pháp và gợi ý cách nói tự nhiên hơn!</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl"
                    style={{ background: '#f3e8ff', color: '#a855f7', border: '2px solid #dbb8ff' }}>
                    <Sparkles size={13} /> AI đang hoạt động
                </div>
            </div>

            {/* Chat area */}
            <div className="bg-white rounded-3xl flex-1 overflow-y-auto p-5 space-y-4"
                style={{ border: '2px solid #e5e7eb', minHeight: 400, maxHeight: 'calc(100vh - 280px)' }}>
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                        {msg.sender === 'ai' && (
                            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 mt-1"
                                style={{ background: 'linear-gradient(135deg, #ce82ff, #a855f7)' }}>🦜</div>
                        )}
                        <div className={`flex flex-col gap-2 max-w-[80%]`}>
                            <div className={`p-4 rounded-2xl font-bold text-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'text-white rounded-tr-sm'
                                    : 'text-gray-800 rounded-tl-sm'
                            }`} style={msg.sender === 'user'
                                ? { background: '#1cb0f6', borderRadius: '18px 4px 18px 18px' }
                                : { background: '#f7f8fa', border: '2px solid #e5e7eb', borderBottom: '3px solid #d1d5db', borderRadius: '4px 18px 18px 18px' }}>
                                {msg.text}
                            </div>
                            {msg.sender === 'ai' && msg.correction && (
                                <div className="p-4 rounded-2xl text-sm" style={{ background: '#fffbeb', border: '2px solid #fde68a', borderBottom: '3px solid #fbbf24' }}>
                                    <p className="font-black text-amber-700 mb-1.5 flex items-center gap-1.5">💡 Giải thích lỗi</p>
                                    <p className="font-bold text-amber-800">{msg.correction}</p>
                                    {msg.better_version && (
<div className="mt-2.5 p-3 rounded-xl font-bold text-green-800 text-sm italic"
                                            style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                                            <span className="font-black not-italic text-green-700">Tự nhiên hơn: </span>
                                            "{msg.better_version}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {msg.sender === 'user' && (
                            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-1 font-black text-sm text-white"
                                style={{ background: '#1cb0f6' }}>
                                <User size={18} />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #ce82ff, #a855f7)' }}>🦜</div>
                        <div className="p-4 rounded-2xl flex gap-1.5 items-center" style={{ background: '#f7f8fa', border: '2px solid #e5e7eb', borderBottom: '3px solid #d1d5db' }}>
                            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="bg-white rounded-3xl p-3 flex gap-2 items-center"
                style={{ border: '2px solid #e5e7eb', borderBottom: '4px solid #e0e0e0' }}>
                <button type="button" onClick={toggleMic}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0"
                    style={isListening
                        ? { background: '#fff1f0', color: '#ff4b4b', border: '2px solid #ffd6d3', animation: 'pulse 1s infinite' }
                        : { background: '#f3e8ff', color: '#a855f7', border: '2px solid #dbb8ff' }}>
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    placeholder={isListening ? "🎙️ Đang nghe..." : "Type in English..."}
                    className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none text-sm transition-all"
                    style={{ border: '2px solid #e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = '#ce82ff'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
disabled={isLoading} />
                <button type="submit" disabled={isLoading || !input.trim()}
                    className="w-12 h-12 rounded-2xl text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
                    style={{ background: '#ce82ff', borderBottom: '3px solid #a855f7' }}>
                    <Send size={20} strokeWidth={2.5} />
                </button>
            </form>
        </div>
    );
};

export default AiChat;