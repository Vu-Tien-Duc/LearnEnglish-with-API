import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Heart, RefreshCw, CheckCircle, XCircle, BookOpen, ChevronRight, ArrowLeft, Zap, Shuffle, RotateCcw, Home } from 'lucide-react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

function getUser() {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
}

// ── COMPONENT 1: Thẻ Flashcard ──────────────────────────────────────────────
const Flashcard = ({ wordInfo, onUpdateProgress, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
        setIsFavorite(wordInfo.IsFavorite || wordInfo.isFavorite || false); 
    }, [wordInfo]);

    const playAudio = (e) => {
        e.stopPropagation(); 
        window.speechSynthesis.cancel(); 
        const textToSpeak = wordInfo.Word || wordInfo.word;
        if (textToSpeak) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US'; utterance.rate = 0.9; 
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) onToggleFavorite(wordInfo.WordID || wordInfo.wordId);
    };

    return (
        <div style={fcStyles.wrapper}>
            {/* Thẻ 3D */}
            <div style={fcStyles.cardContainer} onClick={() => setIsFlipped(!isFlipped)}>
                <div style={{ ...fcStyles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                    
                    {/* MẶT TRƯỚC */}
                    <div style={{...fcStyles.cardFace, ...fcStyles.front}}>
                        <button onClick={handleFavorite} style={fcStyles.heartBtn}>
                            <Heart size={28} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#d1d5db"} />
                        </button>
                        <h2 style={fcStyles.wordText}>{wordInfo.Word || wordInfo.word}</h2>
                        <p style={fcStyles.ipaText}>/{wordInfo.IPA || wordInfo.ipa || 'IPA'}/</p>
                        <button onClick={playAudio} style={fcStyles.audioBtn}>
                            <Volume2 size={28} />
                        </button>
                        <p style={fcStyles.flipHint}><RefreshCw size={14} /> Chạm để lật xem nghĩa</p>
                    </div>

                    {/* MẶT SAU (ĐÃ THÊM ẢNH RÕ RÀNG HƠN) */}
                    <div style={{...fcStyles.cardFace, ...fcStyles.back}}>
                        {(wordInfo.ImageURL || wordInfo.imageUrl) && (
                            <img 
                                src={wordInfo.ImageURL || wordInfo.imageUrl} 
                                alt="vocab" 
                                style={fcStyles.image} 
                                onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                        )}
                        <h3 style={fcStyles.meaningText}>{wordInfo.Meaning || wordInfo.meaning}</h3>
                        <div style={fcStyles.exampleBox}>
                            <p style={fcStyles.exampleText}>"{wordInfo.ExampleSentence || wordInfo.Example || "..."}"</p>
                            <p style={{...fcStyles.exampleText, fontSize: '13px', color: '#666'}}>{wordInfo.Translation}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nút hành động */}
            <div style={fcStyles.actionGroup}>
                <button onClick={() => onUpdateProgress(wordInfo, 'Learning')} style={fcStyles.btnFail}>
                    <XCircle size={20} /> Đang học (X)
                </button>
                <button onClick={() => onUpdateProgress(wordInfo, 'Mastered')} style={fcStyles.btnPass}>
                    <CheckCircle size={20} /> Đã thuộc (V)
                </button>
            </div>
        </div>
    );
};

// ── COMPONENT 2: Trang Phòng Học ───────────────────────────────────────────
const FlashcardStudy = () => {
    const navigate = useNavigate();
    const user = getUser();

    // Các luồng: MENU -> LESSON_LIST -> STUDY -> RESULT
    const [view, setView] = useState('MENU'); 
    const [lessons, setLessons] = useState([]);
    const [originalWords, setOriginalWords] = useState([]); // Lưu bộ từ gốc của phiên
    const [words, setWords] = useState([]); // Bộ từ đang học
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [studyTitle, setStudyTitle] = useState("");

    // Lưu lại kết quả của phiên học hiện tại
    const [sessionResult, setSessionResult] = useState({ mastered: [], learning: [] });

    useEffect(() => {
        if (!user) navigate('/', { replace: true });
    }, [navigate, user?.UserID]);

    const openLessonList = async () => {
        setLoading(true);
        setView('LESSON_LIST');
        try {
            const response = await API.get('/user/lessons');
            setLessons(response.data);
        } catch (error) { console.error("Lỗi tải lesson:", error); }
        setLoading(false);
    };

    const startStudy = async (mode, lesson = null) => {
        setLoading(true);
        setView('STUDY');
        setCurrentIndex(0);
        setSessionResult({ mastered: [], learning: [] });

        try {
            let res;
            if (mode === 'LESSON') {
                setStudyTitle(`Bài: ${lesson.LessonName}`);
                res = await API.get('/user/vocabulary', { params: { user_id: user.UserID, lesson_id: lesson.LessonID } });
            } else if (mode === 'RANDOM') {
                setStudyTitle("Random 30 từ");
                res = await API.get('/user/vocabulary/random', { params: { user_id: user.UserID } });
            } else if (mode === 'WEAK') {
                setStudyTitle("Ôn tập từ kém");
                res = await API.get('/user/vocabulary/weak', { params: { user_id: user.UserID } });
            }

            if (!res.data || res.data.length === 0) {
                alert("🎉 Tuyệt vời! Bạn không có từ vựng nào ở mục này.");
                setView('MENU');
            } else {
                setWords(res.data);
                setOriginalWords(res.data); // Lưu lại bản gốc để có thể "Reset"
            }
        } catch (error) { console.error("Lỗi lấy danh sách từ:", error); }
        setLoading(false);
    };

    // LOGIC CẬP NHẬT KHI BẤM NÚT (KHÔNG LẶP VÒNG TRÒN NỮA MÀ ĐI ĐẾN HẾT)
    const handleUpdateProgress = async (wordObj, status) => {
        const wordId = wordObj.WordID || wordObj.wordId;
        
        // 1. Gọi API lưu vào DB
        try {
            await API.post('/user/progress/update', { wordId, status, user_id: user.UserID });
        } catch (error) { 
            console.error("Lỗi cập nhật tiến độ:", error); 
        }

        // 2. Lưu vào mảng kết quả của phiên học
        setSessionResult(prev => ({
            ...prev,
            [status === 'Mastered' ? 'mastered' : 'learning']: [
                ...prev[status === 'Mastered' ? 'mastered' : 'learning'], 
                wordObj
            ]
        }));

        // 3. Chuyển sang thẻ tiếp theo hoặc Hiện Kết Quả
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setView('RESULT'); // Đã học xong bộ thẻ -> Chuyển sang màn hình tổng kết
        }
    };

    const handleToggleFavorite = async (wordId) => {
        try {
            await API.post('/user/favorites/toggle', { wordId, user_id: user.UserID });
        } catch (error) { console.error("Lỗi thả tim:", error); }
    };

    // --- CÁC HÀM XỬ LÝ Ở MÀN HÌNH RESULT ---
    const restartAll = () => {
        setWords(originalWords); // Khôi phục lại toàn bộ bộ từ của phiên
        setCurrentIndex(0);
        setSessionResult({ mastered: [], learning: [] });
        setView('STUDY');
    };

    const restartWeakOnly = () => {
        if (sessionResult.learning.length === 0) {
            alert("Bạn đã thuộc tất cả từ! Không có từ kém để học lại.");
            return;
        }
        setWords(sessionResult.learning); // Chỉ học lại mảng Learning
        setOriginalWords(sessionResult.learning); // Set bộ này làm bộ gốc mới
        setCurrentIndex(0);
        setSessionResult({ mastered: [], learning: [] });
        setView('STUDY');
    };

    // --- GIAO DIỆN CHÍNH ---
    return (
        <div style={styles.root}>
            <Navbar />
            <div style={styles.container}>
                
                {/* 1. MÀN HÌNH MENU CHỌN CHẾ ĐỘ */}
                {view === 'MENU' && (
                    <div style={styles.menuGrid}>
                        <h1 style={styles.title}>Chọn chế độ học</h1>
                        <div style={styles.modeCard} onClick={openLessonList}>
                            <BookOpen size={32} color="#2563eb" />
                            <div><h3>Học theo Lesson</h3><p>Học theo các bài học được sắp xếp sẵn</p></div>
                        </div>
                        <div style={styles.modeCard} onClick={() => startStudy('RANDOM')}>
                            <Shuffle size={32} color="#8b5cf6" />
                            <div><h3>Random 30 từ</h3><p>Ưu tiên từ mới và từ đang học</p></div>
                        </div>
                        <div style={styles.modeCard} onClick={() => startStudy('WEAK')}>
                            <Zap size={32} color="#f59e0b" />
                            <div><h3>Ôn tập từ kém</h3><p>Chỉ học các từ vựng bạn chưa nhớ</p></div>
                        </div>
                    </div>
                )}

                {/* 2. MÀN HÌNH CHỌN LESSON */}
                {view === 'LESSON_LIST' && (
                    <div>
                        <div style={styles.studyTopBar}>
                            <button onClick={() => setView('MENU')} style={styles.backBtn}>
                                <ArrowLeft size={20} /> Trở về Menu
                            </button>
                            <h2 style={styles.studyLessonTitle}>Danh sách bài học</h2>
                        </div>
                        
                        {loading ? <div style={styles.loadingText}>Đang tải...</div> : (
                            <div style={styles.lessonGrid}>
                                {lessons.map((lesson) => (
                                    <div key={lesson.LessonID} style={styles.lessonCard} onClick={() => startStudy('LESSON', lesson)}>
                                        <div style={styles.lessonIcon}><BookOpen size={28} /></div>
                                        <div style={styles.lessonInfo}>
                                            <span style={styles.categoryTag}>{lesson.CategoryName}</span>
                                            <h3 style={styles.lessonName}>{lesson.LessonName}</h3>
                                            <p style={styles.wordCount}>{lesson.TotalWords} từ vựng</p>
                                        </div>
                                        <ChevronRight size={24} color="#9ca3af" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. MÀN HÌNH LẬT THẺ */}
                {view === 'STUDY' && (
                    <div>
                        <div style={styles.studyTopBar}>
                            <button onClick={() => setView('MENU')} style={styles.backBtn}>
                                <ArrowLeft size={20} /> Thoát
                            </button>
                            <h2 style={styles.studyLessonTitle}>{studyTitle}</h2>
                        </div>

                        {loading ? <div style={styles.loadingText}>Đang chuẩn bị bộ thẻ...</div> : (
                            words.length > 0 && (
                                <>
                                    <div style={styles.headerBox}>
                                        <div style={styles.progressBadge}>
                                            Tiến độ: {currentIndex + 1} / {words.length} thẻ
                                        </div>
                                    </div>
                                    <Flashcard 
                                        key={words[currentIndex].WordID} 
                                        wordInfo={words[currentIndex]} 
                                        onUpdateProgress={handleUpdateProgress}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                </>
                            )
                        )}
                    </div>
                )}

                {/* 4. MÀN HÌNH TỔNG KẾT (SAU KHI HẾT THẺ) */}
                {view === 'RESULT' && (
                    <div style={styles.resultContainer}>
                        <h2 style={styles.resultTitle}>🎉 Hoàn thành phiên học!</h2>
                        <div style={styles.statsBox}>
                            <div style={styles.statItem}>
                                <span style={{fontSize: '36px', fontWeight: 'bold', color: '#16a34a'}}>{sessionResult.mastered.length}</span>
                                <span style={{color: '#6b7280'}}>Đã thuộc</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={{fontSize: '36px', fontWeight: 'bold', color: '#ea580c'}}>{sessionResult.learning.length}</span>
                                <span style={{color: '#6b7280'}}>Đang học</span>
                            </div>
                        </div>

                        <div style={styles.resultActions}>
                            <button onClick={restartAll} style={styles.resBtnPrimary}>
                                <RotateCcw size={20} /> Học lại toàn bộ ({words.length})
                            </button>

                            {sessionResult.learning.length > 0 && (
                                <button onClick={restartWeakOnly} style={styles.resBtnSecondary}>
                                    <Zap size={20} /> Học lại từ chưa thuộc ({sessionResult.learning.length})
                                </button>
                            )}

                            <button onClick={() => setView('MENU')} style={styles.resBtnOutline}>
                                <Home size={20} /> Về màn hình chính
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// ── STYLES ────────────────────────────────────────────────────────────────

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
    audioBtn: { padding: '16px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flipHint: { marginTop: '32px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' },
    
    // Đã chỉnh sửa style của Image cho to, bo tròn đẹp mắt hơn trên thẻ
    image: { width: '140px', height: '140px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    
    meaningText: { fontSize: '26px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 12px', textAlign: 'center' },
    exampleBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '12px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' },
    exampleText: { textAlign: 'center', color: '#374151', fontSize: '15px', fontStyle: 'italic', margin: 0, lineHeight: '1.5' },
    
    actionGroup: { display: 'flex', gap: '16px', marginTop: '24px', width: '100%' }, 
    btnFail: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#fff', color: '#ea580c', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #ffedd5', cursor: 'pointer', fontSize: '16px' },
    btnPass: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }
};

const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    menuGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    title: { fontSize: '32px', fontWeight: 900, color: '#111827', margin: '0 0 24px', textAlign: 'center' },
    modeCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease', gap: '20px' },
    headerBox: { textAlign: 'center', marginBottom: '20px' },
    loadingText: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '18px', marginTop: '40px' },
    lessonGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    lessonCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' },
    lessonIcon: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px', marginRight: '20px' },
    lessonInfo: { flex: 1 },
    categoryTag: { fontSize: '12px', fontWeight: 'bold', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' },
    lessonName: { fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '4px 0' },
    wordCount: { fontSize: '14px', color: '#6b7280', margin: 0 },
    studyTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
    studyLessonTitle: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 },
    progressBadge: { display: 'inline-flex', alignItems: 'center', padding: '8px 20px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', fontSize: '15px', fontWeight: 'bold' },
    
    // Result Screen Styles
    resultContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' },
    resultTitle: { fontSize: '28px', color: '#111827', marginBottom: '30px' },
    statsBox: { display: 'flex', gap: '40px', marginBottom: '40px' },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    resultActions: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
    resBtnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    resBtnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    resBtnOutline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
};

export default FlashcardStudy;