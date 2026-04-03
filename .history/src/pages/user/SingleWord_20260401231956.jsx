import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Volume2, Heart, RefreshCw, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

const BACKEND_URL = 'http://127.0.0.1:5000'; 

function getUser() {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
}

const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    return path.startsWith('/') ? `${BACKEND_URL}${path}` : `${BACKEND_URL}/${path}`;
};

const playSound = (type) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'Mastered') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); 
            gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        } else {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(250, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15); 
            gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
        }
    } catch (error) { console.log(error); }
};

// COMPONENT FLASHCARD (Copy từ FlashcardStudy sang để nó chạy độc lập)
const Flashcard = ({ wordInfo, onUpdateProgress, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(wordInfo.IsFavorite);
    const [animating, setAnimating] = useState(null); 

    const playAudio = (e) => {
        e.stopPropagation(); window.speechSynthesis.cancel(); 
        const audioUrl = getFullUrl(wordInfo.AudioURL);
        const speakWithAI = () => {
            if (wordInfo.Word) {
                const utterance = new SpeechSynthesisUtterance(wordInfo.Word);
                utterance.lang = 'en-US'; window.speechSynthesis.speak(utterance);
            }
        };
        if (audioUrl) { const audio = new Audio(audioUrl); audio.play().catch(() => speakWithAI()); } 
        else { speakWithAI(); }
    };

    const handleActionClick = (status) => {
        if (animating) return; 
        playSound(status); setAnimating(status); 
        setTimeout(() => { onUpdateProgress(wordInfo, status); setAnimating(null); setIsFlipped(false); }, 400); 
    };

    const dynamicCardStyle = {
        ...fcStyles.cardContainer,
        transform: animating === 'Mastered' ? 'translateX(120px) rotate(10deg)' : animating === 'Learning' ? 'translateX(-120px) rotate(-10deg)' : 'translateX(0) rotate(0)',
        opacity: animating ? 0 : 1, transition: 'transform 0.4s ease-out, opacity 0.3s ease-out'
    };

    return (
        <div style={fcStyles.wrapper}>
            <div style={dynamicCardStyle} onClick={() => !animating && setIsFlipped(!isFlipped)}>
                <div style={{ ...fcStyles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                    <div style={{...fcStyles.cardFace, ...fcStyles.front}}>
                        <button onClick={(e) => {e.stopPropagation(); setIsFavorite(!isFavorite); onToggleFavorite(wordInfo.WordID);}} style={fcStyles.heartBtn}>
                            <Heart size={28} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#d1d5db"} />
                        </button>
                        <h2 style={fcStyles.wordText}>{wordInfo.Word}</h2>
                        <p style={fcStyles.ipaText}>/{wordInfo.IPA || 'IPA'}/</p>
                        <button onClick={playAudio} style={fcStyles.audioBtn}><Volume2 size={28} /></button>
                        <p style={fcStyles.flipHint}><RefreshCw size={14} /> Chạm để lật xem nghĩa</p>
                    </div>
                    <div style={{...fcStyles.cardFace, ...fcStyles.back}}>
                        {wordInfo.ImageURL && <img src={getFullUrl(wordInfo.ImageURL)} alt="" style={fcStyles.image} />}
                        <h3 style={fcStyles.meaningText}>{wordInfo.Meaning}</h3>
                        <div style={fcStyles.exampleBox}>
                            <p style={fcStyles.exampleText}>"{wordInfo.ExampleSentence || "..."}"</p>
                            <p style={{...fcStyles.exampleText, fontSize: '13px', color: '#666'}}>{wordInfo.Translation}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{...fcStyles.actionGroup, opacity: animating ? 0.5 : 1, pointerEvents: animating ? 'none' : 'auto'}}>
                <button onClick={() => handleActionClick('Learning')} style={{...fcStyles.btnFail, transform: animating === 'Learning' ? 'scale(0.95)' : 'scale(1)'}}><XCircle size={20} /> Đang học (X)</button>
                <button onClick={() => handleActionClick('Mastered')} style={{...fcStyles.btnPass, transform: animating === 'Mastered' ? 'scale(0.95)' : 'scale(1)'}}><CheckCircle size={20} /> Đã thuộc (V)</button>
            </div>
        </div>
    );
};

const SingleWord = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [searchParams] = useSearchParams();
    const wordId = searchParams.get('id');

    const [wordData, setWordData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !wordId) { navigate('/history'); return; }
        fetchWord();
    }, [wordId]);

    const fetchWord = async () => {
        try {
            const currentUserId = user?.UserID || user?.id;
            const res = await API.get('/user/history/word', { params: { user_id: currentUserId, word_id: wordId } });
            setWordData(res.data);
        } catch (error) { console.error("Lỗi lấy chi tiết từ:", error); }
        setLoading(false);
    };

    const handleUpdateProgress = async (wordObj, status) => {
        try {
            await API.post('/user/progress/update', { wordId: wordObj.WordID, status, user_id: user.UserID || user.id });
            // Cập nhật lại status trên màn hình
            setWordData(prev => ({...prev, Status: status}));
        } catch (error) { console.error("Lỗi:", error); }
    };

    const handleToggleFavorite = async (wId) => {
        API.post('/user/favorites/toggle', { wordId: wId, user_id: user.UserID || user.id });
    };

    return (
        <div style={styles.root}>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.studyTopBar}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}><ArrowLeft size={20} /> Quay lại lịch sử</button>
                    {wordData && (
                        <span style={{fontWeight: 'bold', color: wordData.Status === 'Mastered' ? '#16a34a' : '#ea580c'}}>
                            Trạng thái: {wordData.Status === 'Mastered' ? 'Đã thuộc' : wordData.Status === 'Learning' ? 'Đang học' : 'Mới'}
                        </span>
                    )}
                </div>

                {loading ? <div style={{textAlign: 'center', marginTop: 40, fontWeight: 'bold'}}>Đang tải thẻ lật...</div> : 
                 wordData ? (
                    <Flashcard wordInfo={wordData} onUpdateProgress={handleUpdateProgress} onToggleFavorite={handleToggleFavorite} />
                ) : (
                    <div style={{textAlign: 'center', color: 'red'}}>Lỗi: Không tìm thấy từ vựng này.</div>
                )}
            </div>
        </div>
    );
};

// --- STYLES ---
const fcStyles = {
    wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '384px', margin: '0 auto' },
    cardContainer: { width: '100%', height: '400px', cursor: 'pointer', perspective: '1000px' }, 
    cardInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    front: { backgroundColor: '#ffffff', border: '2px solid #bfdbfe' },
    back: { backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', transform: 'rotateY(180deg)' },
    heartBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' },
    wordText: { fontSize: '40px', fontWeight: 900, color: '#1f2937', margin: '0 0 8px', textAlign: 'center' },
    ipaText: { fontSize: '18px', color: '#9ca3af', fontStyle: 'italic', fontWeight: 500, margin: '0 0 24px' },
    audioBtn: { padding: '16px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
    flipHint: { marginTop: '32px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' },
    image: { width: '140px', height: '140px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    meaningText: { fontSize: '26px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 12px', textAlign: 'center' },
    exampleBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '12px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' },
    exampleText: { textAlign: 'center', color: '#374151', fontSize: '15px', fontStyle: 'italic', margin: 0, lineHeight: '1.5' },
    actionGroup: { display: 'flex', gap: '16px', marginTop: '24px', width: '100%', transition: 'opacity 0.3s' }, 
    btnFail: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#fff', color: '#ea580c', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #ffedd5', cursor: 'pointer', fontSize: '16px', transition: 'transform 0.1s' },
    btnPass: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)', transition: 'transform 0.1s' }
};

const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    studyTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
};

export default SingleWord;