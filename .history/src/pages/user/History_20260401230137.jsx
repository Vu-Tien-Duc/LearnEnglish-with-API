import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Volume2, Heart, RefreshCw, X } from 'lucide-react';
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

// ==========================================
// COMPONENT: MINI FLASHCARD (HIỂN THỊ DẠNG MODAL POPUP)
// ==========================================
const MiniFlashcardModal = ({ wordInfo, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!wordInfo) return null;

    const playAudio = (e) => {
        e.stopPropagation(); 
        window.speechSynthesis.cancel(); 
        
        const audioUrl = getFullUrl(wordInfo.AudioURL);
        const speakWithAI = () => {
            const textToSpeak = wordInfo.Word;
            if (textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US'; 
                window.speechSynthesis.speak(utterance);
            }
        };

        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => speakWithAI());
        } else {
            speakWithAI();
        }
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                
                {/* Nút đóng Modal */}
                <button style={modalStyles.closeBtn} onClick={onClose}><X size={24} /></button>
                
                <h3 style={modalStyles.modalTitle}>Ôn tập nhanh</h3>

                {/* Thẻ Flashcard */}
                <div style={modalStyles.cardContainer} onClick={() => setIsFlipped(!isFlipped)}>
                    <div style={{ ...modalStyles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                        
                        {/* MẶT TRƯỚC */}
                        <div style={{...modalStyles.cardFace, ...modalStyles.front}}>
                            <Heart size={24} fill={wordInfo.IsFavorite ? "#ef4444" : "none"} color={wordInfo.IsFavorite ? "#ef4444" : "#d1d5db"} style={{position: 'absolute', top: 16, right: 16}} />
                            <h2 style={modalStyles.wordText}>{wordInfo.Word}</h2>
                            <p style={modalStyles.ipaText}>/{wordInfo.IPA || 'IPA'}/</p>
                            <button onClick={playAudio} style={modalStyles.audioBtn}>
                                <Volume2 size={24} />
                            </button>
                            <p style={modalStyles.flipHint}><RefreshCw size={14} /> Chạm để lật xem nghĩa</p>
                        </div>

                        {/* MẶT SAU */}
                        <div style={{...modalStyles.cardFace, ...modalStyles.back}}>
                            {(wordInfo.ImageURL) && (
                                <img src={getFullUrl(wordInfo.ImageURL)} alt={wordInfo.Word} style={modalStyles.image} onError={(e) => { e.target.style.display = 'none'; }} />
                            )}
                            <h3 style={modalStyles.meaningText}>{wordInfo.Meaning}</h3>
                            <div style={modalStyles.exampleBox}>
                                <p style={modalStyles.exampleText}>"{wordInfo.ExampleSentence || "..."}"</p>
                                <p style={{...modalStyles.exampleText, fontSize: '13px', color: '#666'}}>{wordInfo.Translation}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={modalStyles.statusBox}>
                    Trạng thái hiện tại: 
                    <strong style={{color: wordInfo.Status === 'Mastered' ? '#16a34a' : wordInfo.Status === 'Learning' ? '#ea580c' : '#6b7280', marginLeft: 6}}>
                        {wordInfo.Status}
                    </strong>
                </div>

            </div>
        </div>
    );
};

// ==========================================
// COMPONENT CHÍNH: HISTORY
// ==========================================
const History = () => {
    const navigate = useNavigate();
    const user = getUser();

    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State quản lý hiển thị Modal
    const [selectedWordDetail, setSelectedWordDetail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchHistory();
    }, [navigate, user]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const currentUserId = user?.UserID || user?.id || user?.userId;
            const response = await API.get('/user/history', { params: { user_id: currentUserId } });
            setHistoryList(response.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    // Khi User click vào 1 dòng lịch sử
    const handleRowClick = async (wordId) => {
        try {
            const currentUserId = user?.UserID || user?.id || user?.userId;
            const res = await API.get('/user/history/word', { params: { user_id: currentUserId, word_id: wordId } });
            setSelectedWordDetail(res.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Lỗi lấy chi tiết từ:", error);
        }
    };

    // Format ngày giờ
    const formatDate = (isoString) => {
        if (!isoString) return "Chưa rõ";
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Helper render badge trạng thái
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
                    <div style={styles.iconBox}><Clock size={32} color="#2563eb" /></div>
                    <div>
                        <h1 style={styles.title}>Lịch sử học tập</h1>
                        <p style={styles.subtitle}>Xem lại các từ vựng bạn đã làm Quiz hoặc lật thẻ gần đây.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loading}>Đang tải lịch sử...</div>
                ) : historyList.length === 0 ? (
                    <div style={styles.empty}>Bạn chưa có lịch sử học tập nào. Hãy bắt đầu làm Quiz hoặc học Flashcard nhé!</div>
                ) : (
                    <div style={styles.listContainer}>
                        {historyList.map((item, index) => (
                            <div key={item.LearningID || index} style={styles.listItem} onClick={() => handleRowClick(item.WordID)}>
                                
                                <div style={styles.itemLeft}>
                                    <div style={styles.wordAvatar}>
                                        {item.ImageURL ? (
                                            <img src={getFullUrl(item.ImageURL)} alt="" style={styles.avatarImg} />
                                        ) : (
                                            <span>{item.Word.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={styles.wordTitle}>{item.Word}</h3>
                                        <p style={styles.wordMeaning}>{item.Meaning}</p>
                                    </div>
                                </div>

                                <div style={styles.itemRight}>
                                    <div style={styles.infoCol}>
                                        <span style={styles.infoLabel}>Điểm Quiz</span>
                                        <span style={{...styles.scoreText, color: item.Score >= 70 ? '#16a34a' : item.Score >= 50 ? '#d97706' : '#dc2626'}}>
                                            {item.Score} đ
                                        </span>
                                    </div>
                                    <div style={styles.infoCol}>
                                        <span style={styles.infoLabel}>Trạng thái</span>
                                        {renderStatusBadge(item.Status)}
                                    </div>
                                    <div style={styles.infoCol}>
                                        <span style={styles.infoLabel}>Thời gian</span>
                                        <span style={styles.dateText}>{formatDate(item.LearnDate)}</span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* HIỂN THỊ MODAL NẾU IS_MODAL_OPEN LÀ TRUE */}
            {isModalOpen && (
                <MiniFlashcardModal 
                    wordInfo={selectedWordDetail} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}

            <Footer />
        </div>
    );
};

// ==========================================
// STYLES
// ==========================================
const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '40px 20px' },
    header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' },
    iconBox: { backgroundColor: '#dbeafe', padding: '16px', borderRadius: '20px' },
    title: { fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
    subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
    loading: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', marginTop: '40px' },
    empty: { textAlign: 'center', color: '#6b7280', marginTop: '40px', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb' },
    
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s', flexWrap: 'wrap', gap: '16px' },
    itemLeft: { display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' },
    wordAvatar: { width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    wordTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px' },
    wordMeaning: { fontSize: '14px', color: '#6b7280', margin: 0 },
    
    itemRight: { display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' },
    infoCol: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' },
    scoreText: { fontSize: '16px', fontWeight: 'bold' },
    dateText: { fontSize: '13px', color: '#4b5563', fontWeight: 500 },
    
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', textAlign: 'center' },
    badgeMastered: { backgroundColor: '#dcfce7', color: '#166534' },
    badgeLearning: { backgroundColor: '#fef3c7', color: '#d97706' },
    badgeNew: { backgroundColor: '#f3f4f6', color: '#4b5563' }
};

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '380px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    closeBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 24px' },
    
    cardContainer: { width: '100%', height: '340px', cursor: 'pointer', perspective: '1000px', marginBottom: '24px' },
    cardInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    front: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb' },
    back: { backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', transform: 'rotateY(180deg)' },
    
    wordText: { fontSize: '32px', fontWeight: 900, color: '#1f2937', margin: '0 0 8px', textAlign: 'center' },
    ipaText: { fontSize: '16px', color: '#9ca3af', fontStyle: 'italic', fontWeight: 500, margin: '0 0 20px' },
    audioBtn: { padding: '12px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flipHint: { marginTop: '24px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' },
    image: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', border: '2px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    meaningText: { fontSize: '24px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 12px', textAlign: 'center' },
    exampleBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '10px', borderRadius: '10px', width: '100%', boxSizing: 'border-box' },
    exampleText: { textAlign: 'center', color: '#374151', fontSize: '14px', fontStyle: 'italic', margin: 0, lineHeight: '1.4' },
    
    statusBox: { fontSize: '14px', color: '#4b5563', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '999px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
};

export default History;