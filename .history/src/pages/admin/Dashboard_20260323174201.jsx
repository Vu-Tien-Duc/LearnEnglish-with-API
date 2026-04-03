// src/pages/admin/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:5000/api/admin/dashboard";

// ─── helpers ──────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function initials(name = "") {
  return name.slice(0, 1).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#a78bfa,#6ee7b7)",
];

// ─── sub-components ────────────────────────────────────────────

function StatCard({ emoji, value, label, delta, deltaUp, color, onClick }) {
  return (
    <div className="stat-card" style={{ "--glow": color, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div className="emoji">{emoji}</div>
      <div className={`delta ${deltaUp ? "delta-up" : "delta-down"}`}>{delta}</div>
      <div className="value">{value?.toLocaleString()}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function BarChart({ data, maxCount }) {
  return (
    <div className="bar-chart">
      {data.map((row, i) => {
        const pct = maxCount > 0 ? Math.round((row.word_count / maxCount) * 100) : 0;
        return (
          <div className="bar-row" key={i}>
            <div className="bar-label" title={row.CategoryName}>
              {row.CategoryName?.length > 11 ? row.CategoryName.slice(0, 10) + "…" : row.CategoryName}
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="bar-count">{row.word_count}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ summary }) {
  const mastered = summary.Mastered || 0;
  const learning = summary.Learning || 0;
  const newW = summary.New || 0;
  const notStarted = summary.NotStarted || 0;
  const total = mastered + learning + newW + notStarted || 1;

  const toPct = (n) => ((n / total) * 100).toFixed(1);
  const masteredPct = toPct(mastered);
  const learningEnd = +masteredPct + +toPct(learning);
  const newEnd = learningEnd + +toPct(newW);

  const conicGrad = `conic-gradient(
    #6ee7b7 0% ${masteredPct}%,
    #38bdf8 ${masteredPct}% ${learningEnd}%,
    #f472b6 ${learningEnd}% ${newEnd}%,
    #252a38 ${newEnd}% 100%
  )`;

  return (
    <div className="donut-wrap" style={{ marginBottom: 20 }}>
      <div className="donut" style={{ background: conicGrad }} />
      <div className="donut-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: "#6ee7b7" }} />Mastered — {toPct(mastered)}%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#38bdf8" }} />Learning — {toPct(learning)}%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#f472b6" }} />New — {toPct(newW)}%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#252a38" }} />Chưa học — {toPct(notStarted)}%</div>
      </div>
    </div>
  );
}

function ActivityDot({ type }) {
  const map = { quiz: "", new_user: "warn", new_vocab: "" };
  return <div className={`tl-dot ${map[type] || ""}`} />;
}

function Skeleton({ h = 16, w = "100%", r = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: "linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─── main component ────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [vocabCat, setVocabCat] = useState([]);
  const [learnSummary, setLearnSummary] = useState({});
  const [activity, setActivity] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, vc, ls, act, tu] = await Promise.all([
        fetch(`${API}/stats`).then((r) => r.json()),
        fetch(`${API}/vocab-by-category`).then((r) => r.json()),
        fetch(`${API}/learning-summary`).then((r) => r.json()),
        fetch(`${API}/recent-activity`).then((r) => r.json()),
        fetch(`${API}/top-users`).then((r) => r.json()),
      ]);
      setStats(s);
      setVocabCat(vc);
      setLearnSummary(ls);
      setActivity(act);
      setTopUsers(tu);
    } catch (e) {
      setError("Không thể kết nối server. Kiểm tra lại backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh mỗi 60 giây
    const id = setInterval(fetchAll, 60_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const maxVocab = vocabCat.length > 0 ? Math.max(...vocabCat.map((r) => r.word_count)) : 1;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .dash-fade { animation: fadeUp .35s ease both; }
        .dash-fade:nth-child(2){ animation-delay:.05s }
        .dash-fade:nth-child(3){ animation-delay:.1s }
        .dash-fade:nth-child(4){ animation-delay:.15s }
      `}</style>

      <section id="dashboard" className="section active">
        {/* ── Header ───────────────────────────────── */}
        <div className="section-header">
          <div>
            <h2>Tổng quan <em>hệ thống</em></h2>
            <p>
              {loading
                ? "Đang tải dữ liệu từ cơ sở dữ liệu…"
                : error
                  ? <span style={{ color: "var(--danger)" }}>{error}</span>
                  : `Snapshot thời gian thực · ${new Date().toLocaleTimeString("vi-VN")}`}
            </p>
          </div>
          <button className="btn btn-primary" onClick={fetchAll} disabled={loading}>
            {loading ? "⟳ Đang tải…" : "⟳ Làm mới"}
          </button>
        </div>

        {/* ── Stat Cards ────────────────────────────── */}
        <div className="stats-grid">
          {loading
            ? [1, 2, 3, 4].map((k) => (
                <div key={k} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Skeleton h={22} w={36} />
                  <Skeleton h={36} w={80} />
                  <Skeleton h={12} w={100} />
                </div>
              ))
            : (
              <>
                <StatCard className="dash-fade" emoji="👤" value={stats?.total_users} label="Tổng Users" delta={`+${stats?.new_users_today ?? 0} hôm nay`} deltaUp color="rgba(56,189,248,.1)" />
                <StatCard className="dash-fade" emoji="📖" value={stats?.total_vocab} label="Từ vựng" delta={`+${stats?.new_vocab_today ?? 0} hôm nay`} deltaUp color="rgba(110,231,183,.1)" />
                <StatCard className="dash-fade" emoji="🗂" value={stats?.total_categories} label="Categories" delta="Hiện tại" deltaUp color="rgba(244,114,182,.1)" />
                <StatCard className="dash-fade" emoji="❓" value={stats?.total_quiz} label="Quiz Questions" delta="Toàn bộ" deltaUp color="rgba(251,191,36,.1)" />
              </>
            )}
        </div>

        {/* ── Charts ───────────────────────────────── */}
        <div className="two-col">
          {/* Bar chart — từ theo category */}
          <div className="card">
            <div className="card-header">
              <h3>📊 Từ theo Category</h3>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {loading ? "…" : `Top ${Math.min(vocabCat.length, 8)}`}
              </span>
            </div>
            <div className="card-body">
              {loading
                ? [1, 2, 3, 4, 5].map((k) => (
                    <div key={k} className="bar-row" style={{ marginBottom: 10 }}>
                      <Skeleton h={10} w={90} />
                      <Skeleton h={8} />
                      <Skeleton h={10} w={30} />
                    </div>
                  ))
                : vocabCat.length === 0
                  ? <p style={{ color: "var(--muted)", fontSize: 13 }}>Chưa có dữ liệu</p>
                  : <BarChart data={vocabCat.slice(0, 8)} maxCount={maxVocab} />}
            </div>
          </div>

          {/* Donut + progress */}
          <div className="card">
            <div className="card-header">
              <h3>🎯 Tiến độ học TB</h3>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Tất cả users</span>
            </div>
            <div className="card-body">
              {loading
                ? <>
                    <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                      <Skeleton h={100} w={100} r={50} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                        {[1, 2, 3, 4].map(k => <Skeleton key={k} h={12} />)}
                      </div>
                    </div>
                    <Skeleton h={6} /><br /><Skeleton h={6} />
                  </>
                : <>
                    <DonutChart summary={learnSummary} />
                    <div className="progress-row">
                      <div className="progress-meta">
                        <span>Quiz accuracy TB</span>
                        <span>{learnSummary.avg_quiz_score ?? 0}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${learnSummary.avg_quiz_score ?? 0}%` }} />
                      </div>
                    </div>
                    <div className="progress-row" style={{ marginTop: 12 }}>
                      <div className="progress-meta">
                        <span>Tổng lượt học</span>
                        <span>{((learnSummary.Mastered || 0) + (learnSummary.Learning || 0) + (learnSummary.New || 0)).toLocaleString()}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </>}
            </div>
          </div>
        </div>

        {/* ── Activity + Top Users ──────────────────── */}
        <div className="two-col">
          {/* Recent activity */}
          <div className="card">
            <div className="card-header">
              <h3>🕐 Hoạt động gần đây</h3>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {loading ? "…" : `${activity.length} sự kiện`}
              </span>
            </div>
            <div className="card-body">
              {loading
                ? [1, 2, 3, 4, 5].map(k => (
                    <div key={k} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                      <Skeleton h={8} w={8} r={4} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <Skeleton h={13} />
                        <Skeleton h={10} w="60%" />
                      </div>
                    </div>
                  ))
                : activity.length === 0
                  ? <p style={{ color: "var(--muted)", fontSize: 13 }}>Chưa có hoạt động</p>
                  : (
                    <div className="timeline">
                      {activity.map((act, i) => (
                        <div className="tl-item" key={i}>
                          <ActivityDot type={act.type} />
                          <div className="tl-body">
                            <div className="tl-title">{act.text}</div>
                            <div className="tl-meta">
                              {act.meta && <>{act.meta} · </>}
                              {timeAgo(act.time)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
            </div>
          </div>

          {/* Top users */}
          <div className="card">
            <div className="card-header">
              <h3>🏆 Top Users</h3>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Theo từ đã Mastered</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["User", "Mastered", "Learning", "New", "Lần cuối"].map((h) => (
                      <th key={h} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", padding: "10px 16px", textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [1, 2, 3].map(k => (
                        <tr key={k}>
                          {[1, 2, 3, 4, 5].map(j => (
                            <td key={j} style={{ padding: "12px 16px" }}><Skeleton h={13} /></td>
                          ))}
                        </tr>
                      ))
                    : topUsers.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "16px", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                            Chưa có dữ liệu học
                          </td>
                        </tr>
                      )
                      : topUsers.map((u, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "12px 16px" }}>
                              <div className="user-cell">
                                <div className="u-avatar" style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                                  {initials(u.Username)}
                                </div>
                                <div>
                                  <div className="u-name">{u.Username}</div>
                                  <div className="u-email">{u.Email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span className="badge badge-mastered">{u.mastered}</span>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span className="badge badge-learning">{u.learning}</span>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span className="badge badge-new">{u.new_words}</span>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 11, color: "var(--muted)" }}>
                              {u.last_active ? timeAgo(u.last_active) : "—"}
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────── */}
        {error && (
          <div style={{
            background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)",
            borderRadius: 10, padding: "14px 20px", color: "var(--danger)",
            fontSize: 13, marginTop: 16,
          }}>
            ⚠ {error}
            <button onClick={fetchAll} style={{ marginLeft: 16, background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13 }}>
              Thử lại
            </button>
          </div>
        )}
      </section>
    </>
  );
}