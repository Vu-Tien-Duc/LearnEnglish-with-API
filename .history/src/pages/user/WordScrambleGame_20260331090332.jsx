import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Trophy, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import api from '../../../../english-app-frontend/src/services/api';

const WordScrambleGame = () => {
    const navigate = useNavigate();
    
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState(null);
    const [scrambledWord, setScrambledWord] = useState('');
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const response = await api.get('/vocabulary');
                const wordList = response.data.filter(w => w.Word.length > 2);
                setWords(wordList);
                if (wordList.length > 0) {
                    pickNewWord(wordList);
                }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải dữ liệu game:", error);
                setLoading(false);
            }
        };
        fetchWords();
    }, []);

    const scramble = (word) => {
        let shuffled;
        let original = word.toLowerCase();
        do {
            let arr = original.split('');
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            shuffled = arr.join('');
        } while (shuffled === original && original.length > 1);
        return shuffled;
    };

    const pickNewWord = (wordList = words) => {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        const selected = wordList[randomIndex];
        setCurrentWord(selected);
        setScrambledWord(scramble(selected.Word));
        setUserInput('');
        setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        if (userInput.toLowerCase() === currentWord.Word.toLowerCase()) {
            setMessage({ text: 'Tuyệt vời! Bạn đã trả lời đúng 🎉', type: 'success' });
            
            // Lưu điểm lên server ngay khi đúng
            const newScore = 10;
            setScore(prev => prev + newScore);
            try {
                await api.post('/game/score', { score: newScore });
            } catch (err) {
                console.error("Không thể lưu điểm:", err);
            }

            setTimeout(() => {
                pickNewWord();
            }, 1500);
        } else {
            setMessage({ text: 'Sai rồi! Hãy thử lại nhé.', type: 'error' });
            setUserInput('');
        }
    };

    if (loading) return <div className="text-center mt-20 text-xl font-bold text-blue-600">Đang chuẩn bị màn chơi...</div>;
    if (!currentWord) return <div className="text-center mt-20">Không đủ dữ liệu từ vựng.</div>;

    return (
        <div className="flex-1 flex flex-col items-center py-10 px-4 bg-slate-50 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-2xl flex items-center justify-between mb-8">
                <button 
                    onClick={() => navigate('/mini-game')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium"
                >
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-5 py-2 rounded-full font-bold text-lg shadow-sm border border-yellow-200">
                    <Trophy size={22} className="text-yellow-500" />
                    Điểm tích lũy: {score}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-10 text-center relative overflow-hidden">
                    <h2 className="text-blue-100 font-medium mb-4 tracking-widest uppercase text-sm">Hãy sắp xếp lại các chữ cái sau</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {scrambledWord.split('').map((char, index) => (
                            <span key={index} className="inline-flex items-center justify-center w-14 h-16 bg-white rounded-xl text-3xl font-black text-blue-700 shadow-lg uppercase">
                                {char}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-8 bg-gray-50 py-3 px-4 rounded-xl border border-gray-200 w-fit mx-auto">
                        <Lightbulb size={20} className="text-yellow-500" />
                        <span>Gợi ý: <strong>{currentWord.Meaning}</strong></span>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Nhập từ tiếng Anh chính xác..."
                            className="w-full text-center text-2xl font-bold py-4 px-6 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition"
                            autoComplete="off"
                            autoFocus
                        />
                        <div className="flex gap-4 mt-2">
                            <button type="button" onClick={() => pickNewWord()} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                                <RefreshCcw size={20} /> Bỏ qua
                            </button>
                            <button type="submit" className="flex-[2] py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md">
                                Kiểm tra đáp án
                            </button>
                        </div>
                    </form>

                    {message.text && (
                        <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-2 font-bold animate-bounce ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WordScrambleGame;