import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowRight, ArrowLeft, RotateCw, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

// 🔥 IMPORT NAVBAR 
import Navbar from '../../components/Navbar';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

export default function StudyRoom() {
  const navigate = useNavigate();
  const user = getUser();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Đọc lesson_id từ URL query nếu có (ví dụ: /study?lesson_id=1)
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('lesson_id');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    
    // Gọi API lấy danh sách từ vựng
    API.get('/user/vocabulary', { params: { user_id: user.UserID, ...(lessonId && { lesson_id: lessonId }) } })
      .then(res => setWords(res.data))
      .catch(err => console.error('Lỗi tải từ vựng:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false); // Úp thẻ lại trước khi sang từ mới
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = (e, audioUrl) => {
    e.stopPropagation(); // Ngăn không cho click này kích hoạt lật thẻ
    if (audioUrl) new Audio(`http://localhost:5000/uploads/${audioUrl}`).play();
  };

  // ── Giao diện Loading / Trống ──
  if (loading) {
    return (
        <div style={styles.root}>
            <Navbar />
            <div style={{...styles.container, justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#2563eb'}}>
                Đang chuẩn bị bộ thẻ...
            </div>
        </div>
    );
  }
  
  if (words.length === 0) {
    return (
        <div style={styles.root}>
            <Navbar />
            <div style={{...styles.container, justifyContent: 'center', textAlign: 'center', color: '#6b7280'}}>
                Chưa có từ vựng nào trong danh sách này.
            </div>
        </div>
    );
  }

  // ── Giao diện Hoàn thành ──
  if (currentIndex === words.length) {
    return (
      <div style={styles.root}>
        <Navbar />
        <div style={{...styles.container, justifyContent: 'center'}}>
          <div style={styles.finishCard}>
            <CheckCircle2 size={80} color="#22c55e" style={{margin: '0 auto 16px'}} />
            <h2 style={{fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 8px'}}>Hoàn thành bộ thẻ!</h2>
            <p style={{color: '#6b7280', marginBottom: '32px'}}>Bạn đã ôn tập xong {words.length} từ vựng.</p>
            <div style={{display: 'flex', gap: '16px'}}>
              <button onClick={() => {setCurrentIndex(0); setIsFlipped(false);}} style={styles.btnOutline}>Ôn tập lại</button>
              <button onClick={() => navigate('/quiz')} style={styles.btnPrimary}>Làm bài Quiz</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div style={styles.root}>
      <Navbar />
      
      <div style={styles.container}>
        {/* Progress Bar */}
        <div style={styles.progressWrap}>
          <div style={styles.progressHeader}>
            <span>Từ vựng {currentIndex + 1} / {words.length}</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${((currentIndex + 1) / words.length) * 100}%` }} />
          </div>
        </div>

        {/* Flashcard 3D */}
        <div style={styles.cardWrapper} onClick={handleFlip}>
          <div style={{ ...styles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
            
            {/* Mặt trước (Tiếng Anh) */}
            <div style={{...styles.cardFace, ...styles.cardFront}}>
              <div style={styles.flipHint}><RotateCw size={16} /> Nhấp để lật</div>
              
              <h2 style={styles.wordTitle}>{currentWord.Word}</h2>
              {currentWord.Pronunciation && <p style={styles.pronunciation}>/{currentWord.Pronunciation}/</p>}
              
              {/* Nút loa phát âm (Hiển thị nếu API có trả về AudioUrl) */}
              <button 
                  onClick={(e) => playAudio(e, currentWord.AudioUrl || currentWord.audioUrl)} 
                  style={styles.audioBtn}
              >
                  <Volume2 size={24} />
              </button>
            </div>

            {/* Mặt sau (Tiếng Việt) */}
            <div style={{...styles.cardFace, ...styles.cardBack}}>
              <div style={styles.flipHint}><RotateCw size={16} /> Nhấp để lật</div>
              <h2 style={styles.meaningTitle}>{currentWord.Meaning}</h2>
              
              {currentWord.Example && (
                <div style={styles.exampleBox}>
                  <strong>Ví dụ:</strong> {currentWord.Example}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Điều hướng */}
        <div style={styles.navGroup}>
          <button onClick={handlePrev} disabled={currentIndex === 0} style={{...styles.navBtn, opacity: currentIndex === 0 ? 0.3 : 1}}>
            <ArrowLeft size={24} /> Quay lại
          </button>
          
          <button onClick={() => setCurrentIndex(prev => prev + 1)} style={{...styles.navBtn, ...styles.navBtnNext}}>
            {currentIndex === words.length - 1 ? 'Hoàn thành' : 'Từ tiếp theo'} <ArrowRight size={24} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Styles (CSS Nội bộ an toàn) ────────────────────────────────────────────────
const styles = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
  container: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  
  // Progress
  progressWrap: { width: '100%', maxWidth: '600px', marginBottom: '40px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' },
  progressTrack: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '10px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: '999px', transition: 'width 0.3s ease' },

  // Flashcard 3D
  cardWrapper: { width: '100%', maxWidth: '600px', height: '400px', perspective: '1000px', cursor: 'pointer', marginBottom: '40px' },
  cardInner: { width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d', position: 'relative' },
  cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', boxSizing: 'border-box', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
  
  cardFront: { backgroundColor: '#ffffff', border: '2px solid #e5e7eb' },
  cardBack: { backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', transform: 'rotateY(180deg)' }, // Quay mặt sau lại 180 độ
  
  flipHint: { position: 'absolute', top: '24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#9ca3af', fontWeight: 600 },
  wordTitle: { fontSize: '48px', fontWeight: 900, color: '#111827', margin: '0 0 12px', textAlign: 'center' },
  pronunciation: { fontSize: '20px', color: '#6b7280', fontStyle: 'italic', margin: '0 0 32px' },
  audioBtn: { backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' },
  
  meaningTitle: { fontSize: '36px', fontWeight: 800, color: '#1d4ed8', margin: '0 0 24px', textAlign: 'center' },
  exampleBox: { backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '16px', color: '#4b5563', fontSize: '16px', border: '1px dashed #93c5fd', width: '100%', maxWidth: '400px', textAlign: 'center' },

  // Navigation
  navGroup: { display: 'flex', gap: '20px', width: '100%', maxWidth: '600px' },
  navBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  navBtnNext: { backgroundColor: '#2563eb', color: '#ffffff', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' },

  // Finish screen
  finishCard: { backgroundColor: '#ffffff', padding: '48px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' },
  btnOutline: { flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', backgroundColor: '#fff', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer' },
  btnPrimary: { flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};