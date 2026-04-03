// src/pages/admin/LessonManager.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .lm-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80;
    font-family:'DM Sans',sans-serif; font-size:15px;
    color:var(--text); background:var(--bg);
    height:100vh; display:flex; flex-direction:column; overflow:hidden;
  }
  .lm-root *, .lm-root *::before, .lm-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Top bar ── */
  .lm-topbar {
    flex-shrink:0; padding:16px 24px 12px;
    border-bottom:1px solid var(--border); background:var(--surface);
    display:flex; flex-direction:column; gap:12px;
  }
  .lm-topbar-row1 { display:flex; align-items:center; justify-content:space-between; }
  .lm-topbar-row1 h2 { font-family:'DM Serif Display',serif; font-size:26px; line-height:1; }
  .lm-topbar-row1 h2 em { font-style:italic; color:var(--accent); }
  .lm-topbar-row2 { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

  /* ── Buttons ── */
  .lm-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:14px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .18s;
  }
  .lm-btn.primary { background:var(--accent); color:#0d0f14; }
  .lm-btn.primary:hover { filter:brightness(1.1); box-shadow:0 0 16px rgba(110,231,183,.3); }
  .lm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .lm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .lm-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .lm-btn.danger:hover { background:rgba(248,113,113,.22); }
  .lm-btn.info { background:rgba(56,189,248,.1); color:var(--accent2); border:1px solid rgba(56,189,248,.2); }
  .lm-btn.info:hover { background:rgba(56,189,248,.2); }
  .lm-btn:disabled { opacity:.45; cursor:not-allowed; }

  /* ── Filter inputs ── */
  .lm-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:7px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:14px; width:220px; outline:none; transition:border-color .2s;
  }
  .lm-search:focus { border-color:var(--accent); }
  .lm-search::placeholder { color:var(--muted); }
  .lm-select {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:7px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:14px; outline:none; cursor:pointer;
  }
  .lm-select:focus { border-color:var(--accent); }
  .lm-count { font-size:14px; color:var(--muted); margin-left:auto; }
  .lm-count b { color:var(--text); }

  /* ── Scrollable table ── */
  .lm-table-container { flex:1; overflow:auto; min-height:0; }
  .lm-tbl { width:100%; border-collapse:collapse; }
  .lm-tbl thead th {
    font-size:12px; text-transform:uppercase; letter-spacing:.8px;
    color:var(--muted); padding:12px 16px; text-align:left;
    border-bottom:1px solid var(--border); white-space:nowrap;
    background:var(--surface); position:sticky; top:0; z-index:2;
  }
  .lm-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .12s; }
  .lm-tbl tbody tr:last-child { border-bottom:none; }
  .lm-tbl tbody tr:hover { background:rgba(110,231,183,.03); }
  .lm-tbl tbody td { padding:12px 16px; vertical-align:middle; }

  /* ── Cell content ── */
  .lm-lesson-name { font-weight:600; font-size:15px; }
  .lm-lesson-id   { font-size:13px; color:var(--muted); margin-top:2px; }
  .lm-date        { font-size:13px; color:var(--muted); }

  /* ── Badges ── */
  .lm-badge { display:inline-flex; align-items:center; padding:4px 11px; border-radius:20px; font-size:12px; font-weight:500; }
  .lm-badge.cat    { background:rgba(56,189,248,.08);  color:var(--accent2); }
  .lm-badge.words  { background:rgba(110,231,183,.08); color:var(--accent); }
  .lm-badge.zero   { background:rgba(100,116,139,.1);  color:var(--muted); }

  /* ── Icon buttons ── */
  .lm-actions { display:flex; gap:5px; justify-content:center; }
  .lm-icon-btn {
    width:30px; height:30px; border-radius:6px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted); font-size:14px;
    display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .lm-icon-btn:hover      { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.05); }
  .lm-icon-btn.del:hover  { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }
  .lm-icon-btn.view:hover { color:var(--accent2); border-color:var(--accent2); background:rgba(56,189,248,.06); }

  /* ── Empty ── */
  .lm-empty { text-align:center; padding:56px 20px; color:var(--muted); }
  .lm-empty .em-icon { font-size:36px; margin-bottom:12px; }
  .lm-empty p { font-size:14px; }

  /* ── Skeleton ── */
  @keyframes lm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .lm-skel { display:block; border-radius:4px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:lm-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes lm-toast-in { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .lm-toast {
    position:fixed; top:18px; right:18px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent); border-radius:8px;
    padding:12px 18px; color:var(--text); font-size:14px;
    font-family:'DM Sans',sans-serif; box-shadow:0 8px 28px rgba(0,0,0,.4);
    animation:lm-toast-in .25s ease; min-width:200px;
  }
  .lm-toast.error { border-left-color:var(--danger); }

  /* ── Pagination ── */
  .lm-pagination {
    flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
    padding:9px 24px; border-top:1px solid var(--border);
    background:var(--surface); gap:12px;
  }
  .lm-pg-info { font-size:13px; color:var(--muted); }
  .lm-pg-info b { color:var(--text); }
  .lm-pg-controls { display:flex; align-items:center; gap:3px; }
  .lm-pg-btn {
    min-width:30px; height:30px; padding:0 8px;
    border-radius:6px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted);
    font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500;
    display:flex; align-items:center; justify-content:center;
    transition:all .14s; user-select:none;
  }
  .lm-pg-btn:hover:not(:disabled) { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.06); }
  .lm-pg-btn.active { background:var(--accent); color:#0d0f14; border-color:var(--accent); font-weight:600; cursor:default; }
  .lm-pg-btn:disabled { opacity:.3; cursor:not-allowed; }
  .lm-pg-dots { font-size:13px; color:var(--muted); padding:0 3px; }

  /* ── Modal ── */
  @keyframes lm-modal-in { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .lm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }
  .lm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:480px; max-width:96vw;
    max-height:88vh; overflow-y:auto;
    animation:lm-modal-in .2s ease;
  }
  .lm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 22px; border-bottom:1px solid var(--border);
    position:sticky; top:0; background:var(--card); z-index:2;
    border-radius:14px 14px 0 0;
  }
  .lm-modal-head h3 { font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .lm-modal-close {
    background:none; border:1px solid var(--border); border-radius:6px;
    width:30px; height:30px; color:var(--muted); font-size:15px;
    cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .lm-modal-close:hover { color:var(--danger); border-color:var(--danger); }
  .lm-modal-body { padding:22px; display:flex; flex-direction:column; gap:14px; }
  .lm-modal-footer {
    padding:14px 22px; border-top:1px solid var(--border);
    display:flex; gap:8px; justify-content:flex-end;
    position:sticky; bottom:0; background:var(--card);
    border-radius:0 0 14px 14px;
  }

  /* ── Form ── */
  .lm-fg { display:flex; flex-direction:column; gap:6px; }
  .lm-label { font-size:12px; text-transform:uppercase; letter-spacing:.9px; color:var(--muted); }
  .lm-finput {
    background:var(--surface); border:1px solid var(--border); border-radius:7px;
    padding:9px 13px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:14px; outline:none; transition:border-color .18s; width:100%;
  }
  .lm-finput:focus { border-color:var(--accent); }
  .lm-finput::placeholder { color:var(--muted); }

  /* ── Words preview trong modal detail ── */
  .lm-words-list { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
  .lm-word-row {
    display:flex; align-items:center; gap:10px;
    padding:8px 12px; border-radius:8px;
    background:var(--surface); border:1px solid var(--border);
  }
  .lm-word-en { font-weight:600; font-size:14px; flex:1; }
  .lm-word-vi { font-size:13px; color:var(--muted); }
  .lm-word-ipa { font-size:12px; color:var(--accent2); font-style:italic; }

  /* ── Confirm dialog ── */
  .lm-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:12px; width:340px; padding:26px;
    animation:lm-modal-in .18s ease; text-align:center;
  }
  .lm-confirm .ci { font-size:32px; margin-bottom:10px; }
  .lm-confirm h4 { font-size:16px; font-weight:600; margin-bottom:6px; }
  .lm-confirm p  { font-size:14px; color:var(--muted); margin-bottom:16px; line-height:1.5; }
  .lm-confirm-btns { display:flex; gap:8px; justify-content:center; }

  /* ── Detail modal wider ── */
  .lm-modal.wide { width:580px; }
  .lm-detail-section {
    font-size:11px; text-transform:uppercase; letter-spacing:1.2px;
    color:var(--muted); padding-bottom:6px; border-bottom:1px solid var(--border);
  }
  .lm-detail-meta { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .lm-detail-item { display:flex; flex-direction:column; gap:3px; }
  .lm-detail-key { font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); }
  .lm-detail-val { font-size:14px; font-weight:500; }
`;

const PAGE_SIZE = 20;

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className={`lm-toast${(msg.startsWith("❌")||msg.startsWith("⚠"))?" error":""}`}>{msg}</div>;
}

function SkelRow() {
  const S = ({ w }) => <span className="lm-skel" style={{ height: 12, width: w, display: "block" }} />;
  return (
    <tr>
      {[160, 100, 80, 100, 80, 60].map((w, i) => (
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
    const start = Math.max(2, page - 2);
    const end   = Math.min(totalPages - 1, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="lm-pagination">
      <span className="lm-pg-info"><b>{from}–{to}</b> trong <b>{totalItems}</b> lesson</span>
      <div className="lm-pg-controls">
        <button className="lm-pg-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {buildPages().map((p, i) =>
          p === "…"
            ? <span key={`d${i}`} className="lm-pg-dots">…</span>
            : <button key={p} className={`lm-pg-btn${p === page ? " active" : ""}`} onClick={() => p !== page && onPage(p)}>{p}</button>
        )}
        <button className="lm-pg-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function LessonManager() {
  const [lessons,    setLessons]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState("");
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("all");
  const [page,       setPage]       = useState(1);

  // Form state
  const [showForm,   setShowForm]   = useState(false);
  const [editingID,  setEditingID]  = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form,       setForm]       = useState({ LessonName: "", CategoryID: "" });

  // Detail modal
  const [detailLesson, setDetailLesson] = useState(null);
  const [detailWords,  setDetailWords]  = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);

  // Confirm delete
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.Role !== "Admin") {
      alert("🚫 Bạn không có quyền!");
      window.location.href = "/login";
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/lessons/");
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch { setLessons([]); }
    finally { setLoading(false); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get("/admin/lessons/categories");
      setCategories(res.data);
      if (res.data.length > 0) setForm(p => ({ ...p, CategoryID: res.data[0].CategoryID }));
    } catch {}
  }, []);

  useEffect(() => { fetchLessons(); fetchCategories(); }, [fetchLessons, fetchCategories]);
  useEffect(() => { setPage(1); }, [search, filterCat]);

  /* ── Filter & paginate ── */
  const filtered = lessons.filter(l => {
    const q = search.toLowerCase();
    return (
      (!q || l.LessonName?.toLowerCase().includes(q)) &&
      (filterCat === "all" || String(l.CategoryID) === filterCat)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Open add ── */
  const openAdd = () => {
    setEditingID(null);
    setForm({ LessonName: "", CategoryID: categories[0]?.CategoryID || "" });
    setShowForm(true);
  };

  /* ── Open edit ── */
  const handleEdit = (item) => {
    setEditingID(item.LessonID);
    setForm({ LessonName: item.LessonName || "", CategoryID: item.CategoryID || "" });
    setShowForm(true);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.LessonName.trim()) { setToast("⚠ Vui lòng nhập tên lesson!"); return; }
    if (!form.CategoryID)        { setToast("⚠ Vui lòng chọn category!"); return; }
    setSubmitting(true);
    try {
      if (editingID) {
        await API.put(`/admin/lessons/${editingID}`, form);
        setToast("✅ Cập nhật thành công!");
      } else {
        await API.post("/admin/lessons/", form);
        setToast("➕ Thêm lesson thành công!");
      }
      fetchLessons();
      setShowForm(false); setEditingID(null);
    } catch { setToast("❌ Lỗi khi lưu!"); }
    finally { setSubmitting(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/lessons/${id}`);
      setToast("🗑 Xóa lesson thành công!");
      if (paginated.length === 1 && safePage > 1) setPage(safePage - 1);
      fetchLessons();
    } catch { setToast("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  /* ── View detail ── */
  const handleViewDetail = async (lesson) => {
    setDetailLesson(lesson);
    setDetailWords([]);
    setLoadingWords(true);
    try {
      const res = await API.get(`/admin/lessons/${lesson.LessonID}/words`);
      setDetailWords(Array.isArray(res.data) ? res.data : []);
    } catch {}
    finally { setLoadingWords(false); }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="lm-root">
      <style>{STYLES}</style>

      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* ── Top bar ── */}
      <div className="lm-topbar">
        <div className="lm-topbar-row1">
          <h2>Lesson <em>Manager</em></h2>
          <button className="lm-btn primary" onClick={openAdd}>＋ Thêm lesson</button>
        </div>
        <div className="lm-topbar-row2">
          <input className="lm-search" placeholder="🔍 Tìm tên lesson…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="lm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">Tất cả category</option>
            {categories.map(c => <option key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</option>)}
          </select>
          <span className="lm-count">Tổng <b>{filtered.length}</b> lesson</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="lm-table-container">
        <table className="lm-tbl">
          <thead>
            <tr>
              <th>Tên Lesson</th>
              <th>Category</th>
              <th>Số từ vựng</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3,4,5,6].map(k => <SkelRow key={k} />)
              : paginated.length === 0
                ? (
                  <tr><td colSpan={5}>
                    <div className="lm-empty">
                      <div className="em-icon">📚</div>
                      <p>{search || filterCat !== "all"
                        ? "Không tìm thấy lesson phù hợp"
                        : "Chưa có lesson nào. Hãy tạo lesson đầu tiên!"}
                      </p>
                    </div>
                  </td></tr>
                )
                : paginated.map(item => (
                  <tr key={item.LessonID}>
                    <td>
                      <div className="lm-lesson-name">{item.LessonName}</div>
                      <div className="lm-lesson-id">ID: {item.LessonID}</div>
                    </td>
                    <td>
                      <span className="lm-badge cat">{item.CategoryName || "—"}</span>
                    </td>
                    <td>
                      <span className={`lm-badge ${item.WordCount > 0 ? "words" : "zero"}`}>
                        {item.WordCount} từ
                      </span>
                    </td>
                    <td>
                      <span className="lm-date">{formatDate(item.CreatedDate)}</span>
                    </td>
                    <td>
                      <div className="lm-actions">
                        <button className="lm-icon-btn view" title="Xem từ vựng" onClick={() => handleViewDetail(item)}>👁</button>
                        <button className="lm-icon-btn" title="Chỉnh sửa" onClick={() => handleEdit(item)}>✏️</button>
                        <button className="lm-icon-btn del" title="Xóa" onClick={() => setConfirmDel(item)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && filtered.length > PAGE_SIZE && (
        <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} onPage={setPage} />
      )}

      {/* ── Modal thêm / sửa ── */}
      {showForm && (
        <div className="lm-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="lm-modal">
            <div className="lm-modal-head">
              <h3>{editingID ? "✏️ Chỉnh sửa lesson" : "📚 Thêm lesson mới"}</h3>
              <button className="lm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="lm-modal-body">
              <div className="lm-fg">
                <label className="lm-label">Tên Lesson *</label>
                <input className="lm-finput" placeholder="e.g. Animals Basic"
                  value={form.LessonName}
                  onChange={e => setForm(p => ({ ...p, LessonName: e.target.value }))} />
              </div>
              <div className="lm-fg">
                <label className="lm-label">Category *</label>
                <select className="lm-finput" value={form.CategoryID}
                  onChange={e => setForm(p => ({ ...p, CategoryID: parseInt(e.target.value) }))}>
                  <option value="">-- Chọn category --</option>
                  {categories.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
                </select>
              </div>
            </div>
            <div className="lm-modal-footer">
              <button className="lm-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="lm-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingID ? "💾 Cập nhật" : "➕ Thêm lesson"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal xem từ vựng trong lesson ── */}
      {detailLesson && (
        <div className="lm-overlay" onClick={e => { if (e.target === e.currentTarget) setDetailLesson(null); }}>
          <div className="lm-modal wide">
            <div className="lm-modal-head">
              <h3>👁 {detailLesson.LessonName}</h3>
              <button className="lm-modal-close" onClick={() => setDetailLesson(null)}>✕</button>
            </div>
            <div className="lm-modal-body">
              {/* Meta */}
              <div className="lm-detail-section">Thông tin lesson</div>
              <div className="lm-detail-meta">
                <div className="lm-detail-item">
                  <span className="lm-detail-key">Category</span>
                  <span className="lm-detail-val">{detailLesson.CategoryName || "—"}</span>
                </div>
                <div className="lm-detail-item">
                  <span className="lm-detail-key">Ngày tạo</span>
                  <span className="lm-detail-val">{formatDate(detailLesson.CreatedDate)}</span>
                </div>
                <div className="lm-detail-item">
                  <span className="lm-detail-key">Số từ vựng</span>
                  <span className="lm-detail-val" style={{ color: "var(--accent)" }}>{detailLesson.WordCount} từ</span>
                </div>
              </div>

              {/* Words list */}
              <div className="lm-detail-section" style={{ marginTop: 6 }}>
                Danh sách từ vựng
              </div>
              {loadingWords ? (
                <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>⟳ Đang tải…</div>
              ) : detailWords.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
                  Chưa có từ vựng nào thuộc lesson này.
                </div>
              ) : (
                <div className="lm-words-list">
                  {detailWords.map(w => (
                    <div key={w.WordID} className="lm-word-row">
                      <div className="lm-word-en">{w.Word}</div>
                      <div className="lm-word-vi">{w.Meaning}</div>
                      {w.IPA && <div className="lm-word-ipa">{w.IPA}</div>}
                      {w.Accent && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px",
                          borderRadius: 20, textTransform: "uppercase",
                          background: w.Accent === "US" ? "rgba(56,189,248,.1)" : "rgba(251,191,36,.1)",
                          color: w.Accent === "US" ? "var(--accent2)" : "var(--gold)"
                        }}>{w.Accent}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="lm-modal-footer">
              <button className="lm-btn ghost" onClick={() => setDetailLesson(null)}>Đóng</button>
              <button className="lm-btn primary" onClick={() => { setDetailLesson(null); handleEdit(detailLesson); }}>
                ✏️ Chỉnh sửa lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirmDel && (
        <div className="lm-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="lm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa lesson</h4>
            <p>
              Bạn sắp xóa lesson <b style={{ color: "var(--danger)" }}>"{confirmDel.LessonName}"</b>.<br />
              Các từ vựng thuộc lesson này sẽ không bị xóa nhưng sẽ không còn gắn với lesson nào.
            </p>
            <div className="lm-confirm-btns">
              <button className="lm-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="lm-btn danger" onClick={() => handleDelete(confirmDel.LessonID)}>🗑 Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}