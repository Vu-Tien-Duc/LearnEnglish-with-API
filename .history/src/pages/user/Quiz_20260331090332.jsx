import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react';
import api from '../../../../english-app-frontend/src/services/api';

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get('/quiz');
                setQuestions(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải bài trắc nghiệm", error);
                setLoading(false);
            }
        };
        fetchQuiz();
    }, []);

    const handleSelectOption = (option) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        if (option.isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            // [ĐÃ SỬA] Tính điểm dựa trên state score hiện tại vì đã được cộng ở handleSelectOption
            const finalPercent = Math.round((score / questions.length) * 100);
            setIsFinished(true);
            
            try {
                // Lưu điểm vào bảng UserLearning thông qua API
                await api.post('/quiz/submit', { score: finalPercent });
            } catch (error) {
                console.error("Lỗi khi lưu điểm", error);
            }
        }
    };

    const playAudio = (audioUrl) => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    if (loading) return <div className="text-center mt-20 text-xl font-semibold">Đang chuẩn bị câu hỏi...</div>;
    if (questions.length === 0) return <div className="text-center mt-20">Chưa có dữ liệu câu hỏi trắc nghiệm.</div>;

    if (isFinished) {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full text-center">
                    <Award size={80} className={`mx-auto mb-4 ${percent >= 50 ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Hoàn thành!</h2>
                    <p className="text-gray-500 mb-6">Bạn đã trả lời đúng {score} / {questions.length} câu hỏi.</p>
                    <div className="text-6xl font-black text-blue-600 mb-8">{percent}%</div>
                    <div className="flex gap-4">
                        <button onClick={() => window.location.reload()} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Làm lại</button>
                        <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">Về Tổng quan</button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="flex-1 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-2xl mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
                    <span>Đúng: {score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                {currentQuestion.audioUrl && (
                    <button onClick={() => playAudio(currentQuestion.audioUrl)} className="mb-6 flex items-center gap-2 mx-auto bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition">
                        <Volume2 size={20} /> Nghe phát âm
                    </button>
                )}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">{currentQuestion.text}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option) => {
                        let buttonStyle = "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300";
                        let Icon = null;
                        if (isAnswered) {
                            if (option.isCorrect) {
                                buttonStyle = "bg-green-100 border-green-500 text-green-800 shadow-sm";
                                Icon = <CheckCircle2 className="text-green-600" size={20} />;
                            } else if (selectedOption?.id === option.id) {
                                buttonStyle = "bg-red-100 border-red-500 text-red-800 shadow-sm";
                                Icon = <XCircle className="text-red-600" size={20} />;
                            } else {
                                buttonStyle = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                            }
                        }
                        return (
                            <button key={option.id} onClick={() => handleSelectOption(option)} disabled={isAnswered} className={`relative flex items-center justify-between p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 text-left ${buttonStyle}`}>
                                <span>{option.text}</span>
                                {Icon && <span>{Icon}</span>}
                            </button>
                        );
                    })}
                </div>
                {isAnswered && (
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleNext} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
                            {currentIndex < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'} <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;