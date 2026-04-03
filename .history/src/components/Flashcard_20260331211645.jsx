import { useState, useEffect } from 'react';
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

    // Logic bọc lót 2 lớp cho Âm thanh (Của bạn viết rất hay, giữ nguyên)
    const playAudio = (e) => {
        e.stopPropagation(); 
        window.speechSynthesis.cancel(); 

        const speakWithAI = () => {
            if (wordInfo.Word) {
                const utterance = new SpeechSynthesisUtterance(wordInfo.Word);
                utterance.lang = 'en-US'; 
                utterance.rate = 0.9; 
                window.speechSynthesis.speak(utterance);
            }
        };

        if (wordInfo.AudioURL && wordInfo.AudioURL.startsWith('http')) {
            const audio = new Audio(wordInfo.AudioURL);
            audio.play().catch((error) => {
                console.warn("⚠️ Link mp3 bị chặn hoặc lỗi. Đang tự động chuyển sang giọng AI...", error);
                speakWithAI(); 
            });
        } 
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
        <div style={fcStyles.wrapper}>
            {/* Thẻ 3D */}
            <div style={fcStyles.cardContainer} onClick={handleFlip}>
                <div style={{ ...fcStyles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                    
                    {/* MẶT TRƯỚC */}
                    <div style={{...fcStyles.cardFace, ...fcStyles.front}}>
                        <button onClick={handleFavorite} style={fcStyles.heartBtn}>
                            <Heart 
                                size={28} 
                                fill={isFavorite ? "#ef4444" : "none"} 
                                color={isFavorite ? "#ef4444" : "#d1d5db"} 
                            />
                        </button>
                        
                        <h2 style={fcStyles.wordText}>{wordInfo.Word}</h2>
                        <p style={fcStyles.ipaText}>/{wordInfo.IPA || 'IPA'}/</p>
                        
                        <button onClick={playAudio} style={fcStyles.audioBtn}>
                            <Volume2 size={28} />
                        </button>
                        <p style={fcStyles.flipHint}>
                            <RefreshCw size={14} /> Chạm để lật xem nghĩa
                        </p>
                    </div>

                    {/* MẶT SAU */}
                    <div style={{...fcStyles.cardFace, ...fcStyles.back}}>
                        {wordInfo.ImageURL && (
                            <img 
                                src={wordInfo.ImageURL} 
                                alt={wordInfo.Word} 
                                style={fcStyles.image} 
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        <h3 style={fcStyles.meaningText}>{wordInfo.Meaning}</h3>
                        <p style={fcStyles.exampleText}>
                           {wordInfo.Example || "Keep going, you're doing great!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nút hành động (Chỉ hiện khi thẻ đã lật) */}
            <div style={{
                ...fcStyles.actionGroup, 
                opacity: isFlipped ? 1 : 0, 
                transform: isFlipped ? 'translateY(0)' : 'translateY(16px)',
                pointerEvents: isFlipped ? 'auto' : 'none'
            }}>
                <button onClick={() => onUpdateProgress(wordInfo.WordID, 'Learning')} style={fcStyles.btnFail}>
                    <XCircle size={20} /> Chưa thuộc
                </button>
                <button onClick={() => onUpdateProgress(wordInfo.WordID, 'Mastered')} style={fcStyles.btnPass}>
                    <CheckCircle size={20} /> Đã thuộc
                </button>
            </div>
        </div>
    );
};

const fcStyles = {
    wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '384px', margin: '0 auto' },
    cardContainer: { width: '100%', height: '320px', cursor: 'pointer', perspective: '1000px' },
    cardInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    
    front: { backgroundColor: '#ffffff', border: '2px solid #bfdbfe' },
    back: { backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', transform: 'rotateY(180deg)' },
    
    heartBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' },
    wordText: { fontSize: '40px', fontWeight: 900, color: '#1f2937', margin: '0 0 8px' },
    ipaText: { fontSize: '18px', color: '#9ca3af', fontStyle: 'italic', fontWeight: 500, margin: '0 0 24px' },
    audioBtn: { padding: '16px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flipHint: { marginTop: '32px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' },
    
    image: { width: '112px', height: '112px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px', border: '3px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    meaningText: { fontSize: '30px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 16px', textAlign: 'center' },
    exampleText: { textAlign: 'center', color: '#4b5563', padding: '0 16px', fontStyle: 'italic', margin: 0 },
    
    actionGroup: { display: 'flex', gap: '16px', marginTop: '32px', width: '100%', transition: 'all 0.5s ease' },
    btnFail: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#fff', color: '#ea580c', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #ffedd5', cursor: 'pointer', fontSize: '16px' },
    btnPass: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }
};

export default Flashcard;