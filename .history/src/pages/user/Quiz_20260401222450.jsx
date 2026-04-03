import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, ArrowRight, BookOpen, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

const Quiz = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [view, setView] = useState('LESSONS');
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State quản lý đúng/sai và số lần sai
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false); 
  const [tempWrongOption, setTempWrongOption] = useState(null); 
  const [wrongAttempts, setWrongAttempts] = useState(0); // <-- THÊM MỚI: Đếm số lần chọn sai
  
  const [totalScore, setTotalScore] = useState(0); 
  const [earnedScoreInfo, setEarnedScoreInfo] = useState(null); 

  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchLessons();
  }, [navigate]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/user/quiz-lessons', { params: { user_id: user.UserID } });
      setLessons(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách bài học:', err);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Lỗi tải quiz:', err);
    } finally {
      setLoading(false);
    }
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
    setWrongAttempts(0); // <-- Reset số lần sai khi sang câu mới
  };

  const handleSelectOption = async (option) => {
    if (isAnsweredCorrectly || tempWrongOption === option.id) return;

    if (option.isCorrect) {
      // 1. CHỌN ĐÚNG
      // Tính điểm: Lấy 100 trừ đi (số lần sai * 25). Nếu tính ra nhỏ hơn 25 thì giữ ở mức 25.
      const scoreForThisQ = Math.max(100 - (wrongAttempts * 25), 25);
      
      setIsAnsweredCorrectly(true);
      setTotalScore(prev => prev + scoreForThisQ);
      setEarnedScoreInfo(`+${scoreForThisQ}`);
      setTempWrongOption(null);

      try {
        await API.post('/user/quiz/submit', {
          user_id: user.UserID,
          word_id: questions[currentIndex].wordId,
          score: scoreForThisQ, // Truyền điểm thực tế xuống Backend
        });
      } catch (err) { console.error('Lỗi lưu điểm:', err); }
      
    } else {
      // 2. CHỌN SAI
      setWrongAttempts(prev => prev + 1); // <-- Tăng bộ đếm lỗi
      setTempWrongOption(option.id); 

      setTimeout(() => {
        setTempWrongOption(null);
      }, 600); 
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

  // ... PHẦN GIAO DIỆN BÊN DƯỚI GIỮ NGUYÊN NHƯ CŨ ...
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
            <p style={styles.subTitle}>Mỗi bài 10 câu ngẫu nhiên. Trả lời đúng để nhận điểm, sai sẽ bị trừ điểm!</p>
          </div>

          {loading ? (
             <div style={styles.loadingText}>Đang tải danh sách bài học...</div>
          ) : (
            <div style={styles.lessonGrid}>
              {/* Ôn tập tổng hợp */}
              <div style={{...styles.lessonCard, borderColor: '#bfdbfe', backgroundColor: '#eff6ff'}} onClick={() => startQuiz(null)}>
                <div style={{...styles.lessonIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                  <Sparkles size={28} />
                </div>
                <div style={styles.lessonInfo}>
                  <span style={{...styles.categoryTag, color: '#2563eb'}}>Ngẫu nhiên toàn hệ thống</span>
                  <h3 style={styles.lessonName}>Ôn Tập Tổng Hợp</h3>
                  <div style={styles.lessonStats}>
                    <span>10 câu hỏi kết hợp</span>
                  </div>
                </div>
                <ChevronRight size={24} color="#3b82f6" />
              </div>

              {/* Bài học chi tiết */}
              {lessons.map((lesson) => (
                <div key={lesson.LessonID} style={styles.lessonCard} onClick={() => startQuiz(lesson)}>
                  <div style={styles.lessonIcon}><BookOpen size={28} /></div>
                  <div style={styles.lessonInfo}>
                    <span style={styles.categoryTag}>{lesson.CategoryName}</span>
                    <h3 style={styles.lessonName}>{lesson.LessonName}</h3>
                    <div style={styles.lessonStats}>
                      <span>{lesson.TotalQuestions} câu hỏi</span> 
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
        
        <div style={styles.quizTopBar}>
            <button onClick={backToLessons} style={styles.backBtn}>
                <ArrowLeft size={20} /> Quay lại
            </button>
            <h2 style={styles.quizLessonTitle}>
              {selectedLesson ? selectedLesson.LessonName : 'Ôn Tập Tổng Hợp'}
            </h2>
        </div>

        {loading ? (
          <div style={styles.loadingText}>Đang chuẩn bị câu hỏi...</div>
        ) : questions.length === 0 ? (
          <div style={styles.emptyText}>Bộ câu hỏi này hiện đang trống.</div>
        ) : isFinished ? (
          
          <div style={styles.finishCard}>
            <Award size={80} color="#facc15" style={{margin: '0 auto 16px'}} />
            <h2 style={styles.finishTitle}>Hoàn thành Quiz!</h2>
            <p style={styles.finishSub}>Tổng điểm của bạn trong bài này:</p>
            <div style={styles.finishScore}>{totalScore}</div>
            <div style={styles.actionGroup}>
              <button onClick={() => startQuiz(selectedLesson)} style={styles.btnOutline}>Làm lại</button>
              <button onClick={backToLessons} style={styles.btnPrimary}>Bài khác</button>
            </div>
          </div>

        ) : (
          
          <div style={styles.quizWrapper}>
            <div style={styles.progressWrap}>
              <div style={styles.progressHeader}>
                <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
                <span style={{color: '#2563eb'}}>Điểm tích lũy: {totalScore}</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            <div style={styles.questionBox}>
              
              <h3 style={styles.questionText}>{questions[currentIndex].text}</h3>

              <div style={styles.optionsGrid}>
                {questions[currentIndex].options.map((option) => {
                  let optStyle = { ...styles.optionBtn };
                  let Icon = null;

                  if (isAnsweredCorrectly) {
                    // Logic khi đã trả lời đúng
                    if (option.isCorrect) {
                      optStyle = { ...optStyle, ...styles.optCorrect }; 
                      Icon = <CheckCircle2 color="#16a34a" size={20} />; 
                    } else {
                      optStyle = { ...optStyle, opacity: 0.5, cursor: 'not-allowed' }; 
                    }
                  } else if (tempWrongOption === option.id) {
                    // LOGIC NHÁY ĐỎ KHI TRẢ LỜI SAI (Chỉ có tác dụng trong 600ms)
                    optStyle = { ...optStyle, ...styles.optWrong }; 
                    Icon = <XCircle color="#dc2626" size={20} />; 
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option)}
                      // Khóa nút nếu đã trả lời đúng hoặc đang trong 600ms nháy đỏ
                      disabled={isAnsweredCorrectly || tempWrongOption === option.id} 
                      style={optStyle}
                    >
                      <span>{option.text}</span>
                      {Icon && <span>{Icon}</span>}
                    </button>
                  );
                })}
              </div>

              {isAnsweredCorrectly && (
                <div style={styles.nextWrap}>
                  <div style={styles.earnedScoreLabel}>{earnedScoreInfo} điểm</div>
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
// ── Styles ────────────────────────────────────────────────
const styles = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
  container: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  headerBox: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
  subTitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
  loadingText: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '18px', marginTop: '40px' },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', marginTop: '40px' },
  lessonGrid: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  
  // Đã sửa border thành 3 thuộc tính riêng biệt
  lessonCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' },
  
  lessonIcon: { backgroundColor: '#fef3c7', color: '#d97706', padding: '16px', borderRadius: '16px', marginRight: '20px' },
  lessonInfo: { flex: 1 },
  categoryTag: { fontSize: '12px', fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px' },
  lessonName: { fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '4px 0' },
  lessonStats: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280' },
  scoreTag: { backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' },
  quizTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '32px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  quizLessonTitle: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 },
  quizWrapper: { width: '100%', maxWidth: '600px' },
  progressWrap: { width: '100%', marginBottom: '32px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' },
  progressTrack: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '10px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: '999px', transition: 'width 0.3s ease' },
  
  // Đã sửa border thành 3 thuộc tính riêng biệt
  questionBox: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderWidth: '1px', borderStyle: 'solid', borderColor: '#f3f4f6' },
  
  questionText: { fontSize: '24px', fontWeight: 'bold', color: '#111827', textAlign: 'center', margin: '0 0 32px' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
  
  // Đã sửa border thành 3 thuộc tính riêng biệt cho các nút đáp án
  optionBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#f9fafb', borderWidth: '2px', borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: '16px', fontSize: '18px', fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
  optCorrect: { backgroundColor: '#dcfce7', borderColor: '#22c55e', color: '#166534', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)' },
  optWrong: { backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)', opacity: 0.8, cursor: 'not-allowed' },
  
  nextWrap: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' },
  
  // Đã sửa border thành 3 thuộc tính riêng biệt
  earnedScoreLabel: { fontSize: '22px', fontWeight: 900, color: '#16a34a', backgroundColor: '#dcfce7', padding: '6px 16px', borderRadius: '12px', borderWidth: '2px', borderStyle: 'solid', borderColor: '#bbf7d0' },
  
  btnNext: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' },
  finishCard: { backgroundColor: '#ffffff', padding: '48px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', margin: '0 auto' },
  finishTitle: { fontSize: '30px', fontWeight: 800, color: '#111827', margin: '0 0 8px' },
  finishSub: { color: '#6b7280', margin: '0 0 24px', fontSize: '16px' },
  finishScore: { fontSize: '60px', fontWeight: 900, color: '#2563eb', margin: '0 0 32px' },
  actionGroup: { display: 'flex', gap: '16px' },
  
  // Đã sửa border thành 3 thuộc tính riêng biệt
  btnOutline: { flex: 1, padding: '14px', borderRadius: '12px', borderWidth: '2px', borderStyle: 'solid', borderColor: '#e5e7eb', backgroundColor: '#fff', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  btnPrimary: { flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
};

export default Quiz;