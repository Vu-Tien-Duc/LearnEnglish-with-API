import React, { useState, useEffect } from 'react';
import { Volume2, Heart, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const Flashcard = ({ wordInfo, onUpdateProgress, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
        setIsFavorite(wordInfo.IsFavorite || false); 
    }, [wordInfo]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // [ĐÃ SỬA LỖI TRIỆT ĐỂ]: Logic bọc lót 2 lớp cho Âm thanh
    const playAudio = (e) => {
        e.stopPropagation(); // Ngăn lật thẻ khi bấm loa
        window.speechSynthesis.cancel(); // Reset lại bộ nhớ đệm AI để chống kẹt giọng

        // Hàm dự phòng: Trình duyệt tự đọc (Text-to-Speech)
        const speakWithAI = () => {
            if (wordInfo.Word) {
                const utterance = new SpeechSynthesisUtterance(wordInfo.Word);
                utterance.lang = 'en-US'; // Chuẩn giọng Mỹ
                utterance.rate = 0.9; // Tốc độ vừa phải
                window.speechSynthesis.speak(utterance);
            }
        };

        // 1. Nếu có link âm thanh từ Database
        if (wordInfo.AudioURL && wordInfo.AudioURL.startsWith('http')) {
            const audio = new Audio(wordInfo.AudioURL);
            
            // Lệnh play() trả về một Promise. Ta phải dùng .catch() để bắt lỗi nếu Cambridge chặn.
            audio.play().catch((error) => {
                console.warn("⚠️ Link mp3 bị chặn hoặc lỗi. Đang tự động chuyển sang giọng AI...", error);
                speakWithAI(); // Gọi hàm đọc AI thay thế ngay lập tức!
            });
        } 
        // 2. Nếu Database hoàn toàn trống link âm thanh
        else {
            speakWithAI();
        }
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        const nextState = !isFavorite;
        setIsFavorite(nextState);
        if (onToggleFavorite) onToggleFavorite(wordInfo.WordID);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto">
            {/* Thẻ 3D */}
            <div 
                className="w-full h-80 cursor-pointer perspective-1000" 
                onClick={handleFlip}
            >
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* MẶT TRƯỚC */}
                    <div className="absolute w-full h-full bg-white border-2 border-blue-200 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 backface-hidden">
                        <button 
                            onClick={handleFavorite} 
                            className="absolute top-4 right-4 transition-transform hover:scale-125"
                        >
                            <Heart 
                                size={28} 
                                fill={isFavorite ? "#ef4444" : "none"} 
                                className={isFavorite ? "text-red-500" : "text-gray-300"} 
                            />
                        </button>
                        
                        <h2 className="text-4xl font-black text-gray-800 mb-2">{wordInfo.Word}</h2>
                        <p className="text-gray-400 font-medium italic mb-6">/{wordInfo.IPA || 'IPA'}/</p>
                        
                        <button 
                            onClick={playAudio} 
                            className="p-4 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 shadow-sm transition"
                        >
                            <Volume2 size={28} />
                        </button>
                        <p className="mt-8 text-xs text-gray-400 flex items-center gap-1">
                            <RefreshCw size={12} /> Chạm để lật xem nghĩa
                        </p>
                    </div>

                    {/* MẶT SAU */}
                    <div className="absolute w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 backface-hidden rotate-y-180">
                        {wordInfo.ImageURL && (
                            <img 
                                src={wordInfo.ImageURL} 
                                alt={wordInfo.Word} 
                                className="w-28 h-28 object-cover rounded-2xl mb-4 shadow-md border-2 border-white" 
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        <h3 className="text-3xl font-bold text-blue-800">{wordInfo.Meaning}</h3>
                        <p className="text-center text-gray-600 mt-4 px-4 italic">
                           {wordInfo.Example || "Keep going, you're doing great!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nút hành động */}
            <div className={`flex gap-4 mt-8 w-full transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button 
                    onClick={() => onUpdateProgress(wordInfo.WordID, 'Learning')}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-orange-600 font-bold rounded-xl border-2 border-orange-100 hover:bg-orange-50 transition shadow-sm"
                >
                    <XCircle size={20} /> Chưa thuộc
                </button>
                <button 
                    onClick={() => onUpdateProgress(wordInfo.WordID, 'Mastered')}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md"
                >
                    <CheckCircle size={20} /> Đã thuộc
                </button>
            </div>
        </div>
    );
};

export default Flashcard;