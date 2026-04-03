// src/pages/admin/Dashboard.jsx
// ✅ Self-contained — không cần import CSS bên ngoài
import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:5000/api/admin/dashboard";

/* ─── All styles scoped inside .dash-root ───────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .dash-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80; --warn:#fb923c;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg); min-height:100%;
  }
  .dash-root *,
  .dash-root *::before,
  .dash-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* Header */
  .dash-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; }
  .dash-header h2 { font-family:'DM Serif Display',serif; font-size:28px; color:var(--text); line-height:1; }
  .dash-header h2 em { font-style:italic; color:var(--accent); }
  .dash-header p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* Btn */
  .dash-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; background:var(--accent); color:#0d0f14;
    transition:all .2s;
  }
  .dash-btn:hover { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .dash-btn:disabled { opacity:.5; cursor:not-allowed; }

  /* Stats */
  .dash-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:1100px){ .dash-stats{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:640px) { .dash-stats{grid-template-columns:1fr 1fr;} }

  .dash-stat {
    background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:22px 24px; position:relative; overflow:hidden;
    transition:border-color .2s, transform .2s; cursor:default;
  }
  .dash-stat:hover { border-color:var(--accent); transform:translateY(-2px); }
  .dash-stat::after {
    content:''; position:absolute; right:-20px; bottom:-20px;
    width:80px; height:80px; border-radius:50%;
    background:var(--glow,rgba(110,231,183,.07));
  }
  .ds-emoji { font-size:22px; margin-bottom:12px; }
  .ds-val { font-family:'DM Serif Display',serif; font-size:36px; color:var(--text); line-height:1; margin-bottom:4px; }
  .ds-label { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; }
  .ds-delta {
    position:absolute; top:22px; right:20px;
    font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px;
    background:rgba(74,222,128,.12); color:var(--success);
  }

  /* 2-col */
  .dash-2col { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
  @media(max-width:900px){ .dash-2col{grid-template-columns:1fr;} }

  /* Card */
  .dash-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .dash-card-head { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid var(--border); }
  .dash-card-head h3 { font-size:14px; font-weight:600; color:var(--text); display:flex; align-items:center; gap:8px; }
  .dash-card-head .head-sub { font-size:11px; color:var(--muted); }
  .dash-card-body { padding:22px; }

  /* Bar chart */
  .dash-bar-chart { display:flex; flex-direction:column; gap:10px; }
  .dash-bar-row { display:flex; align-items:center; gap:10px; }
  .dash-bar-label { font-size:12px; color:var(--muted); width:90px; flex-shrink:0; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .dash-bar-track { flex:1; height:8px; background:var(--border); border-radius:4px; overflow:hidden; }
  .dash-bar-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--accent),var(--accent2)); transition:width .7s cubic-bezier(.4,0,.2,1); }
  .dash-bar-count { font-size:12px; color:var(--muted); width:32px; text-align:right; }

  /* Donut */
  .dash-donut-wrap { display:flex; align-items:center; gap:24px; margin-bottom:20px; }
  .dash-donut { width:100px; height:100px; border-radius:50%; position:relative; flex-shrink:0; }
  .dash-donut::after { content:''; position:absolute; inset:20px; border-radius:50%; background:var(--card); }
  .dash-legend { display:flex; flex-direction:column; gap:8px; }
  .dash-legend-item { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); }
  .dash-legend-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

  /* Progress */
  .dash-prog-row { display:flex; flex-direction:column; gap:4px; margin-bottom:14px; }
  .dash-prog-meta { display:flex; justify-content:space-between; font-size:12px; color:var(--muted); }
  .dash-prog-track { height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
  .dash-prog-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--accent2),var(--accent)); transition:width .7s cubic-bezier(.4,0,.2,1); }

  /* Timeline */
  .dash-timeline { display:flex; flex-direction:column; gap:14px; }
  .dash-tl-item { display:flex; align-items:flex-start; gap:12px; }
  .dash-tl-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); flex-shrink:0; margin-top:5px; }
  .dash-tl-dot.warn { background:var(--gold); }
  .dash-tl-dot.dim  { background:var(--muted); }
  .dash-tl-title { font-size:13px; font-weight:500; }
  .dash-tl-meta { font-size:11px; color:var(--muted); margin-top:2px; }

  /* Table */
  .dash-tbl-wrap { overflow-x:auto; }
  .dash-tbl { width:100%; border-collapse:collapse; }
  .dash-tbl thead th { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); padding:10px 16px; text-align:left; border-bottom:1px solid var(--border); white-space:nowrap; }
  .dash-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
  .dash-tbl tbody tr:last-child { border-bottom:none; }
  .dash-tbl tbody tr:hover { background:rgba(255,255,255,.02); }
  .dash-tbl tbody td { padding:12px 16px; font-size:13px; color:var(--text); vertical-align:middle; }

  /* Badges */
  .dash-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }
  .dash-badge.mastered { background:rgba(74,222,128,.1);  color:var(--success); }
  .dash-badge.learning { background:rgba(251,191,36,.12); color:var(--gold); }
  .dash-badge.newword  { background:rgba(56,189,248,.1);  color:var(--accent2); }

  /* User cell */
  .dash-user-cell { display:flex; align-items:center; gap:10px; }
  .dash-avatar { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#0d0f14; flex-shrink:0; }
  .dash-u-name { font-weight:500; font-size:13px; }
  .dash-u-email { font-size:11px; color:var(--muted); }

  /* Skeleton */
  @keyframes dash-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .dash-skel { display:block; border-radius:6px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:dash-shim 1.4s infinite; }

  /* Fade up */
  @keyframes dash-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .dash-up { animation:dash-up .4s ease both; }

  /* Error */
  .dash-err { background:rgba(248,113,113,.1); border:1px solid rgba(248,113,113,.3); border-radius:10px; padding:14px 20px; color:var(--danger); font-size:13px; margin-top:16px; display:flex; align-items:center; gap:12px; }
  .dash-err button { background:none; border:none; color:var(--accent); cursor:pointer; font-size:13px; padding:0; font-family:inherit; }

  /* Empty */
  .dash-empty { color:var(--muted); font-size:13px; text-align:center; padding:24px 0; }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return "";
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60)    return `${Math.floor(d)}s trước`;
  if (d < 3600)  return `${Math.floor(d/60)} phút trước`;
  if (d < 86400) return `${Math.floor(d/3600)} giờ trước`;
  return `${Math.floor(d/86400)} ngày trước`;
}
const GRADS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#a78bfa,#6ee7b7)",
];

/* ─── Small components ──────────────────────────────────────── */
function Skel({ h=14, w="100%", r=6 }) {
  return <span className="dash-skel" style={{ height:h, width:w, borderRadius:r, display:"block" }} />;
}

function StatCard({ emoji, value, label, delta, glow, delay }) {
  return (
    <div className="dash-stat dash-up" style={{ "--glow": glow, animationDelay: delay }}>
      <div className="ds-emoji">{emoji}</div>
      <div className="ds-delta">{delta}</div>
      <div className="ds-val">{(value ?? 0).toLocaleString()}</div>
      <div className="ds-label">{label}</div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(r => r.word_count), 1);
  return (
    <div className="dash-bar-chart">
      {data.map((row, i) => (
        <div className="dash-bar-row" key={i}>
          <div className="dash-bar-label" title={row.CategoryName}>{row.CategoryName}</div>
          <div className="dash-bar-track">
            <div className="dash-bar-fill" style={{ width:`${Math.round(row.word_count/max*100)}%` }} />
          </div>
          <div className="dash-bar-count">{row.word_count}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ s }) {
  const M = s.Mastered || 0, L = s.Learning || 0, N = s.New || 0, NS = s.NotStarted || 0;
  const total = M + L + N + NS || 1;
  const p = n => ((n/total)*100).toFixed(1);
  const mP = +p(M), lE = mP + +p(L), nE = lE + +p(N);
  const grad = `conic-gradient(#6ee7b7 0% ${mP}%,#38bdf8 ${mP}% ${lE}%,#f472b6 ${lE}% ${nE}%,#252a38 ${nE}% 100%)`;
  return (
    <div className="dash-donut-wrap">
      <div className="dash-donut" style={{ background: grad }} />
      <div className="dash-legend">
        {[["#6ee7b7","Mastered",p(M)],["#38bdf8","Learning",p(L)],["#f472b6","New",p(N)],["#252a38","Chưa học",p(NS)]].map(([c,lb,pp])=>(
          <div className="dash-legend-item" key={lb}>
            <div className="dash-legend-dot" style={{ background:c }} />
            {lb} — {pp}%
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats,    setStats]    = useState(null);
  const [vocabCat, setVocabCat] = useState([]);
  const [summary,  setSummary]  = useState({});
  const [activity, setActivity] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [s,vc,ls,act,tu] = await Promise.all([
        fetch(`${API}/stats`).then(r=>r.json()),
        fetch(`${API}/vocab-by-category`).then(r=>r.json()),
        fetch(`${API}/learning-summary`).then(r=>r.json()),
        fetch(`${API}/recent-activity`).then(r=>r.json()),
        fetch(`${API}/top-users`).then(r=>r.json()),
      ]);
      setStats(s); setVocabCat(vc); setSummary(ls); setActivity(act); setTopUsers(tu);
    } catch {
      setError("Không thể kết nối tới backend. Kiểm tra Flask đang chạy chưa.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); const id=setInterval(fetchAll,60000); return ()=>clearInterval(id); }, [fetchAll]);

  return (
    <div className="dash-root">
      <style>{STYLES}</style>

      {/* Header */}
      <div className="dash-header">
        <div>
          <h2>Tổng quan <em>hệ thống</em></h2>
          <p>{loading ? "Đang tải dữ liệu…" : error
            ? <span style={{color:"var(--danger)"}}>{error}</span>
            : `Snapshot thời gian thực · ${new Date().toLocaleTimeString("vi-VN")}`}
          </p>
        </div>
        <button className="dash-btn" onClick={fetchAll} disabled={loading}>
          {loading ? "⟳ Đang tải…" : "⟳ Làm mới"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="dash-stats">
        {loading
          ? [1,2,3,4].map(k=>(
              <div key={k} className="dash-stat" style={{display:"flex",flexDirection:"column",gap:10,cursor:"default"}}>
                <Skel h={22} w={36}/><Skel h={36} w={80}/><Skel h={12} w={100}/>
              </div>
            ))
          : <>
              <StatCard emoji="👤" value={stats?.total_users}      label="Tổng Users"     delta={`+${stats?.new_users_today??0} hôm nay`} glow="rgba(56,189,248,.1)"  delay=".0s"/>
              <StatCard emoji="📖" value={stats?.total_vocab}      label="Từ vựng"        delta={`+${stats?.new_vocab_today??0} hôm nay`} glow="rgba(110,231,183,.1)" delay=".05s"/>
              <StatCard emoji="🗂" value={stats?.total_categories} label="Categories"     delta="Hiện tại"                                glow="rgba(244,114,182,.1)" delay=".1s"/>
              <StatCard emoji="❓" value={stats?.total_quiz}       label="Quiz Questions" delta="Toàn bộ"                                  glow="rgba(251,191,36,.1)"  delay=".15s"/>
            </>
        }
      </div>

      {/* Charts */}
      <div className="dash-2col">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>📊 Từ theo Category</h3>
            <span className="head-sub">{loading?"…":`Top ${Math.min(vocabCat.length,8)}`}</span>
          </div>
          <div className="dash-card-body">
            {loading
              ? [1,2,3,4,5].map(k=>(
                  <div key={k} className="dash-bar-row" style={{marginBottom:10}}>
                    <Skel h={10} w={90}/><Skel h={8}/><Skel h={10} w={30}/>
                  </div>
                ))
              : vocabCat.length===0
                ? <p className="dash-empty">Chưa có dữ liệu</p>
                : <BarChart data={vocabCat.slice(0,8)}/>
            }
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3>🎯 Tiến độ học</h3>
            <span className="head-sub">Tất cả users</span>
          </div>
          <div className="dash-card-body">
            {loading
              ? <><div style={{display:"flex",gap:24,marginBottom:20}}><Skel h={100} w={100} r={50}/><div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>{[1,2,3,4].map(k=><Skel key={k} h={12}/>)}</div></div><Skel h={6}/><br/><Skel h={6}/></>
              : <>
                  <DonutChart s={summary}/>
                  <div className="dash-prog-row">
                    <div className="dash-prog-meta"><span>Quiz accuracy TB</span><span>{summary.avg_quiz_score??0}%</span></div>
                    <div className="dash-prog-track"><div className="dash-prog-fill" style={{width:`${summary.avg_quiz_score??0}%`}}/></div>
                  </div>
                  <div className="dash-prog-row">
                    <div className="dash-prog-meta"><span>Tổng lượt học</span><span>{((summary.Mastered||0)+(summary.Learning||0)+(summary.New||0)).toLocaleString()}</span></div>
                    <div className="dash-prog-track"><div className="dash-prog-fill" style={{width:"100%"}}/></div>
                  </div>
                </>
            }
          </div>
        </div>
      </div>

      {/* Activity + Top users */}
      <div className="dash-2col">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>🕐 Hoạt động gần đây</h3>
            <span className="head-sub">{loading?"…":`${activity.length} sự kiện`}</span>
          </div>
          <div className="dash-card-body">
            {loading
              ? [1,2,3,4,5].map(k=>(
                  <div key={k} style={{display:"flex",gap:12,marginBottom:14}}>
                    <Skel h={8} w={8} r={4}/>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                      <Skel h={13}/><Skel h={10} w="60%"/>
                    </div>
                  </div>
                ))
              : activity.length===0
                ? <p className="dash-empty">Chưa có hoạt động</p>
                : (
                  <div className="dash-timeline">
                    {activity.map((act,i)=>(
                      <div className="dash-tl-item" key={i}>
                        <div className={`dash-tl-dot ${act.type==="new_user"?"warn":""}`}/>
                        <div>
                          <div className="dash-tl-title">{act.text}</div>
                          <div className="dash-tl-meta">{act.meta&&<>{act.meta} · </>}{timeAgo(act.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3>🏆 Top Users</h3>
            <span className="head-sub">Theo Mastered</span>
          </div>
          <div className="dash-tbl-wrap">
            <table className="dash-tbl">
              <thead><tr>{["User","Mastered","Learning","New","Lần cuối"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {loading
                  ? [1,2,3].map(k=><tr key={k}>{[1,2,3,4,5].map(j=><td key={j}><Skel h={13}/></td>)}</tr>)
                  : topUsers.length===0
                    ? <tr><td colSpan={5} className="dash-empty">Chưa có dữ liệu học</td></tr>
                    : topUsers.map((u,i)=>(
                        <tr key={i}>
                          <td>
                            <div className="dash-user-cell">
                              <div className="dash-avatar" style={{background:GRADS[i%GRADS.length]}}>
                                {(u.Username||"?")[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="dash-u-name">{u.Username}</div>
                                <div className="dash-u-email">{u.Email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="dash-badge mastered">{u.mastered}</span></td>
                          <td><span className="dash-badge learning">{u.learning}</span></td>
                          <td><span className="dash-badge newword">{u.new_words}</span></td>
                          <td style={{fontSize:11,color:"var(--muted)"}}>{u.last_active?timeAgo(u.last_active):"—"}</td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {error&&(
        <div className="dash-err">
          ⚠ {error}
          <button onClick={fetchAll}>Thử lại</button>
        </div>
      )}
    </div>
  );
}