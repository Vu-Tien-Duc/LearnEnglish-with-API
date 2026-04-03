import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";

// ─── helpers ───────────────────────────────────────────────
function getImg(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://127.0.0.1:5000${url}`;
}
function getAudio(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://127.0.0.1:5000${url}`;
}
function getUserId() {
  return JSON.parse(localStorage.getItem("user") || "{}").UserID;
}

// ─── styles ────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

.fc-root {
  --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
  --accent:#6ee7b7; --accent2:#38bdf8; --gold:#fbbf24;
  --text:#e2e8f0; --muted:#64748b; --danger:#f87171; --success:#4ade80;
  font-family:'DM Sans',sans-serif; font-size:14px;
  color:var(--text); background:var(--bg);
  min-height:100vh; display:flex; flex-direction:column;
}
.fc-root *, .fc-root *::before, .fc-root *::after { box-sizing:border-box; margin:0; padding:0; }

/* ── topbar ── */
.fc-top {
  padding:14px 20px; border-bottom:1px solid var(--border);
  background:var(--surface);
  display:flex; align-items:center; gap:14px;
}
.fc-top h2 { font-family:'DM Serif Display',serif; font-size:20px; flex:1; }
.fc-top h2 em { font-style:italic; color:var(--accent); }
.fc-back-btn {
  background:transparent; border:1px solid var(--border); border-radius:7px;
  padding:7px 14px; color:var(--muted); font-size:13px; font-weight:600;
  cursor:pointer; transition:all .15s;
}
.fc-back-btn:hover { color:var(--text); border-color:var(--muted); }

/* ── progress bar ── */
.fc-progress-wrap { padding:12px 20px 0; background:var(--surface); }
.fc-progress-info {
  display:flex; justify-content:space-between; font-size:12px;
  color:var(--muted); margin-bottom:6px;
}
.fc-bar-track {
  height:6px; background:var(--border); border-radius:4px; overflow:hidden;
}
.fc-bar-fill {
  height:100%; background:var(--accent); border-radius:4px;
  transition:width .4s ease;
}
.fc-status-row {
  display:flex; gap:16px; padding:8px 20px 12px;
  background:var(--surface); font-size:12px;
}
.fc-status-row span { display:flex; align-items:center; gap:5px; }
.fc-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.fc-dot.new      { background:var(--muted); }
.fc-dot.learning { background:var(--gold); }
.fc-dot.mastered { background:var(--success); }

/* ── main ── */
.fc-main {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:24px 16px; gap:20px;
}

/* ── card flip ── */
.fc-scene { width:100%; max-width:520px; height:320px; perspective:1200px; cursor:pointer; }
.fc-flipper {
  width:100%; height:100%; position:relative;
  transform-style:preserve-3d;
  transition:transform .5s cubic-bezier(.4,0,.2,1);
}
.fc-flipper.flipped { transform:rotateY(180deg); }
.fc-face {
  position:absolute; inset:0; border-radius:16px;
  border:1px solid var(--border); backface-visibility:hidden;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:28px; background:var(--card); overflow:hidden;
}
.fc-face.back { transform:rotateY(180deg); justify-content:flex-start; padding-top:20px; }

/* front */
.fc-word   { font-size:42px; font-weight:600; letter-spacing:-1px; text-align:center; }
.fc-hint   { font-size:13px; color:var(--muted); margin-top:10px; }

/* back */
.fc-back-top { display:flex; width:100%; align-items:flex-start; gap:14px; margin-bottom:12px; }
.fc-back-img {
  width:80px; height:80px; border-radius:10px; object-fit:cover;
  border:1px solid var(--border); flex-shrink:0;
}
.fc-back-noimg {
  width:80px; height:80px; border-radius:10px; border:1px dashed var(--border);
  display:flex; align-items:center; justify-content:center;
  color:var(--muted); font-size:22px; flex-shrink:0;
}
.fc-back-info { flex:1; min-width:0; }
.fc-back-word  { font-size:22px; font-weight:600; }
.fc-back-meaning { font-size:18px; color:var(--accent); margin-top:4px; }
.fc-ipa    { font-size:14px; color:var(--accent2); font-style:italic; margin-top:6px; }
.fc-example { font-size:13px; color:var(--muted); margin-top:10px; line-height:1.5; }
.fc-example em { color:var(--text); font-style:normal; }
.fc-audio {
  height:28px; width:100%; filter:invert(1) hue-rotate(145deg) brightness(.8);
  border-radius:20px; outline:none; margin-top:10px;
}
.fc-fav-btn {
  position:absolute; top:14px; right:14px;
  background:transparent; border:none; cursor:pointer;
  font-size:20px; line-height:1; padding:4px; transition:transform .2s;
}
.fc-fav-btn:hover { transform:scale(1.2); }

/* ── action row ── */
.fc-actions {
  display:flex; gap:14px; width:100%; max-width:520px;
}
.fc-act-btn {
  flex:1; padding:14px; border-radius:12px; font-size:15px; font-weight:600;
  cursor:pointer; border:none; transition:all .18s; display:flex;
  align-items:center; justify-content:center; gap:8px;
}
.fc-act-btn.x-btn {
  background:rgba(248,113,113,.12); color:var(--danger);
  border:1px solid rgba(248,113,113,.25);
}
.fc-act-btn.x-btn:hover { background:rgba(248,113,113,.22); transform:translateY(-2px); }
.fc-act-btn.v-btn {
  background:rgba(74,222,128,.1); color:var(--success);
  border:1px solid rgba(74,222,128,.2);
}
.fc-act-btn.v-btn:hover { background:rgba(74,222,128,.18); transform:translateY(-2px); }
.fc-act-btn:disabled { opacity:.4; cursor:default; transform:none; }

.fc-flip-hint { font-size:12px; color:var(--muted); text-align:center; }

/* ── result screen ── */
.fc-result {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:20px; padding:32px;
}
.fc-result h2 { font-family:'DM Serif Display',serif; font-size:28px; }
.fc-result h2 em { font-style:italic; color:var(--accent); }
.fc-result-stats {
  display:flex; gap:16px; flex-wrap:wrap; justify-content:center;
}
.fc-stat-card {
  background:var(--card); border:1px solid var(--border); border-radius:12px;
  padding:16px 24px; text-align:center; min-width:100px;
}
.fc-stat-card .num { font-size:32px; font-weight:600; }
.fc-stat-card .lbl { font-size:12px; color:var(--muted); margin-top:4px; }
.fc-stat-card.new      .num { color:var(--muted); }
.fc-stat-card.learning .num { color:var(--gold); }
.fc-stat-card.mastered .num { color:var(--success); }
.fc-result-btns { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }
.fc-rbtn {
  padding:12px 24px; border-radius:9px; font-size:14px; font-weight:600;
  cursor:pointer; border:none; transition:all .18s;
}
.fc-rbtn.primary { background:var(--accent); color:#0d0f14; }
.fc-rbtn.primary:hover { filter:brightness(1.1); }
.fc-rbtn.ghost { background:transparent; border:1px solid var(--border); color:var(--muted); }
.fc-rbtn.ghost:hover { color:var(--text); border-color:var(--muted); }
`;

// ─── component ─────────────────────────────────────────────
export default function FlashcardStudy({ lessonId, lessonName, onBack }) {
  const userId = getUserId();

  const [cards,   setCards]   = useState([]);
  const [queue,   setQueue]   = useState([]);   // index list
  const [current, setCurrent] = useState(0);    // index into queue
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done,    setDone]    = useState(false);

  // ── fetch cards ──
  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/user/flashcard/${lessonId}`, {
        params: { user_id: userId }
      });
      setCards(res.data);
      setQueue(res.data.map((_, i) => i));
      setCurrent(0);
      setFlipped(false);
      setDone(false);
    } catch {}
    finally { setLoading(false); }
  }, [lessonId, userId]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const card      = cards[queue[current]];
  const totalDone = current;
  const pct       = queue.length ? Math.round((totalDone / queue.length) * 100) : 0;

  // count statuses
  const counts = cards.reduce((acc, c) => {
    const s = c.Status || "New";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // ── flip ──
  const handleFlip = () => setFlipped(f => !f);

  // ── status button ──
  const handleStatus = async (status) => {
    if (!card) return;
    // optimistic update
    setCards(prev => prev.map((c, i) =>
      i === queue[current] ? { ...c, Status: status } : c
    ));
    // API call
    await API.post("/user/flashcard/status", {
      user_id: userId, word_id: card.WordID, status
    }).catch(() => {});

    // advance
    const next = current + 1;
    if (next >= queue.length) {
      setDone(true);
    } else {
      setCurrent(next);
      setFlipped(false);
    }
  };

  // ── favorite toggle ──
  const toggleFav = async (e) => {
    e.stopPropagation();
    if (!card) return;
    const res = await API.post("/user/favorites/toggle", {
      user_id: userId, word_id: card.WordID
    }).catch(() => null);
    if (res) {
      setCards(prev => prev.map((c, i) =>
        i === queue[current] ? { ...c, IsFavorite: res.data.is_favorite ? 1 : 0 } : c
      ));
    }
  };

  // ── restart all ──
  const restartAll = () => {
    setQueue(cards.map((_, i) => i));
    setCurrent(0); setFlipped(false); setDone(false);
  };

  // ── restart only Learning ──
  const restartLearning = () => {
    const learningIdx = cards.reduce((acc, c, i) => {
      if (c.Status === "Learning") acc.push(i);
      return acc;
    }, []);
    if (!learningIdx.length) return;
    setQueue(learningIdx);
    setCurrent(0); setFlipped(false); setDone(false);
  };

  // ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="fc-root" style={{alignItems:"center",justifyContent:"center"}}>
      <style>{S}</style>
      <div style={{color:"var(--muted)"}}>Đang tải thẻ...</div>
    </div>
  );

  return (
    <div className="fc-root">
      <style>{S}</style>

      {/* topbar */}
      <div className="fc-top">
        <button className="fc-back-btn" onClick={onBack}>← Quay lại</button>
        <h2>{lessonName} — <em>Flashcard</em></h2>
      </div>

      {!done ? (
        <>
          {/* progress */}
          <div className="fc-progress-wrap">
            <div className="fc-progress-info">
              <span>Thẻ {Math.min(current + 1, queue.length)} / {queue.length}</span>
              <span>{pct}%</span>
            </div>
            <div className="fc-bar-track">
              <div className="fc-bar-fill" style={{width:`${pct}%`}}/>
            </div>
          </div>
          <div className="fc-status-row">
            <span><div className="fc-dot new"/>New: {counts["New"]||0}</span>
            <span><div className="fc-dot learning"/>Learning: {counts["Learning"]||0}</span>
            <span><div className="fc-dot mastered"/>Mastered: {counts["Mastered"]||0}</span>
          </div>

          {/* card */}
          {card && (
            <div className="fc-main">
              <div className="fc-scene" onClick={handleFlip}>
                <div className={`fc-flipper${flipped?" flipped":""}`}>
                  {/* FRONT */}
                  <div className="fc-face front">
                    <div className="fc-word">{card.Word}</div>
                    <div className="fc-hint">Nhấn để lật thẻ</div>
                    {/* status badge */}
                    <div style={{
                      position:"absolute", top:14, left:14,
                      padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                      background: card.Status==="Mastered"?"rgba(74,222,128,.1)"
                        :card.Status==="Learning"?"rgba(251,191,36,.1)":"rgba(100,116,139,.1)",
                      color: card.Status==="Mastered"?"var(--success)"
                        :card.Status==="Learning"?"var(--gold)":"var(--muted)"
                    }}>{card.Status}</div>
                  </div>

                  {/* BACK */}
                  <div className="fc-face back">
                    <button className="fc-fav-btn" onClick={toggleFav}>
                      {card.IsFavorite ? "❤️" : "🤍"}
                    </button>
                    <div className="fc-back-top">
                      {getImg(card.ImageURL)
                        ? <img className="fc-back-img" src={getImg(card.ImageURL)} alt={card.Word}/>
                        : <div className="fc-back-noimg">📷</div>
                      }
                      <div className="fc-back-info">
                        <div className="fc-back-word">{card.Word}</div>
                        <div className="fc-back-meaning">{card.Meaning}</div>
                        {card.IPA && <div className="fc-ipa">/{card.IPA}/
                          {card.Accent && <span style={{
                            marginLeft:8, padding:"1px 7px", borderRadius:20,
                            fontSize:10, fontWeight:700, textTransform:"uppercase",
                            background: card.Accent==="US"?"rgba(56,189,248,.1)":"rgba(251,191,36,.1)",
                            color: card.Accent==="US"?"var(--accent2)":"var(--gold)"
                          }}>{card.Accent}</span>}
                        </div>}
                      </div>
                    </div>
                    {card.ExampleSentence && (
                      <div className="fc-example">
                        <em>{card.ExampleSentence}</em><br/>
                        {card.Translation}
                      </div>
                    )}
                    {getAudio(card.AudioURL) && (
                      <audio className="fc-audio" controls>
                        <source src={getAudio(card.AudioURL)} type="audio/mpeg"/>
                      </audio>
                    )}
                  </div>
                </div>
              </div>

              {/* action buttons — chỉ hiện sau khi lật */}
              <div className="fc-actions">
                <button className="fc-act-btn x-btn"
                  disabled={!flipped}
                  onClick={() => handleStatus("Learning")}>
                  ✕ &nbsp;Đang học
                </button>
                <button className="fc-act-btn v-btn"
                  disabled={!flipped}
                  onClick={() => handleStatus("Mastered")}>
                  ✓ &nbsp;Đã thuộc
                </button>
              </div>
              {!flipped && (
                <div className="fc-flip-hint">Lật thẻ để xem nghĩa rồi đánh giá</div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ── RESULT SCREEN ── */
        <div className="fc-result">
          <h2>Hoàn thành <em>session!</em></h2>
          <div className="fc-result-stats">
            <div className="fc-stat-card new">
              <div className="num">{counts["New"]||0}</div>
              <div className="lbl">Chưa học</div>
            </div>
            <div className="fc-stat-card learning">
              <div className="num">{counts["Learning"]||0}</div>
              <div className="lbl">Đang học</div>
            </div>
            <div className="fc-stat-card mastered">
              <div className="num">{counts["Mastered"]||0}</div>
              <div className="lbl">Đã thuộc</div>
            </div>
          </div>
          <div className="fc-result-btns">
            <button className="fc-rbtn primary" onClick={restartAll}>
              🔄 Học lại tất cả ({queue.length} thẻ)
            </button>
            {(counts["Learning"]||0) > 0 && (
              <button className="fc-rbtn ghost" onClick={restartLearning}>
                📖 Ôn lại đang học ({counts["Learning"]||0} thẻ)
              </button>
            )}
            <button className="fc-rbtn ghost" onClick={onBack}>
              ← Về danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
}