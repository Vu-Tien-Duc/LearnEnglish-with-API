// ════════════════════════════════════════════════════════
//  Games.jsx
// ════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit } from 'lucide-react';
import API from '../../services/api';
import Navbar, { Footer } from '../../components/Navbar';

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
                <div style={{...styles.iconWrap, backgroundColor: game.bg + '15', border: `1.5px solid ${game.bg}30`}}>
                  <Icon size={26} strokeWidth={2} color={game.bg} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>{game.name}</h3>
                  <p style={styles.cardDesc}>{game.desc}</p>
                </div>
                <button
                  onClick={() => navigate(`/mini-game/${game.id}`)}
                  style={{...styles.btn, backgroundColor: game.bg}}
                >
                  Chơi Ngay →
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  MemoryGame.jsx
// ════════════════════════════════════════════════════════
export const MemoryGame = () => {
  const navigate = useNavigate();
  
  const [vocabList, setVocabList] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isWon, setIsWon] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  // Rút trích ID để làm dependency an toàn
  const userId = user?.UserID;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    API.get('/user/vocabulary', { params: { user_id: userId } })
      .then(res => setVocabList(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]); // Đã khắc phục lỗi ESLint dòng 81

  const handleSelectDifficulty = (wordCount) => {
    if (vocabList.length < wordCount) {
      alert(`Kho từ vựng của bạn hiện có ${vocabList.length} từ. Cần ít nhất ${wordCount} từ để chơi mức này! Hãy học thêm từ mới nhé.`);
      return;
    }
    setDifficulty(wordCount);
    initGame(wordCount);
  };

  const initGame = (wordCount) => {
    const picked = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, wordCount);
    const gameCards = [];
    
    picked.forEach(w => {
      gameCards.push({ id: `${w.WordID}-en`, text: w.Word, matchId: w.WordID, type: 'en' });
      gameCards.push({ id: `${w.WordID}-vi`, text: w.Meaning, matchId: w.WordID, type: 'vi' });
    });
    
    setCards(gameCards.sort(() => 0.5 - Math.random()));
    setFlippedIndices([]); 
    setMatchedIndices([]);
    setMoves(0); 
    setScore(0); 
    setIsWon(false);
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
        setScore(score + 20);
        
        if (newMatched.length === cards.length) {
          setTimeout(() => setIsWon(true), 500);
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
          <div style={styles.loadingText}>Đang tải dữ liệu...</div>
        ) : !difficulty ? (
          
          /* MÀN HÌNH CHỌN ĐỘ KHÓ */
          <div style={styles.difficultyPanel}>
            <div style={styles.difficultyHeader}>
              <span style={styles.difficultyEmoji}>🧠</span>
              <h2 style={styles.difficultyTitle}>Thử thách trí nhớ</h2>
              <p style={styles.difficultyDesc}>Chọn số lượng từ vựng bạn muốn thử sức ở ván này.</p>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {[
                { count: 6,  label: '🌱 Mức Dễ',  sub: '6 từ · 12 thẻ',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                { count: 10, label: '🔥 Mức Vừa', sub: '10 từ · 20 thẻ', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
                { count: 15, label: '☠️ Mức Khó', sub: '15 từ · 30 thẻ', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
              ].map(d => (
                <button key={d.count} onClick={() => handleSelectDifficulty(d.count)}
                  style={{...styles.difficultyBtn, backgroundColor: d.bg, borderColor: d.border}}>
                  <span style={{fontSize: '16px', fontWeight: 700, color: d.color}}>{d.label}</span>
                  <span style={{fontSize: '13px', color: '#9ca3af', fontWeight: 500}}>{d.sub}</span>
                </button>
              ))}
            </div>
            
            <button onClick={() => navigate('/mini-game')} style={styles.backTextBtn}>
              ← Quay lại Menu
            </button>
          </div>

        ) : (

          /* MÀN HÌNH CHƠI GAME */
          <>
            <div style={styles.topBar}>
              <button onClick={() => setDifficulty(null)} style={styles.backBtn}>← Đổi độ khó</button>
              <div style={{display: 'flex', gap: '10px'}}>
                <span style={styles.movesBadge}>Lượt lật: {moves}</span>
                <span style={styles.scoreBadge}>🏆 {score} điểm</span>
              </div>
            </div>

            {isWon && (
              <div style={styles.winCard}>
                <p style={{fontSize: '52px', margin: '0 0 12px', lineHeight: 1}}>🎉</p>
                <h2 style={{fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: '#111827'}}>Tuyệt vời!</h2>
                <p style={{color: '#6b7280', margin: '0 0 24px', fontSize: '15px'}}>
                  Hoàn thành mức <strong style={{color: '#111827'}}>{difficulty} từ</strong> với {score} điểm.
                </p>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                  <button onClick={() => setDifficulty(null)} style={styles.btnOutlineSecondary}>Đổi mức khác</button>
                  <button onClick={() => initGame(difficulty)} style={{...styles.btn, backgroundColor: '#16a34a'}}>↺ Chơi lại</button>
                </div>
              </div>
            )}

            <div style={{
              ...styles.memGrid, 
              gridTemplateColumns: difficulty >= 15 ? 'repeat(auto-fill, minmax(90px, 1fr))' : 'repeat(auto-fill, minmax(120px, 1fr))',
              maxWidth: difficulty >= 15 ? '900px' : '768px'
            }}>
              {cards.map((card, index) => {
                const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                const isMatched = matchedIndices.includes(index);
                const fontSizeEn = difficulty >= 15 ? '14px' : '17px';
                const fontSizeVi = difficulty >= 15 ? '12px' : '14px';

                return (
                  <div key={index} onClick={() => handleCardClick(index)}
                    style={{...styles.memCard, opacity: isMatched ? 0.55 : 1, transform: isMatched ? 'scale(0.94)' : 'none'}}>
                    <div style={{...styles.memInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'}}>
                      <div style={styles.memFront}>
                        <span style={{color: 'rgba(255,255,255,0.6)', fontSize: '28px', fontWeight: 800}}>?</span>
                      </div>
                      <div style={{...styles.memBack, backgroundColor: isMatched ? '#f0fdf4' : '#fff', borderColor: isMatched ? '#86efac' : '#dbeafe'}}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: card.type === 'en' ? fontSizeEn : fontSizeVi,
                          color: card.type === 'en' ? '#1d4ed8' : '#374151',
                          lineHeight: 1.35
                        }}>
                          {card.text}
                        </span>
                        {card.type === 'en' && (
                          <span style={{position: 'absolute', top: '6px', right: '8px', fontSize: '9px', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.5px', textTransform: 'uppercase'}}>EN</span>
                        )}
                        {card.type === 'vi' && (
                          <span style={{position: 'absolute', top: '6px', right: '8px', fontSize: '9px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase'}}>VI</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  WordScrambleGame.jsx
// ════════════════════════════════════════════════════════
export const WordScrambleGame = () => {
  const navigate = useNavigate();
  const [allWords, setAllWords] = useState([]);
  const [gameWords, setGameWords] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const userId = user?.UserID;

  const scrambleWord = (word) => {
    let s, orig = word.toLowerCase();
    do { 
      s = orig.split('').sort(() => Math.random() - 0.5).join(''); 
    } while (s === orig && orig.length > 1);
    return s;
  };

  // Bọc hàm setupRound để dùng được trong initNewGame an toàn
  const setupRound = useCallback((wordObj) => {
    setCurrentWord(wordObj);
    setScrambled(scrambleWord(wordObj.Word));
    setInput('');
    setMessage({ text: '', type: '' });
  }, []); // Cảnh báo: scrambleWord không phụ thuộc state nên an toàn ở đây

  // Bọc hàm initNewGame bằng useCallback để dùng an toàn trong useEffect
  const initNewGame = useCallback((sourceList) => {
    if (!sourceList || sourceList.length === 0) return;
    const shuffled = [...sourceList].sort(() => Math.random() - 0.5);
    const selected10 = shuffled.slice(0, 10);
    setGameWords(selected10);
    setCurrentRound(0);
    setScore(0);
    setIsGameOver(false);
    setupRound(selected10[0]);
  }, [setupRound]);

  useEffect(() => {
    if (!userId) return;
    API.get('/user/vocabulary', { params: { user_id: userId } })
      .then(res => {
        const list = res.data.filter(w => w.Word.length > 2);
        setAllWords(list);
        if (list.length > 0) initNewGame(list);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId, initNewGame]); // Đã khắc phục lỗi ESLint dòng 269

  const nextRound = () => {
    const nextIndex = currentRound + 1;
    if (nextIndex < gameWords.length) {
      setCurrentRound(nextIndex);
      setupRound(gameWords[nextIndex]);
    } else {
      setIsGameOver(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.toLowerCase() === currentWord.Word.toLowerCase()) {
      setMessage({ text: 'Tuyệt vời! Đúng rồi 🎉', type: 'success' });
      setScore(score + 10);
      setTimeout(() => { nextRound(); }, 1000);
    } else {
      setMessage({ text: 'Sai rồi! Thử lại nhé.', type: 'error' });
      setInput('');
    }
  };

  const handleSkip = () => { nextRound(); };

  return (
    <div style={styles.root}>
      <Navbar />

      <div style={styles.gameContent}>
        {loading ? (
          <div style={{...styles.loadingText, color: '#2563eb'}}>Đang chuẩn bị...</div>
        ) : !currentWord ? (
          <div style={{textAlign: 'center', marginTop: '80px', color: '#9ca3af', fontSize: '16px'}}>Không đủ từ vựng để chơi!</div>
        ) : isGameOver ? (
          // MÀN HÌNH KẾT THÚC
          <div style={styles.difficultyPanel}>
            <div style={styles.difficultyHeader}>
              <span style={styles.difficultyEmoji}>🎯</span>
              <h2 style={{...styles.difficultyTitle, color: '#1d4ed8'}}>Hoàn thành!</h2>
              <p style={styles.difficultyDesc}>Bạn đã trả lời xong {gameWords.length} câu hỏi.</p>
            </div>
            <div style={styles.scoreDisplay}>
              <span style={styles.scoreNumber}>{score}</span>
              <span style={styles.scoreLabel}>điểm</span>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => navigate('/mini-game')} style={styles.btnOutlineSecondary}>← Menu</button>
              {/* Truyền allWords vào initNewGame khi chơi lại */}
              <button onClick={() => initNewGame(allWords)} style={{...styles.btn, backgroundColor: '#2563eb', flex: 2}}>↺ Chơi lại 10 từ khác</button>
            </div>
          </div>
        ) : (
          // MÀN HÌNH CHƠI CHÍNH
          <>
            <div style={styles.topBar}>
              <button onClick={() => navigate('/mini-game')} style={styles.backBtn}>← Quay lại</button>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <span style={styles.movesBadge}>Câu {currentRound + 1} / {gameWords.length}</span>
                <span style={styles.scoreBadge}>🏆 {score} điểm</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={styles.progressTrack}>
              <div style={{...styles.progressFill, width: `${((currentRound) / gameWords.length) * 100}%`}} />
            </div>

            <div style={styles.scrambleBox}>
              <div style={styles.scrambleTop}>
                <p style={styles.scrambleLabel}>Sắp xếp lại các chữ cái</p>
                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px'}}>
                  {scrambled.split('').map((c, i) => (
                    <span key={i} style={styles.letter}>{c.toUpperCase()}</span>
                  ))}
                </div>
              </div>

              <div style={styles.scrambleBottom}>
                <div style={styles.hint}>
                  💡 Gợi ý: <strong style={{color: '#1d4ed8'}}>{currentWord.Meaning}</strong>
                </div>

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nhập từ tiếng Anh..."
                    style={{
                      ...styles.input,
                      borderColor: message.type === 'success' ? '#4ade80' : message.type === 'error' ? '#f87171' : '#e5e7eb'
                    }}
                    autoComplete="off" 
                    autoFocus 
                    disabled={message.type === 'success'}
                  />
                  <div style={styles.btnGroup}>
                    <button type="button" onClick={handleSkip} style={styles.btnSkip} disabled={message.type === 'success'}>
                      Bỏ qua ⏭
                    </button>
                    <button type="submit" style={styles.btnSubmit} disabled={message.type === 'success'}>
                      Kiểm tra
                    </button>
                  </div>
                </form>

                {message.text && (
                  <div style={{
                    ...styles.msgBlock, 
                    backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  // Layout
  root: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  hubContent: {
    padding: '40px 32px',
    flex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  gameContent: {
    padding: '32px 24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
  },

  // Header (Hub)
  header: {
    borderBottom: '1.5px solid #e5e7eb',
    paddingBottom: '28px',
    marginBottom: '36px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 900,
    color: '#0f172a',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  sub: {
    color: '#94a3b8',
    fontSize: '15px',
    margin: 0,
    fontWeight: 500,
  },

  // Top bar (in-game)
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '720px',
    marginBottom: '20px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '6px 0',
    letterSpacing: '0.2px',
  },
  scoreBadge: {
    backgroundColor: '#fffbeb',
    color: '#b45309',
    padding: '6px 16px',
    borderRadius: '999px',
    fontWeight: 800,
    border: '1.5px solid #fde68a',
    fontSize: '13px',
  },
  movesBadge: {
    backgroundColor: '#fff',
    color: '#374151',
    padding: '6px 16px',
    borderRadius: '999px',
    fontWeight: 700,
    border: '1.5px solid #e5e7eb',
    fontSize: '13px',
  },

  // Progress bar (Word Scramble)
  progressTrack: {
    width: '100%',
    maxWidth: '720px',
    height: '5px',
    backgroundColor: '#e5e7eb',
    borderRadius: '999px',
    marginBottom: '28px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },

  // Hub game card grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '720px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
    border: '1.5px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'box-shadow 0.2s',
  },
  iconWrap: {
    padding: '14px',
    borderRadius: '14px',
    width: 'fit-content',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 800,
    margin: '0 0 4px',
    color: '#0f172a',
  },
  cardDesc: {
    color: '#64748b',
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.5,
  },

  // Shared button
  btn: {
    padding: '12px 22px',
    borderRadius: '12px',
    border: 'none',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
    letterSpacing: '0.2px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },

  // Difficulty selection panel
  difficultyPanel: {
    backgroundColor: '#ffffff',
    padding: '40px 36px',
    borderRadius: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)',
    border: '1.5px solid #f1f5f9',
    maxWidth: '440px',
    width: '100%',
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    alignItems: 'stretch',
  },
  difficultyHeader: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  difficultyEmoji: {
    fontSize: '44px',
    display: 'block',
    marginBottom: '12px',
    lineHeight: 1,
  },
  difficultyTitle: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#0f172a',
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  },
  difficultyDesc: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '14px',
  },
  difficultyBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: '14px',
    border: '1.5px solid',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginBottom: '10px',
  },

  backTextBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '13px',
    marginTop: '16px',
    cursor: 'pointer',
    fontWeight: 600,
    alignSelf: 'center',
  },

  // Win/complete card
  winCard: {
    backgroundColor: '#fff',
    padding: '32px 28px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
    border: '1.5px solid #f1f5f9',
    marginBottom: '28px',
    maxWidth: '420px',
    width: '100%',
  },

  // Score display (game over)
  scoreDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '28px',
  },
  scoreNumber: {
    fontSize: '56px',
    fontWeight: 900,
    color: '#1d4ed8',
    lineHeight: 1,
    letterSpacing: '-2px',
  },
  scoreLabel: {
    fontSize: '16px',
    color: '#94a3b8',
    fontWeight: 600,
  },

  // Secondary outline button
  btnOutlineSecondary: {
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#374151',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
  },

  // Memory game grid
  memGrid: {
    display: 'grid',
    gap: '12px',
    width: '100%',
  },
  memCard: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    cursor: 'pointer',
    perspective: '1000px',
    transition: 'opacity 0.3s, transform 0.3s',
  },
  memInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d',
  },
  memFront: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
  },
  memBack: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#fff',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
    border: '1.5px solid',
    padding: '12px',
    textAlign: 'center',
  },

  // Word Scramble
  scrambleBox: {
    width: '100%',
    maxWidth: '620px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.07)',
    border: '1.5px solid #f1f5f9',
    overflow: 'hidden',
  },
  scrambleTop: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    padding: '40px 32px',
    textAlign: 'center',
  },
  scrambleLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '2.5px',
    margin: '0 0 20px',
    fontWeight: 700,
  },
  letter: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '58px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    fontSize: '26px',
    fontWeight: 900,
    color: '#1d4ed8',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  },
  scrambleBottom: {
    padding: '32px',
  },
  hint: {
    backgroundColor: '#f8fafc',
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    color: '#475569',
    textAlign: 'center',
    fontSize: '14px',
    width: 'fit-content',
    margin: '0 auto 28px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: 800,
    padding: '14px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '14px',
    outline: 'none',
    color: '#0f172a',
    letterSpacing: '0.5px',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
  },
  btnSkip: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#64748b',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  btnSubmit: {
    flex: 2,
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
    fontFamily: 'inherit',
  },
  msgBlock: {
    padding: '13px 20px',
    borderRadius: '12px',
    fontWeight: 700,
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '100px',
    fontSize: '17px',
    fontWeight: 700,
    color: '#16a34a',
  },
};