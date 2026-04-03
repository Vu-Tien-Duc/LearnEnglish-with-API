import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import API from '../../services/api';
import Navbar, { Footer } from '../../components/Navbar';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

// ── INJECT GLOBAL CSS ──────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --white:    #ffffff;
    --bg:       #f7f7f5;
    --bg2:      #f0efec;
    --ink:      #111111;
    --ink2:     #333333;
    --muted:    #888888;
    --border:   #e4e4e0;
    --border2:  #d0d0cc;
    --gold:     #c9a84c;
    --gold-bg:  #fdf8ee;
    --green:    #1a7f4b;
    --green-bg: #edf7f1;
    --red:      #c0392b;
    --red-bg:   #fdf0ef;
    --blue:     #2a5caa;
    --blue-bg:  #f0f4fb;
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
    --radius:    20px;
    --radius-sm: 12px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shakeX {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-6px); }
    40%,80% { transform: translateX(6px); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.8); opacity: 0; }
    70%  { transform: scale(1.06); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* ── Lesson cards ── */
  .q-lesson-card {
    display: flex;
    align-items: center;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    cursor: pointer;
    gap: 20px;
    box-shadow: var(--shadow-sm);
    transition: all 0.22s cubic-bezier(.22,1,.36,1);
    animation: fadeUp 0.45s ease both;
    position: relative;
    overflow: hidden;
  }
  .q-lesson-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; opacity: 0; transition: opacity 0.22s;
    border-radius: 3px 0 0 3px;
  }
  .q-lesson-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border2);
  }
  .q-lesson-card:hover::before { opacity: 1; }
  .q-lesson-card.ac-gold::before  { background: var(--gold); }
  .q-lesson-card.ac-blue::before  { background: var(--blue); }

  /* ── Option buttons ── */
  .q-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    font-size: 15px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink2);
    cursor: pointer;
    transition: all 0.18s;
    text-align: left;
    width: 100%;
  }
  .q-option:hover:not(:disabled) {
    background: var(--white);
    border-color: var(--border2);
    color: var(--ink);
    box-shadow: var(--shadow-sm);
    transform: translateX(3px);
  }
  .q-option.opt-correct {
    background: var(--green-bg);
    border-color: #a3d9b8;
    color: var(--green);
    animation: popIn 0.35s cubic-bezier(.22,1,.36,1) both;
    cursor: default;
  }
  .q-option.opt-wrong {
    background: var(--red-bg);
    border-color: #f0b8b4;
    color: var(--red);
    animation: shakeX 0.4s ease both;
    cursor: not-allowed;
  }
  .q-option.opt-disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  /* ── Action buttons ── */
  .q-btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px; padding: 13px 24px;
    border-radius: var(--radius-sm); border: none;
    font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
    letter-spacing: 0.2px;
  }
  .q-btn:hover { transform: translateY(-1px); }
  .q-btn-primary  { background: var(--ink); color: #fff; }
  .q-btn-primary:hover  { background: var(--ink2); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
  .q-btn-outline  { background: var(--white); color: var(--ink2); border: 1.5px solid var(--border) !important; }
  .q-btn-outline:hover  { border-color: var(--border2) !important; box-shadow: var(--shadow-sm); }
  .q-btn-next     { background: var(--ink); color: #fff; padding: 12px 22px; }
  .q-btn-next:hover { background: var(--ink2); }

  .back-btn-q {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: var(--muted); font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 6px 0;
    transition: color 0.18s;
  }
  .back-btn-q:hover { color: var(--ink); }

  /* progress bar */
  .q-prog-track {
    height: 3px; background: var(--border);
    border-radius: 99px; overflow: hidden;
  }
  .q-prog-fill {
    height: 100%; background: var(--ink);
    border-radius: 99px;
    transition: width 0.5s cubic-bezier(.22,1,.36,1);
  }
`;

function injectCSS() {
  if (!document.getElementById('quiz-css')) {
    const s = document.createElement('style');
    s.id = 'quiz-css';
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }
}

// ── Shared layout wrapper ──────────────────────────────────────────────────
function PageWrap({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '44px 20px 80px', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

// ── Page header ────────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 36, animation: 'fadeUp 0.5s ease both' }}>
      {eyebrow && (
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10,
        }}>{eyebrow}</div>
      )}
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 36, fontWeight: 900, color: 'var(--ink)',
        lineHeight: 1.1, marginBottom: 10, letterSpacing: '-1px',
      }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</p>}
    </div>
  );
}

// ── Main Quiz Component ────────────────────────────────────────────────────
const Quiz = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [view, setView] = useState('LESSONS');
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false);
  const [tempWrongOption, setTempWrongOption] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [totalScore, setTotalScore] = useState(0);
  const [earnedScoreInfo, setEarnedScoreInfo] = useState(null);

  const [isFinished, setIsFinished] = useState(false);
const [loading, setLoading] = useState(true);

  // 1. Rút trích UserID thành biến nguyên thủy (primitive) để tránh bị khác tham chiếu bộ nhớ khi render lại
  const userId = user ? user.UserID : null;

  // 2. Định nghĩa fetchLessons TRƯỚC bằng useCallback
  const fetchLessons = useCallback(async () => {
    if (!userId) return; // Chốt chặn an toàn
    
    setLoading(true);
    try {
      const res = await API.get('/user/quiz-lessons', { params: { user_id: userId } });
      setLessons(res.data);
    } catch (err) { 
      console.error('Lỗi tải danh sách bài học:', err); 
    } finally { 
      setLoading(false); 
    }
  }, [userId]);

  useEffect(() => {
    injectCSS();
    
    if (!userId) { 
      navigate('/login'); 
      return; 
    }
    
    fetchLessons();
  }, [navigate, userId, fetchLessons]); 

  const startQuiz = async (lesson) => {
    setSelectedLesson(lesson);
    setView('QUIZ');
    setLoading(true);
    setCurrentIndex(0);
    setTotalScore(0);
    setIsFinished(false);
    resetQuestionState();
    try {
      const params = lesson ? { lesson_id: lesson.LessonID } : {};
      const res = await API.get('/user/quiz', { params });
      setQuestions(res.data);
    } catch (err) { console.error('Lỗi tải quiz:', err); }
    finally { setLoading(false); }
  };

  const backToLessons = () => {
    setView('LESSONS');
    setQuestions([]);
    setSelectedLesson(null);
    fetchLessons();
  };

  const resetQuestionState = () => {
    setIsAnsweredCorrectly(false);
    setEarnedScoreInfo(null);
    setTempWrongOption(null);
    setWrongAttempts(0);
  };

  const handleSelectOption = async (option) => {
    if (isAnsweredCorrectly || tempWrongOption === option.id) return;
    if (option.isCorrect) {
      const scoreForThisQ = Math.max(100 - (wrongAttempts * 25), 25);
      setIsAnsweredCorrectly(true);
      setTotalScore(prev => prev + scoreForThisQ);
      setEarnedScoreInfo(`+${scoreForThisQ}`);
      setTempWrongOption(null);
      try {
        await API.post('/user/quiz/submit', {
          user_id: user.UserID,
          word_id: questions[currentIndex].wordId,
          score: scoreForThisQ,
        });
      } catch (err) { console.error('Lỗi lưu điểm:', err); }
    } else {
      setWrongAttempts(prev => prev + 1);
      setTempWrongOption(option.id);
      setTimeout(() => { setTempWrongOption(null); }, 600);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      setIsFinished(true);
    }
  };

  const pct = questions.length > 0
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;
  const avgScore = questions.length > 0
    ? Math.round(totalScore / questions.length)
    : 0;

  // ── VIEW: LESSONS ──────────────────────────────────────────────────────
  if (view === 'LESSONS') {
    return (
      <PageWrap>
        <PageHeader
          eyebrow="Quiz"
          title="Trắc nghiệm"
          sub="Mỗi bài 10 câu ngẫu nhiên. Trả lời đúng để nhận điểm, sai nhiều sẽ bị trừ điểm."
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 14 }}>
            <div style={{ animation: 'pulse 1.5s infinite', fontSize: 28, marginBottom: 12 }}>⏳</div>
            Đang tải danh sách bài học...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Ôn tập tổng hợp */}
            <div
              className="q-lesson-card ac-blue"
              style={{ animationDelay: '0s', borderColor: '#dce7f5', background: 'var(--blue-bg)' }}
              onClick={() => startQuiz(null)}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                background: 'rgba(42,92,170,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--blue)',
              }}>
                <Sparkles size={22} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
                  color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 5,
                }}>Ngẫu nhiên toàn hệ thống</div>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 3,
                }}>Ôn Tập Tổng Hợp</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>10 câu hỏi kết hợp</div>
              </div>
              <ChevronRight size={16} color="var(--border2)" />
            </div>

            {/* Bài học chi tiết */}
            {lessons.map((lesson, i) => (
              <div
                key={lesson.LessonID}
                className="q-lesson-card ac-gold"
                style={{ animationDelay: `${(i + 1) * 0.05}s` }}
                onClick={() => startQuiz(lesson)}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: 'var(--gold-bg)',
                  border: '1px solid #ecdcb0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gold)',
                }}>
                  <BookOpen size={22} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
                    color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 5,
                  }}>{lesson.CategoryName}</div>
                  <div style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{lesson.LessonName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
                    <span>{lesson.TotalQuestions} câu hỏi</span>
                    {lesson.AvgScore !== null && (
                      <span style={{
                        background: 'var(--green-bg)',
                        color: 'var(--green)',
                        border: '1px solid #b3dcc4',
                        borderRadius: 6, padding: '2px 8px',
                        fontWeight: 700, fontSize: 11,
                      }}>
                        TB: {lesson.AvgScore}đ
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--border2)" />
              </div>
            ))}
          </div>
        )}
      </PageWrap>
    );
  }

  // ── VIEW: QUIZ ─────────────────────────────────────────────────────────
  return (
    <PageWrap>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <button className="back-btn-q" onClick={backToLessons}>
          <ArrowLeft size={16} strokeWidth={2} /> Quay lại
        </button>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--muted)',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 99, padding: '5px 14px',
        }}>
          {selectedLesson ? selectedLesson.LessonName : 'Ôn Tập Tổng Hợp'}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 14 }}>
          <div style={{ animation: 'pulse 1.5s infinite', fontSize: 28, marginBottom: 12 }}>⏳</div>
          Đang chuẩn bị câu hỏi...
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 14 }}>
          Bộ câu hỏi này hiện đang trống.
        </div>
      ) : isFinished ? (

        /* ── RESULT ── */
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 28,
          padding: '48px 36px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          animation: 'scaleIn 0.45s cubic-bezier(.22,1,.36,1) both',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>🎯</div>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 30, fontWeight: 900, color: 'var(--ink)',
            marginBottom: 8, letterSpacing: '-0.5px',
          }}>Quiz hoàn thành</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 36 }}>
            Bạn đã trả lời {questions.length} câu hỏi
          </p>

          {/* score circle */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 36 }}>
            <svg width="140" height="140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="70" cy="70" r="58" fill="none"
                stroke={avgScore >= 70 ? 'var(--green)' : avgScore >= 40 ? 'var(--gold)' : 'var(--red)'}
                strokeWidth="8"
                strokeDasharray={`${(avgScore / 100) * 2 * Math.PI * 58} ${2 * Math.PI * 58}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 34, fontWeight: 900,
                color: avgScore >= 70 ? 'var(--green)' : avgScore >= 40 ? 'var(--gold)' : 'var(--red)',
                lineHeight: 1,
              }}>{avgScore}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>điểm TB</div>
            </div>
          </div>

          {/* score breakdown */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, marginBottom: 36,
          }}>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '16px',
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: 'var(--ink)', marginBottom: 4 }}>
                {totalScore}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Tổng điểm
              </div>
            </div>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '16px',
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: 'var(--ink)', marginBottom: 4 }}>
                {questions.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Số câu
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="q-btn q-btn-outline" style={{ flex: 1, border: 'none' }} onClick={() => startQuiz(selectedLesson)}>
              Làm lại
            </button>
            <button className="q-btn q-btn-primary" style={{ flex: 1 }} onClick={backToLessons}>
              Bài khác
            </button>
          </div>
        </div>

      ) : (

        /* ── QUESTION ── */
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>

          {/* progress + score row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 99, padding: '5px 14px',
              fontSize: 12, fontWeight: 700, color: 'var(--ink)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              {totalScore} điểm
            </div>
          </div>

          {/* progress bar */}
          <div className="q-prog-track" style={{ marginBottom: 32 }}>
            <div className="q-prog-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* question card */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 0,
          }}>
            {/* question number tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
              color: 'var(--muted)', textTransform: 'uppercase',
              border: '1px solid var(--border)',
              borderRadius: 99, padding: '4px 12px', marginBottom: 20,
            }}>
              Câu hỏi {currentIndex + 1}
            </div>

            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 24, fontWeight: 700, color: 'var(--ink)',
              textAlign: 'center', lineHeight: 1.35,
              marginBottom: 32,
            }}>
              {questions[currentIndex].text}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions[currentIndex].options.map((option) => {
                let cls = 'q-option';
                let Icon = null;

                if (isAnsweredCorrectly) {
                  if (option.isCorrect) {
                    cls += ' opt-correct';
                    Icon = <CheckCircle2 size={18} strokeWidth={2} />;
                  } else {
                    cls += ' opt-disabled';
                  }
                } else if (tempWrongOption === option.id) {
                  cls += ' opt-wrong';
                  Icon = <XCircle size={18} strokeWidth={2} />;
                }

                return (
                  <button
                    key={option.id}
                    className={cls}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnsweredCorrectly || tempWrongOption === option.id}
                  >
                    <span style={{ lineHeight: 1.5 }}>{option.text}</span>
                    {Icon && <span style={{ flexShrink: 0, marginLeft: 10 }}>{Icon}</span>}
                  </button>
                );
              })}
            </div>

            {/* next action */}
            {isAnsweredCorrectly && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 28,
                paddingTop: 24,
                borderTop: '1px solid var(--border)',
                animation: 'slideUp 0.3s ease both',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--green-bg)',
                  border: '1px solid #b3dcc4',
                  borderRadius: 10,
                  padding: '8px 16px',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--green)', fontFamily: 'Playfair Display, serif' }}>
                    {earnedScoreInfo}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>điểm</span>
                </div>

                <button className="q-btn q-btn-next" onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'}
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrap>
  );
  <Footer />
};

export default Quiz;