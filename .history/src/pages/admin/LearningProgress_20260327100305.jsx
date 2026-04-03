import { useState, useEffect } from "react";

// ─── Inline styles matching LexiAdmin dark theme ───────────────────────────
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "32px",
    background: "transparent",
  },

  /* Section header */
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  h2: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "28px",
    color: "#e2e8f0",
    lineHeight: 1,
  },
  h2em: { fontStyle: "italic", color: "#6ee7b7" },
  subtext: { color: "#64748b", marginTop: "6px", fontSize: "13px" },

  /* Filter bar */
  filterBar: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" },
  filterSelect: {
    background: "#181c26",
    border: "1px solid #252a38",
    borderRadius: "8px",
    padding: "7px 12px",
    color: "#e2e8f0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },
  filterChip: (active) => ({
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    border: active ? "1px solid #6ee7b7" : "1px solid #252a38",
    background: active ? "rgba(110,231,183,.1)" : "transparent",
    color: active ? "#6ee7b7" : "#64748b",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .15s",
  }),

  /* Cards */
  card: {
    background: "#181c26",
    border: "1px solid #252a38",
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px",
    borderBottom: "1px solid #252a38",
  },
  cardHeaderTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardBody: { padding: "22px" },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },

  /* Summary mini-boxes */
  miniBox: (color) => ({
    textAlign: "center",
    padding: "14px",
    background: "#13161e",
    borderRadius: "10px",
    flex: 1,
  }),
  miniVal: (color) => ({
    fontFamily: "'DM Serif Display', serif",
    fontSize: "28px",
    color: color,
  }),
  miniLabel: { fontSize: "11px", color: "#64748b", marginTop: "4px" },

  /* Table */
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#64748b",
    padding: "10px 16px",
    textAlign: "left",
    borderBottom: "1px solid #252a38",
    whiteSpace: "nowrap",
  },
  td: { padding: "12px 16px", fontSize: "13px", color: "#e2e8f0", verticalAlign: "middle" },

  /* Progress bar */
  progressTrack: { height: "6px", background: "#252a38", borderRadius: "3px", overflow: "hidden", flex: 1 },
  progressFill: (pct) => ({
    height: "100%",
    borderRadius: "3px",
    background: "linear-gradient(90deg, #38bdf8, #6ee7b7)",
    width: `${pct || 0}%`,
    transition: "width .6s ease",
  }),

  /* Badges */
  badge: (type) => {
    const map = {
      new:      { background: "rgba(56,189,248,.1)",   color: "#38bdf8" },
      learning: { background: "rgba(251,191,36,.12)",  color: "#fbbf24" },
      mastered: { background: "rgba(74,222,128,.1)",   color: "#4ade80" },
      admin:    { background: "rgba(251,191,36,.12)",  color: "#fbbf24" },
      user:     { background: "rgba(56,189,248,.1)",   color: "#38bdf8" },
    };
    const s = map[type] || map.user;
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 500,
      ...s,
    };
  },

  /* Score pill */
  scorePill: (score) => {
    if (score == null) return { display: "none" };
    const n = Number(score);
    const style =
      n >= 80 ? { background: "rgba(74,222,128,.1)",   color: "#4ade80" }
      : n >= 60 ? { background: "rgba(251,191,36,.12)", color: "#fbbf24" }
      :           { background: "rgba(248,113,113,.12)", color: "#f87171" };
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: "20px",
      ...style,
    };
  },

  /* Avatar */
  avatar: (gradient) => ({
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: gradient || "linear-gradient(135deg,#6ee7b7,#38bdf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    color: "#0d0f14",
    flexShrink: 0,
  }),

  userCell: { display: "flex", alignItems: "center", gap: "10px" },
  userName: { fontWeight: 500, fontSize: "13px" },
  userEmail: { fontSize: "11px", color: "#64748b" },

  /* Icon button */
  iconBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    border: "1px solid #252a38",
    background: "transparent",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Detail panel */
  detailPanel: {
    background: "#181c26",
    border: "1px solid #6ee7b7",
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "24px",
    animation: "fadeIn .3s ease",
  },

  /* Bar chart */
  barChart: { display: "flex", flexDirection: "column", gap: "12px" },
  barRow: { display: "flex", alignItems: "center", gap: "10px" },
  barLabel: { fontSize: "12px", color: "#64748b", width: "100px", flexShrink: 0, textAlign: "right" },
  barCount: { fontSize: "12px", color: "#64748b", width: "32px" },

  /* Muted */
  muted: { color: "#64748b", fontSize: "12px" },
};

// ─── Avatar gradient pool ─────────────────────────────────────────────────
const GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#a78bfa,#38bdf8)",
];
const avatarGrad = (id) => GRADIENTS[id % GRADIENTS.length];

// ─── Mock data (replace with real API calls) ──────────────────────────────
const MOCK_OVERVIEW = {
  TotalLearners: 142,
  TotalNew: 310,
  TotalLearning: 520,
  TotalMastered: 1240,
  MasteredPercent: 45,
};

const MOCK_USERS = [
  {
    UserID: 1, Username: "Minh Tú", Email: "mintu@gmail.com",
    TotalWords: 412, NewCount: 124, LearningCount: 87, MasteredCount: 201,
    ProgressPercent: 72, AvgQuizScore: 78, LastReviewed: "2026-03-27T08:30:00",
  },
  {
    UserID: 2, Username: "Quang Huy", Email: "quanghuy@outlook.com",
    TotalWords: 780, NewCount: 30, LearningCount: 50, MasteredCount: 700,
    ProgressPercent: 91, AvgQuizScore: 94, LastReviewed: "2026-03-27T07:10:00",
  },
  {
    UserID: 3, Username: "Lan Nguyễn", Email: "lan.nguyen@gmail.com",
    TotalWords: 12, NewCount: 10, LearningCount: 2, MasteredCount: 0,
    ProgressPercent: 5, AvgQuizScore: 40, LastReviewed: "2026-03-27T06:00:00",
  },
  {
    UserID: 4, Username: "Hoa Trần", Email: "hoa.tran@yahoo.com",
    TotalWords: 200, NewCount: 60, LearningCount: 80, MasteredCount: 60,
    ProgressPercent: 48, AvgQuizScore: 65, LastReviewed: "2026-03-26T14:20:00",
  },
];

const MOCK_DETAIL = {
  1: {
    categoryProgress: [
      { CategoryName: "Hàng ngày", TotalInCategory: 512, MasteredInCategory: 400, CategoryPercent: 78 },
      { CategoryName: "Du lịch",   TotalInCategory: 408, MasteredInCategory: 253, CategoryPercent: 62 },
      { CategoryName: "Công nghệ", TotalInCategory: 330, MasteredInCategory: 132, CategoryPercent: 40 },
      { CategoryName: "Kinh doanh",TotalInCategory: 250, MasteredInCategory: 75,  CategoryPercent: 30 },
    ],
    quizHistory: [
      { Word: "ambitious",   Score: 90,  LearnDate: "2026-03-27T08:00:00" },
      { Word: "itinerary",   Score: 70,  LearnDate: "2026-03-26T10:00:00" },
      { Word: "algorithm",   Score: 50,  LearnDate: "2026-03-25T09:00:00" },
      { Word: "negotiate",   Score: 100, LearnDate: "2026-03-24T11:00:00" },
    ],
  },
};

// ─── Utility ──────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return d.toLocaleDateString("vi-VN");
};

// ─── Sub-components ───────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={S.progressTrack}>
        <div style={S.progressFill(pct)} />
      </div>
      <span style={{ fontSize: "11px", color: "#64748b", width: "34px" }}>{pct ?? 0}%</span>
    </div>
  );
}

function MiniBoxes({ newC, learningC, masteredC }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
      <div style={S.miniBox()}>
        <div style={S.miniVal("#38bdf8")}>{newC}</div>
        <div style={S.miniLabel}>New</div>
      </div>
      <div style={S.miniBox()}>
        <div style={S.miniVal("#fbbf24")}>{learningC}</div>
        <div style={S.miniLabel}>Learning</div>
      </div>
      <div style={S.miniBox()}>
        <div style={S.miniVal("#4ade80")}>{masteredC}</div>
        <div style={S.miniLabel}>Mastered</div>
      </div>
    </div>
  );
}

function CategoryBars({ data }) {
  const max = Math.max(...data.map((c) => c.TotalInCategory), 1);
  return (
    <div style={S.barChart}>
      {data.map((c) => (
        <div key={c.CategoryName} style={S.barRow}>
          <div style={S.barLabel}>{c.CategoryName}</div>
          <div style={S.progressTrack}>
            <div style={S.progressFill(c.CategoryPercent)} />
          </div>
          <div style={S.barCount}>{c.CategoryPercent ?? 0}%</div>
        </div>
      ))}
    </div>
  );
}

function QuizHistoryTable({ history }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Từ vựng</th>
            <th style={S.th}>Score</th>
            <th style={S.th}>Ngày</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #252a38" }}>
              <td style={{ ...S.td, fontWeight: 600 }}>{h.Word}</td>
              <td style={S.td}>
                <span style={S.scorePill(h.Score)}>{h.Score}%</span>
              </td>
              <td style={{ ...S.td, ...S.muted }}>{fmtDate(h.LearnDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Detail Panel (expandable row) ───────────────────────────────────────
function DetailPanel({ user, detail }) {
  if (!detail) {
    return (
      <div style={S.detailPanel}>
        <div style={{ ...S.cardBody, color: "#64748b", fontSize: "13px" }}>
          Đang tải chi tiết...
        </div>
      </div>
    );
  }

  return (
    <div style={S.detailPanel}>
      <div style={S.cardHeader}>
        <div style={S.cardHeaderTitle}>
          👤 {user.Username} — Tiến độ chi tiết
        </div>
        <span style={S.muted}>
          Cập nhật: {fmtDate(user.LastReviewed)}
        </span>
      </div>
      <div style={S.cardBody}>
        {/* Mini stat boxes */}
        <MiniBoxes
          newC={user.NewCount}
          learningC={user.LearningCount}
          masteredC={user.MasteredCount}
        />

        {/* Two-col: category bars + quiz history */}
        <div style={S.twoCol}>
          {/* Category progress */}
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Tiến độ theo chủ đề
            </div>
            {detail.categoryProgress?.length ? (
              <CategoryBars data={detail.categoryProgress} />
            ) : (
              <div style={S.muted}>Chưa có dữ liệu</div>
            )}
          </div>

          {/* Quiz history */}
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Lịch sử Quiz gần nhất
            </div>
            {detail.quizHistory?.length ? (
              <QuizHistoryTable history={detail.quizHistory} />
            ) : (
              <div style={S.muted}>Chưa có lịch sử</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview stat cards ──────────────────────────────────────────────────
function OverviewCards({ data }) {
  const cards = [
    { emoji: "👥", value: data.TotalLearners, label: "Người đang học", color: "#38bdf8" },
    { emoji: "📗", value: data.TotalNew,      label: "Từ New",         color: "#38bdf8" },
    { emoji: "📘", value: data.TotalLearning, label: "Đang học",       color: "#fbbf24" },
    { emoji: "🏆", value: data.TotalMastered, label: "Mastered",       color: "#4ade80" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: "#181c26",
            border: "1px solid #252a38",
            borderRadius: "14px",
            padding: "22px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: "22px", marginBottom: "12px" }}>{c.emoji}</div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "36px", color: c.color, lineHeight: 1 }}>
            {c.value?.toLocaleString() ?? "—"}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function LearningProgress() {
  const [users, setUsers]             = useState(MOCK_USERS);
  const [overview, setOverview]       = useState(MOCK_OVERVIEW);
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [filterUser, setFilterUser]   = useState("");
  const [expandedId, setExpandedId]   = useState(null);
  const [detailMap, setDetailMap]     = useState({});
  const [loading, setLoading]         = useState(false);

  // ── Fetch overview (replace mock with real API) ─────────────────────
  useEffect(() => {
    // fetch('/api/admin/learning-progress/stats/overview')
    //   .then(r => r.json()).then(setOverview);
    // fetch('/api/admin/learning-progress')
    //   .then(r => r.json()).then(setUsers);
  }, []);

  // ── Fetch detail per user ────────────────────────────────────────────
  const handleExpand = async (uid) => {
    if (expandedId === uid) { setExpandedId(null); return; }
    setExpandedId(uid);
    if (detailMap[uid]) return;

    setLoading(true);
    try {
      // const res = await fetch(`/api/admin/learning-progress/${uid}`);
      // const data = await res.json();
      // setDetailMap(prev => ({ ...prev, [uid]: data }));

      // Mock fallback
      await new Promise((r) => setTimeout(r, 400));
      setDetailMap((prev) => ({
        ...prev,
        [uid]: MOCK_DETAIL[uid] ?? { categoryProgress: [], quizHistory: [] },
      }));
    } finally {
      setLoading(false);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const STATUS_FILTERS = ["Tất cả", "New", "Learning", "Mastered"];

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !filterUser ||
      u.Username.toLowerCase().includes(filterUser.toLowerCase()) ||
      u.Email.toLowerCase().includes(filterUser.toLowerCase());

    const matchStatus =
      filterStatus === "Tất cả" ||
      (filterStatus === "New"      && u.NewCount > 0) ||
      (filterStatus === "Learning" && u.LearningCount > 0) ||
      (filterStatus === "Mastered" && u.MasteredCount > 0);

    return matchSearch && matchStatus;
  });

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Google Font import */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        tr:hover td { background: rgba(255,255,255,.015); }
        button:hover { opacity:.85; }
      `}</style>

      {/* Header */}
      <div style={S.sectionHeader}>
        <div>
          <h2 style={S.h2}>
            Learning <em style={S.h2em}>Progress</em>
          </h2>
          <p style={S.subtext}>Theo dõi tiến độ học của tất cả người dùng.</p>
        </div>
      </div>

      {/* Overview stat cards */}
      <OverviewCards data={overview} />

      {/* Filter bar */}
      <div style={S.filterBar}>
        <input
          style={{ ...S.filterSelect, width: "240px" }}
          placeholder="🔍 Tìm user, email…"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            style={S.filterChip(filterStatus === s)}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div style={S.card}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Người dùng</th>
                <th style={S.th}>New</th>
                <th style={S.th}>Learning</th>
                <th style={S.th}>Mastered</th>
                <th style={S.th}>Tiến độ</th>
                <th style={S.th}>Quiz TB</th>
                <th style={S.th}>Cập nhật</th>
                <th style={S.th}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <>
                  <tr
                    key={u.UserID}
                    style={{ borderBottom: "1px solid #252a38", cursor: "pointer" }}
                    onClick={() => handleExpand(u.UserID)}
                  >
                    {/* User */}
                    <td style={S.td}>
                      <div style={S.userCell}>
                        <div style={S.avatar(avatarGrad(u.UserID))}>
                          {u.Username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={S.userName}>{u.Username}</div>
                          <div style={S.userEmail}>{u.Email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Counts */}
                    <td style={S.td}>
                      <span style={S.badge("new")}>{u.NewCount}</span>
                    </td>
                    <td style={S.td}>
                      <span style={S.badge("learning")}>{u.LearningCount}</span>
                    </td>
                    <td style={S.td}>
                      <span style={S.badge("mastered")}>{u.MasteredCount}</span>
                    </td>

                    {/* Progress bar */}
                    <td style={{ ...S.td, minWidth: "140px" }}>
                      <ProgressBar pct={u.ProgressPercent} />
                    </td>

                    {/* Quiz avg */}
                    <td style={S.td}>
                      {u.AvgQuizScore != null ? (
                        <span style={S.scorePill(u.AvgQuizScore)}>
                          {Math.round(u.AvgQuizScore)}%
                        </span>
                      ) : (
                        <span style={S.muted}>—</span>
                      )}
                    </td>

                    {/* Last reviewed */}
                    <td style={{ ...S.td, ...S.muted }}>{fmtDate(u.LastReviewed)}</td>

                    {/* Toggle */}
                    <td style={S.td}>
                      <button
                        style={{
                          ...S.iconBtn,
                          color: expandedId === u.UserID ? "#6ee7b7" : "#64748b",
                          borderColor: expandedId === u.UserID ? "#6ee7b7" : "#252a38",
                          transform: expandedId === u.UserID ? "rotate(180deg)" : "none",
                          transition: "transform .2s, color .2s",
                        }}
                        onClick={(e) => { e.stopPropagation(); handleExpand(u.UserID); }}
                        title="Xem chi tiết"
                      >
                        ▾
                      </button>
                    </td>
                  </tr>

                  {/* Detail panel row */}
                  {expandedId === u.UserID && (
                    <tr key={`detail-${u.UserID}`}>
                      <td colSpan={8} style={{ padding: "16px 16px 0" }}>
                        <DetailPanel
                          user={u}
                          detail={loading ? null : detailMap[u.UserID]}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#64748b", padding: "32px" }}>
                    Không tìm thấy user phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}