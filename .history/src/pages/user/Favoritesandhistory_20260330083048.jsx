import { useEffect, useState } from "react";
import API from "../../services/api";

function getUserId() {
  return JSON.parse(localStorage.getItem("user") || "{}").UserID;
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

.fh-root {
  --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
  --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
  --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
  --danger:#f87171; --success:#4ade80;
  font-family:'DM Sans',sans-serif; font-size:14px;
  color:var(--text); background:var(--bg); min-height:100vh;
}
.fh-root *, .fh-root *::before, .fh-root *::after { box-sizing:border-box; margin:0; padding:0; }

/* ── tabs ── */
.fh-tabs {
  display:flex; border-bottom:1px solid var(--border);
  background:var(--surface); padding:0 20px;
}
.fh-tab {
  padding:14px 20px; font-size:14px; font-weight:600;
  cursor:pointer; border:none; background:transparent;
  color:var(--muted); border-bottom:2px solid transparent;
  transition:all .15s;
}
.fh-tab.active { color:var(--accent); border-bottom-color:var(--accent); }
.fh-tab:hover:not(.active) { color:var(--text); }

/* ── section title ── */
.fh-section-title {
  padding:16px 20px 8px;
  font-family:'DM Serif Display',serif; font-size:22px;
  background:var(--surface); border-bottom:1px solid var(--border);
}
.fh-section-title em { font-style:italic; color:var(--accent); }

/* ── stat row (history) ── */
.fh-stats {
  display:flex; gap:12px; padding:16px 20px; flex-wrap:wrap;
}
.fh-stat {
  flex:1; min-width:100px; background:var(--card);
  border:1px solid var(--border); border-radius:12px;
  padding:14px 16px; text-align:center;
}
.fh-stat .num { font-size:28px; font-weight:600; }
.fh-stat .lbl { font-size:12px; color:var(--muted); margin-top:4px; }
.fh-stat.avg  .num { color:var(--accent); }
.fh-stat.mast .num { color:var(--success); }
.fh-stat.lrn  .num { color:var(--gold); }
.fh-stat.sess .num { color:var(--accent2); }

/* ── lesson history cards ── */
.fh-lesson-list { padding:12px 20px; display:flex; flex-direction:column; gap:10px; }
.fh-lesson-card {
  background:var(--card); border:1px solid var(--border); border-radius:12px;
  padding:14px 16px; display:flex; align-items:center; gap:14px;
}
.fh-lesson-icon {
  width:42px; height:42px; border-radius:10px;
  background:rgba(110,231,183,.1); border:1px solid rgba(110,231,183,.15);
  display:flex; align-items:center; justify-content:center;
  font-size:18px; flex-shrink:0;
}
.fh-lesson-info { flex:1; min-width:0; }
.fh-lesson-name { font-weight:600; font-size:15px; }
.fh-lesson-cat  { font-size:12px; color:var(--muted); margin-top:2px; }
.fh-lesson-meta { font-size:12px; color:var(--muted); margin-top:6px; }
.fh-score-pill {
  padding:6px 14px; border-radius:20px; font-size:14px; font-weight:700;
  flex-shrink:0;
}
.fh-score-pill.high  { background:rgba(74,222,128,.1);  color:var(--success); }
.fh-score-pill.mid   { background:rgba(110,231,183,.1); color:var(--accent);  }
.fh-score-pill.low   { background:rgba(251,191,36,.1);  color:var(--gold);    }
.fh-score-pill.fail  { background:rgba(248,113,113,.1); color:var(--danger);  }

/* ── progress bar in history ── */
.fh-prog-wrap { padding:12px 20px; }
.fh-prog-label {
  display:flex; justify-content:space-between;
  font-size:12px; color:var(--muted); margin-bottom:6px;
}
.fh-prog-track { height:8px; background:var(--border); border-radius:6px; overflow:hidden; }
.fh-prog-fill  { height:100%; border-radius:6px; transition:width .6s ease; }
.fh-prog-fill.mastered { background:var(--success); }
.fh-prog-fill.learning { background:var(--gold); }

/* ── favorites grid ── */
.fh-fav-grid {
  padding:16px 20px;
  display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));
  gap:12px;
}
.fh-fav-card {
  background:var(--card); border:1px solid var(--border); border-radius:12px;
  padding:16px; position:relative; transition:border-color .15s;
}
.fh-fav-card:hover { border-color:rgba(244,114,182,.3); }
.fh-fav-word { font-size:18px; font-weight:600; }
.fh-fav-meaning { font-size:14px; color:var(--accent); margin-top:4px; }
.fh-fav-ipa  { font-size:12px; color:var(--accent2); font-style:italic; margin-top:4px; }
.fh-fav-cat  { margin-top:8px; }
.fh-fav-badge {
  display:inline-block; padding:3px 10px; border-radius:20px;
  font-size:11px; font-weight:600;
  background:rgba(56,189,248,.08); color:var(--accent2);
}
.fh-unfav-btn {
  position:absolute; top:12px; right:12px;
  background:transparent; border:none; cursor:pointer;
  font-size:18px; opacity:.6; transition:opacity .15s;
}
.fh-unfav-btn:hover { opacity:1; }

/* ── empty ── */
.fh-empty { padding:60px 20px; text-align:center; color:var(--muted); }
.fh-empty .ei { font-size:40px; margin-bottom:12px; opacity:.5; }
`;

// ═══════════════════════════════════════════════════════════
//  FAVORITES
// ═══════════════════════════════════════════════════════════
export function Favorites() {
  const userId = getUserId();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFav = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/user/favorites/${userId}`);
      setList(res.data);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { fetchFav(); }, []);

  const removeFav = async (wordId) => {
    await API.post("/user/favorites/toggle", { user_id: userId, word_id: wordId });
    setList(prev => prev.filter(w => w.WordID !== wordId));
  };

  const scoreClass = (s) =>
    s >= 75 ? "high" : s >= 50 ? "mid" : s >= 25 ? "low" : "fail";

  return (
    <div className="fh-root">
      <style>{S}</style>
      <div className="fh-section-title">
        Từ vựng <em>Yêu thích</em>
        <span style={{fontSize:14,color:"var(--muted)",marginLeft:10,fontFamily:"DM Sans"}}>
          ({list.length} từ)
        </span>
      </div>

      {loading ? (
        <div className="fh-empty"><div className="ei">⏳</div><p>Đang tải...</p></div>
      ) : list.length === 0 ? (
        <div className="fh-empty">
          <div className="ei">🤍</div>
          <p>Chưa có từ yêu thích nào.<br/>Hãy nhấn ❤️ khi học flashcard!</p>
        </div>
      ) : (
        <div className="fh-fav-grid">
          {list.map(w => (
            <div key={w.WordID} className="fh-fav-card">
              <button className="fh-unfav-btn" title="Bỏ yêu thích"
                onClick={() => removeFav(w.WordID)}>🤍</button>
              <div className="fh-fav-word">{w.Word}</div>
              <div className="fh-fav-meaning">{w.Meaning}</div>
              {w.IPA && (
                <div className="fh-fav-ipa">
                  /{w.IPA}/
                  {w.Accent && (
                    <span style={{
                      marginLeft:6, padding:"1px 6px", borderRadius:20,
                      fontSize:10, fontWeight:700, textTransform:"uppercase",
                      background: w.Accent==="US"?"rgba(56,189,248,.1)":"rgba(251,191,36,.1)",
                      color: w.Accent==="US"?"var(--accent2)":"var(--gold)"
                    }}>{w.Accent}</span>
                  )}
                </div>
              )}
              <div className="fh-fav-cat" style={{marginTop:8}}>
                {w.CategoryName && (
                  <span className="fh-fav-badge">{w.CategoryName}</span>
                )}
                {w.LessonName && (
                  <span className="fh-fav-badge" style={{
                    marginLeft:6, background:"rgba(244,114,182,.08)", color:"var(--accent3)"
                  }}>{w.LessonName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════════
export function History() {
  const userId = getUserId();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/user/history/${userId}`);
        setData(res.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="fh-root"><style>{S}</style>
      <div className="fh-empty"><div className="ei">⏳</div><p>Đang tải...</p></div>
    </div>
  );

  const { lessons = [], progress = {}, global_avg = 0 } = data || {};
  const mastPct = progress.Total
    ? Math.round((progress.Mastered / progress.Total) * 100) : 0;
  const lrnPct  = progress.Total
    ? Math.round((progress.Learning / progress.Total) * 100) : 0;

  const scoreClass = (s) =>
    s >= 75 ? "high" : s >= 50 ? "mid" : s >= 25 ? "low" : "fail";

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("vi-VN", {
      day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"
    });
  };

  return (
    <div className="fh-root">
      <style>{S}</style>
      <div className="fh-section-title">Lịch sử <em>học tập</em></div>

      {/* stats cards */}
      <div className="fh-stats">
        <div className="fh-stat avg">
          <div className="num">{Math.round(global_avg)}</div>
          <div className="lbl">Điểm TB toàn bộ</div>
        </div>
        <div className="fh-stat mast">
          <div className="num">{progress.Mastered || 0}</div>
          <div className="lbl">Đã thuộc</div>
        </div>
        <div className="fh-stat lrn">
          <div className="num">{progress.Learning || 0}</div>
          <div className="lbl">Đang học</div>
        </div>
        <div className="fh-stat sess">
          <div className="num">{lessons.length}</div>
          <div className="lbl">Lesson đã học</div>
        </div>
      </div>

      {/* tiến độ từ vựng */}
      {progress.Total > 0 && (
        <div className="fh-prog-wrap">
          <div className="fh-prog-label">
            <span>Tiến độ từ vựng</span>
            <span>{mastPct}% thuộc / {lrnPct}% đang học</span>
          </div>
          <div className="fh-prog-track" style={{position:"relative"}}>
            <div className="fh-prog-fill mastered" style={{width:`${mastPct}%`}}/>
            <div className="fh-prog-fill learning" style={{
              width:`${lrnPct}%`, position:"absolute", left:`${mastPct}%`, top:0
            }}/>
          </div>
        </div>
      )}

      {/* lesson history */}
      {lessons.length === 0 ? (
        <div className="fh-empty">
          <div className="ei">📭</div>
          <p>Chưa có lịch sử học nào.</p>
        </div>
      ) : (
        <div className="fh-lesson-list">
          {lessons.map(l => (
            <div key={l.LessonID} className="fh-lesson-card">
              <div className="fh-lesson-icon">📚</div>
              <div className="fh-lesson-info">
                <div className="fh-lesson-name">{l.LessonName}</div>
                <div className="fh-lesson-cat">{l.CategoryName}</div>
                <div className="fh-lesson-meta">
                  {l.WordsDone} từ · Lần cuối: {fmtDate(l.LastDate)}
                </div>
              </div>
              <div className={`fh-score-pill ${scoreClass(Math.round(l.AvgScore || 0))}`}>
                {Math.round(l.AvgScore || 0)}đ
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}