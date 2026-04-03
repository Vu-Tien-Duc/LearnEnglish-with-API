// ════════════════════════════════════════════════════════
//  MiniGames.jsx  —  src/pages/user/MiniGames.jsx
// ════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit } from 'lucide-react'; // Đã xóa Trophy
import API from '../../services/api';
import Navbar from '../../components/Navbar';

export const MiniGames = () => {
  const navigate = useNavigate();

  const games = [
    { id: 'word-scramble', name: '🎮 Đảo Chữ',     desc: 'Sắp xếp lại chữ cái để tìm từ đúng!',      icon: Sparkles,     bg: '#3b82f6' },
    { id: 'memory-game',   name: '🧠 Lật Thẻ Nhớ',  desc: 'Ghép cặp tiếng Anh ↔ tiếng Việt.',          icon: BrainCircuit, bg: '#22c55e' },
  ];

  return (
    <div style={styles.root}>
      <Navbar />
      
      <div style={styles.hubContent}>
        <div style={styles.header}>
          <h2 style={styles.title}>Trung tâm Mini Game</h2>
          <p style={styles.sub}>Giải trí & Ôn Tập: Chơi để thư giãn, không áp lực điểm số.</p>
        </div>

        <div style={styles.grid}>
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <div key={game.id} style={styles.card}>
                <div style={{...styles.iconWrap, backgroundColor: game.bg}}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>{game.name}</h3>
                  <p style={styles.cardDesc}>{game.desc}</p>
                </div>
                <button
                  onClick={() => navigate(`/mini-game/${game.id}`)}
                  style={{...styles.btn, backgroundColor: game.bg}}
                >
                  Chơi Ngay
                </button>
              </div>
            );
          })}
        </div>
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

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};

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
        setScore(score + 20); // Điểm chỉ lưu tạm thời ở Client
        
        if (newMatched.length === cards.length) {
          setTimeout(() => {
            setIsWon(true);
            // ĐÃ XÓA API.POST LƯU ĐIỂM Ở ĐÂY
          }, 500);
        }
      } else {
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  return (
    <div style={styles.root}>
      <Navbar />

      <div style={styles.gameContent}>
        {loading ? (
          <div style={{textAlign: 'center', marginTop: '80px', fontSize: '20px', fontWeight: 'bold', color: '#16a34a'}}>Đang chia bài...</div>
        ) : (
          <>
            <div style={styles.topBar}>
              <button onClick={() => navigate('/mini-game')} style={styles.backBtn}>← Quay lại</button>
              <div style={{display: 'flex', gap: '16px'}}>
                <span style={styles.movesBadge}>Lượt lật: {moves}</span>
                <span style={styles.scoreBadge}>🏆 Điểm: {score}</span>
              </div>
            </div>

            {isWon && (
              <div style={{backgroundColor: '#fff', padding: '32px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '32px'}}>
                <p style={{fontSize: '48px', margin: '0 0 16px'}}>🎉</p>
                <h2 style={{fontSize: '28px', fontWeight: 800, margin: '0 0 8px'}}>Tuyệt vời!</h2>
                <p style={{color: '#6b7280', margin: '0 0 24px'}}>Bạn đạt {score} điểm ở lượt này.</p>
                <button onClick={fetchAndInit} style={{...styles.btn, backgroundColor: '#16a34a', width: '100%'}}>↺ Chơi ván mới</button>
              </div>
            )}

            <div style={styles.memGrid}>
              {cards.map((card, index) => {
                const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                const isMatched = matchedIndices.includes(index);
                return (
                  <div key={index} onClick={() => handleCardClick(index)} style={{...styles.memCard, opacity: isMatched ? 0.6 : 1, transform: isMatched ? 'scale(0.95)' : 'none'}}>
                    <div style={{...styles.memInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'}}>
                      <div style={styles.memFront}>
                        <span style={{color: '#dcfce7', fontSize: '32px', opacity: 0.8}}>?</span>
                      </div>
                      <div style={{...styles.memBack, backgroundColor: isMatched ? '#f0fdf4' : '#fff', borderColor: isMatched ? '#4ade80' : '#bfdbfe'}}>
                        <span style={{fontWeight: 'bold', fontSize: card.type === 'en' ? '20px' : '16px', color: card.type === 'en' ? '#1d4ed8' : '#1f2937'}}>
                          {card.text}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};

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
      setScore(score + 10); // Chỉ lưu điểm tạm thời trên giao diện
      // ĐÃ XÓA API.POST LƯU ĐIỂM Ở ĐÂY
      setTimeout(() => pick(), 1500);
    } else {
      setMessage({ text: 'Sai rồi! Thử lại nhé.', type: 'error' });
      setInput('');
    }
  };

  return (
    <div style={styles.root}>
      <Navbar />

      <div style={styles.gameContent}>
        {loading ? (
          <div style={{textAlign: 'center', marginTop: '80px', fontSize: '20px', fontWeight: 'bold', color: '#2563eb'}}>Đang chuẩn bị...</div>
        ) : !currentWord ? null : (
          <>
            <div style={styles.topBar}>
              <button onClick={() => navigate('/mini-game')} style={styles.backBtn}>← Quay lại</button>
              <span style={styles.scoreBadge}>🏆 Điểm: {score}</span>
            </div>

            <div style={styles.scrambleBox}>
              <div style={styles.scrambleTop}>
                <p style={{color: '#dbeafe', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 16px'}}>Sắp xếp lại các chữ cái</p>
                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px'}}>
                  {scrambled.split('').map((c, i) => (
                    <span key={i} style={styles.letter}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={styles.scrambleBottom}>
                <div style={styles.hint}>
                  💡 Gợi ý: <strong>{currentWord.Meaning}</strong>
                </div>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <input 
                    type="text" value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Nhập từ tiếng Anh..."
                    style={styles.input}
                    autoComplete="off" autoFocus 
                  />
                  <div style={styles.btnGroup}>
                    <button type="button" onClick={() => pick()} style={styles.btnSkip}>↺ Bỏ qua</button>
                    <button type="submit" style={styles.btnSubmit}>Kiểm tra</button>
                  </div>
                </form>
                {message.text && (
                  <div style={{
                    ...styles.msgBlock, 
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#15803d' : '#b91c1c'
                  }}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Styles (CSS Objects dùng chung cho cả 3 trang Game) ────────────────────────
const styles = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
  hubContent: { padding: '32px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  gameContent: { padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  
  header: { borderBottom: '1px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px' },
  title: { fontSize: '30px', fontWeight: 800, color: '#030712', margin: 0 },
  sub: { color: '#6b7280', fontSize: '18px', marginTop: '8px', margin: 0 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '768px', marginBottom: '32px' },
  backBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  scoreBadge: { backgroundColor: '#fefce8', color: '#a16207', padding: '8px 20px', borderRadius: '999px', fontWeight: 'bold', border: '1px solid #fef08a' },
  movesBadge: { backgroundColor: '#fff', color: '#374151', padding: '8px 20px', borderRadius: '999px', fontWeight: 'bold', border: '1px solid #e5e7eb' },
  btn: { padding: '14px 24px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', textAlign: 'center', textDecoration: 'none' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '768px', marginBottom: '40px' },
  card: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '20px' },
  iconWrap: { padding: '16px', borderRadius: '50%', color: '#fff', width: 'fit-content' },
  cardTitle: { fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#030712' },
  cardDesc: { color: '#4b5563', margin: 0 },

  // Memory Game
  memGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', width: '100%', maxWidth: '768px' },
  memCard: { position: 'relative', width: '100%', aspectRatio: '4/3', cursor: 'pointer', perspective: '1000px', transition: '0.3s' },
  memInner: { position: 'relative', width: '100%', height: '100%', transition: 'transform 0.5s', transformStyle: 'preserve-3d' },
  memFront: { position: 'absolute', inset: 0, backgroundColor: '#22c55e', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #16a34a' },
  memBack: { position: 'absolute', inset: 0, backgroundColor: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #bfdbfe', padding: '16px', textAlign: 'center' },

  // Word Scramble
  scrambleBox: { width: '100%', maxWidth: '672px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' },
  scrambleTop: { background: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)', padding: '40px', textAlign: 'center' },
  letter: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '64px', backgroundColor: '#fff', borderRadius: '12px', fontSize: '30px', fontWeight: 900, color: '#1d4ed8', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', textTransform: 'uppercase' },
  scrambleBottom: { padding: '32px' },
  hint: { backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#4b5563', textAlign: 'center', width: 'fit-content', margin: '0 auto 32px' },
  input: { width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', padding: '16px 24px', border: '2px solid #e5e7eb', borderRadius: '16px', outline: 'none' },
  btnGroup: { display: 'flex', gap: '16px' },
  btnSkip: { flex: 1, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  btnSubmit: { flex: 2, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' },
  msgBlock: { padding: '16px', borderRadius: '12px', fontWeight: 'bold', textAlign: 'center', marginTop: '24px' }
};