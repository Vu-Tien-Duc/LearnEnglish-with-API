import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Volume2, RefreshCw, CheckCircle, XCircle, X } from 'lucide-react';
import API from '../../services/api';
import Navbar, { Footer } from '../../components/Navbar';

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

// ==========================================
// COMPONENT: FLASHCARD BÊN TRONG MODAL
// ==========================================
const Flashcard = ({ wordInfo, onUpdateProgress, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [animating, setAnimating] = useState(null); 

    useEffect(() => {
        setIsFlipped(false);
        setAnimating(null);
    }, [wordInfo]);

    const playAudio = (e) => {
        e.stopPropagation(); window.speechSynthesis.cancel(); 
        const audioUrl = getFullUrl(wordInfo.AudioURL || wordInfo.audioUrl);
        const speakWithAI = () => {
            const textToSpeak = wordInfo.Word || wordInfo.word;
            if (textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US'; utterance.rate = 0.9; 
                window.speechSynthesis.speak(utterance);
            }
        };
        if (audioUrl) { const audio = new Audio(audioUrl); audio.play().catch(() => speakWithAI()); } 
        else { speakWithAI(); }
    };

    const handleActionClick = (status) => {
        if (animating) return; 
        playSound(status); setAnimating(status); 
        setTimeout(() => { onUpdateProgress(wordInfo, status); }, 400); 
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
                        <button onClick={(e) => {e.stopPropagation(); onToggleFavorite(wordInfo.WordID);}} style={fcStyles.heartBtn}>
                            <Heart size={28} fill={wordInfo.IsFavorite ? "#ef4444" : "none"} color={wordInfo.IsFavorite ? "#ef4444" : "#d1d5db"} />
                        </button>
                        <h2 style={fcStyles.wordText}>{wordInfo.Word || wordInfo.word}</h2>
                        <p style={fcStyles.ipaText}>/{wordInfo.IPA || wordInfo.ipa || 'IPA'}/</p>
                        <button onClick={playAudio} style={fcStyles.audioBtn}><Volume2 size={28} /></button>
                        <p style={fcStyles.flipHint}><RefreshCw size={14} /> Chạm để lật xem nghĩa</p>
                    </div>
                    <div style={{...fcStyles.cardFace, ...fcStyles.back}}>
                        {(wordInfo.ImageURL || wordInfo.imageUrl) && <img src={getFullUrl(wordInfo.ImageURL || wordInfo.imageUrl)} alt="" style={fcStyles.image} onError={(e) => { e.target.style.display = 'none'; }} />}
                        <h3 style={fcStyles.meaningText}>{wordInfo.Meaning || wordInfo.meaning}</h3>
                        <div style={fcStyles.exampleBox}>
                            <p style={fcStyles.exampleText}>"{wordInfo.ExampleSentence || wordInfo.Example || "..."}"</p>
                            <p style={{...fcStyles.exampleText, fontSize: '13px', color: '#666'}}>{wordInfo.Translation}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{...fcStyles.actionGroup, opacity: animating ? 0.5 : 1, pointerEvents: animating ? 'none' : 'auto'}}>
                <button onClick={() => handleActionClick('Learning')} style={{...fcStyles.btnFail, transform: animating === 'Learning' ? 'scale(0.95)' : 'scale(1)'}}><XCircle size={20} /> Đang học</button>
                <button onClick={() => handleActionClick('Mastered')} style={{...fcStyles.btnPass, transform: animating === 'Mastered' ? 'scale(0.95)' : 'scale(1)'}}><CheckCircle size={20} /> Đã thuộc</button>
            </div>
        </div>
    );
};

// ==========================================
// COMPONENT CHÍNH: FAVORITES
// ==========================================
const Favorites = () => {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user?.UserID || user?.id || user?.userId;
    
    const [favoritesList, setFavoritesList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }
        
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const response = await API.get('/user/favorites', { params: { user_id: userId } });
                setFavoritesList(response.data);
            } catch (error) { console.error("Lỗi tải danh sách yêu thích:", error); }
            finally { setLoading(false); }
        };
        fetchFavorites();
    }, [navigate, userId]);

    // Mở chi tiết Flashcard (Tái sử dụng API history/word vì nó trả về full data của 1 từ)
    const handleRowClick = async (wordId) => {
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await API.get('/user/history/word', { params: { user_id: userId, word_id: wordId } });
            setSelectedWord(res.data);
        } catch (error) { console.error("Lỗi lấy chi tiết từ:", error); setIsModalOpen(false); }
        finally { setModalLoading(false); }
    };

    const handleUpdateProgress = async (wordObj, status) => {
        const wordId = wordObj.WordID || wordObj.wordId;
        try {
            await API.post('/user/progress/update', { wordId, status, user_id: userId });
            setFavoritesList(prev => prev.map(item => item.WordID === wordId ? { ...item, Status: status } : item));
        } catch (error) { console.error("Lỗi cập nhật tiến độ:", error); }
        
        setTimeout(() => {
            handleCloseModal();
        }, 300);
    };

    const handleToggleFavorite = async (wordId) => {
        try {
            const res = await API.post('/user/favorites/toggle', { wordId, user_id: userId });
            const isFavNow = res.data.isFavorite;
            // Cập nhật state ở thẻ đang hiển thị
            setSelectedWord(prev => ({ ...prev, IsFavorite: isFavNow }));
        } catch (error) { console.error("Lỗi thả tim:", error); }
    };

    // Đóng Modal và loại bỏ các từ đã bị bỏ tim khỏi danh sách
    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (selectedWord && !selectedWord.IsFavorite) {
            setFavoritesList(prev => prev.filter(w => w.WordID !== selectedWord.WordID));
        }
        setTimeout(() => setSelectedWord(null), 300);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'Mastered': return <span style={{...styles.badge, ...styles.badgeMastered}}>Đã thuộc</span>;
            case 'Learning': return <span style={{...styles.badge, ...styles.badgeLearning}}>Đang học</span>;
            default: return <span style={{...styles.badge, ...styles.badgeNew}}>Mới</span>;
        }
    };

    return (
        <div style={styles.root}>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.iconBox}><Heart size={32} color="#ec4899" fill="#fce7f3" /></div>
                    <div>
                        <h1 style={styles.title}>Từ vựng yêu thích</h1>
                        <p style={styles.subtitle}>Danh sách những từ vựng bạn đã lưu lại để ôn tập.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loading}>Đang tải danh sách...</div>
                ) : favoritesList.length === 0 ? (
                    <div style={styles.empty}>Bạn chưa yêu thích từ vựng nào. Hãy thả tim ở các bài học nhé! ❤️</div>
                ) : (
                    <div style={styles.listContainer}>
                        {favoritesList.map((item, index) => (
                            <div key={item.WordID || index} style={styles.listItem} onClick={() => handleRowClick(item.WordID)}>
                                <div style={styles.itemLeft}>
                                    <div style={styles.wordAvatar}>
                                        {item.ImageURL ? <img src={getFullUrl(item.ImageURL)} alt="" style={styles.avatarImg} /> : <span>{item.Word.charAt(0)}</span>}
                                    </div>
                                    <div>
                                        <h3 style={styles.wordTitle}>{item.Word}</h3>
                                        <p style={styles.wordMeaning}>{item.Meaning}</p>
                                    </div>
                                </div>
                                <div style={styles.itemRight}>
                                    <div style={styles.infoCol}>
                                        <span style={styles.infoLabel}>Trạng thái</span>
                                        {renderStatusBadge(item.Status)}
                                    </div>
                                    <div style={styles.infoCol}>
                                        <Heart size={20} fill="#ef4444" color="#ef4444" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL FLASHCARD */}
            {isModalOpen && (
                <div style={modalStyles.overlay} onClick={handleCloseModal}>
                    <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                        <button style={modalStyles.closeBtn} onClick={handleCloseModal}>
                            <X size={24} />
                        </button>
                        <h2 style={modalStyles.modalTitle}>Ôn tập từ vựng</h2>
                        {modalLoading ? (
                            <div style={{textAlign: 'center', padding: '40px 0', color: '#ec4899', fontWeight: 'bold'}}>Đang tải thẻ...</div>
                        ) : selectedWord ? (
                            <Flashcard 
                                wordInfo={selectedWord} 
                                onUpdateProgress={handleUpdateProgress} 
                                onToggleFavorite={handleToggleFavorite} 
                            />
                        ) : (
                            <div style={{textAlign: 'center', color: 'red'}}>Lỗi tải từ vựng.</div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

// ==========================================
// STYLES
// ==========================================
const fcStyles = {
    wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '384px', margin: '0 auto' },
    cardContainer: { width: '100%', height: '350px', cursor: 'pointer', perspective: '1000px' }, 
    cardInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    front: { backgroundColor: '#ffffff', border: '2px solid #bfdbfe' },
    back: { backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', transform: 'rotateY(180deg)' },
    heartBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' },
    wordText: { fontSize: '40px', fontWeight: 900, color: '#1f2937', margin: '0 0 8px', textAlign: 'center' },
    ipaText: { fontSize: '18px', color: '#9ca3af', fontStyle: 'italic', fontWeight: 500, margin: '0 0 24px' },
    audioBtn: { padding: '16px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
    flipHint: { marginTop: '20px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' },
    image: { width: '110px', height: '110px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    meaningText: { fontSize: '24px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 12px', textAlign: 'center' },
    exampleBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '10px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' },
    exampleText: { textAlign: 'center', color: '#374151', fontSize: '14px', fontStyle: 'italic', margin: 0, lineHeight: '1.4' },
    actionGroup: { display: 'flex', gap: '16px', marginTop: '24px', width: '100%', transition: 'opacity 0.3s' }, 
    btnFail: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#fff', color: '#ea580c', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #ffedd5', cursor: 'pointer', fontSize: '16px', transition: 'transform 0.1s' },
    btnPass: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)', transition: 'transform 0.1s' }
};

const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px 20px' },
    header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' },
    iconBox: { backgroundColor: '#fce7f3', padding: '16px', borderRadius: '20px' },
    title: { fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
    subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
    loading: { textAlign: 'center', color: '#ec4899', fontWeight: 'bold', marginTop: '40px' },
    empty: { textAlign: 'center', color: '#6b7280', marginTop: '40px', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s', flexWrap: 'wrap', gap: '16px' },
    itemLeft: { display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' },
    wordAvatar: { width: '48px', height: '48px', backgroundColor: '#fdf2f8', color: '#ec4899', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    wordTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px' },
    wordMeaning: { fontSize: '14px', color: '#6b7280', margin: 0 },
    itemRight: { display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' },
    infoCol: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' },
    infoLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', textAlign: 'center' },
    badgeMastered: { backgroundColor: '#dcfce7', color: '#166534' },
    badgeLearning: { backgroundColor: '#fef3c7', color: '#d97706' },
    badgeNew: { backgroundColor: '#f3f4f6', color: '#4b5563' }
};

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    content: { backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' },
    modalTitle: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 24px', textAlign: 'center' }
};

export default Favorites;