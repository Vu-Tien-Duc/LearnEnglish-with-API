// ════════════════════════════════════════════════════════
//  MiniGames.jsx  —  src/pages/user/MiniGames.jsx
// ════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad, Sparkles, BrainCircuit, Trophy } from 'lucide-react';
import API from '../../services/api';

export const MiniGames = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    API.get('/user/game/leaderboard')
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error('Lỗi bảng xếp hạng:', err))
      .finally(() => setLoadingBoard(false));
  }, []);

  const games = [
    { id: 'word-scramble', name: '🎮 Đảo Chữ',      desc: 'Sắp xếp lại chữ cái để tìm từ đúng!',       icon: Sparkles,    color: 'from-blue-400 to-blue-600' },
    { id: 'memory-game',  name: '🧠 Lật Thẻ Nhớ',   desc: 'Ghép cặp tiếng Anh ↔ tiếng Việt.',          icon: BrainCircuit, color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="flex-1 space-y-10 p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">Trung tâm Mini Game</h2>
        <p className="text-gray-500 mt-2 text-lg">Giải trí & Ôn Tập: Chơi mà học, học mà chơi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <div key={game.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5 hover:shadow-lg transition-all relative overflow-hidden">
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-full`} />
              <div className={`p-4 rounded-full bg-gradient-to-br ${game.color} text-white w-fit`}>
                <Icon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-950">{game.name}</h3>
                <p className="text-gray-600 mt-2">{game.desc}</p>
              </div>
              <button
                onClick={() => navigate(`/mini-game/${game.id}`)}
                className={`w-full text-center py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-br ${game.color} hover:brightness-110 transition shadow-sm`}
              >
                Chơi Ngay
              </button>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-yellow-500" size={32} />
          <h3 className="text-2xl font-bold text-gray-900">Bảng Xếp Hạng</h3>
        </div>
        {loadingBoard ? (
          <div className="text-center py-10 text-gray-400 italic">Đang tải...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Chưa ai ghi điểm. Hãy là người đầu tiên!</div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((u, index) => {
              const rank = index + 1;
              let cls = 'bg-gray-50 border-gray-100';
              if (rank === 1) cls = 'bg-yellow-50 border-yellow-200 scale-105 shadow-sm';
              if (rank === 2) cls = 'bg-slate-50 border-slate-200';
              if (rank === 3) cls = 'bg-orange-50 border-orange-200';
              return (
                <div key={u.UserID} className={`flex items-center justify-between p-4 rounded-2xl border ${cls}`}>
                  <div className="flex items-center gap-4">
                    <span className="font-black w-8 text-center text-xl text-gray-500">{rank}</span>
                    <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold text-blue-600 shadow-sm">
                      {u.Username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-800 text-lg">{u.Username}</span>
                  </div>
                  <div className="font-black text-blue-600 text-xl">{u.TotalScore} <span className="text-xs font-normal text-gray-400">XP</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  MemoryGame.jsx  —  src/pages/user/MemoryGame.jsx
// ════════════════════════════════════════════════════════
export const MemoryGame = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isWon, setIsWon] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchAndInit(); }, []);

  const fetchAndInit = async () => {
    setLoading(true);
    try {
      const res = await API.get('/user/vocabulary', { params: { user_id: user.UserID } });
      if (res.data.length >= 6) initGame(res.data);
      else alert('Cần ít nhất 6 từ vựng để chơi!');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const initGame = (wordList) => {
    const picked = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 6);
    const gameCards = [];
    picked.forEach(w => {
      gameCards.push({ id: `${w.WordID}-en`, text: w.Word, matchId: w.WordID, type: 'en' });
      gameCards.push({ id: `${w.WordID}-vi`, text: w.Meaning, matchId: w.WordID, type: 'vi' });
    });
    setCards(gameCards.sort(() => 0.5 - Math.random()));
    setFlippedIndices([]); setMatchedIndices([]);
    setMoves(0); setScore(0); setIsWon(false);
  };

  const handleCardClick = (index) => {
    if (flippedIndices.includes(index) || matchedIndices.includes(index) || flippedIndices.length === 2) return;
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(p => p + 1);
      const [a, b] = newFlipped;
      if (cards[a].matchId === cards[b].matchId) {
        const newMatched = [...matchedIndices, a, b];
        setMatchedIndices(newMatched);
        setFlippedIndices([]);
        const newScore = score + 20;
        setScore(newScore);
        if (newMatched.length === cards.length) {
          setTimeout(async () => {
            setIsWon(true);
            try { await API.post('/user/game/score', { user_id: user.UserID, score: newScore }); }
            catch (e) { console.error(e); }
          }, 500);
        }
      } else {
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-green-600">Đang chia bài...</div>;

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button onClick={() => navigate('/mini-game')} className="text-gray-500 hover:text-green-600 transition font-medium">← Quay lại</button>
        <div className="flex gap-4">
          <span className="bg-white px-5 py-2 rounded-full font-semibold shadow-sm border border-gray-200 text-gray-700">Lượt lật: {moves}</span>
          <span className="bg-yellow-100 text-yellow-700 px-5 py-2 rounded-full font-bold shadow-sm border border-yellow-200">🏆 Điểm: {score}</span>
        </div>
      </div>

      {isWon && (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center mb-8">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Tuyệt vời!</h2>
          <p className="text-gray-500 mb-6">Bạn đạt {score} điểm.</p>
          <button onClick={fetchAndInit} className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition">↺ Chơi ván mới</button>
        </div>
      )}

      <div className="w-full max-w-3xl grid grid-cols-3 md:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
          const isMatched = matchedIndices.includes(index);
          return (
            <div key={index} onClick={() => handleCardClick(index)}
              className={`relative w-full aspect-[4/3] cursor-pointer ${isMatched ? 'opacity-70 scale-95' : 'hover:-translate-y-1'} transition-all duration-300`}
              style={{ perspective: '1000px' }}>
              <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow border-2 border-green-300 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <span className="text-green-100 text-3xl opacity-50">?</span>
                </div>
                <div className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center p-4 border-2 ${isMatched ? 'bg-green-50 border-green-400' : 'bg-white border-blue-200'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <span className={`text-center font-bold ${card.type === 'en' ? 'text-xl text-blue-700' : 'text-lg text-gray-800'}`}>{card.text}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  WordScrambleGame.jsx  —  src/pages/user/WordScrambleGame.jsx
// ════════════════════════════════════════════════════════
export const WordScrambleGame = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    API.get('/user/vocabulary', { params: { user_id: user.UserID } })
      .then(res => {
        const list = res.data.filter(w => w.Word.length > 2);
        setWords(list);
        if (list.length > 0) pick(list);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const scrambleWord = (word) => {
    let s, orig = word.toLowerCase();
    do { s = orig.split('').sort(() => Math.random() - 0.5).join(''); } while (s === orig && orig.length > 1);
    return s;
  };

  const pick = (list = words) => {
    const w = list[Math.floor(Math.random() * list.length)];
    setCurrentWord(w);
    setScrambled(scrambleWord(w.Word));
    setInput(''); setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.toLowerCase() === currentWord.Word.toLowerCase()) {
      setMessage({ text: 'Tuyệt vời! Đúng rồi 🎉', type: 'success' });
      const newScore = score + 10;
      setScore(newScore);
      try { await API.post('/user/game/score', { user_id: user.UserID, score: 10 }); }
      catch (e) { console.error(e); }
      setTimeout(() => pick(), 1500);
    } else {
      setMessage({ text: 'Sai rồi! Thử lại nhé.', type: 'error' });
      setInput('');
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-blue-600">Đang chuẩn bị...</div>;
  if (!currentWord) return null;

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 bg-slate-50">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button onClick={() => navigate('/mini-game')} className="text-gray-500 hover:text-blue-600 transition">← Quay lại</button>
        <span className="bg-yellow-100 text-yellow-700 px-5 py-2 rounded-full font-bold border border-yellow-200">🏆 Điểm: {score}</span>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-10 text-center">
          <p className="text-blue-100 text-sm uppercase tracking-widest mb-4">Sắp xếp lại các chữ cái</p>
          <div className="flex flex-wrap justify-center gap-3">
            {scrambled.split('').map((c, i) => (
              <span key={i} className="inline-flex items-center justify-center w-14 h-16 bg-white rounded-xl text-3xl font-black text-blue-700 shadow-lg uppercase">{c}</span>
            ))}
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-8 bg-gray-50 py-3 px-4 rounded-xl border border-gray-200 w-fit mx-auto">
            💡 Gợi ý: <strong>{currentWord.Meaning}</strong>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Nhập từ tiếng Anh..."
              className="w-full text-center text-2xl font-bold py-4 px-6 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition"
              autoComplete="off" autoFocus />
            <div className="flex gap-4 mt-2">
              <button type="button" onClick={() => pick()} className="flex-1 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">↺ Bỏ qua</button>
              <button type="submit" className="flex-[2] py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md">Kiểm tra</button>
            </div>
          </form>
          {message.text && (
            <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};