import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// [QUAN TRỌNG]: Sửa lại đường dẫn nhảy ra ngoài thư mục pages
import api from '../services/api';
import Flashcard from '../components/Flashcard';

const StudyRoom = () => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const fetchVocab = async () => {
      try {
        const response = await api.get('/vocabulary');
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
      // Gửi yêu cầu cập nhật tiến độ xuống Backend Node.js
      await api.post('/user/progress/update', { wordId, status });
      
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        alert("Chúc mừng! Bạn đã hoàn thành danh sách từ hôm nay. Đang quay về Dashboard...");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ:", error);
      alert("Hết phiên làm việc. Vui lòng đăng nhập lại!");
      navigate('/');
    }
  };

  const handleToggleFavorite = async (wordId) => {
    try {
      await api.post('/user/favorites/toggle', { wordId });
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (words.length === 0) return (
    <div className="text-center mt-20">
      <p className="text-gray-500">Hiện tại chưa có từ vựng nào trong danh sách học.</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center py-10 px-4 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Phòng Học Flashcard</h1>
        <div className="inline-flex items-center px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
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
  );
};

export default StudyRoom;