import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react';
import API from '../../services/api';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  // Đọc lesson_id từ URL query (/quiz?lesson_id=1)
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('lesson_id');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get('/user/quiz', { params: { ...(lessonId && { lesson_id: lessonId }) } })
      .then(res => setQuestions(res.data))
      .catch(err => console.error('Lỗi tải quiz:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectOption = async (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.isCorrect;
    if (isCorrect) setCorrectCount(prev => prev + 1);

    // Ghi từng câu vào UserLearning: đúng = 10, sai = 0
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

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Đang chuẩn bị câu hỏi...</div>;
  if (questions.length === 0) return <div className="text-center mt-20">Chưa có dữ liệu câu hỏi trắc nghiệm.</div>;

  // ── Kết thúc ──
  if (isFinished) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full text-center">
          <Award size={80} className={`mx-auto mb-4 ${percent >= 50 ? 'text-yellow-400' : 'text-gray-400'}`} />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Hoàn thành!</h2>
          <p className="text-gray-500 mb-6">Bạn trả lời đúng {correctCount} / {questions.length} câu.</p>
          <div className="text-6xl font-black text-blue-600 mb-8">{percent}%</div>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Làm lại</button>
            <button onClick={() => navigate('/')} className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">Trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
          <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
          <span>Đúng: {correctCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {currentQ.audioUrl && (
          <button
            onClick={() => playAudio(currentQ.audioUrl)}
            className="mb-6 flex items-center gap-2 mx-auto bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition"
          >
            <Volume2 size={20} /> Nghe phát âm
          </button>
        )}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">{currentQ.text}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((option) => {
            let style = 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300';
            let Icon = null;
            if (isAnswered) {
              if (option.isCorrect) { style = 'bg-green-100 border-green-500 text-green-800 shadow-sm'; Icon = <CheckCircle2 className="text-green-600" size={20} />; }
              else if (selectedOption?.id === option.id) { style = 'bg-red-100 border-red-500 text-red-800 shadow-sm'; Icon = <XCircle className="text-red-600" size={20} />; }
              else { style = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'; }
            }
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`relative flex items-center justify-between p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 text-left ${style}`}
              >
                <span>{option.text}</span>
                {Icon && <span>{Icon}</span>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
            >
              {currentIndex < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'} <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;