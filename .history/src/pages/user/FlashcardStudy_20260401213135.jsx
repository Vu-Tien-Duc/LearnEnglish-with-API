import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Heart, RefreshCw, CheckCircle, XCircle, BookOpen, ChevronRight, ArrowLeft, Shuffle, Zap } from 'lucide-react';
import API from '../../services/api';
import Navbar, { Footer } from '../../components/Navbar';

// --- HELPERS ---
const getUser = () => JSON.parse(localStorage.getItem('user')) || null;

// --- COMPONENT 1: FLASHCARD ---
const Flashcard = ({ wordInfo, onAction, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(wordInfo.IsFavorite);

    useEffect(() => {
        setIsFlipped(false);
        setIsFavorite(wordInfo.IsFavorite);
    }, [wordInfo]);

    const playAudio = (e) => {
        e.stopPropagation();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordInfo.Word);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const toggleFav = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        onToggleFavorite(wordInfo.WordID);
    };

    return (
        <div style={fcStyles.wrapper}>
            <div style={fcStyles.cardContainer} onClick={() => setIsFlipped(!isFlipped)}>
                <div style={{ ...fcStyles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                    {/* Front */}
                    <div style={{ ...fcStyles.cardFace, ...fcStyles.front }}>
                        <button onClick={toggleFav} style={fcStyles.heartBtn}>
                            <Heart size={24} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#d1d5db"} />
                        </button>
                        <h2 style={fcStyles.wordText}>{wordInfo.Word}</h2>
                        <p style={fcStyles.ipaText}>/{wordInfo.IPA || '...'}/</p>
                        <button onClick={playAudio} style={fcStyles.audioBtn}><Volume2 size={24} /></button>
                        <p style={fcStyles.flipHint}><RefreshCw size={14} /> Click to flip</p>
                    </div>
                    {/* Back */}
                    <div style={{ ...fcStyles.cardFace, ...fcStyles.back }}>
                        {wordInfo.ImageURL && <img src={wordInfo.ImageURL} alt="" style={fcStyles.image} />}
                        <h3 style={fcStyles.meaningText}>{wordInfo.Meaning}</h3>
                        <div style={fcStyles.exampleBox}>
                            <p style={fcStyles.exampleText}>"{wordInfo.ExampleSentence}"</p>
                            <p style={{ ...fcStyles.exampleText, fontSize: '13px', color: '#666' }}>{wordInfo.Translation}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ ...fcStyles.actionGroup, opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}>
                <button onClick={() => onAction('Learning')} style={fcStyles.btnWeak}><XCircle size={18} /> Chưa nhớ</button>
                <button onClick={() => onAction('Learning')} style={fcStyles.btnLearning}><Zap size={18} /> Đang học</button>
                <button onClick={() => onAction('Mastered')} style={fcStyles.btnPass}><CheckCircle size={18} /> Đã thuộc</button>
            </div>
        </div>
    );
};

// --- COMPONENT 2: MAIN PAGE ---
const FlashcardStudy = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [view, setView] = useState('MENU'); 
    const [lessons, setLessons] = useState([]);
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) navigate('/');
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await API.get('/user/lessons');
            setLessons(res.data);
        } catch (e) { console.error(e); }
    };

    const loadVocab = async (mode, lessonId = null) => {
        setLoading(true);
        try {
            let res;
            if (mode === 'LESSON') res = await API.get('/user/vocabulary', { params: { user_id: user.UserID, lesson_id: lessonId } });
            else if (mode === 'RANDOM') res = await API.get('/user/vocabulary/random', { params: { user_id: user.UserID } });
            else if (mode === 'WEAK') res = await API.get('/user/vocabulary/weak', { params: { user_id: user.UserID } });
            
            if (res.data.length === 0) {
                alert("Không có từ vựng nào trong chế độ này!");
                setLoading(false);
                return;
            }
            setWords(res.data);
            setCurrentIndex(0);
            setView('STUDY');
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAction = async (status) => {
        const currentWord = words[currentIndex];
        await API.post('/user/progress/update', { user_id: user.UserID, wordId: currentWord.WordID, status });

        if (status === 'Mastered') {
            // Loại bỏ từ nếu đã thuộc trong phiên này
            const newWords = words.filter((_, i) => i !== currentIndex);
            setWords(newWords);
            if (currentIndex >= newWords.length && newWords.length > 0) setCurrentIndex(0);
            else if (newWords.length === 0) {
                alert("🎉 Tuyệt vời! Bạn đã hoàn thành tất cả từ.");
                setView('MENU');
            }
        } else {
            // Nếu chưa thuộc, đẩy xuống cuối hoặc vị trí tiếp theo (Logic lặp lại)
            if (words.length > 1) {
                setCurrentIndex((currentIndex + 1) % words.length);
            }
        }
    };

    const handleFavorite = (wordId) => {
        API.post('/user/favorites/toggle', { user_id: user.UserID, wordId });
    };

    return (
        <div style={styles.root}>
            <Navbar />
            <div style={styles.container}>
                {view === 'MENU' ? (
                    <div style={styles.menuGrid}>
                        <h1 style={styles.title}>Chế độ học tập</h1>
                        <div style={styles.modeCard} onClick={() => loadVocab('RANDOM')}>
                            <Shuffle size={32} color="#8b5cf6" />
                            <div><h3>Random 30 từ</h3><p>Ưu tiên từ mới và từ đang học</p></div>
                        </div>
                        <div style={styles.modeCard} onClick={() => loadVocab('WEAK')}>
                            <Zap size={32} color="#f59e0b" />
                            <div><h3>Học từ yếu</h3><p>Chỉ học các từ đang ở trạng thái 'Learning'</p></div>
                        </div>
                        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #ddd' }} />
                        <h2 style={{ fontSize: '18px', width: '100%' }}>📘 Học theo bài (Lessons)</h2>
                        {lessons.map(l => (
                            <div key={l.LessonID} style={styles.lessonItem} onClick={() => loadVocab('LESSON', l.LessonID)}>
                                <BookOpen size={20} />
                                <div style={{ flex: 1 }}><b>{l.LessonName}</b><br /><small>{l.CategoryName} • {l.TotalWords} từ</small></div>
                                <ChevronRight size={20} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div style={styles.studyHeader}>
                            <button onClick={() => setView('MENU')} style={styles.backBtn}><ArrowLeft size={18} /> Quay lại</button>
                            <div style={styles.progressBadge}>Tiến độ: {words.length} từ còn lại</div>
                        </div>
                        {words.length > 0 && (
                            <Flashcard 
                                wordInfo={words[currentIndex]} 
                                onAction={handleAction} 
                                onToggleFavorite={handleFavorite}
                            />
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

// --- STYLES ---
const fcStyles = {
    wrapper: { width: '100%', maxWidth: '400px', margin: '0 auto', textAlign: 'center' },
    cardContainer: { height: '420px', perspective: '1000px', cursor: 'pointer' },
    cardInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '20px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee' },
    front: { backgroundColor: '#fff' },
    back: { backgroundColor: '#f0f7ff', transform: 'rotateY(180deg)' },
    wordText: { fontSize: '42px', margin: '10px 0', color: '#1a1a1a' },
    ipaText: { color: '#888', fontStyle: 'italic', marginBottom: '20px' },
    audioBtn: { padding: '15px', borderRadius: '50%', border: 'none', backgroundColor: '#eef2ff', color: '#4f46e5', cursor: 'pointer' },
    image: { width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover', marginBottom: '15px' },
    meaningText: { fontSize: '26px', fontWeight: 'bold', color: '#1e40af', marginBottom: '15px' },
    exampleBox: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', width: '100%' },
    exampleText: { margin: '5px 0', fontSize: '15px', lineHeight: '1.4' },
    actionGroup: { display: 'flex', gap: '10px', marginTop: '30px', transition: '0.3s' },
    btnWeak: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' },
    btnLearning: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' },
    btnPass: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' },
    heartBtn: { position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' },
    flipHint: { marginTop: '20px', fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }
};

const styles = {
    root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' },
    container: { flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '40px 20px' },
    menuGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    title: { textAlign: 'center', fontSize: '28px', fontWeight: '900', marginBottom: '20px' },
    modeCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: '0.2s' },
    lessonItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '12px', cursor: 'pointer', border: '1px solid #eee' },
    studyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    backBtn: { border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontWeight: '600' },
    progressBadge: { padding: '5px 15px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }
};

export default FlashcardStudy;