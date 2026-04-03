import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Heart, RefreshCw, CheckCircle, XCircle, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';

// Đảm bảo đường dẫn import API và Navbar chính xác theo cấu trúc thư mục của bạn
import API from '../../services/api';
import Navbar from '../../components/Navbar';

// ── Hàm hỗ trợ ─────────────────────────────────────────────────────────────
function getUser() {
    try { 
        return JSON.parse(localStorage.getItem('user')) || null; 
    } catch { 
        return null; 
    }
}

// ── COMPONENT 1: Thẻ Flashcard ──────────────────────────────────────────────
const Flashcard = ({ wordInfo, onUpdateProgress, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Reset lại trạng thái lật thẻ khi chuyển sang từ mới
        setIsFlipped(false);
        // Lưu ý: Đảm bảo key IsFavorite hoặc isFavorite khớp với dữ liệu API trả về
        setIsFavorite(wordInfo.IsFavorite || wordInfo.isFavorite || false); 
    }, [wordInfo]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const playAudio = (e) => {
        e.stopPropagation(); 
        window.speechSynthesis.cancel(); 

        const speakWithAI = () => {
            // Hỗ trợ cả key Word (viết hoa) và word (viết thường)
            const textToSpeak = wordInfo.Word || wordInfo.word;
            if (textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US'; 
                utterance.rate = 0.9; 
                window.speechSynthesis.speak(utterance);
            }
        };

        const audioUrl = wordInfo.AudioURL || wordInfo.audioUrl;

        if (audioUrl && audioUrl.startsWith('http')) {
            const audio = new Audio(audioUrl);
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
        // Hỗ trợ cả WordID và wordId
        if (onToggleFavorite) onToggleFavorite(wordInfo.WordID || wordInfo.wordId);
    };

    return (
        <div style={fcStyles.wrapper}>
            {/* Thẻ 3D */}
            <div style={fcStyles.cardContainer} onClick={handleFlip}>
                <div style={{ ...fcStyles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                    
                    {/* MẶT TRƯỚC: Từ vựng & Phát âm */}
                    <div style={{...fcStyles.cardFace, ...fcStyles.front}}>
                        <button onClick={handleFavorite} style={fcStyles.heartBtn}>
                            <Heart 
                                size={28} 
                                fill={isFavorite ? "#ef4444" : "none"} 
                                color={isFavorite ? "#ef4444" : "#d1d5db"} 
                            />
                        </button>
                        
                        <h2 style={fcStyles.wordText}>{wordInfo.Word || wordInfo.word}</h2>
                        <p style={fcStyles.ipaText}>/{wordInfo.IPA || wordInfo.ipa || 'IPA'}/</p>
                        
                        <button onClick={playAudio} style={fcStyles.audioBtn}>
                            <Volume2 size={28} />
                        </button>
                        <p style={fcStyles.flipHint}>
                            <RefreshCw size={14} /> Chạm để lật xem nghĩa
                        </p>
                    </div>

                    {/* MẶT SAU: Nghĩa, Hình ảnh & Câu ví dụ */}
                    <div style={{...fcStyles.cardFace, ...fcStyles.back}}>
                        {(wordInfo.ImageURL || wordInfo.imageUrl) && (
                            <img 
                                src={wordInfo.ImageURL || wordInfo.imageUrl} 
                                alt={wordInfo.Word || wordInfo.word} 
                                style={fcStyles.image} 
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        
                        <h3 style={fcStyles.meaningText}>{wordInfo.Meaning || wordInfo.meaning}</h3>
                        
                        {/* HIỂN THỊ CÂU VÍ DỤ TỪ DATABASE */}
                        <div style={fcStyles.exampleBox}>
                            <p style={fcStyles.exampleText}>
                                "{wordInfo.Example || wordInfo.example || "Keep going, you're doing great!"}"
                            </p>
                        </div>
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
                <button onClick={() => onUpdateProgress(wordInfo.WordID || wordInfo.wordId, 'Learning')} style={fcStyles.btnFail}>
                    <XCircle size={20} /> Chưa thuộc
                </button>
                <button onClick={() => onUpdateProgress(wordInfo.WordID || wordInfo.wordId, 'Mastered')} style={fcStyles.btnPass}>
                    <CheckCircle size={20} /> Đã thuộc
                </button>
            </div>
        </div>
    );
};

// ── COMPONENT 2: Trang Phòng Học (StudyRoom) ────────────────────────────────
const StudyRoom = () => {
    const navigate = useNavigate();
    const user = getUser();

    // ── States quản lý luồng màn hình ──
    const [view, setView] = useState('LESSONS'); // 'LESSONS' | 'STUDY'
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    
    // ── States quản lý Flashcard ──
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // 1. KHI VÀO TRANG: Tải danh sách các Bài học (Lessons)
    useEffect(() => {
        if (!user) {
            navigate('/', { replace: true });
            return;
        }
        fetchLessons();
    // ĐÃ SỬA Ở ĐÂY: Thêm ?.UserID vào dependency để tránh vòng lặp API
    }, [navigate, user?.UserID]);

    const fetchLessons = async () => {
        setLoading(true);
        try {
            const response = await API.get('/user/lessons');
            setLessons(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài học:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. KHI CHỌN 1 BÀI HỌC: Chuyển sang màn hình học và tải từ vựng của bài đó
    const startLesson = async (lesson) => {
        setSelectedLesson(lesson);
        setView('STUDY');
        setLoading(true);
        setCurrentIndex(0);

        try {
            const response = await API.get('/user/vocabulary', { 
                params: { user_id: user.UserID, lesson_id: lesson.LessonID } 
            });
            setWords(response.data);
        } catch (error) {
            console.error("Lỗi khi tải từ vựng của bài học:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. XỬ LÝ NÚT QUAY LẠI
    const backToLessons = () => {
        setView('LESSONS');
        setWords([]);
        setSelectedLesson(null);
    };

    // 4. XỬ LÝ LƯU TIẾN ĐỘ THẺ GHI NHỚ
    const handleUpdateProgress = async (wordId, status) => {
        try {
            await API.post('/user/progress/update', { wordId, status, user_id: user.UserID });
            
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                alert("🎉 Chúc mừng! Bạn đã hoàn thành bài học này.");
                backToLessons(); // Học xong đá về lại danh sách bài
            }
        } catch (error) {
            console.error("Lỗi cập nhật tiến độ:", error);
        }
    };

    const handleToggleFavorite = async (wordId) => {
        try {
            await API.post('/user/favorites/toggle', { wordId, user_id: user.UserID });
        } catch (error) {
            console.error("Lỗi cập nhật yêu thích:", error);
        }
    };

    // ==========================================
    // GIAO DIỆN 1: DANH SÁCH BÀI HỌC
    // ==========================================
    if (view === 'LESSONS') {
        return (
            <div style={styles.root}>
                <Navbar />
                <div style={styles.container}>
                    <div style={styles.headerBox}>
                        <h1 style={styles.title}>Chọn bài học</h1>
                        <p style={styles.subTitle}>Hãy chọn một chủ đề để bắt đầu luyện tập thẻ ghi nhớ</p>
                    </div>

                    {loading ? (
                        <div style={styles.loadingText}>Đang tải danh sách bài học...</div>
                    ) : lessons.length === 0 ? (
                        <div style={styles.emptyText}>Chưa có bài học nào được tạo.</div>
                    ) : (
                        <div style={styles.lessonGrid}>
                            {lessons.map((lesson) => (
                                <div key={lesson.LessonID} style={styles.lessonCard} onClick={() => startLesson(lesson)}>
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
            </div>
        );
    }

    // ==========================================
    // GIAO DIỆN 2: LẬT THẺ FLASHCARD
    // ==========================================
    return (
        <div style={styles.root}>
            <Navbar />
            
            <div style={styles.container}>
                {/* Nút quay lại và Tiêu đề bài đang học */}
                <div style={styles.studyTopBar}>
                    <button onClick={backToLessons} style={styles.backBtn}>
                        <ArrowLeft size={20} /> Quay lại danh sách
                    </button>
                    <h2 style={styles.studyLessonTitle}>{selectedLesson?.LessonName}</h2>
                </div>

                {loading ? (
                    <div style={styles.loadingText}>Đang chuẩn bị bộ thẻ...</div>
                ) : words.length === 0 ? (
                    <div style={styles.emptyText}>Bài học này hiện chưa có từ vựng.</div>
                ) : (
                    <>
                        <div style={styles.headerBox}>
                            <div style={styles.progressBadge}>
                                Tiến độ bài học: {currentIndex + 1} / {words.length}
                            </div>
                        </div>

                        <Flashcard 
                            key={words[currentIndex].WordID} 
                            wordInfo={words[currentIndex]} 
                            onUpdateProgress={handleUpdateProgress}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────

// Styles của Flashcard
const fcStyles = {
    wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '384px', margin: '0 auto' },
    cardContainer: { width: '100%', height: '380px', cursor: 'pointer', perspective: '1000px' }, 
    cardInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    
    front: { backgroundColor: '#ffffff', border: '2px solid #bfdbfe' },
    back: { backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', transform: 'rotateY(180deg)' },
    
    heartBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' },
    wordText: { fontSize: '40px', fontWeight: 900, color: '#1f2937', margin: '0 0 8px', textAlign: 'center' },
    ipaText: { fontSize: '18px', color: '#9ca3af', fontStyle: 'italic', fontWeight: 500, margin: '0 0 24px' },
    audioBtn: { padding: '16px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flipHint: { marginTop: '32px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' },
    
    image: { width: '112px', height: '112px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px', border: '3px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    meaningText: { fontSize: '28px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 16px', textAlign: 'center' },
    
    exampleBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '12px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' },
    exampleText: { textAlign: 'center', color: '#374151', fontSize: '15px', fontStyle: 'italic', margin: 0, lineHeight: '1.5' },
    
    actionGroup: { display: 'flex', gap: '16px', marginTop: '32px', width: '100%', transition: 'all 0.5s ease' },
    btnFail: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#fff', color: '#ea580c', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #ffedd5', cursor: 'pointer', fontSize: '16px' },
    btnPass: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }
};

// Styles của StudyRoom
const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    
    headerBox: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
    subTitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
    
    loadingText: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '18px', marginTop: '40px' },
    emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', marginTop: '40px' },

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
    progressBadge: { display: 'inline-flex', alignItems: 'center', padding: '8px 20px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', fontSize: '15px', fontWeight: 'bold' }
};

// Export Component chính (Container Page)
export default StudyRoom;