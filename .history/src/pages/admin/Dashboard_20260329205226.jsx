import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin/dashboard";

/* ═══════════════ TOKENS ═══════════════ */
const T = {
  bg:      "#0d0f14",
  surface: "#13161e",
  card:    "#181c26",
  border:  "#252a38",
  border2: "#1e2330",
  accent:  "#6ee7b7",
  accent2: "#38bdf8",
  accent3: "#f472b6",
  gold:    "#fbbf24",
  text:    "#e2e8f0",
  muted:   "#64748b",
  danger:  "#f87171",
  success: "#4ade80",
};

/* ═══════════════ HELPERS ═══════════════ */
const fmtTime = iso => {
  if (!iso) return "—";
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1)    return "Vừa xong";
  if (diff < 60)   return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return d.toLocaleDateString("vi-VN");
};

const ACTIVITY_CFG = {
  quiz:      { icon: "🎯", color: T.accent2, bg: "rgba(56,189,248,.1)",  label: "Quiz" },
  new_user:  { icon: "👤", color: T.accent,  bg: "rgba(110,231,183,.1)", label: "User mới" },
  new_vocab: { icon: "📖", color: T.gold,    bg: "rgba(251,191,36,.1)",  label: "Từ mới" },
};

const GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#38bdf8,#a78bfa)",
  "linear-gradient(135deg,#fb923c,#f472b6)",
];
const avatarGrad = id => GRADIENTS[(id ?? 0) % GRADIENTS.length];

/* ═══════════════ INLINE SVG BAR CHART ═══════════════ */
function BarChart({ data }) {
  if (!data?.length) return (
    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 13 }}>
      Đang tải dữ liệu…
    </div>
  );

  const max = Math.max(...data.map(d => d.word_count), 1);
  const W = 520, H = 160, barW = Math.min(36, Math.floor((W - 40) / data.length) - 8);
  const gap = Math.floor((W - 40) / data.length);

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.accent} stopOpacity="1" />
          <stop offset="100%" stopColor={T.accent2} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = 10 + H * t;
        return (
          <g key={t}>
            <line x1={36} x2={W - 4} y1={y} y2={y} stroke={T.border} strokeWidth="1" />
            <text x={30} y={y + 4} fontSize="9" fill={T.muted} textAnchor="end">
              {Math.round(max * (1 - t))}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max(4, (d.word_count / max) * H);
        const x = 40 + i * gap + (gap - barW) / 2;
        const y = 10 + H - barH;
        const shortName = d.CategoryName?.length > 10 ? d.CategoryName.slice(0, 9) + "…" : d.CategoryName;
        return (
          <g key={i}>
            {/* Bar bg */}
            <rect x={x} y={10} width={barW} height={H} rx={4} fill={T.border} opacity={0.3} />
            {/* Bar fill */}
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="url(#barGrad)">
              <title>{`${d.CategoryName}: ${d.word_count} từ`}</title>
            </rect>
            {/* Value label */}
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="10" fill={T.accent} fontWeight="600">
              {d.word_count}
            </text>
            {/* Category label */}
            <text x={x + barW / 2} y={H + 26} textAnchor="middle" fontSize="9" fill={T.muted}>
              {shortName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════ DONUT CHART ═══════════════ */
function DonutChart({ mastered = 0, learning = 0, newW = 0, notStarted = 0 }) {
  const total = mastered + learning + newW + notStarted;
  if (total === 0) return null;

  const cx = 70, cy = 70, r = 52, stroke = 14;
  const circ = 2 * Math.PI * r;

  const slices = [
    { val: mastered,   color: T.success,  label: "Mastered" },
    { val: learning,   color: T.gold,     label: "Learning" },
    { val: newW,       color: T.accent2,  label: "New" },
    { val: notStarted, color: T.border,   label: "Chưa học" },
  ];

  let offset = 0;
  const paths = slices.map((s, i) => {
    const dash = (s.val / total) * circ;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={s.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        <title>{`${s.label}: ${s.val}`}</title>
      </circle>
    );
    offset += dash;
    return el;
  });

  const mastPct = Math.round((mastered / total) * 100);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={140} height={140} viewBox={`0 0 140 140`} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        {paths}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fill={T.text} fontWeight="700" fontFamily="'DM Serif Display',serif">
          {mastPct}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={T.muted}>Mastered</text>
      </svg>
      <div style={{ flex: 1 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: T.muted, flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
              {s.val.toLocaleString()}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.muted }}>Tổng cộng</div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: T.text, marginTop: 2 }}>
            {total.toLocaleString()} <span style={{ fontSize: 12, color: T.muted }}>từ vựng</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ STAT CARD ═══════════════ */
function StatCard({ label, value, sub, subLabel, color, icon, gradient }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 22px", position: "relative", overflow: "hidden",
    }}>
      {/* Gradient glow blob */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: gradient || `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.muted }}>
          {label}
        </div>
        <div style={{ fontSize: 20, lineHeight: 1, opacity: 0.8 }}>{icon}</div>
      </div>

      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color, lineHeight: 1, marginBottom: 8 }}>
        {value != null ? value.toLocaleString() : <span style={{ fontSize: 20, color: T.muted }}>—</span>}
      </div>

      {sub != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
          <span style={{ color: T.success, fontWeight: 600 }}>+{sub}</span>
          <span style={{ color: T.muted }}>{subLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ ACTIVITY FEED ═══════════════ */
function ActivityFeed({ activities }) {
  if (!activities) return (
    <div style={{ padding: "20px", color: T.muted, fontSize: 13, textAlign: "center" }}>Đang tải…</div>
  );
  if (!activities.length) return (
    <div style={{ padding: "20px", color: T.muted, fontSize: 13, textAlign: "center" }}>Chưa có hoạt động nào.</div>
  );

  return (
    <div>
      {activities.map((a, i) => {
        const cfg = ACTIVITY_CFG[a.type] || ACTIVITY_CFG.new_vocab;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "11px 0",
            borderBottom: i < activities.length - 1 ? `1px solid ${T.border2}` : "none",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>{cfg.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{a.text}</div>
              {a.meta && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{a.meta}</div>}
            </div>
            <div style={{ fontSize: 11, color: T.muted, flexShrink: 0, marginTop: 2 }}>
              {fmtTime(a.time)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════ TOP USERS TABLE ═══════════════ */
function TopUsers({ users }) {
  if (!users) return <div style={{ color: T.muted, fontSize: 13, padding: "16px 0" }}>Đang tải…</div>;
  if (!users.length) return <div style={{ color: T.muted, fontSize: 13 }}>Chưa có dữ liệu.</div>;

  const th = { fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: T.muted, padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${T.border}` };
  const td = { padding: "11px 12px", fontSize: 13, color: T.text, verticalAlign: "middle", borderBottom: `1px solid ${T.border2}` };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Người dùng</th>
            <th style={th}>Mastered</th>
            <th style={th}>Learning</th>
            <th style={th}>Hoạt động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td style={{ ...td, color: T.muted, fontWeight: 700, width: 36 }}>{i + 1}</td>
              <td style={td}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: avatarGrad(i),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#0d0f14",
                  }}>
                    {(u.Username || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.Username}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{u.Email}</div>
                  </div>
                </div>
              </td>
              <td style={td}>
                <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(74,222,128,.1)", color: T.success }}>
                  {u.mastered ?? 0}
                </span>
              </td>
              <td style={td}>
                <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(251,191,36,.1)", color: T.gold }}>
                  {u.learning ?? 0}
                </span>
              </td>
              <td style={{ ...td, color: T.muted, fontSize: 12 }}>{fmtTime(u.last_active)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════ SECTION WRAPPER ═══════════════ */
function Section({ title, sub, children, action }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: T.text }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

/* ═══════════════ QUIZ SCORE BADGE ═══════════════ */
function ScoreBadge({ score }) {
  const n = Number(score ?? 0);
  const [bg, col] = n >= 80 ? ["rgba(74,222,128,.1)", T.success] : n >= 50 ? ["rgba(251,191,36,.1)", T.gold] : ["rgba(248,113,113,.1)", T.danger];
  return <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color: col }}>{Math.round(n)}%</span>;
}

/* ═══════════════ MAIN DASHBOARD ═══════════════ */
export default function Dashboard() {
  const [stats,      setStats]    = useState(null);
  const [byCategory, setByCategory] = useState(null);
  const [learnSum,   setLearnSum] = useState(null);
  const [activity,   setActivity] = useState(null);
  const [topUsers,   setTopUsers] = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [error,      setError]    = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [s, bc, ls, ac, tu] = await Promise.all([
        fetch(`${API}/stats`).then(r => r.json()),
        fetch(`${API}/vocab-by-category`).then(r => r.json()),
        fetch(`${API}/learning-summary`).then(r => r.json()),
        fetch(`${API}/recent-activity`).then(r => r.json()),
        fetch(`${API}/top-users`).then(r => r.json()),
      ]);
      setStats(s); setByCategory(bc); setLearnSum(ls); setActivity(ac); setTopUsers(tu);
    } catch (e) {
      setError("Không thể kết nối tới server. Hãy kiểm tra backend Flask.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: "Tổng Users",      value: stats?.total_users,      sub: stats?.new_users_today, subLabel: "hôm nay", color: T.accent2, icon: "◎", gradient: `radial-gradient(circle, ${T.accent2}25 0%, transparent 70%)` },
    { label: "Tổng Từ vựng",    value: stats?.total_vocab,      sub: stats?.new_vocab_today, subLabel: "hôm nay", color: T.accent,  icon: "◈", gradient: `radial-gradient(circle, ${T.accent}25 0%, transparent 70%)` },
    { label: "Categories",      value: stats?.total_categories, color: T.accent3, icon: "⊡", gradient: `radial-gradient(circle, ${T.accent3}20 0%, transparent 70%)` },
    { label: "Quiz Questions",  value: stats?.total_quiz,       color: T.gold,    icon: "◇", gradient: `radial-gradient(circle, ${T.gold}20 0%, transparent 70%)` },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: T.text }}>
      {/* Inject serif font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .skel{display:block;border-radius:6px;background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        tbody tr:hover td{background:rgba(255,255,255,0.012)}
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 30, color: T.text, lineHeight: 1.1 }}>
            Dashboard <em style={{ fontStyle: "italic", color: T.accent }}>Overview</em>
          </h1>
          <p style={{ color: T.muted, marginTop: 6, fontSize: 13 }}>
            Dữ liệu thực từ CSDL — cập nhật mỗi lần tải trang.
          </p>
        </div>
        <button
          onClick={load}
          style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, color: T.muted, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "all .18s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
        >
          ↺ Làm mới
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background: "rgba(248,113,113,.1)", border: `1px solid rgba(248,113,113,.25)`, borderRadius: 10, padding: "13px 18px", color: T.danger, fontSize: 13, marginBottom: 22, display: "flex", gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <span className="skel" style={{ height: 12, width: "60%", marginBottom: 14, display: "block" }} />
              <span className="skel" style={{ height: 32, width: "50%", marginBottom: 10, display: "block" }} />
              <span className="skel" style={{ height: 10, width: "40%", display: "block" }} />
            </div>
          ))
          : statCards.map(c => <StatCard key={c.label} {...c} />)
        }
      </div>

      {/* ── Quiz avg score banner ── */}
      {learnSum?.avg_quiz_score != null && !loading && (
        <div style={{
          background: "rgba(110,231,183,0.06)", border: `1px solid rgba(110,231,183,0.2)`,
          borderRadius: 10, padding: "12px 20px", marginBottom: 22,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span style={{ fontSize: 13, color: T.text }}>
            Điểm quiz trung bình toàn hệ thống:
          </span>
          <ScoreBadge score={learnSum.avg_quiz_score} />
          <span style={{ fontSize: 12, color: T.muted, marginLeft: 4 }}>
            (tính từ tất cả bài làm trong DB)
          </span>
        </div>
      )}

      {/* ── Row 2: Donut + Bar chart ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 16, marginBottom: 16 }}>
        {/* Donut */}
        <Section title="Trạng thái học" sub="Phân bố từ vựng theo tiến độ">
          {loading
            ? <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="skel" style={{ width: 140, height: 140, borderRadius: "50%", display: "block" }} />
              </div>
            : <DonutChart
                mastered={learnSum?.Mastered || 0}
                learning={learnSum?.Learning || 0}
                newW={learnSum?.New || 0}
                notStarted={learnSum?.NotStarted || 0}
              />
          }
        </Section>

        {/* Bar chart */}
        <Section title="Từ vựng theo Category" sub="Số lượng từ trong mỗi chủ đề">
          {loading
            ? <span className="skel" style={{ height: 180, display: "block", borderRadius: 8 }} />
            : <BarChart data={byCategory} />
          }
        </Section>
      </div>

      {/* ── Row 3: Top users + Recent activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Top users */}
        <Section
          title="Top 5 Người dùng"
          sub="Xếp hạng theo số từ đã Mastered"
        >
          {loading
            ? Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border2}` }}>
                <span className="skel" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span className="skel" style={{ height: 12, width: "60%", display: "block", marginBottom: 6 }} />
                  <span className="skel" style={{ height: 10, width: "40%", display: "block" }} />
                </div>
              </div>
            ))
            : <TopUsers users={topUsers} />
          }
        </Section>

        {/* Recent activity */}
        <Section
          title="Hoạt động gần đây"
          sub="Quiz, user mới, từ vựng mới"
        >
          {loading
            ? Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border2}` }}>
                <span className="skel" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span className="skel" style={{ height: 12, width: "80%", display: "block", marginBottom: 6 }} />
                  <span className="skel" style={{ height: 10, width: "30%", display: "block" }} />
                </div>
              </div>
            ))
            : <ActivityFeed activities={activity} />
          }
        </Section>
      </div>
    </div>
  );
}