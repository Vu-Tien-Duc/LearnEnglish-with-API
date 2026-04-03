// src/pages/MiniGames.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad, Sparkles, BrainCircuit, Bot, Trophy } from 'lucide-react';
import api from '../../../../english-app-frontend/src/services/api';

const MiniGames = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    // 1. Lấy bảng xếp hạng thật từ API
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/game/leaderboard');
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Lỗi tải bảng xếp hạng:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };
        fetchLeaderboard();
    }, []);

    // 2. Danh sách các Game
    const games = [
        {
            id: 'word-scramble',
            name: '🎮 TRÒ CHƠI 1: ĐẢO CHỮ',
            description: 'AI đã xáo trộn các chữ cái. Hãy sắp xếp lại để tìm từ tiếng Anh đúng!',
            icon: Sparkles,
            color: 'from-blue-400 to-blue-600'
        },
        {
            id: 'memory-game',
            name: '🧠 TRÒ CHƠI 2: LẬT THẺ NHỚ',
            description: 'Tìm các cặp thẻ khớp nhau giữa từ tiếng Anh và nghĩa tiếng Việt.',
            icon: BrainCircuit,
            color: 'from-green-400 to-green-600'
        },
        {
            id: 'speech-to-play',
            name: '🎙️ TÍCH HỢP GIỌNG NÓI',
            description: 'Đọc lệnh "Play Word Scramble" hoặc "Play Memory Game" để bắt đầu.',
            icon: Bot,
            color: 'from-purple-400 to-purple-600',
            note: 'Bonus: Kết hợp Chức năng 12'
        }
    ];

    return (
        <div className="flex-1 space-y-10 p-8 pt-6 bg-slate-50 min-h-screen">
            
            {/* Tiêu đề trang */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">Trung tâm Mini Game</h2>
                    <p className="text-gray-500 mt-2 text-lg">Giải trí & Ôn Tập: Chơi mà học, học mà chơi.</p>
                </div>
            </div>

            {/* Lưới các thẻ game */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {games.map((game) => {
                    const Icon = game.icon;
                    return (
                        <div 
                            key={game.id} 
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start gap-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-full`}></div>
                            <div className={`p-4 rounded-full bg-gradient-to-br ${game.color} text-white`}>
                                <Icon size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-950">{game.name}</h3>
                                <p className="text-gray-600 mt-2">{game.description}</p>
                                {game.note && <p className="text-sm font-medium text-purple-600 mt-2 italic">{game.note}</p>}
                            </div>
                            <button 
                                onClick={() => navigate(`/mini-game/${game.id}`)}
                                className={`w-full text-center py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-br ${game.color} hover:brightness-110 transition shadow-sm`}
                            >
                                {game.id === 'speech-to-play' ? 'Kích hoạt Mic' : 'Chơi Ngay'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Bảng Xếp Hạng Thực Tế */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="text-yellow-500" size={32}/>
                    <h3 className="text-2xl font-bold text-gray-900">Bảng Xếp Hạng Cao Thủ</h3>
                </div>
                
                {loadingLeaderboard ? (
                    <div className="text-center py-10 text-gray-400 italic">Đang tải bảng xếp hạng...</div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Chưa có ai ghi điểm. Hãy là người đầu tiên!</div>
                ) : (
                    <div className="space-y-4">
                        {leaderboard.map((user, index) => {
                            const rank = index + 1;
                            let rankStyle = "bg-gray-50 border-gray-100";
                            let rankIconColor = "text-gray-400";
                            
                            if (rank === 1) { rankStyle = "bg-yellow-50 border-yellow-200 scale-105 shadow-sm"; rankIconColor = "text-yellow-500"; }
                            if (rank === 2) { rankStyle = "bg-slate-50 border-slate-200"; rankIconColor = "text-slate-400"; }
                            if (rank === 3) { rankStyle = "bg-orange-50 border-orange-200"; rankIconColor = "text-orange-500"; }

                            return (
                                <div key={user.UserID} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${rankStyle}`}>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-black w-8 text-center text-xl ${rankIconColor}`}>{rank}</span>
                                        <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center font-bold text-blue-600 shadow-sm">
                                            {user.Username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-gray-800 text-lg">{user.Username}</span>
                                    </div>
                                    <div className="font-black text-blue-600 text-xl">
                                        {user.TotalScore} <span className="text-xs font-normal text-gray-400">XP</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiniGames;