import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Trophy, Brain, Sparkles } from 'lucide-react';
import api from '../../../../english-app-frontend/src/services/api';

const MemoryGame = () => {
    const navigate = useNavigate();
    
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedIndices, setMatchedIndices] = useState([]);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isWon, setIsWon] = useState(false);

    useEffect(() => {
        fetchAndInitializeGame();
    }, []);

    const fetchAndInitializeGame = async () => {
        setLoading(true);
        try {
            const response = await api.get('/vocabulary');
            const wordList = response.data;
            if (wordList.length >= 6) {
                initializeGame(wordList);
            } else {
                alert("Cần ít nhất 6 từ vựng để chơi Memory Game!");
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu game:", error);
        } finally {
            setLoading(false);
        }
    };

    const initializeGame = (wordList) => {
        const shuffledWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 6);
        const gameCards = [];
        shuffledWords.forEach((word) => {
            gameCards.push({ id: `${word.WordID}-en`, text: word.Word, matchId: word.WordID, type: 'en' });
            gameCards.push({ id: `${word.WordID}-vi`, text: word.Meaning, matchId: word.WordID, type: 'vi' });
        });
        const shuffledCards = gameCards.sort(() => 0.5 - Math.random());
        setCards(shuffledCards);
        setFlippedIndices([]);
        setMatchedIndices([]);
        setMoves(0);
        setScore(0);
        setIsWon(false);
    };

    const handleCardClick = (index) => {
        if (flippedIndices.includes(index) || matchedIndices.includes(index) || flippedIndices.length === 2) {
            return;
        }

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const firstIndex = newFlipped[0];
            const secondIndex = newFlipped[1];

            if (cards[firstIndex].matchId === cards[secondIndex].matchId) {
                const newMatched = [...matchedIndices, firstIndex, secondIndex];
                setMatchedIndices(newMatched);
                setFlippedIndices([]);
                const currentScore = score + 20;
                setScore(currentScore);

                if (newMatched.length === cards.length) {
                    setTimeout(async () => {
                        setIsWon(true);
                        try {
                            await api.post('/game/score', { score: currentScore });
                        } catch (error) {
                            console.error("Lỗi khi lưu điểm:", error);
                        }
                    }, 500);
                }
            } else {
                setTimeout(() => setFlippedIndices([]), 1000);
            }
        }
    };

    if (loading) return <div className="text-center mt-20 text-xl font-bold text-green-600">Đang chia bài...</div>;
    if (cards.length === 0) return <div className="text-center mt-20">Không đủ dữ liệu từ vựng.</div>;

    return (
        <div className="flex-1 flex flex-col items-center py-10 px-4 bg-slate-50 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-3xl flex items-center justify-between mb-8">
                <button onClick={() => navigate('/mini-game')} className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition font-medium">
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2 rounded-full font-semibold shadow-sm border border-gray-200">
                        <Brain size={20} className="text-blue-500" /> Lượt lật: {moves}
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-5 py-2 rounded-full font-bold shadow-sm border border-yellow-200">
                        <Trophy size={22} className="text-yellow-500" /> Điểm: {score}
                    </div>
                </div>
            </div>

            {isWon && (
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center mb-8 animate-bounce">
                    <Sparkles size={60} className="text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Tuyệt vời!</h2>
                    <p className="text-gray-500 mb-6">Bạn đạt {score} điểm.</p>
                    <button onClick={fetchAndInitializeGame} className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center justify-center gap-2">
                        <RefreshCcw size={20} /> Chơi ván mới
                    </button>
                </div>
            )}

            <div className="w-full max-w-3xl">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {cards.map((card, index) => {
                        const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                        const isMatched = matchedIndices.includes(index);
                        return (
                            <div 
                                key={index}
                                onClick={() => handleCardClick(index)}
                                className={`relative w-full aspect-[4/3] cursor-pointer group ${isMatched ? 'opacity-70 scale-95' : 'hover:-translate-y-1'} transition-all duration-300`}
                                style={{ perspective: '1000px' }}
                            >
                                <div className={`relative w-full h-full transition-transform duration-500`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                                    {/* Mặt Úp */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow border-2 border-green-300 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                                        <Brain size={40} className="text-green-200 opacity-50" />
                                    </div>
                                    {/* Mặt Lật */}
                                    <div className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center p-4 border-2 ${isMatched ? 'bg-green-50 border-green-400' : 'bg-white border-blue-200'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <span className={`text-center font-bold ${card.type === 'en' ? 'text-xl md:text-2xl text-blue-700' : 'text-lg md:text-xl text-gray-800'}`}>
                                            {card.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MemoryGame;