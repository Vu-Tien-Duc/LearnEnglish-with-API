import { useState, useEffect } from "react";

const API = "http://localhost:5000/api/admin/learnprogress";

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1)    return "Vừa xong";
  if (diff < 60)   return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return d.toLocaleDateString("vi-VN");
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

// ─── Styles ───────────────────────────────────────────────────────────────
const S = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", minHeight: "100vh", padding: "32px", background: "transparent" },
  sectionHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" },
  h2: { fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#e2e8f0", lineHeight: 1 },
  h2em: { fontStyle: "italic", color: "#6ee7b7" },
  subtext: { color: "#64748b", marginTop: "6px", fontSize: "13px" },

  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { background: "#181c26", border: "1px solid #252a38", borderRadius: "14px", padding: "22px 24px", overflow: "hidden" },
  statEmoji: { fontSize: "22px", marginBottom: "12px" },
  statVal: (color) => ({ fontFamily: "'DM Serif Display',serif", fontSize: "36px", color, lineHeight: 1 }),
  statLabel: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" },

  filterBar: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" },
  searchInput: { background: "#181c26", border: "1px solid #252a38", borderRadius: "8px", padding: "7px 14px", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", outline: "none", width: "240px" },
  chip: (active) => ({ padding: "6px 14px", borderRadius: "20px", fontSize: "12px", border: active ? "1px solid #6ee7b7" : "1px solid #252a38", background: active ? "rgba(110,231,183,.1)" : "transparent", color: active ? "#6ee7b7" : "#64748b", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .15s" }),

  card: { background: "#181c26", border: "1px solid #252a38", borderRadius: "14px", overflow: "hidden", marginBottom: "24px" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #252a38" },
  cardHeaderTitle: { fontSize: "14px", fontWeight: 600, color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px" },
  cardBody: { padding: "22px" },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", padding: "10px 16px", textAlign: "left", borderBottom: "1px solid #252a38", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#e2e8f0", verticalAlign: "middle", borderBottom: "1px solid #1a1e2a" },

  userCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: (g) => ({ width: "30px", height: "30px", borderRadius: "8px", background: g, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#0d0f14", flexShrink: 0 }),
  userName: { fontWeight: 500, fontSize: "13px" },
  userEmail: { fontSize: "11px", color: "#64748b" },

  badge: (type) => {
    const m = { new: ["rgba(56,189,248,.1)", "#38bdf8"], learning: ["rgba(251,191,36,.12)", "#fbbf24"], mastered: ["rgba(74,222,128,.1)", "#4ade80"] };
    const [bg, c] = m[type] ?? m.new;
    return { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: bg, color: c };
  },

  scorePill: (score) => {
    const n = Number(score ?? 0);
    const [bg, c] = n >= 80 ? ["rgba(74,222,128,.1)", "#4ade80"] : n >= 60 ? ["rgba(251,191,36,.12)", "#fbbf24"] : ["rgba(248,113,113,.12)", "#f87171"];
    return { display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: bg, color: c };
  },

  progressWrap: { display: "flex", alignItems: "center", gap: "8px" },
  progressTrack: { height: "6px", background: "#252a38", borderRadius: "3px", overflow: "hidden", flex: 1, minWidth: "80px" },
  progressFill: (pct) => ({ height: "100%", borderRadius: "3px", background: "linear-gradient(90deg,#38bdf8,#6ee7b7)", width: `${pct ?? 0}%`, transition: "width .6s ease" }),
  progressPct: { fontSize: "11px", color: "#64748b", width: "34px" },

  toggleBtn: (open) => ({ width: "28px", height: "28px", borderRadius: "6px", border: open ? "1px solid #6ee7b7" : "1px solid #252a38", background: "transparent", cursor: "pointer", color: open ? "#6ee7b7" : "#64748b", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", transform: open ? "rotate(180deg)" : "none" }),

  detailPanel: { background: "#13161e", border: "1px solid #6ee7b7", borderRadius: "12px", overflow: "hidden", marginBottom: "4px", animation: "fadeIn .25s ease" },
  detailHeader: { padding: "16px 22px", borderBottom: "1px solid #252a38", display: "flex", alignItems: "center", justifyContent: "space-between" },
  detailTitle: { fontSize: "14px", fontWeight: 600, color: "#e2e8f0" },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  miniBoxes: { display: "flex", gap: "10px", marginBottom: "18px" },
  miniBox: { textAlign: "center", padding: "14px", background: "#181c26", borderRadius: "10px", flex: 1 },
  miniVal: (c) => ({ fontFamily: "'DM Serif Display',serif", fontSize: "26px", color: c }),
  miniLabel: { fontSize: "11px", color: "#64748b", marginTop: "4px" },

  colLabel: { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" },
  barRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  barLabel: { fontSize: "12px", color: "#64748b", width: "90px", flexShrink: 0, textAlign: "right" },
  barTrack: { flex: 1, height: "8px", background: "#252a38", borderRadius: "4px", overflow: "hidden" },
  barFill: (pct) => ({ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg,#6ee7b7,#38bdf8)", width: `${pct ?? 0}%`, transition: "width .6s ease" }),
  barCount: { fontSize: "12px", color: "#64748b", width: "32px" },

  emptyRow: { textAlign: "center", color: "#64748b", padding: "40px", fontSize: "13px" },
  loadingTxt: { color: "#64748b", fontSize: "13px" },
  muted: { color: "#64748b", fontSize: "12px" },
  errorBanner: { background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.2)", borderRadius: "10px", padding: "14px 18px", color: "#f87171", fontSize: "13px", marginBottom: "20px" },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function ProgressBar({ pct }) {
  return (
    <div style={S.progressWrap}>
      <div style={S.progressTrack}><div style={S.progressFill(pct)} /></div>
      <span style={S.progressPct}>{pct ?? 0}%</span>
    </div>
  );
}

function OverviewCards({ data }) {
  const cards = [
    { emoji: "👥", value: data?.TotalLearners, label: "Người đang học",  color: "#38bdf8" },
    { emoji: "📗", value: data?.TotalNew,      label: "Từ New",           color: "#38bdf8" },
    { emoji: "📘", value: data?.TotalLearning, label: "Đang học",         color: "#fbbf24" },
    { emoji: "🏆", value: data?.TotalMastered, label: "Mastered",         color: "#4ade80" },
  ];
  return (
    <div style={S.statGrid}>
      {cards.map((c) => (
        <div key={c.label} style={S.statCard}>
          <div style={S.statEmoji}>{c.emoji}</div>
          <div style={S.statVal(c.color)}>{c.value ?? "—"}</div>
          <div style={S.statLabel}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function CategoryBars({ data }) {
  if (!data?.length) return <div style={S.muted}>Chưa có dữ liệu</div>;
  return (
    <>
      {data.map((c) => (
        <div key={c.CategoryID} style={S.barRow}>
          <div style={S.barLabel}>{c.CategoryName}</div>
          <div style={S.barTrack}><div style={S.barFill(c.CategoryPercent)} /></div>
          <div style={S.barCount}>{c.CategoryPercent ?? 0}%</div>
        </div>
      ))}
    </>
  );
}

function QuizHistoryTable({ data }) {
  if (!data?.length) return <div style={S.muted}>Chưa có lịch sử</div>;
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
          {data.map((h, i) => (
            <tr key={i}>
              <td style={{ ...S.td, fontWeight: 600 }}>{h.Word}</td>
              <td style={S.td}>
                {h.Score != null
                  ? <span style={S.scorePill(h.Score)}>{h.Score}%</span>
                  : <span style={S.muted}>—</span>}
              </td>
              <td style={{ ...S.td, ...S.muted }}>{fmtDate(h.LearnDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailPanel({ user, detail, loadingDetail }) {
  if (loadingDetail) {
    return (
      <div style={S.detailPanel}>
        <div style={{ ...S.cardBody, ...S.loadingTxt }}>⏳ Đang tải chi tiết...</div>
      </div>
    );
  }
  return (
    <div style={S.detailPanel}>
      <div style={S.detailHeader}>
        <div style={S.detailTitle}>👤 {user.Username} — Chi tiết tiến độ</div>
        <span style={S.muted}>Cập nhật: {fmtDate(user.LastReviewed)}</span>
      </div>
      <div style={S.cardBody}>
        {/* Mini stat boxes */}
        <div style={S.miniBoxes}>
          <div style={S.miniBox}>
            <div style={S.miniVal("#38bdf8")}>{user.NewCount ?? 0}</div>
            <div style={S.miniLabel}>New</div>
          </div>
          <div style={S.miniBox}>
            <div style={S.miniVal("#fbbf24")}>{user.LearningCount ?? 0}</div>
            <div style={S.miniLabel}>Learning</div>
          </div>
          <div style={S.miniBox}>
            <div style={S.miniVal("#4ade80")}>{user.MasteredCount ?? 0}</div>
            <div style={S.miniLabel}>Mastered</div>
          </div>
          <div style={S.miniBox}>
            <div style={S.miniVal("#e2e8f0")}>{user.TotalWords ?? 0}</div>
            <div style={S.miniLabel}>Tổng từ</div>
          </div>
        </div>

        {/* Two-col: category bars + quiz history */}
        <div style={S.twoCol}>
          <div>
            <div style={S.colLabel}>Tiến độ theo chủ đề</div>
            <CategoryBars data={detail?.categoryProgress} />
          </div>
          <div>
            <div style={S.colLabel}>Lịch sử Quiz gần nhất</div>
            <QuizHistoryTable data={detail?.quizHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function LearningProgress() {
  const [overview, setOverview]         = useState(null);
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [search, setSearch]             = useState("");
  const [expandedId, setExpandedId]     = useState(null);
  const [detailMap, setDetailMap]       = useState({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Load overview + user list on mount ────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [ovRes, usersRes] = await Promise.all([
          fetch(`${API}/overview`),
          fetch(`${API}/`),
        ]);

        if (!ovRes.ok || !usersRes.ok) throw new Error("Lỗi kết nối API");

        const [ovData, usersData] = await Promise.all([
          ovRes.json(),
          usersRes.json(),
        ]);

        if (ovData.error)    throw new Error(ovData.error);
        if (usersData.error) throw new Error(usersData.error);

        setOverview(ovData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Expand / collapse user detail ─────────────────────────────────────
  const handleExpand = async (uid) => {
    if (expandedId === uid) { setExpandedId(null); return; }
    setExpandedId(uid);
    if (detailMap[uid]) return; // already fetched

    setLoadingDetail(true);
    try {
      const res  = await fetch(`${API}/${uid}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDetailMap((prev) => ({ ...prev, [uid]: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────
  const STATUS_FILTERS = ["Tất cả", "New", "Learning", "Mastered"];

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.Username ?? "").toLowerCase().includes(q) ||
      (u.Email    ?? "").toLowerCase().includes(q);

    const matchStatus =
      filterStatus === "Tất cả" ||
      (filterStatus === "New"      && (u.NewCount      ?? 0) > 0) ||
      (filterStatus === "Learning" && (u.LearningCount ?? 0) > 0) ||
      (filterStatus === "Mastered" && (u.MasteredCount ?? 0) > 0);

    return matchSearch && matchStatus;
  });

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} tbody tr:hover td{background:rgba(255,255,255,.015)}`}</style>

      {/* Header */}
      <div style={S.sectionHeader}>
        <div>
          <h2 style={S.h2}>Learning <em style={S.h2em}>Progress</em></h2>
          <p style={S.subtext}>Theo dõi tiến độ học của tất cả người dùng.</p>
        </div>
      </div>

      {/* Error */}
      {error && <div style={S.errorBanner}>⚠️ {error}</div>}

      {/* Overview cards */}
      <OverviewCards data={overview} />

      {/* Filter bar */}
      <div style={S.filterBar}>
        <input
          style={S.searchInput}
          placeholder="🔍  Tìm user, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {STATUS_FILTERS.map((s) => (
          <button key={s} style={S.chip(filterStatus === s)} onClick={() => setFilterStatus(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div style={S.card}>
        {loading ? (
          <div style={{ ...S.cardBody, ...S.loadingTxt }}>⏳ Đang tải dữ liệu...</div>
        ) : (
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
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={S.emptyRow}>Không tìm thấy user phù hợp.</td></tr>
                )}

                {filtered.map((u) => {
                  const isOpen = expandedId === u.UserID;
                  return (
                    <>
                      <tr
                        key={u.UserID}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleExpand(u.UserID)}
                      >
                        {/* User info */}
                        <td style={S.td}>
                          <div style={S.userCell}>
                            <div style={S.avatar(avatarGrad(u.UserID))}>
                              {(u.Username ?? "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={S.userName}>{u.Username}</div>
                              <div style={S.userEmail}>{u.Email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={S.td}><span style={S.badge("new")}>{u.NewCount ?? 0}</span></td>
                        <td style={S.td}><span style={S.badge("learning")}>{u.LearningCount ?? 0}</span></td>
                        <td style={S.td}><span style={S.badge("mastered")}>{u.MasteredCount ?? 0}</span></td>

                        <td style={{ ...S.td, minWidth: "140px" }}>
                          <ProgressBar pct={u.ProgressPercent} />
                        </td>

                        <td style={S.td}>
                          {u.AvgQuizScore != null
                            ? <span style={S.scorePill(u.AvgQuizScore)}>{Math.round(u.AvgQuizScore)}%</span>
                            : <span style={S.muted}>—</span>}
                        </td>

                        <td style={{ ...S.td, ...S.muted }}>{fmtDate(u.LastReviewed)}</td>

                        <td style={S.td}>
                          <button
                            style={S.toggleBtn(isOpen)}
                            onClick={(e) => { e.stopPropagation(); handleExpand(u.UserID); }}
                            title="Xem chi tiết"
                          >
                            ▾
                          </button>
                        </td>
                      </tr>

                      {/* Detail expandable row */}
                      {isOpen && (
                        <tr key={`detail-${u.UserID}`}>
                          <td colSpan={8} style={{ padding: "12px 16px 4px" }}>
                            <DetailPanel
                              user={u}
                              detail={detailMap[u.UserID]}
                              loadingDetail={loadingDetail}
                            />
                          </td>
                        </tr>
                      )}
                    </>
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