import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import API from '../../services/api';
import Flashcard from '../../components/Flashcard';
import Navbar from '../../components/Navbar';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

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
  }, [navigate]);

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
const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    
    // Header
    headerBox: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
    subTitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
    
    // Trạng thái (Loading / Trống)
    loadingText: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '18px', marginTop: '40px' },
    emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', marginTop: '40px' },

    // Lưới bài học
    lessonGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    lessonCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' },
    lessonIcon: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px', marginRight: '20px' },
    lessonInfo: { flex: 1 },
    categoryTag: { fontSize: '12px', fontWeight: 'bold', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' },
    lessonName: { fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '4px 0' },
    wordCount: { fontSize: '14px', color: '#6b7280', margin: 0 },

    // Thanh điều hướng học
    studyTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
    studyLessonTitle: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 },
    progressBadge: { display: 'inline-flex', alignItems: 'center', padding: '8px 20px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', fontSize: '15px', fontWeight: 'bold' }
};

export default StudyRoom;