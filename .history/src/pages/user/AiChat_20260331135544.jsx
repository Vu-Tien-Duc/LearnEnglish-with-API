// src/pages/user/AiChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Mic, MicOff } from 'lucide-react';
import API from '../../services/api';

const AiChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: "Hello! I'm your English teacher. Type or speak to practice. How can I help you today?",
    correction: null
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) { alert('Trình duyệt không hỗ trợ mic. Dùng Chrome nhé!'); return; }
    if (isListening) { recognitionRef.current.stop(); }
    else { setInput(''); recognitionRef.current.start(); setIsListening(true); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);
    try {
      // AI chat route ở /api/ai/chat — bạn cần tạo route này riêng trong Flask
      const res = await API.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: res.data.reply,
        correction: res.data.correction,
        better_version: res.data.better_version
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops! I'm having trouble connecting to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full h-[calc(100vh-80px)] bg-slate-50">
      <div className="bg-white rounded-t-3xl shadow-sm border border-gray-100 flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 text-purple-600 rounded-full mb-3">
            <Sparkles size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Luyện giao tiếp AI</h2>
          <p className="text-gray-500">Nói hoặc nhắn tin — AI sẽ sửa lỗi ngữ pháp cho bạn!</p>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="flex flex-col gap-2">
                <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                  {msg.text}
                </div>
                {msg.sender === 'ai' && msg.correction && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm">
                    <p className="font-bold text-amber-700 mb-1">💡 Giải thích lỗi:</p>
                    <p>{msg.correction}</p>
                    {msg.better_version && (
                      <p className="mt-2 p-2 bg-white rounded border border-amber-100 italic">
                        <span className="font-bold text-green-700">Cách nói tự nhiên hơn:</span> "{msg.better_version}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 animate-pulse">
            <Bot size={20} />
            <span className="italic text-sm">AI Teacher is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-white p-4 rounded-b-3xl shadow-md border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <button type="button" onClick={toggleMic}
            className={`p-4 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}>
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Type your message in English...'}
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-lg rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            disabled={isLoading} />
          <button type="submit" disabled={isLoading || !input.trim()}
            className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition disabled:opacity-50 shadow-lg">
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChat;