import React, { useState, useEffect, Fragment } from "react";
const API = "http://localhost:5000/api/admin/learnprogress";

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1)    return "Vừa xong";
  if (diff < 60)   return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return d.toLocaleDateString("vi-VN");
};

const fmtShortDate = (isoDate) => {
  if (!isoDate) return "";
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
};

const GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#a78bfa,#38bdf8)",
  "linear-gradient(135deg,#fb923c,#f472b6)",
];
const avatarGrad = (id) => GRADIENTS[(id ?? 0) % GRADIENTS.length];

const STATUS_COLOR = {
  Mastered:    ["rgba(74,222,128,.12)",  "#4ade80"],
  Learning:    ["rgba(251,191,36,.12)",  "#fbbf24"],
  New:         ["rgba(56,189,248,.1)",   "#38bdf8"],
  "Not Started": ["rgba(100,116,139,.1)", "#64748b"],
};
const statusBadge = (s) => {
  const [bg, c] = STATUS_COLOR[s] ?? STATUS_COLOR["Not Started"];
  return { display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background:bg, color:c, whiteSpace:"nowrap" };
};

const scorePill = (score) => {
  const n = Number(score ?? 0);
  const [bg, c] = n >= 80 ? ["rgba(74,222,128,.12)","#4ade80"] : n >= 50 ? ["rgba(251,191,36,.12)","#fbbf24"] : ["rgba(248,113,113,.12)","#f87171"];
  return { display:"inline-flex", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:600, background:bg, color:c };
};

// ─── Inline SVG Line Chart ─────────────────────────────────────────────────
function LineChart({ data }) {
  const W = 420, H = 120, PAD = { t:12, r:12, b:28, l:36 };
  if (!data?.length) return (
    <div style={{ height: H + PAD.t + PAD.b, display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", fontSize:"12px" }}>
      Chưa có dữ liệu hoạt động
    </div>
  );

  const maxScore = Math.max(...data.map(d => d.AvgScore ?? 0), 100);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const pts = data.map((d, i) => ({
    x: PAD.l + (i / Math.max(data.length - 1, 1)) * innerW,
    y: PAD.t + innerH - ((d.AvgScore ?? 0) / maxScore) * innerH,
    d,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${PAD.t + innerH} ` +
    pts.map(p => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length-1].x},${PAD.t + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + PAD.t + PAD.b}`} style={{ width:"100%", height:"auto", overflow:"visible" }}>
      <defs>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + innerH * t;
        return (
          <g key={t}>
            <line x1={PAD.l} x2={PAD.l + innerW} y1={y} y2={y} stroke="#252a38" strokeWidth="1" />
            <text x={PAD.l - 6} y={y + 4} fontSize="9" fill="#475569" textAnchor="end">
              {Math.round(maxScore * (1 - t))}
            </text>
          </g>
        );
      })}

      {/* area */}
      <path d={area} fill="url(#lineArea)" />

      {/* line */}
      <polyline points={polyline} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#38bdf8" stroke="#0d0f14" strokeWidth="1.5">
          <title>{`${fmtShortDate(p.d.Day)}: avg ${Math.round(p.d.AvgScore ?? 0)} — ${p.d.WordsStudied} từ`}</title>
        </circle>
      ))}

      {/* x-axis labels */}
      {pts.filter((_, i) => i % Math.ceil(pts.length / 6) === 0).map((p, i) => (
        <text key={i} x={p.x} y={H + PAD.t + 10} fontSize="9" fill="#475569" textAnchor="middle">
          {fmtShortDate(p.d.Day)}
        </text>
      ))}
    </svg>
  );
}

// ─── Mini Donut Chart ──────────────────────────────────────────────────────
function DonutChart({ mastered, learning, newCount }) {
  const total = mastered + learning + newCount;
  if (total === 0) return (
    <div style={{ width:80, height:80, borderRadius:"50%", background:"#252a38", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:10, color:"#64748b" }}>—</span>
    </div>
  );

  const cx = 40, cy = 40, r = 30, stroke = 10;
  const circ = 2 * Math.PI * r;

  const slices = [
    { val: mastered,  color: "#4ade80" },
    { val: learning,  color: "#fbbf24" },
    { val: newCount,  color: "#38bdf8" },
  ];

  let offset = 0;
  const paths = slices.map((s, i) => {
    const dash = (s.val / total) * circ;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={s.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px` }}
      >
        <title>{s.val} từ</title>
      </circle>
    );
    offset += dash;
    return el;
  });

  return (
    <svg width={80} height={80} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#252a38" strokeWidth={stroke} />
      {paths}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#e2e8f0" fontWeight="700">{Math.round(mastered/total*100)}%</text>
    </svg>
  );
}

// ─── Detail Tabs ───────────────────────────────────────────────────────────
const TABS = ["📊 Tổng quan", "📚 Từ vựng", "🎯 Lesson", "📈 Hoạt động"];

function DetailPanel({ user, uid, onStatusChange, onResetUser }) {
  const [tab, setTab]         = useState(0);
  const [detail, setDetail]   = useState(null);
  const [words, setWords]     = useState(null);
  const [lessons, setLessons] = useState(null);
  const [daily, setDaily]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [wordFilter, setWordFilter] = useState("Tất cả");
  const [wordSearch, setWordSearch] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const fetchTab = async (t) => {
    setLoading(true);
    try {
      if (t === 0 && !detail) {
        const r = await fetch(`${API}/${uid}`);
        const d = await r.json();
        setDetail(d);
      } else if (t === 1 && !words) {
        const r = await fetch(`${API}/${uid}/words`);
        setWords(await r.json());
      } else if (t === 2 && !lessons) {
        const r = await fetch(`${API}/${uid}/lessons`);
        setLessons(await r.json());
      } else if (t === 3 && !daily) {
        const r = await fetch(`${API}/${uid}/daily`);
        setDaily(await r.json());
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };



  const handleTab = (i) => { setTab(i); fetchTab(i); };

  const handleStatusChange = async (wordId, newStatus) => {
    try {
      await fetch(`${API}/${uid}/${wordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setWords(prev => prev?.map(w => w.WordID === wordId ? { ...w, Status: newStatus } : w));
      if (onStatusChange) onStatusChange();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (wordId) => {
    try {
      await fetch(`${API}/${uid}/${wordId}`, { method: "DELETE" });
      setWords(prev => prev?.map(w => w.WordID === wordId ? { ...w, Status: "Not Started" } : w));
      if (onStatusChange) onStatusChange();
    } catch(e) { console.error(e); }
  };

  const handleReset = async () => {
    try {
      await fetch(`${API}/${uid}/reset`, { method: "DELETE" });
      setWords(prev => prev?.map(w => ({ ...w, Status: "Not Started" })));
      setDetail(null);
      setConfirmReset(false);
      if (onResetUser) onResetUser(uid);
      fetchTab(0);
    } catch(e) { console.error(e); }
  };

  const filteredWords = (words ?? []).filter(w => {
    const matchStatus = wordFilter === "Tất cả" || w.Status === wordFilter;
    const q = wordSearch.toLowerCase();
    const matchSearch = !q || w.Word.toLowerCase().includes(q) || (w.Meaning ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ background:"#0e1118", border:"1px solid #6ee7b7", borderRadius:"14px", overflow:"hidden", animation:"slideDown .25s ease" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", borderBottom:"1px solid #252a38", padding:"0 16px", background:"#111420" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => handleTab(i)} style={{
            background:"none", border:"none", cursor:"pointer",
            padding:"12px 16px", fontSize:"12px", fontFamily:"'DM Sans',sans-serif",
            color: tab === i ? "#6ee7b7" : "#64748b",
            borderBottom: tab === i ? "2px solid #6ee7b7" : "2px solid transparent",
            transition:"all .15s", fontWeight: tab === i ? 600 : 400,
          }}>{t}</button>
        ))}
        <div style={{ flex:1 }} />
        {/* Reset button */}
        {confirmReset ? (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 8px" }}>
            <span style={{ fontSize:11, color:"#f87171" }}>Xác nhận reset?</span>
            <button onClick={handleReset} style={{ ...btnStyle("#f87171","rgba(248,113,113,.15)"), padding:"4px 10px", fontSize:11 }}>Có</button>
            <button onClick={() => setConfirmReset(false)} style={{ ...btnStyle("#64748b","rgba(100,116,139,.1)"), padding:"4px 10px", fontSize:11 }}>Không</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} style={{ ...btnStyle("#f87171","rgba(248,113,113,.1)"), margin:"8px", fontSize:11 }}>
            🗑 Reset tiến độ
          </button>
        )}
      </div>

      <div style={{ padding:"20px 22px" }}>
        {loading && <div style={{ color:"#64748b", fontSize:13 }}>⏳ Đang tải...</div>}

        {/* TAB 0 — Overview */}
        {!loading && tab === 0 && detail && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"New",     val: detail.user?.NewCount ?? 0,      color:"#38bdf8" },
                { label:"Learning",val: detail.user?.LearningCount ?? 0, color:"#fbbf24" },
                { label:"Mastered",val: detail.user?.MasteredCount ?? 0, color:"4ade80" },
                { label:"Tổng từ", val: detail.user?.TotalWords ?? 0,    color:"#e2e8f0" },
              ].map(m => (
                <div key={m.label} style={{ background:"#181c26", borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:m.color, lineHeight:1 }}>{m.val}</div>
                  <div style={{ fontSize:11, color:"#64748b", marginTop:4, textTransform:"uppercase", letterSpacing:"0.8px" }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div>
                <div style={colLabel}>Tiến độ theo chủ đề</div>
                {(detail.categoryProgress ?? []).map(c => (
                  <div key={c.CategoryID} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                    <div style={{ fontSize:12, color:"#94a3b8", width:90, textAlign:"right", flexShrink:0 }}>{c.CategoryName}</div>
                    <div style={{ flex:1, height:7, background:"#252a38", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:4, background:"linear-gradient(90deg,#6ee7b7,#38bdf8)", width:`${c.CategoryPercent ?? 0}%`, transition:"width .6s ease" }} />
                    </div>
                    <div style={{ fontSize:11, color:"#64748b", width:30 }}>{c.CategoryPercent ?? 0}%</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={colLabel}>Lịch sử quiz gần nhất</div>
                {(detail.quizHistory ?? []).length === 0
                  ? <div style={{ color:"#64748b", fontSize:12 }}>Chưa có lịch sử</div>
                  : (detail.quizHistory ?? []).map((h, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #1a1e2a" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{h.Word}</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        {h.Score != null ? <span style={scorePill(h.Score)}>{h.Score}%</span> : <span style={{ color:"#64748b", fontSize:12 }}>—</span>}
                        <span style={{ color:"#475569", fontSize:11 }}>{fmtDate(h.LearnDate)}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* TAB 1 — Word List */}
        {!loading && tab === 1 && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <input
                placeholder="🔍 Tìm từ..."
                value={wordSearch}
                onChange={e => setWordSearch(e.target.value)}
                style={{ background:"#181c26", border:"1px solid #252a38", borderRadius:8, padding:"6px 12px", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:"none", width:180 }}
              />
              {["Tất cả","Mastered","Learning","New","Not Started"].map(s => (
                <button key={s} onClick={() => setWordFilter(s)} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:11, border: wordFilter===s ? "1px solid #6ee7b7" : "1px solid #252a38",
                  background: wordFilter===s ? "rgba(110,231,183,.1)" : "transparent",
                  color: wordFilter===s ? "#6ee7b7" : "#64748b", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                }}>{s}</button>
              ))}
              <span style={{ marginLeft:"auto", color:"#64748b", fontSize:11 }}>{filteredWords.length} từ</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Từ vựng","Nghĩa","Chủ đề","Lesson","Độ khó","Trạng thái","Score","Thao tác"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign:"center", color:"#64748b", padding:32, fontSize:13 }}>Không có từ nào</td></tr>
                  )}
                  {filteredWords.map(w => (
                    <tr key={w.WordID} style={{ transition:"background .1s" }}>
                      <td style={td}><span style={{ fontWeight:600, color:"#e2e8f0" }}>{w.Word}</span></td>
                      <td style={{ ...td, color:"#94a3b8" }}>{w.Meaning}</td>
                      <td style={td}><span style={{ fontSize:11, color:"#64748b", background:"#1a1e2a", padding:"2px 8px", borderRadius:6 }}>{w.CategoryName ?? "—"}</span></td>
                      <td style={td}><span style={{ fontSize:11, color:"#64748b" }}>{w.LessonName ?? "—"}</span></td>
                      <td style={{ ...td, textAlign:"center" }}>
                        <span style={{ fontSize:11, color: w.DifficultyLevel >= 3 ? "#f87171" : w.DifficultyLevel === 2 ? "#fbbf24" : "#4ade80" }}>
                          {"★".repeat(w.DifficultyLevel ?? 1)}
                        </span>
                      </td>
                      <td style={td}>
                        <select
                          value={w.Status}
                          onChange={e => handleStatusChange(w.WordID, e.target.value)}
                          style={{ background:"#1a1e2a", border:"1px solid #252a38", borderRadius:6, padding:"3px 8px", color:(STATUS_COLOR[w.Status] ?? STATUS_COLOR["Not Started"])[1], fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", outline:"none" }}
                        >
                          {["New","Learning","Mastered"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={td}>
                        {w.BestScore != null
                          ? <span style={scorePill(w.BestScore)}>{w.BestScore}%</span>
                          : <span style={{ color:"#64748b", fontSize:12 }}>—</span>}
                      </td>
                      <td style={td}>
                        {w.Status !== "Not Started" && (
                          <button onClick={() => handleDelete(w.WordID)} title="Xóa tiến độ từ này" style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:14, padding:4 }}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2 — Lessons */}
        {!loading && tab === 2 && (
          <div>
            {(lessons ?? []).length === 0
              ? <div style={{ color:"#64748b", fontSize:13 }}>Chưa có dữ liệu lesson</div>
              : (lessons ?? []).map(l => (
                <div key={l.LessonID} style={{ background:"#181c26", borderRadius:10, padding:"14px 18px", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:600, color:"#e2e8f0", fontSize:13 }}>{l.LessonName ?? "(Chưa đặt tên)"}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{l.CategoryName} · {l.TotalWords} từ</div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={statusBadge("Mastered")}>{l.MasteredCount} Mastered</span>
                      <span style={statusBadge("Learning")}>{l.LearningCount} Learning</span>
                      <span style={statusBadge("New")}>{l.NewCount} New</span>
                      <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:"#6ee7b7", minWidth:36, textAlign:"right" }}>{l.LessonPercent ?? 0}%</span>
                    </div>
                  </div>
                  <div style={{ height:6, background:"#252a38", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#6ee7b7,#38bdf8)", width:`${l.LessonPercent ?? 0}%`, transition:"width .6s ease" }} />
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* TAB 3 — Daily activity */}
        {!loading && tab === 3 && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
              <div style={colLabel}>Điểm trung bình theo ngày (30 ngày gần nhất)</div>
              {(daily ?? []).length > 0 && (
                <div style={{ display:"flex", gap:16 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:"#38bdf8" }}>{(daily ?? []).length}</div>
                    <div style={{ fontSize:10, color:"#64748b" }}>Ngày học</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:"#6ee7b7" }}>
                      {Math.round((daily ?? []).reduce((a,d) => a + (d.AvgScore ?? 0), 0) / Math.max((daily??[]).length, 1))}
                    </div>
                    <div style={{ fontSize:10, color:"#64748b" }}>Avg Score</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:"#fbbf24" }}>
                      {(daily ?? []).reduce((a,d) => a + (d.WordsStudied ?? 0), 0)}
                    </div>
                    <div style={{ fontSize:10, color:"#64748b" }}>Tổng lượt học</div>
                  </div>
                </div>
              )}
            </div>
            <LineChart data={daily} />
            {(daily ?? []).length > 0 && (
              <div style={{ marginTop:16, overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["Ngày","Số lượt","Từ đã học","Avg Score"].map(h => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...(daily ?? [])].reverse().map((d, i) => (
                      <tr key={i}>
                        <td style={td}>{fmtShortDate(d.Day)} ({d.Day})</td>
                        <td style={td}>{d.SessionCount}</td>
                        <td style={td}>{d.WordsStudied}</td>
                        <td style={td}>
                          {d.AvgScore != null ? <span style={scorePill(d.AvgScore)}>{Math.round(d.AvgScore)}%</span> : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared mini-styles ────────────────────────────────────────────────────
const th = { fontSize:11, textTransform:"uppercase", letterSpacing:"1px", color:"#64748b", padding:"8px 14px", textAlign:"left", borderBottom:"1px solid #252a38", whiteSpace:"nowrap" };
const td = { padding:"10px 14px", fontSize:13, color:"#e2e8f0", verticalAlign:"middle", borderBottom:"1px solid #1a1e2a" };
const colLabel = { fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 };
const btnStyle = (color, bg) => ({ background:bg, border:`1px solid ${color}40`, borderRadius:7, padding:"6px 14px", color, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, transition:"all .15s" });

// ─── Progress Bar ──────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#252a38", borderRadius:3, overflow:"hidden", minWidth:70 }}>
        <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#38bdf8,#6ee7b7)", width:`${pct ?? 0}%`, transition:"width .6s ease" }} />
      </div>
      <span style={{ fontSize:11, color:"#64748b", width:32 }}>{pct ?? 0}%</span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function LearningProgress() {
  const [overview, setOverview]     = useState(null);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [filterStatus, setFilter]   = useState("Tất cả");
  const [search, setSearch]         = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const loadAll = async () => {
    setLoading(true); setError("");
    try {
      const [ovRes, usersRes] = await Promise.all([
        fetch(`${API}/overview`), fetch(`${API}/`),
      ]);
      if (!ovRes.ok || !usersRes.ok) throw new Error("Lỗi kết nối API");
      const [ov, us] = await Promise.all([ovRes.json(), usersRes.json()]);
      if (ov.error) throw new Error(ov.error);
      setOverview(ov); setUsers(us);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleResetUser = (uid) => {
    setUsers(prev => prev.map(u => u.UserID === uid
      ? { ...u, NewCount:0, LearningCount:0, MasteredCount:0, TotalWords:0, ProgressPercent:0, AvgQuizScore:null }
      : u
    ));
    loadAll(); // refresh overview
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.Username??"").toLowerCase().includes(q) || (u.Email??"").toLowerCase().includes(q);
    const matchStatus = filterStatus === "Tất cả"
      || (filterStatus==="New"      && (u.NewCount??0)>0)
      || (filterStatus==="Learning" && (u.LearningCount??0)>0)
      || (filterStatus==="Mastered" && (u.MasteredCount??0)>0);
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:"#e2e8f0", minHeight:"100vh", padding:"32px", background:"transparent" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        tbody tr:hover td { background: rgba(255,255,255,.015) }
        select option { background: #1a1e2a; }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:"#e2e8f0", lineHeight:1, margin:0 }}>
            Learning <em style={{ fontStyle:"italic", color:"#6ee7b7" }}>Progress</em>
          </h2>
          <p style={{ color:"#64748b", marginTop:6, fontSize:13, margin:"6px 0 0" }}>
            Theo dõi tiến độ học của tất cả người dùng — từng từ, từng lesson, từng ngày.
          </p>
        </div>
        <button onClick={loadAll} style={{ ...btnStyle("#64748b","rgba(100,116,139,.08)"), fontSize:12 }}>
          ↺ Làm mới
        </button>
      </div>

      {error && (
        <div style={{ background:"rgba(248,113,113,.12)", border:"1px solid rgba(248,113,113,.2)", borderRadius:10, padding:"14px 18px", color:"#f87171", fontSize:13, marginBottom:20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Overview cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:28 }}>
        {[
          { emoji:"👥", val:overview?.TotalLearners, label:"Người học",   color:"#38bdf8" },
          { emoji:"📗", val:overview?.TotalNew,      label:"New",          color:"#38bdf8" },
          { emoji:"📘", val:overview?.TotalLearning, label:"Đang học",     color:"#fbbf24" },
          { emoji:"🏆", val:overview?.TotalMastered, label:"Mastered",     color:"#4ade80" },
          { emoji:"📊", val:overview?.MasteredPercent != null ? `${overview.MasteredPercent}%` : "—", label:"Tỉ lệ Mastered", color:"#a78bfa" },
        ].map(c => (
          <div key={c.label} style={{ background:"#181c26", border:"1px solid #252a38", borderRadius:14, padding:"20px 20px" }}>
            <div style={{ fontSize:20, marginBottom:10 }}>{c.emoji}</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:c.color, lineHeight:1 }}>{c.val ?? "—"}</div>
            <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18, alignItems:"center" }}>
        <input
          style={{ background:"#181c26", border:"1px solid #252a38", borderRadius:8, padding:"7px 14px", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", width:230 }}
          placeholder="🔍  Tìm user, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {["Tất cả","New","Learning","Mastered"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:"6px 14px", borderRadius:20, fontSize:12,
            border: filterStatus===s ? "1px solid #6ee7b7" : "1px solid #252a38",
            background: filterStatus===s ? "rgba(110,231,183,.1)" : "transparent",
            color: filterStatus===s ? "#6ee7b7" : "#64748b",
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s",
          }}>{s}</button>
        ))}
        <span style={{ marginLeft:"auto", color:"#64748b", fontSize:12 }}>{filtered.length} người dùng</span>
      </div>

      {/* Table */}
      <div style={{ background:"#181c26", border:"1px solid #252a38", borderRadius:14, overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:40, color:"#64748b", fontSize:13, textAlign:"center" }}>⏳ Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Người dùng","Trạng thái","New","Learning","Mastered","Tiến độ","Quiz TB","Cập nhật","Chi tiết"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign:"center", color:"#64748b", padding:40, fontSize:13 }}>Không tìm thấy user phù hợp.</td></tr>
                )}
                {filtered.map(u => {
                  const isOpen = expandedId === u.UserID;
                  return (
                    <Fragment key={u.UserID}> {/* <--- Bọc bằng thẻ Fragment có chứa key */}
                      <tr style={{ cursor:"pointer" }} onClick={() => setExpandedId(isOpen ? null : u.UserID)}>
                        {/* ... (các <td> giữ nguyên) ... */}
                        <td style={td}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:8, background:avatarGrad(u.UserID), display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#0d0f14", flexShrink:0 }}>
                              {(u.Username??"?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight:500, fontSize:13 }}>{u.Username}</div>
                              <div style={{ fontSize:11, color:"#64748b" }}>{u.Email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={td}>
                          <DonutChart mastered={u.MasteredCount??0} learning={u.LearningCount??0} newCount={u.NewCount??0} />
                        </td>
                        <td style={td}><span style={statusBadge("New")}>{u.NewCount ?? 0}</span></td>
                        <td style={td}><span style={statusBadge("Learning")}>{u.LearningCount ?? 0}</span></td>
                        <td style={td}><span style={statusBadge("Mastered")}>{u.MasteredCount ?? 0}</span></td>
                        <td style={{ ...td, minWidth:130 }}><ProgressBar pct={u.ProgressPercent} /></td>
                        <td style={td}>
                          {u.AvgQuizScore != null
                            ? <span style={scorePill(u.AvgQuizScore)}>{Math.round(u.AvgQuizScore)}%</span>
                            : <span style={{ color:"#64748b", fontSize:12 }}>—</span>}
                        </td>
                        <td style={{ ...td, color:"#64748b", fontSize:12 }}>{fmtDate(u.LastReviewed)}</td>
                        <td style={td}>
                          <button
                            style={{ width:28, height:28, borderRadius:6, border: isOpen ? "1px solid #6ee7b7" : "1px solid #252a38", background:"transparent", cursor:"pointer", color: isOpen ? "#6ee7b7" : "#64748b", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", transform: isOpen ? "rotate(180deg)" : "none" }}
                            onClick={e => { e.stopPropagation(); setExpandedId(isOpen ? null : u.UserID); }}
                          >▾</button>
                        </td>
                      </tr>
                      
                      {isOpen && (
                        <tr>
                          <td colSpan={9} style={{ padding:"12px 16px 4px" }}>
                            <DetailPanel
                              user={u}
                              uid={u.UserID}
                              onStatusChange={loadAll}
                              onResetUser={handleResetUser}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}