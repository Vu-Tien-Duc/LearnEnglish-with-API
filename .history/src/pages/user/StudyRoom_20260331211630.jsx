import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api'; // Đã sửa đường dẫn
import Flashcard from '../../components/Flashcard'; // Đã sửa đường dẫn
import Navbar from '../../components/Navbar'; // Gọi thêm Navbar

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

const StudyRoom = () => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    const fetchVocab = async () => {
      try {
        // Đã sửa lại endpoint gọi từ vựng theo API chuẩn của User
        const response = await API.get('/user/vocabulary', { params: { user_id: user.UserID } });
        setWords(response.data);
      } catch (error) {
        console.error("Lỗi khi tải từ vựng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, [navigate]);

  const handleUpdateProgress = async (wordId, status) => {
    try {
      // Gửi yêu cầu cập nhật tiến độ xuống Backend
      await API.post('/user/progress/update', { wordId, status, user_id: user.UserID });
      
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        alert("🎉 Chúc mừng! Bạn đã hoàn thành danh sách từ hôm nay.");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ:", error);
      alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại!");
    }
  };

  const handleToggleFavorite = async (wordId) => {
    try {
      await API.post('/user/favorites/toggle', { wordId, user_id: user.UserID });
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);
    }
  };

  if (loading) return (
    <div style={styles.root}>
        <Navbar />
        <div style={{...styles.container, justifyContent: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '20px'}}>
            Đang tải bộ thẻ...
        </div>
    </div>
  );

  if (words.length === 0) return (
    <div style={styles.root}>
        <Navbar />
        <div style={{...styles.container, justifyContent: 'center', color: '#6b7280', fontSize: '18px'}}>
            Hiện tại chưa có từ vựng nào trong danh sách học.
        </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.headerBox}>
          <h1 style={styles.title}>Phòng Học Flashcard</h1>
          <div style={styles.progressBadge}>
            Tiến độ: {currentIndex + 1} / {words.length}
          </div>
        </div>

        <Flashcard 
          key={words[currentIndex].WordID} 
          wordInfo={words[currentIndex]} 
          onUpdateProgress={handleUpdateProgress}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
};

const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    headerBox: { textAlign: 'center', marginBottom: '32px' },
    title: { fontSize: '30px', fontWeight: 800, color: '#111827', margin: '0 0 12px' },
    progressBadge: { display: 'inline-flex', alignItems: 'center', padding: '6px 16px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', fontSize: '14px', fontWeight: 'bold' }
};

export default StudyRoom;