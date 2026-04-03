// src/pages/admin/FavoriteWordManager.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .fw-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80;
    font-family:'DM Sans',sans-serif; font-size:15px;
    color:var(--text); background:var(--bg);
    height:100vh; display:flex; flex-direction:column; overflow:hidden;
  }
  .fw-root *, .fw-root *::before, .fw-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Top bar ── */
  .fw-topbar {
    flex-shrink:0; padding:16px 24px 12px;
    border-bottom:1px solid var(--border); background:var(--surface);
    display:flex; flex-direction:column; gap:12px;
  }
  .fw-topbar-row1 { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .fw-topbar-row1 h2 { font-family:'DM Serif Display',serif; font-size:26px; line-height:1; }
  .fw-topbar-row1 h2 em { font-style:italic; color:var(--accent3); }
  .fw-topbar-row2 { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

  /* ── Stat chips ── */
  .fw-stats { display:flex; gap:8px; flex-wrap:wrap; }
  .fw-stat {
    display:flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:20px;
    background:var(--card); border:1px solid var(--border);
    font-size:13px; color:var(--muted);
  }
  .fw-stat b { color:var(--text); }
  .fw-stat.accent { border-color:rgba(244,114,182,.3); background:rgba(244,114,182,.05); }
  .fw-stat.accent b { color:var(--accent3); }

  /* ── Tabs ── */
  .fw-tabs { display:flex; gap:4px; border-bottom:1px solid var(--border); padding:0 24px; background:var(--surface); flex-shrink:0; }
  .fw-tab {
    padding:10px 18px; font-size:14px; font-weight:500; cursor:pointer;
    border:none; background:transparent; color:var(--muted);
    border-bottom:2px solid transparent; transition:all .18s;
    font-family:'DM Sans',sans-serif;
  }
  .fw-tab:hover { color:var(--text); }
  .fw-tab.active { color:var(--accent3); border-bottom-color:var(--accent3); }

  /* ── Buttons ── */
  .fw-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:8px; font-size:14px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .18s;
  }
  .fw-btn.ghost  { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .fw-btn.ghost:hover  { color:var(--text); border-color:var(--muted); }
  .fw-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .fw-btn.danger:hover { background:rgba(248,113,113,.22); }
  .fw-btn:disabled { opacity:.45; cursor:not-allowed; }

  /* ── Filter bar ── */
  .fw-filterbar { flex-shrink:0; display:flex; gap:10px; flex-wrap:wrap; align-items:center; padding:10px 24px; border-bottom:1px solid var(--border); background:var(--bg); }
  .fw-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:7px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:14px; width:220px; outline:none; transition:border-color .2s;
  }
  .fw-search:focus { border-color:var(--accent3); }
  .fw-search::placeholder { color:var(--muted); }
  .fw-select {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:7px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:14px; outline:none; cursor:pointer;
  }
  .fw-select:focus { border-color:var(--accent3); }
  .fw-count { font-size:14px; color:var(--muted); margin-left:auto; }
  .fw-count b { color:var(--text); }

  /* ── Scrollable table ── */
  .fw-table-container { flex:1; overflow:auto; min-height:0; }
  .fw-tbl { width:100%; border-collapse:collapse; }
  .fw-tbl thead th {
    font-size:12px; text-transform:uppercase; letter-spacing:.8px;
    color:var(--muted); padding:12px 16px; text-align:left;
    border-bottom:1px solid var(--border); white-space:nowrap;
    background:var(--surface); position:sticky; top:0; z-index:2;
  }
  .fw-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .12s; }
  .fw-tbl tbody tr:last-child { border-bottom:none; }
  .fw-tbl tbody tr:hover { background:rgba(244,114,182,.025); }
  .fw-tbl tbody td { padding:12px 16px; vertical-align:middle; }

  /* ── Cell content ── */
  .fw-word-en  { font-weight:600; font-size:15px; }
  .fw-word-vi  { font-size:13px; color:var(--muted); margin-top:2px; }
  .fw-username { font-weight:600; font-size:14px; }
  .fw-email    { font-size:13px; color:var(--muted); margin-top:2px; }
  .fw-heart    { color:var(--accent3); font-size:16px; }

  /* ── Badges ── */
  .fw-badge { display:inline-flex; align-items:center; padding:4px 11px; border-radius:20px; font-size:12px; font-weight:500; }
  .fw-badge.cat    { background:rgba(56,189,248,.08);  color:var(--accent2); }
  .fw-badge.lesson { background:rgba(244,114,182,.08); color:var(--accent3); }
  .fw-badge.diff-easy   { background:rgba(74,222,128,.1);  color:var(--success); }
  .fw-badge.diff-medium { background:rgba(251,191,36,.12); color:var(--gold); }
  .fw-badge.diff-hard   { background:rgba(248,113,113,.12);color:var(--danger); }
  .fw-badge.count  { background:rgba(244,114,182,.1); color:var(--accent3); font-size:13px; font-weight:600; }

  /* ── Icon buttons ── */
  .fw-actions { display:flex; gap:5px; justify-content:center; }
  .fw-icon-btn {
    width:30px; height:30px; border-radius:6px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted); font-size:13px;
    display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .fw-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }

  /* ── Empty ── */
  .fw-empty { text-align:center; padding:56px 20px; color:var(--muted); }
  .fw-empty .em-icon { font-size:36px; margin-bottom:12px; }
  .fw-empty p { font-size:14px; }

  /* ── Skeleton ── */
  @keyframes fw-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .fw-skel { display:block; border-radius:4px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:fw-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes fw-toast-in { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .fw-toast {
    position:fixed; top:18px; right:18px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent3); border-radius:8px;
    padding:12px 18px; color:var(--text); font-size:14px;
    font-family:'DM Sans',sans-serif; box-shadow:0 8px 28px rgba(0,0,0,.4);
    animation:fw-toast-in .25s ease; min-width:200px;
  }
  .fw-toast.error { border-left-color:var(--danger); }

  /* ── Pagination ── */
  .fw-pagination {
    flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
    padding:9px 24px; border-top:1px solid var(--border);
    background:var(--surface); gap:12px;
  }
  .fw-pg-info { font-size:13px; color:var(--muted); }
  .fw-pg-info b { color:var(--text); }
  .fw-pg-controls { display:flex; align-items:center; gap:3px; }
  .fw-pg-btn {
    min-width:30px; height:30px; padding:0 8px;
    border-radius:6px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted);
    font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500;
    display:flex; align-items:center; justify-content:center;
    transition:all .14s; user-select:none;
  }
  .fw-pg-btn:hover:not(:disabled) { color:var(--text); border-color:var(--accent3); background:rgba(244,114,182,.06); }
  .fw-pg-btn.active { background:var(--accent3); color:#0d0f14; border-color:var(--accent3); font-weight:600; cursor:default; }
  .fw-pg-btn:disabled { opacity:.3; cursor:not-allowed; }
  .fw-pg-dots { font-size:13px; color:var(--muted); padding:0 3px; }

  /* ── Modal overlay ── */
  @keyframes fw-modal-in { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .fw-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }

  /* ── Confirm dialog ── */
  .fw-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:12px; width:340px; padding:26px;
    animation:fw-modal-in .18s ease; text-align:center;
  }
  .fw-confirm .ci { font-size:32px; margin-bottom:10px; }
  .fw-confirm h4 { font-size:16px; font-weight:600; margin-bottom:6px; }
  .fw-confirm p  { font-size:14px; color:var(--muted); margin-bottom:16px; line-height:1.5; }
  .fw-confirm-btns { display:flex; gap:8px; justify-content:center; }

  /* ── Stats table (tab 2) ── */
  .fw-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:20px 24px; overflow-y:auto; }
  .fw-stats-card {
    background:var(--card); border:1px solid var(--border);
    border-radius:12px; overflow:hidden;
  }
  .fw-stats-card-head {
    padding:14px 18px; border-bottom:1px solid var(--border);
    font-size:13px; font-weight:600; color:var(--text);
    display:flex; align-items:center; gap:8px;
  }
  .fw-stats-card-body { overflow-y:auto; max-height:320px; }
  .fw-stats-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 18px; border-bottom:1px solid var(--border);
    font-size:13px;
  }
  .fw-stats-row:last-child { border-bottom:none; }
  .fw-stats-row-left { display:flex; flex-direction:column; gap:2px; }
  .fw-stats-name { font-weight:500; color:var(--text); font-size:14px; }
  .fw-stats-sub  { font-size:12px; color:var(--muted); }
  .fw-rank { font-family:'DM Serif Display',serif; font-size:18px; color:var(--muted); min-width:28px; }
`;

const DIFF_MAP   = { 1: ["diff-easy","Easy"], 2: ["diff-medium","Medium"], 3: ["diff-hard","Hard"] };
const PAGE_SIZE  = 20;

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className={`fw-toast${(msg.startsWith("❌")||msg.startsWith("⚠"))?" error":""}`}>{msg}</div>;
}

function SkelRow({ cols = 6 }) {
  const S = ({ w }) => <span className="fw-skel" style={{ height: 12, width: w, display: "block" }} />;
  const widths = [140, 110, 80, 80, 90, 50];
  return (
    <tr>
      {widths.slice(0, cols).map((w, i) => (
        <td key={i} style={{ padding: "12px 16px" }}><S w={w} /></td>
      ))}
    </tr>
  );
}

function Pagination({ page, totalPages, totalItems, onPage }) {
  const from = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, totalItems);

  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 4) pages.push("…");
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    if (page < totalPages - 3) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="fw-pagination">
      <span className="fw-pg-info"><b>{from}–{to}</b> trong <b>{totalItems}</b> bản ghi</span>
      <div className="fw-pg-controls">
        <button className="fw-pg-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {buildPages().map((p, i) =>
          p === "…"
            ? <span key={`d${i}`} className="fw-pg-dots">…</span>
            : <button key={p} className={`fw-pg-btn${p === page ? " active" : ""}`} onClick={() => p !== page && onPage(p)}>{p}</button>
        )}
        <button className="fw-pg-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function FavoriteWordManager() {
  const [tab,        setTab]        = useState("list");   // "list" | "stats"

  // Data
  const [favoriteword,  setFavorites]  = useState([]);
  const [users,      setUsers]      = useState([]);
  const [topWords,   setTopWords]   = useState([]);
  const [userStats,  setUserStats]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [loadStats,  setLoadStats]  = useState(false);

  // Filter / pagination
  const [search,     setSearch]     = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [page,       setPage]       = useState(1);

  // Toast / confirm
  const [toast,      setToast]      = useState("");
  const [confirmDel, setConfirmDel] = useState(null); // { type: "single"|"user", id, label }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.Role !== "Admin") {
      alert("🚫 Bạn không có quyền!");
      window.location.href = "/login";
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/favoriteword/");
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch { setFavorites([]); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserID;

    const res = await API.get(`/admin/favoriteword/user/${userId}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadStats(true);
    try {
      const [topRes, userRes] = await Promise.all([
        API.get("/admin/favoriteword/stats/top-words?limit=10"),
        API.get("/admin/favoriteword/stats/by-user"),
      ]);
      setTopWords(Array.isArray(topRes.data) ? topRes.data : []);
      setUserStats(Array.isArray(userRes.data) ? userRes.data : []);
    } catch {}
    finally { setLoadStats(false); }
  }, []);

  useEffect(() => { fetchFavorites(); fetchUsers(); }, [fetchFavorites, fetchUsers]);
  useEffect(() => { if (tab === "stats") fetchStats(); }, [tab, fetchStats]);
  useEffect(() => { setPage(1); }, [search, filterUser]);

  /* ── Filter & paginate ── */
  const filtered = favoriteword.filter(f => {
    const q = search.toLowerCase();
    return (
      (!q || f.Word?.toLowerCase().includes(q) || f.Username?.toLowerCase().includes(q) || f.Meaning?.toLowerCase().includes(q)) &&
      (filterUser === "all" || String(f.UserID) === filterUser)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Delete single favorite ── */
  const handleDeleteSingle = async (favoriteId) => {
    try {
      await API.delete(`/admin/favoriteword/${favoriteId}`);
      setToast("🗑 Đã xóa khỏi danh sách yêu thích!");
      if (paginated.length === 1 && safePage > 1) setPage(safePage - 1);
      fetchFavorites();
    } catch { setToast("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  /* ── Delete all favoriteword of a user ── */
  const handleClearUser = async (userId) => {
    try {
      await API.delete(`/admin/favoriteword/user/${userId}/clear`);
      setToast("🗑 Đã xóa toàn bộ từ yêu thích của user!");
      fetchFavorites();
    } catch { setToast("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  /* ── Tổng số favoriteword & unique users có fav ── */
  const totalFavs       = favoriteword.length;
  const uniqueUserCount = new Set(favoriteword.map(f => f.UserID)).size;

  return (
    <div className="fw-root">
      <style>{STYLES}</style>

      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* ── Top bar ── */}
      <div className="fw-topbar">
        <div className="fw-topbar-row1">
          <h2>Favorite <em>Words</em></h2>
          <div className="fw-stats">
            <div className="fw-stat accent">
              <span>❤️</span>
              <span>Tổng <b>{totalFavs}</b> lượt yêu thích</span>
            </div>
            <div className="fw-stat">
              <span>👤</span>
              <span><b>{uniqueUserCount}</b> users có từ yêu thích</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="fw-tabs">
        <button className={`fw-tab${tab === "list" ? " active" : ""}`} onClick={() => setTab("list")}>
          📋 Danh sách yêu thích
        </button>
        <button className={`fw-tab${tab === "stats" ? " active" : ""}`} onClick={() => setTab("stats")}>
          📊 Thống kê
        </button>
      </div>

      {/* ══════════ TAB: LIST ══════════ */}
      {tab === "list" && (
        <>
          {/* Filter bar */}
          <div className="fw-filterbar">
            <input className="fw-search" placeholder="🔍 Tìm từ vựng, user…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="fw-select" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
              <option value="all">Tất cả user</option>
              {users.map(u => (
                <option key={u.UserID} value={String(u.UserID)}>{u.Username}</option>
              ))}
            </select>
            {filterUser !== "all" && (
              <button className="fw-btn danger"
                onClick={() => {
                  const u = users.find(u => String(u.UserID) === filterUser);
                  setConfirmDel({ type: "user", id: parseInt(filterUser), label: u?.Username || filterUser });
                }}>
                🗑 Xóa tất cả của user này
              </button>
            )}
            <span className="fw-count">Tổng <b>{filtered.length}</b> bản ghi</span>
          </div>

          {/* Table */}
          <div className="fw-table-container">
            <table className="fw-tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Từ vựng</th>
                  <th>Category</th>
                  <th>Lesson</th>
                  <th>Độ khó</th>
                  <th>User</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5,6].map(k => <SkelRow key={k} cols={7} />)
                  : paginated.length === 0
                    ? (
                      <tr><td colSpan={7}>
                        <div className="fw-empty">
                          <div className="em-icon">💔</div>
                          <p>{search || filterUser !== "all"
                            ? "Không tìm thấy kết quả phù hợp"
                            : "Chưa có từ vựng yêu thích nào."}
                          </p>
                        </div>
                      </td></tr>
                    )
                    : paginated.map(item => {
                      const [diffClass, diffLabel] = DIFF_MAP[item.DifficultyLevel] || ["diff-easy", "Easy"];
                      return (
                        <tr key={item.FavoriteID}>
                          <td style={{ width: 32 }}>
                            <span className="fw-heart">❤</span>
                          </td>
                          <td>
                            <div className="fw-word-en">{item.Word}</div>
                            <div className="fw-word-vi">{item.Meaning}</div>
                          </td>
                          <td>
                            <span className="fw-badge cat">{item.CategoryName || "—"}</span>
                          </td>
                          <td>
                            {item.LessonName
                              ? <span className="fw-badge lesson">{item.LessonName}</span>
                              : <span style={{ color: "var(--muted)" }}>—</span>}
                          </td>
                          <td>
                            <span className={`fw-badge ${diffClass}`}>{diffLabel}</span>
                          </td>
                          <td>
                            <div className="fw-username">{item.Username}</div>
                            <div className="fw-email">{item.Email}</div>
                          </td>
                          <td>
                            <div className="fw-actions">
                              <button className="fw-icon-btn del" title="Xóa yêu thích"
                                onClick={() => setConfirmDel({ type: "single", id: item.FavoriteID, label: `"${item.Word}" của ${item.Username}` })}>
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} onPage={setPage} />
          )}
        </>
      )}

      {/* ══════════ TAB: STATS ══════════ */}
      {tab === "stats" && (
        <div className="fw-stats-grid">
          {/* Top từ được yêu thích nhiều nhất */}
          <div className="fw-stats-card">
            <div className="fw-stats-card-head">❤️ Top 10 từ được yêu thích nhiều nhất</div>
            <div className="fw-stats-card-body">
              {loadStats
                ? <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>⟳ Đang tải…</div>
                : topWords.length === 0
                  ? <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>Chưa có dữ liệu.</div>
                  : topWords.map((w, i) => (
                    <div key={w.WordID} className="fw-stats-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="fw-rank">{String(i + 1).padStart(2, "0")}</span>
                        <div className="fw-stats-row-left">
                          <span className="fw-stats-name">{w.Word}</span>
                          <span className="fw-stats-sub">{w.Meaning} · {w.CategoryName || "—"}</span>
                        </div>
                      </div>
                      <span className="fw-badge count">❤ {w.FavoriteCount}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Số từ yêu thích theo user */}
          <div className="fw-stats-card">
            <div className="fw-stats-card-head">👤 Từ yêu thích theo từng user</div>
            <div className="fw-stats-card-body">
              {loadStats
                ? <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>⟳ Đang tải…</div>
                : userStats.length === 0
                  ? <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>Chưa có dữ liệu.</div>
                  : userStats.map((u, i) => (
                    <div key={u.UserID} className="fw-stats-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="fw-rank">{String(i + 1).padStart(2, "0")}</span>
                        <div className="fw-stats-row-left">
                          <span className="fw-stats-name">{u.Username}</span>
                          <span className="fw-stats-sub">{u.Email}</span>
                        </div>
                      </div>
                      <span className="fw-badge count">❤ {u.FavoriteCount}</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirmDel && (
        <div className="fw-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="fw-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa</h4>
            <p>
              {confirmDel.type === "user"
                ? <>Xóa <b>toàn bộ từ yêu thích</b> của user <b style={{ color: "var(--danger)" }}>{confirmDel.label}</b>?</>
                : <>Xóa từ yêu thích <b style={{ color: "var(--danger)" }}>{confirmDel.label}</b>?</>
              }
              <br /><span style={{ fontSize: 13 }}>Hành động này không thể hoàn tác.</span>
            </p>
            <div className="fw-confirm-btns">
              <button className="fw-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="fw-btn danger" onClick={() => {
                if (confirmDel.type === "user") handleClearUser(confirmDel.id);
                else handleDeleteSingle(confirmDel.id);
              }}>🗑 Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}