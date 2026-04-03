import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Heart, RefreshCw, CheckCircle, XCircle, BookOpen, ChevronRight, ArrowLeft, Zap, Shuffle, RotateCcw, Home } from 'lucide-react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

// ── CẤU HÌNH BACKEND URL ──────────────────────────────────────────────────
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

// ── HÀM TẠO ÂM THANH BẰNG WEB AUDIO API ──────────────────────────────────
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
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(250, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch (error) {
        console.log("Audio không được hỗ trợ", error);
    }
};

// ── INJECT GLOBAL CSS ──────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --white:   #ffffff;
    --bg:      #f7f7f5;
    --bg2:     #f0efec;
    --ink:     #111111;
    --ink2:    #333333;
    --muted:   #888888;
    --border:  #e4e4e0;
    --border2: #d0d0cc;
    --gold:    #c9a84c;
    --gold-bg: #fdf8ee;
    --green:   #1a7f4b;
    --green-bg:#edf7f1;
    --red:     #c0392b;
    --red-bg:  #fdf0ef;
    --blue:    #2a5caa;
    --blue-bg: #f0f4fb;
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
    --radius: 20px;
    --radius-sm: 12px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; } 50% { opacity: 0.5; }
  }

  .fc-mode-card {
    display: flex;
    align-items: center;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 28px;
    cursor: pointer;
    gap: 22px;
    box-shadow: var(--shadow-sm);
    transition: all 0.22s cubic-bezier(.22,1,.36,1);
    animation: fadeUp 0.5s ease both;
    position: relative;
    overflow: hidden;
    text-decoration: none;
  }
  .fc-mode-card::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    opacity: 0;
    transition: opacity 0.22s;
  }
  .fc-mode-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border2);
  }
  .fc-mode-card:hover::after { opacity: 1; }
  .fc-mode-card.accent-blue::after  { background: var(--blue); }
  .fc-mode-card.accent-gold::after  { background: var(--gold); }
  .fc-mode-card.accent-green::after { background: var(--green); }

  .fc-lesson-card {
    display: flex;
    align-items: center;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 18px 22px;
    cursor: pointer;
    gap: 18px;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s;
    animation: fadeUp 0.4s ease both;
  }
  .fc-lesson-card:hover {
    border-color: var(--border2);
    box-shadow: var(--shadow-md);
    transform: translateX(3px);
  }

  .fc-action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px 20px;
    border-radius: var(--radius-sm);
    border: none;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.18s;
    letter-spacing: 0.2px;
  }
  .fc-action-btn:hover { transform: translateY(-1px); }
  .fc-action-btn:active { transform: scale(0.98); }

  .btn-fail {
    background: var(--white);
    color: var(--red);
    border: 1.5px solid #f0ccc9 !important;
    box-shadow: var(--shadow-sm);
  }
  .btn-fail:hover { background: var(--red-bg); border-color: #e0a8a5 !important; }

  .btn-pass {
    background: var(--green);
    color: #fff;
    box-shadow: 0 4px 16px rgba(26,127,75,0.25);
  }
  .btn-pass:hover { background: #16a05f; box-shadow: 0 6px 20px rgba(26,127,75,0.35); }

  .res-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 20px;
    border-radius: var(--radius-sm);
    border: none;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    width: 100%;
    transition: all 0.18s;
  }
  .res-btn:hover { transform: translateY(-1px); }
  .res-btn-primary   { background: var(--ink); color: #fff; }
  .res-btn-primary:hover { background: var(--ink2); }
  .res-btn-secondary { background: var(--gold-bg); color: var(--gold); border: 1.5px solid #e8d9b0 !important; }
  .res-btn-secondary:hover { background: #faefd8; }
  .res-btn-outline   { background: var(--bg); color: var(--muted); border: 1px solid var(--border) !important; }
  .res-btn-outline:hover { background: var(--bg2); color: var(--ink); }

  .back-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: var(--muted); font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 6px 0;
    transition: color 0.18s;
  }
  .back-btn:hover { color: var(--ink); }

  .audio-btn {
    width: 52px; height: 52px;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--ink2);
    cursor: pointer;
    transition: all 0.18s;
  }
  .audio-btn:hover {
    background: var(--ink);
    color: #fff;
    border-color: var(--ink);
    transform: scale(1.05);
  }

  .heart-btn {
    position: absolute; top: 18px; right: 18px;
    background: none; border: none; cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.18s;
    display: flex; align-items: center;
  }
  .heart-btn:hover { background: #ffeaea; transform: scale(1.1); }

  .progress-bar-track {
    height: 3px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .progress-bar-fill {
    height: 100%;
    background: var(--ink);
    border-radius: 99px;
    transition: width 0.5s cubic-bezier(.22,1,.36,1);
  }
`;

function injectCSS() {
    if (!document.getElementById('fc-css')) {
        const s = document.createElement('style');
        s.id = 'fc-css';
        s.textContent = GLOBAL_CSS;
        document.head.appendChild(s);
    }
}

// ── COMPONENT 1: Thẻ Flashcard ─────────────────────────────────────────────
const Flashcard = ({ wordInfo, onUpdateProgress, onToggleFavorite }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [animating, setAnimating] = useState(null);

    useEffect(() => {
        setIsFlipped(false);
        setAnimating(null);
        setIsFavorite(wordInfo.IsFavorite || wordInfo.isFavorite || false);
    }, [wordInfo]);

    const playAudio = (e) => {
        e.stopPropagation();
        window.speechSynthesis.cancel();
        const audioUrl = getFullUrl(wordInfo.AudioURL || wordInfo.audioUrl);
        const speakWithAI = () => {
            const textToSpeak = wordInfo.Word || wordInfo.word;
            if (textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US'; utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        };
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => speakWithAI());
        } else { speakWithAI(); }
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) onToggleFavorite(wordInfo.WordID || wordInfo.wordId);
    };

    const handleActionClick = (status) => {
        if (animating) return;
        playSound(status);
        setAnimating(status);
        setTimeout(() => { onUpdateProgress(wordInfo, status); }, 400);
    };

    const cardTransform = animating === 'Mastered'
        ? 'translateX(110px) rotate(8deg)'
        : animating === 'Learning'
            ? 'translateX(-110px) rotate(-8deg)'
            : 'translateX(0) rotate(0)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {/* Card wrapper */}
            <div style={{
                width: '100%', height: '420px', cursor: 'pointer',
                perspective: '1200px',
                transform: cardTransform,
                opacity: animating ? 0 : 1,
                transition: 'transform 0.4s cubic-bezier(.22,1,.36,1), opacity 0.3s ease',
            }} onClick={() => !animating && setIsFlipped(!isFlipped)}>
                <div style={{
                    position: 'relative', width: '100%', height: '100%',
                    transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                }}>

                    {/* ── FRONT ── */}
                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: 24,
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        padding: '32px 28px',
                    }}>
                        {/* Top accent line */}
                        <div style={{
                            position: 'absolute', top: 0, left: '15%', right: '15%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, var(--ink), transparent)',
                            borderRadius: '0 0 2px 2px',
                        }} />

                        <button className="heart-btn" onClick={handleFavorite}>
                            <Heart
                                size={22}
                                fill={isFavorite ? '#e53e3e' : 'none'}
                                color={isFavorite ? '#e53e3e' : '#ccc'}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* Word type tag */}
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
                            color: 'var(--muted)', textTransform: 'uppercase',
                            marginBottom: 20,
                            border: '1px solid var(--border)',
                            borderRadius: 99, padding: '4px 12px',
                        }}>ENGLISH</div>

                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 46, fontWeight: 900,
                            color: 'var(--ink)',
                            margin: '0 0 10px',
                            textAlign: 'center',
                            lineHeight: 1.1,
                            letterSpacing: '-1px',
                        }}>
                            {wordInfo.Word || wordInfo.word}
                        </h2>

                        <p style={{
                            fontSize: 16, color: 'var(--muted)',
                            fontStyle: 'italic',
                            fontFamily: 'DM Sans, sans-serif',
                            margin: '0 0 28px',
                            letterSpacing: '0.5px',
                        }}>
                            /{wordInfo.IPA || wordInfo.ipa || '···'}/
                        </p>

                        <button className="audio-btn" onClick={playAudio}>
                            <Volume2 size={20} strokeWidth={1.8} />
                        </button>

                        <div style={{
                            marginTop: 'auto',
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 11, color: '#bbb',
                        }}>
                            <RefreshCw size={11} />
                            <span>Chạm để xem nghĩa</span>
                        </div>
                    </div>

                    {/* ── BACK ── */}
                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: 24,
                        background: '#fff',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        padding: '28px',
                        gap: 0,
                    }}>
                        {/* Bottom accent line */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: '15%', right: '15%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, var(--green), transparent)',
                            borderRadius: '2px 2px 0 0',
                        }} />

                        {(wordInfo.ImageURL || wordInfo.imageUrl) && (
                            <img
                                src={getFullUrl(wordInfo.ImageURL || wordInfo.imageUrl)}
                                alt={wordInfo.Word || wordInfo.word}
                                style={{
                                    width: 110, height: 110,
                                    objectFit: 'cover',
                                    borderRadius: 14,
                                    marginBottom: 18,
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-sm)',
                                }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        )}

                        <h3 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 30, fontWeight: 700,
                            color: 'var(--ink)',
                            textAlign: 'center',
                            marginBottom: 16,
                            lineHeight: 1.2,
                        }}>
                            {wordInfo.Meaning || wordInfo.meaning}
                        </h3>

                        <div style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: '14px 18px',
                            width: '100%',
                        }}>
                            <p style={{
                                textAlign: 'center',
                                color: 'var(--ink2)',
                                fontSize: 14,
                                fontStyle: 'italic',
                                lineHeight: 1.6,
                                margin: '0 0 6px',
                            }}>
                                "{wordInfo.ExampleSentence || wordInfo.Example || '···'}"
                            </p>
                            {wordInfo.Translation && (
                                <p style={{
                                    textAlign: 'center',
                                    color: 'var(--muted)',
                                    fontSize: 12.5,
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}>
                                    {wordInfo.Translation}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div style={{
                display: 'flex', gap: 12, marginTop: 20, width: '100%',
                opacity: animating ? 0.4 : 1,
                pointerEvents: animating ? 'none' : 'auto',
                transition: 'opacity 0.3s',
            }}>
                <button
                    className="fc-action-btn btn-fail"
                    onClick={() => handleActionClick('Learning')}
                    style={{ border: 'none' }}
                >
                    <XCircle size={18} strokeWidth={2} />
                    Đang học
                </button>
                <button
                    className="fc-action-btn btn-pass"
                    onClick={() => handleActionClick('Mastered')}
                >
                    <CheckCircle size={18} strokeWidth={2} />
                    Đã thuộc
                </button>
            </div>
        </div>
    );
};

// ── COMPONENT 2: Trang Phòng Học ───────────────────────────────────────────
const FlashcardStudy = () => {
    const navigate = useNavigate();
    const user = getUser();

    const [view, setView] = useState('MENU');
    const [lessons, setLessons] = useState([]);
    const [originalWords, setOriginalWords] = useState([]);
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [studyTitle, setStudyTitle] = useState('');
    const [sessionResult, setSessionResult] = useState({ mastered: [], learning: [] });

    const currentUserId = user?.UserID || user?.id || user?.userId;

    useEffect(() => {
        injectCSS();
        if (!user) navigate('/', { replace: true });
    }, [navigate, user]);

    const openLessonList = async () => {
        setLoading(true);
        setView('LESSON_LIST');
        try {
            const response = await API.get('/user/lessons');
            setLessons(response.data);
        } catch (error) { console.error('Lỗi tải lesson:', error); }
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
                setStudyTitle(`${lesson.LessonName || lesson.lessonName}`);
                const lessonId = lesson.LessonID || lesson.lessonId;
                res = await API.get('/user/vocabulary', { params: { user_id: currentUserId, lesson_id: lessonId } });
            } else if (mode === 'RANDOM') {
                setStudyTitle('Random 30 từ');
                res = await API.get('/user/vocabulary/random', { params: { user_id: currentUserId } });
            } else if (mode === 'WEAK') {
                setStudyTitle('Ôn tập từ kém');
                res = await API.get('/user/vocabulary/weak', { params: { user_id: currentUserId } });
            }
            if (!res.data || res.data.length === 0) {
                alert('🎉 Tuyệt vời! Bạn không có từ vựng nào ở mục này.');
                setView('MENU');
            } else {
                setWords(res.data);
                setOriginalWords(res.data);
            }
        } catch (error) { console.error('Lỗi lấy danh sách từ:', error); }
        setLoading(false);
    };

    const handleUpdateProgress = async (wordObj, status) => {
        const wordId = wordObj.WordID || wordObj.wordId;
        try {
            await API.post('/user/progress/update', { wordId, status, user_id: currentUserId });
        } catch (error) { console.error('Lỗi cập nhật tiến độ:', error); }
        setSessionResult(prev => ({
            ...prev,
            [status === 'Mastered' ? 'mastered' : 'learning']: [
                ...prev[status === 'Mastered' ? 'mastered' : 'learning'],
                wordObj,
            ],
        }));
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setView('RESULT');
        }
    };

    const handleToggleFavorite = async (wordId) => {
        try {
            await API.post('/user/favorites/toggle', { wordId, user_id: currentUserId });
        } catch (error) { console.error('Lỗi thả tim:', error); }
    };

    const restartAll = () => {
        setWords(originalWords);
        setCurrentIndex(0);
        setSessionResult({ mastered: [], learning: [] });
        setView('STUDY');
    };

    const restartWeakOnly = () => {
        if (sessionResult.learning.length === 0) {
            alert('Bạn đã thuộc tất cả từ!');
            return;
        }
        setWords(sessionResult.learning);
        setOriginalWords(sessionResult.learning);
        setCurrentIndex(0);
        setSessionResult({ mastered: [], learning: [] });
        setView('STUDY');
    };

    const pct = words.length > 0 ? Math.round((currentIndex / words.length) * 100) : 0;

    /* ─ MENU ─ */
    if (view === 'MENU') return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px' }}>

                {/* Page header */}
                <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s ease both' }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 3,
                        color: 'var(--muted)', textTransform: 'uppercase',
                        marginBottom: 10,
                    }}>Flashcard</div>
                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 38, fontWeight: 900,
                        color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10,
                        letterSpacing: '-1px',
                    }}>Chọn chế độ học</h1>
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
                        Học qua thẻ từ vựng, lật để xem nghĩa và đánh giá mức độ ghi nhớ.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="fc-mode-card accent-blue" style={{ animationDelay: '0.05s' }} onClick={openLessonList}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: 'var(--blue-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--blue)',
                        }}>
                            <BookOpen size={24} strokeWidth={1.8} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
                                Học theo Lesson
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                                Học theo các bài học được sắp xếp sẵn
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--border2)" />
                    </div>

                    <div className="fc-mode-card accent-gold" style={{ animationDelay: '0.1s' }} onClick={() => startStudy('RANDOM')}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: 'var(--gold-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--gold)',
                        }}>
                            <Shuffle size={24} strokeWidth={1.8} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
                                Random 30 từ
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                                Ưu tiên từ mới và từ đang học
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--border2)" />
                    </div>

                    <div className="fc-mode-card accent-green" style={{ animationDelay: '0.15s' }} onClick={() => startStudy('WEAK')}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: 'var(--green-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--green)',
                        }}>
                            <Zap size={24} strokeWidth={1.8} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
                                Ôn tập từ kém
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                                Chỉ học các từ vựng bạn chưa nhớ
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--border2)" />
                    </div>
                </div>
            </div>
        </div>
    );

    /* ─ LESSON LIST ─ */
    if (view === 'LESSON_LIST') return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>

                {/* top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    marginBottom: 32, animation: 'fadeUp 0.4s ease both',
                }}>
                    <button className="back-btn" onClick={() => setView('MENU')}>
                        <ArrowLeft size={16} strokeWidth={2} /> Chế độ học
                    </button>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {lessons.length} bài học
                    </span>
                </div>

                <h2 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 26, fontWeight: 700, color: 'var(--ink)',
                    marginBottom: 20, animation: 'fadeUp 0.4s 0.05s ease both',
                }}>
                    Danh sách bài học
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 14 }}>
                        <div style={{ animation: 'pulse 1.5s infinite', fontSize: 28, marginBottom: 12 }}>⏳</div>
                        Đang tải...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {lessons.map((lesson, i) => (
                            <div
                                key={lesson.LessonID || lesson.lessonId}
                                className="fc-lesson-card"
                                style={{ animationDelay: `${i * 0.04}s` }}
                                onClick={() => startStudy('LESSON', lesson)}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    background: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--ink2)',
                                }}>
                                    <BookOpen size={20} strokeWidth={1.8} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 10, fontWeight: 700, letterSpacing: 2,
                                        color: 'var(--gold)', textTransform: 'uppercase',
                                        marginBottom: 4,
                                    }}>
                                        {lesson.CategoryName || lesson.categoryName}
                                    </div>
                                    <div style={{
                                        fontSize: 15, fontWeight: 600, color: 'var(--ink)',
                                        fontFamily: 'Playfair Display, serif',
                                        marginBottom: 2,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {lesson.LessonName || lesson.lessonName}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                        {lesson.TotalWords ?? lesson.wordCount} từ vựng
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--border2)" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    /* ─ STUDY ─ */
    if (view === 'STUDY') return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 500, margin: '0 auto', padding: '36px 20px 80px' }}>

                {/* top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 20,
                }}>
                    <button className="back-btn" onClick={() => setView('MENU')}>
                        <ArrowLeft size={16} strokeWidth={2} /> Thoát
                    </button>
                    <div style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--muted)',
                        background: 'var(--white)',
                        border: '1px solid var(--border)',
                        borderRadius: 99, padding: '5px 14px',
                    }}>
                        {currentIndex + 1} / {words.length}
                    </div>
                </div>

                {/* progress bar */}
                <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>

                {/* study title */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 18, fontWeight: 700, color: 'var(--ink)',
                    }}>{studyTitle}</h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 14 }}>
                        <div style={{ animation: 'pulse 1.5s infinite', fontSize: 28, marginBottom: 12 }}>⏳</div>
                        Đang chuẩn bị bộ thẻ...
                    </div>
                ) : (
                    words.length > 0 && (
                        <Flashcard
                            key={words[currentIndex].WordID || words[currentIndex].wordId}
                            wordInfo={words[currentIndex]}
                            onUpdateProgress={handleUpdateProgress}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    )
                )}
            </div>
        </div>
    );

    /* ─ RESULT ─ */
    if (view === 'RESULT') return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px 80px' }}>
                <div style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: 28,
                    padding: '44px 36px',
                    boxShadow: 'var(--shadow-lg)',
                    textAlign: 'center',
                    animation: 'scaleIn 0.45s cubic-bezier(.22,1,.36,1) both',
                }}>
                    {/* trophy */}
                    <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>🎯</div>

                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 28, fontWeight: 900, color: 'var(--ink)',
                        marginBottom: 8, letterSpacing: '-0.5px',
                    }}>Phiên học hoàn thành</h2>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 36 }}>
                        Bạn đã ôn xong {words.length} thẻ từ vựng
                    </p>

                    {/* stats */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: 12, marginBottom: 36,
                    }}>
                        <div style={{
                            background: 'var(--green-bg)',
                            border: '1px solid #c3e8d4',
                            borderRadius: 16, padding: '20px 16px',
                        }}>
                            <div style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 40, fontWeight: 900, color: 'var(--green)',
                                lineHeight: 1, marginBottom: 6,
                            }}>
                                {sessionResult.mastered.length}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Đã thuộc ✓</div>
                        </div>
                        <div style={{
                            background: 'var(--red-bg)',
                            border: '1px solid #f0ccc9',
                            borderRadius: 16, padding: '20px 16px',
                        }}>
                            <div style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 40, fontWeight: 900, color: 'var(--red)',
                                lineHeight: 1, marginBottom: 6,
                            }}>
                                {sessionResult.learning.length}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Đang học ✗</div>
                        </div>
                    </div>

                    {/* accuracy bar */}
                    {words.length > 0 && (
                        <div style={{ marginBottom: 36 }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: 12, color: 'var(--muted)', marginBottom: 8,
                            }}>
                                <span>Độ chính xác</span>
                                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                                    {Math.round((sessionResult.mastered.length / words.length) * 100)}%
                                </span>
                            </div>
                            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(sessionResult.mastered.length / words.length) * 100}%`,
                                    background: 'var(--green)',
                                    borderRadius: 99,
                                    transition: 'width 1s cubic-bezier(.22,1,.36,1)',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="res-btn res-btn-primary" onClick={restartAll}>
                            <RotateCcw size={16} strokeWidth={2} />
                            Học lại toàn bộ ({words.length} thẻ)
                        </button>
                        {sessionResult.learning.length > 0 && (
                            <button className="res-btn res-btn-secondary" onClick={restartWeakOnly} style={{ border: 'none' }}>
                                <Zap size={16} strokeWidth={2} />
                                Học lại từ chưa thuộc ({sessionResult.learning.length})
                            </button>
                        )}
                        <button className="res-btn res-btn-outline" onClick={() => setView('MENU')} style={{ border: 'none' }}>
                            <Home size={16} strokeWidth={2} />
                            Về màn hình chính
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return null;
};

export default FlashcardStudy;