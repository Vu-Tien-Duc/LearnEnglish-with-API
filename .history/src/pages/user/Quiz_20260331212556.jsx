import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle2, XCircle, Award, ArrowRight, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

const Quiz = () => {
  const navigate = useNavigate();
  const user = getUser();

  // ── States quản lý luồng màn hình ──
  const [view, setView] = useState('LESSONS'); // 'LESSONS' | 'QUIZ'
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // ── States quản lý Quiz ──
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. TẢI DANH SÁCH BÀI HỌC KHI VÀO TRANG
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchLessons();
  }, [navigate]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/user/lessons', { params: { user_id: user.UserID } });
      setLessons(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách bài học:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. BẮT ĐẦU QUIZ THEO BÀI HỌC
  const startQuiz = async (lesson) => {
    setSelectedLesson(lesson);
    setView('QUIZ');
    setLoading(true);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await API.get('/user/quiz', { params: { lesson_id: lesson.LessonID } });
      setQuestions(res.data);
    } catch (err) {
      console.error('Lỗi tải quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. QUAY LẠI DANH SÁCH BÀI HỌC
  const backToLessons = () => {
    setView('LESSONS');
    setQuestions([]);
    setSelectedLesson(null);
    fetchLessons(); // Gọi lại để cập nhật AvgScore mới nhất
  };

  // 4. XỬ LÝ KHI CHỌN ĐÁP ÁN
  const handleSelectOption = async (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.isCorrect;
    if (isCorrect) setCorrectCount(prev => prev + 1);

    // Ghi điểm xuống Backend
    const score = isCorrect ? 10 : 0;
    const currentQ = questions[currentIndex];
    try {
      await API.post('/user/quiz/submit', {
        user_id: user.UserID,
        word_id: currentQ.wordId,
        score,
      });
    } catch (err) {
      console.error('Lỗi lưu điểm:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const playAudio = (audioUrl) => {
    if (audioUrl) new Audio(`http://localhost:5000/uploads/${audioUrl}`).play();
  };

  // ==========================================
  // GIAO DIỆN 1: CHỌN BÀI HỌC
  // ==========================================
  if (view === 'LESSONS') {
    return (
      <div style={styles.root}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.headerBox}>
            <h1 style={styles.title}>Trắc nghiệm kiến thức</h1>
            <p style={styles.subTitle}>Chọn một bài học để bắt đầu kiểm tra trí nhớ của bạn</p>
          </div>

          {loading ? (
             <div style={styles.loadingText}>Đang tải danh sách bài học...</div>
          ) : lessons.length === 0 ? (
             <div style={styles.emptyText}>Chưa có bài học nào được tạo.</div>
          ) : (
            <div style={styles.lessonGrid}>
              {lessons.map((lesson) => (
                <div key={lesson.LessonID} style={styles.lessonCard} onClick={() => startQuiz(lesson)}>
                  <div style={styles.lessonIcon}><BookOpen size={28} /></div>
                  <div style={styles.lessonInfo}>
                    <span style={styles.categoryTag}>{lesson.CategoryName}</span>
                    <h3 style={styles.lessonName}>{lesson.LessonName}</h3>
                    <div style={styles.lessonStats}>
                      <span>{lesson.TotalWords} câu hỏi</span>
                      {lesson.AvgScore !== null && (
                        <span style={styles.scoreTag}>Điểm TB: {lesson.AvgScore}</span>
                      )}
                    </div>
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
  // GIAO DIỆN 2: LÀM BÀI QUIZ & KẾT QUẢ
  // ==========================================
  return (
    <div style={styles.root}>
      <Navbar />
      <div style={styles.container}>
        
        {/* Thanh Topbar */}
        <div style={styles.quizTopBar}>
            <button onClick={backToLessons} style={styles.backBtn}>
                <ArrowLeft size={20} /> Quay lại
            </button>
            <h2 style={styles.quizLessonTitle}>{selectedLesson?.LessonName}</h2>
        </div>

        {loading ? (
          <div style={styles.loadingText}>Đang chuẩn bị câu hỏi...</div>
        ) : questions.length === 0 ? (
          <div style={styles.emptyText}>Bài học này chưa có câu hỏi trắc nghiệm nào.</div>
        ) : isFinished ? (
          
          // --- MÀN HÌNH KẾT QUẢ ---
          <div style={styles.finishCard}>
            <Award size={80} color={correctCount / questions.length >= 0.5 ? '#facc15' : '#9ca3af'} style={{margin: '0 auto 16px'}} />
            <h2 style={styles.finishTitle}>Hoàn thành!</h2>
            <p style={styles.finishSub}>Bạn trả lời đúng {correctCount} / {questions.length} câu.</p>
            <div style={styles.finishScore}>{Math.round((correctCount / questions.length) * 100)}%</div>
            <div style={styles.actionGroup}>
              <button onClick={() => startQuiz(selectedLesson)} style={styles.btnOutline}>Làm lại</button>
              <button onClick={backToLessons} style={styles.btnPrimary}>Bài khác</button>
            </div>
          </div>

        ) : (
          
          // --- MÀN HÌNH CÂU HỎI ---
          <div style={styles.quizWrapper}>
            {/* Progress */}
            <div style={styles.progressWrap}>
              <div style={styles.progressHeader}>
                <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
                <span style={{color: '#16a34a'}}>Đúng: {correctCount}</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            <div style={styles.questionBox}>
              {questions[currentIndex].audioUrl && (
                <button 
                  onClick={() => playAudio(questions[currentIndex].audioUrl)} 
                  style={styles.audioBtn}
                >
                  <Volume2 size={20} /> Nghe phát âm
                </button>
              )}
              
              <h3 style={styles.questionText}>{questions[currentIndex].text}</h3>

              <div style={styles.optionsGrid}>
                {questions[currentIndex].options.map((option) => {
                  let optStyle = { ...styles.optionBtn };
                  let Icon = null;

                  if (isAnswered) {
                    if (option.isCorrect) { 
                      optStyle = { ...optStyle, ...styles.optCorrect }; 
                      Icon = <CheckCircle2 color="#16a34a" size={20} />; 
                    }
                    else if (selectedOption?.id === option.id) { 
                      optStyle = { ...optStyle, ...styles.optWrong }; 
                      Icon = <XCircle color="#dc2626" size={20} />; 
                    }
                    else { 
                      optStyle = { ...optStyle, opacity: 0.5 }; 
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswered}
                      style={optStyle}
                    >
                      <span>{option.text}</span>
                      {Icon && <span>{Icon}</span>}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div style={styles.nextWrap}>
                  <button onClick={handleNext} style={styles.btnNext}>
                    {currentIndex < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'} <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ── Styles (CSS Nội bộ an toàn) ────────────────────────────────────────────────
const styles = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
  container: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  
  // Header Chọn bài
  headerBox: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
  subTitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
  loadingText: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '18px', marginTop: '40px' },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', marginTop: '40px' },

  // Lưới bài học
  lessonGrid: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  lessonCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' },
  lessonIcon: { backgroundColor: '#fef3c7', color: '#d97706', padding: '16px', borderRadius: '16px', marginRight: '20px' },
  lessonInfo: { flex: 1 },
  categoryTag: { fontSize: '12px', fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px' },
  lessonName: { fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '4px 0' },
  lessonStats: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280' },
  scoreTag: { backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' },

  // Quiz Topbar
  quizTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '32px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  quizLessonTitle: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 },

  // Quiz Wrapper
  quizWrapper: { width: '100%', maxWidth: '600px' },
  
  // Progress
  progressWrap: { width: '100%', marginBottom: '32px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' },
  progressTrack: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '10px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: '999px', transition: 'width 0.3s ease' },

  // Question Box
  questionBox: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' },
  audioBtn: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto 24px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', padding: '8px 16px', borderRadius: '999px', fontWeight: 600, cursor: 'pointer' },
  questionText: { fontSize: '24px', fontWeight: 'bold', color: '#111827', textAlign: 'center', margin: '0 0 32px' },
  
  // Options
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
  optionBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '16px', fontSize: '18px', fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
  optCorrect: { backgroundColor: '#dcfce7', borderColor: '#22c55e', color: '#166534', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)' },
  optWrong: { backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' },

  // Next Button
  nextWrap: { display: 'flex', justifyContent: 'flex-end', marginTop: '32px' },
  btnNext: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' },

  // Finish Screen
  finishCard: { backgroundColor: '#ffffff', padding: '48px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', margin: '0 auto' },
  finishTitle: { fontSize: '30px', fontWeight: 800, color: '#111827', margin: '0 0 8px' },
  finishSub: { color: '#6b7280', margin: '0 0 24px', fontSize: '16px' },
  finishScore: { fontSize: '60px', fontWeight: 900, color: '#2563eb', margin: '0 0 32px' },
  actionGroup: { display: 'flex', gap: '16px' },
  btnOutline: { flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', backgroundColor: '#fff', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  btnPrimary: { flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
};

export default Quiz;