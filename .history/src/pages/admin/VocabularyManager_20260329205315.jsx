import { useEffect, useState } from "react";
import API from "../../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .vm-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg);
    height:100vh; display:flex; flex-direction:column; overflow:hidden;
  }
  .vm-root *, .vm-root *::before, .vm-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Custom Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  /* ── Top bar ── */
  .vm-topbar {
    flex-shrink:0;
    padding:16px 20px 14px;
    border-bottom:1px solid var(--border);
    background:var(--surface);
    display:flex; flex-direction:column; gap:12px;
  }
  .vm-topbar-row1 { display:flex; align-items:center; justify-content:space-between; flex-wrap: wrap; gap: 10px; }
  .vm-topbar-row1 h2 { font-family:'DM Serif Display',serif; font-size:24px; line-height:1; }
  .vm-topbar-row1 h2 em { font-style:italic; color:var(--accent); }
  .vm-topbar-row2 { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

  /* ── Buttons ── */
  .vm-btn {
    display:inline-flex; align-items:center; justify-content: center; gap:6px;
    padding:8px 16px; border-radius:7px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:600;
    cursor:pointer; border:none; transition:all .18s;
  }
  .vm-btn.primary { background:var(--accent); color:#0d0f14; }
  .vm-btn.primary:hover { filter:brightness(1.1); box-shadow:0 0 16px rgba(110,231,183,.3); transform: translateY(-1px); }
  .vm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .vm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .vm-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .vm-btn.danger:hover { background:rgba(248,113,113,.22); }
  .vm-btn:disabled { opacity:.45; cursor:not-allowed; transform: none; box-shadow: none; }

  /* ── Filter inputs ── */
  .vm-search {
    background:var(--card); border:1px solid var(--border); border-radius:7px;
    padding:8px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; width:220px; outline:none; transition:border-color .2s; flex-grow: 1; max-width: 300px;
  }
  .vm-search:focus { border-color:var(--accent); }
  .vm-search::placeholder { color:var(--muted); }
  .vm-select {
    background:var(--card); border:1px solid var(--border); border-radius:7px;
    padding:8px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; cursor:pointer; flex-grow: 1; min-width: 140px;
  }
  .vm-select:focus { border-color:var(--accent); }
  .vm-count { font-size:13px; color:var(--muted); margin-left:auto; white-space: nowrap; }
  .vm-count b { color:var(--text); }

  /* ── Scrollable table ── */
  .vm-table-container { flex:1; overflow:auto; min-height:0; position: relative; }
  .vm-tbl { width:100%; border-collapse:collapse; font-size:14px; min-width: 1100px; }
  .vm-tbl thead th {
    font-size:12px; text-transform:uppercase; letter-spacing:.8px; font-weight: 600;
    color:var(--muted); padding:12px 16px; text-align:left;
    border-bottom:1px solid var(--border); white-space:nowrap;
    background:var(--surface); position:sticky; top:0; z-index:2;
  }
  .vm-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .12s; }
  .vm-tbl tbody tr:last-child { border-bottom:none; }
  .vm-tbl tbody tr:hover { background:rgba(110,231,183,.04); }
  .vm-tbl tbody td { padding:12px 16px; vertical-align:middle; }

  /* ── Cell content ── */
  .vm-word-en { font-weight:600; font-size:15px; color: var(--text); }
  .vm-word-vi { font-size:13px; color:var(--muted); margin-top:3px; }
  .vm-ipa     { font-size:13px; color:var(--accent2); font-style:italic; white-space: nowrap;}
  .vm-trunc   { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 220px; color:var(--muted); font-size:13px; line-height: 1.4; }

  /* ── Badges ── */
  .vm-badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space: nowrap; }
  .vm-badge.easy   { background:rgba(74,222,128,.1);  color:var(--success); }
  .vm-badge.medium { background:rgba(251,191,36,.12); color:var(--gold); }
  .vm-badge.hard   { background:rgba(248,113,113,.12);color:var(--danger); }
  .vm-badge.cat    { background:rgba(56,189,248,.08); color:var(--accent2); }
  .vm-badge.lesson { background:rgba(244,114,182,.08);color:var(--accent3); }

  .vm-accent-tag { display:inline-block; padding:3px 8px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
  .vm-accent-tag.US { background:rgba(56,189,248,.1); color:var(--accent2); }
  .vm-accent-tag.UK { background:rgba(251,191,36,.1); color:var(--gold); }

  .vm-thumb  { width:40px; height:40px; border-radius:6px; object-fit:cover; border:1px solid var(--border); display:block; }
  .vm-no-img { width:40px; height:40px; border-radius:6px; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:16px; background: rgba(0,0,0,0.2); }
  .vm-audio  { height:32px; width:150px; filter:invert(1) hue-rotate(145deg) brightness(.8); border-radius:20px; outline: none; }

  /* ── Icon buttons ── */
  .vm-actions { display:flex; gap:6px; justify-content:center; }
  .vm-icon-btn {
    width:30px; height:30px; border-radius:6px; border:1px solid var(--border);
    background:var(--card); cursor:pointer; color:var(--muted); font-size:14px;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .vm-icon-btn:hover     { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.1); transform: translateY(-1px); }
  .vm-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.1); }

  /* ── Empty ── */
  .vm-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .vm-empty .em-icon { font-size:40px; margin-bottom:12px; opacity: 0.5; }
  .vm-empty p { font-size:14px; }

  /* ── Skeleton ── */
  @keyframes vm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .vm-skel { display:block; border-radius:4px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:vm-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes vm-toast-in { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .vm-toast {
    position:fixed; top:20px; right:20px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:4px solid var(--accent); border-radius:8px;
    padding:14px 18px; color:var(--text); font-size:14px; font-weight: 500;
    font-family:'DM Sans',sans-serif; box-shadow:0 10px 30px rgba(0,0,0,.5);
    animation:vm-toast-in .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); min-width:220px;
  }
  .vm-toast.error { border-left-color:var(--danger); }

  /* ── Pagination bar ── */
  .vm-pagination {
    flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
    padding:12px 20px; border-top:1px solid var(--border);
    background:var(--surface); gap:16px; flex-wrap: wrap;
  }
  .vm-pg-info { font-size:13px; color:var(--muted); white-space:nowrap; }
  .vm-pg-info b { color:var(--text); font-weight: 600; }
  .vm-pg-controls { display:flex; align-items:center; gap:4px; }
  .vm-pg-btn {
    min-width:32px; height:32px; padding:0 8px;
    border-radius:6px; border:1px solid var(--border);
    background:var(--card); cursor:pointer; color:var(--muted);
    font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s; user-select:none;
  }
  .vm-pg-btn:hover:not(:disabled) { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.1); }
  .vm-pg-btn.active { background:var(--accent); color:#0d0f14; border-color:var(--accent); cursor:default; }
  .vm-pg-btn:disabled { opacity:.4; cursor:not-allowed; }
  .vm-pg-dots { font-size:14px; color:var(--muted); padding:0 4px; line-height:32px; }
  .vm-pg-size { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--muted); }
  .vm-pg-size select {
    background:var(--card); border:1px solid var(--border); border-radius:6px;
    padding:4px 8px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; cursor:pointer;
  }

  /* ── Modal ── */
  @keyframes vm-modal-in { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .vm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.7);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(5px); padding: 16px;
  }
  .vm-modal {
    background:var(--card); border:1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    border-radius:16px; width:600px; max-width:100%;
    max-height:90vh; display: flex; flex-direction: column;
    animation:vm-modal-in .25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .vm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; border-bottom:1px solid var(--border);
    background:var(--surface); border-radius:16px 16px 0 0; flex-shrink: 0;
  }
  .vm-modal-head h3 { font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .vm-modal-close {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    width:32px; height:32px; color:var(--muted); font-size:16px;
    cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .vm-modal-close:hover { color:var(--danger); border-color:var(--danger); background: rgba(248,113,113,.1); }
  .vm-modal-body { padding:20px 24px; overflow-y: auto; }
  .vm-modal-footer {
    padding:16px 24px; border-top:1px solid var(--border);
    display:flex; gap:10px; justify-content:flex-end;
    background:var(--surface); border-radius:0 0 16px 16px; flex-shrink: 0;
  }

  /* ── Form grid ── */
  .vm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .vm-form-group { display:flex; flex-direction:column; gap:6px; }
  .vm-form-group.full { grid-column:1/-1; }
  .vm-form-label { font-size:12px; font-weight: 600; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .vm-form-input {
    background:var(--bg); border:1px solid var(--border); border-radius:8px;
    padding:10px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:14px; outline:none; transition:all .2s; width:100%;
  }
  .vm-form-input:focus { border-color:var(--accent); box-shadow: 0 0 0 3px rgba(110,231,183,0.1); }
  .vm-form-input::placeholder { color:var(--muted); opacity: 0.7; }
  .vm-form-section {
    font-size:11px; font-weight: 700; text-transform:uppercase; letter-spacing:1.5px;
    color:var(--muted); padding:16px 0 4px;
    border-top:1px solid var(--border); margin-top:4px;
    grid-column:1/-1;
  }
  .vm-form-section:first-child { border-top:none; padding-top:0; margin-top:0; }

  /* ── Image in form ── */
  .vm-img-preview { width:100%; height:120px; border-radius:8px; object-fit:cover; border:1px solid var(--border); margin-top:8px; display:block; }
  .vm-img-placeholder { width:100%; height:120px; border-radius:8px; border:1px dashed var(--muted); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; margin-top:8px; background:var(--bg); }
  .vm-file-label { display:inline-flex; align-items:center; justify-content: center; gap:6px; padding:10px 16px; border-radius:8px; border:1px dashed var(--muted); background:var(--bg); color:var(--text); font-weight: 500; font-size:13px; cursor:pointer; transition:all .2s; margin-top:6px; }
  .vm-file-label:hover { border-color:var(--accent); color:var(--accent); background: rgba(110,231,183,0.05); }
  .vm-file-input { display:none; }

  /* ── Confirm dialog ── */
  .vm-confirm { background:var(--card); border:1px solid var(--border); border-radius:16px; width:340px; padding:28px 24px; animation:vm-modal-in .2s ease; text-align:center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
  .vm-confirm .ci { font-size:36px; margin-bottom:12px; display: inline-block; background: rgba(248,113,113,0.1); padding: 12px; border-radius: 50%; }
  .vm-confirm h4 { font-size:18px; font-weight:600; margin-bottom:8px; }
  .vm-confirm p  { font-size:14px; color:var(--muted); margin-bottom:20px; line-height:1.6; }
  .vm-confirm-btns { display:flex; gap:10px; justify-content:center; }
  .vm-confirm-btns button { flex: 1; }

  /* ── Media Queries for Responsiveness ── */
  @media (max-width: 900px) {
    .vm-search { max-width: 100%; }
    .vm-count { width: 100%; text-align: left; }
  }
  @media (max-width: 600px) {
    .vm-form-grid { grid-template-columns: 1fr; }
    .vm-topbar-row1 { flex-direction: column; align-items: flex-start; }
    .vm-topbar-row2 { flex-direction: column; align-items: stretch; }
    .vm-select { width: 100%; }
    .vm-pagination { justify-content: center; }
  }
`;

const DIFF_MAP = { 1:["easy","Easy"], 2:["medium","Medium"], 3:["hard","Hard"] };
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function getFullAudioURL(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://127.0.0.1:5000${url.startsWith("/") ? url : "/"+url}`;
}
function getFullImageURL(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://127.0.0.1:5000${url}`;
}

const EMPTY_FORM = {
  Word:"", Meaning:"", CategoryID:1, DifficultyLevel:1,
  IPA:"", AudioURL:"", Accent:"US",
  ExampleSentence:"", Translation:"", ImageURL:"", LessonID:null
};

function F({ label, children, full }) {
  return (
    <div className={`vm-form-group${full?" full":""}`}>
      <label className="vm-form-label">{label}</label>
      {children}
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className={`vm-toast${(msg.startsWith("❌")||msg.startsWith("⚠"))?" error":""}`}>{msg}</div>;
}

function SkelRow() {
  const S = ({ w="80px" }) => <span className="vm-skel" style={{height:14,width:w,display:"block"}}/>;
  return (
    <tr>
      {[120,80,60,60,50,140,40,160,140,60,50].map((w,i) => (
        <td key={i}><S w={w}/></td>
      ))}
    </tr>
  );
}

/* ─── Pagination component ──────────────────────────────────── */
function Pagination({ page, totalPages, pageSize, totalItems, onPage, onPageSize }) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

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
    <div className="vm-pagination">
      <div className="vm-pg-size">
        <span>Hiển thị</span>
        <select value={pageSize} onChange={e => onPageSize(parseInt(e.target.value))}>
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>/ trang</span>
      </div>

      <span className="vm-pg-info">
        <b>{from}–{to}</b> trong tổng số <b>{totalItems}</b> từ
      </span>

      <div className="vm-pg-controls">
        <button className="vm-pg-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {buildPages().map((p, i) =>
          p === "…"
            ? <span key={`d${i}`} className="vm-pg-dots">…</span>
            : <button key={p} className={`vm-pg-btn${p === page ? " active" : ""}`} onClick={() => p !== page && onPage(p)}>{p}</button>
        )}
        <button className="vm-pg-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function VocabularyManager() {
  const [vocabList,    setVocabList]    = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [editingID,    setEditingID]    = useState(null);
  const [toast,        setToast]        = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterDiff,   setFilterDiff]   = useState("all");
  const [filterLesson, setFilterLesson] = useState("all");
  const [form,         setForm]         = useState({ ...EMPTY_FORM });

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.Role !== "Admin") {
      alert("🚫 Bạn không có quyền truy cập!");
      window.location.href = "/login";
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/vocabulary");
      let data = res.data;
      if (typeof data === "string") data = JSON.parse(data);
      setVocabList(Array.isArray(data) ? data : []);
    } catch { setVocabList([]); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/admin/vocabulary/categories");
      setCategories(res.data);
      if (res.data.length > 0) setForm(p => ({ ...p, CategoryID: res.data[0].CategoryID }));
    } catch {}
  };

  const fetchLessons = async () => {
    try {
      const res = await API.get("/admin/vocabulary/lessons");
      setLessons(res.data);
    } catch {}
  };

  useEffect(() => { fetchData(); fetchCategories(); fetchLessons(); }, []);
  useEffect(() => { setPage(1); }, [search, filterCat, filterDiff, filterLesson, pageSize]);

  const filtered = vocabList.filter(v => {
    const q = search.toLowerCase();
    return (
      (!q || v.Word?.toLowerCase().includes(q) || v.Meaning?.toLowerCase().includes(q)) &&
      (filterCat    === "all" || String(v.CategoryID)      === filterCat) &&
      (filterDiff   === "all" || String(v.DifficultyLevel) === filterDiff) &&
      (filterLesson === "all" || String(v.LessonID)        === filterLesson)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSubmit = async () => {
    if (!form.Word.trim() || !form.Meaning.trim()) { setToast("⚠ Vui lòng nhập Từ vựng và Nghĩa!"); return; }
    setSubmitting(true);
    try {
      if (editingID) {
        await API.put(`/admin/vocabulary/${editingID}`, form);
        setToast("✅ Cập nhật thành công!");
      } else {
        await API.post("/admin/vocabulary/", form);
        setToast("➕ Thêm từ mới thành công!");
      }
      fetchData();
      setForm({ ...EMPTY_FORM, CategoryID: categories[0]?.CategoryID || 1 });
      setShowForm(false); setEditingID(null);
    } catch { setToast("❌ Lỗi khi lưu dữ liệu!"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/vocabulary/${id}`);
      setToast("🗑 Xóa thành công!");
      if (paginated.length === 1 && safePage > 1) setPage(safePage - 1);
      fetchData();
    } catch { setToast("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  const handleEdit = (item) => {
    setEditingID(item.WordID);
    setForm({
      Word: item.Word||"", Meaning: item.Meaning||"",
      CategoryID: item.CategoryID||categories[0]?.CategoryID,
      DifficultyLevel: item.DifficultyLevel||1,
      IPA: item.IPA||"", AudioURL: item.AudioURL||"",
      Accent: item.Accent||"US",
      ExampleSentence: item.ExampleSentence||"",
      Translation: item.Translation||"",
      ImageURL: item.ImageURL||"", LessonID: item.LessonID||null
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await API.post("/admin/vocabulary/upload-image", fd, { headers: {"Content-Type":"multipart/form-data"} });
      setForm(p => ({ ...p, ImageURL: res.data.url }));
      setToast("🖼 Tải ảnh thành công!");
    } catch { setToast("❌ Upload ảnh lỗi!"); }
  };

  const openAdd = () => {
    setEditingID(null);
    setForm({ ...EMPTY_FORM, CategoryID: categories[0]?.CategoryID || 1 });
    setShowForm(true);
  };

  return (
    <div className="vm-root">
      <style>{STYLES}</style>

      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* ── Top bar ── */}
      <div className="vm-topbar">
        <div className="vm-topbar-row1">
          <h2>Vocabulary <em>Manager</em></h2>
          <button className="vm-btn primary" onClick={openAdd}>＋ Thêm từ mới</button>
        </div>
        <div className="vm-topbar-row2">
          <input className="vm-search" placeholder="🔍 Tìm kiếm từ vựng, nghĩa..."
            value={search} onChange={e => setSearch(e.target.value)}/>
          <select className="vm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">📁 Tất cả Category</option>
            {categories.map(c => <option key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</option>)}
          </select>
          <select className="vm-select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
            <option value="all">⚡ Tất cả Độ khó</option>
            <option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option>
          </select>
          <select className="vm-select" value={filterLesson} onChange={e => setFilterLesson(e.target.value)}>
            <option value="all">📚 Tất cả Lesson</option>
            {lessons.map(l => <option key={l.LessonID} value={String(l.LessonID)}>{l.LessonName}</option>)}
          </select>
          <span className="vm-count">Tổng: <b>{filtered.length}</b> từ</span>
        </div>
      </div>

      {/* ── Scrollable table ── */}
      <div className="vm-table-container">
        <table className="vm-tbl">
          <thead>
            <tr>
              <th>Từ vựng</th><th>Category</th><th>Độ khó</th>
              <th>IPA</th><th>Accent</th><th>Audio</th><th>Ảnh</th>
              <th>Ví dụ</th><th>Dịch ví dụ</th><th>Lesson</th>
              <th style={{textAlign:"center"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3,4,5,6].map(k => <SkelRow key={k}/>)
              : paginated.length === 0
                ? (
                  <tr><td colSpan={11}>
                    <div className="vm-empty">
                      <div className="em-icon">📭</div>
                      <p>{search||filterCat!=="all"||filterDiff!=="all"||filterLesson!=="all"
                        ? "Không tìm thấy từ vựng nào phù hợp với bộ lọc."
                        : "Chưa có từ vựng nào trong hệ thống. Hãy thêm từ đầu tiên!"}</p>
                    </div>
                  </td></tr>
                )
                : paginated.map(item => {
                  const [diffClass, diffLabel] = DIFF_MAP[item.DifficultyLevel] || ["easy","Easy"];
                  const audioSrc = getFullAudioURL(item.AudioURL);
                  const imgSrc   = getFullImageURL(item.ImageURL);
                  return (
                    <tr key={item.WordID}>
                      <td>
                        <div className="vm-word-en">{item.Word}</div>
                        <div className="vm-word-vi">{item.Meaning}</div>
                      </td>
                      <td><span className="vm-badge cat">{item.CategoryName||"—"}</span></td>
                      <td><span className={`vm-badge ${diffClass}`}>{diffLabel}</span></td>
                      <td><span className="vm-ipa">{item.IPA||"—"}</span></td>
                      <td>
                        {item.Accent
                          ? <span className={`vm-accent-tag ${item.Accent}`}>{item.Accent}</span>
                          : <span style={{color:"var(--muted)"}}>—</span>}
                      </td>
                      <td>
                        {audioSrc
                          ? <audio className="vm-audio" controls><source src={audioSrc} type="audio/mpeg"/></audio>
                          : <span style={{color:"var(--muted)"}}>—</span>}
                      </td>
                      <td>
                        {imgSrc
                          ? <img className="vm-thumb" src={imgSrc} alt={item.Word}/>
                          : <div className="vm-no-img">?</div>}
                      </td>
                      <td><div className="vm-trunc" title={item.ExampleSentence}>{item.ExampleSentence||"—"}</div></td>
                      <td><div className="vm-trunc" title={item.Translation}>{item.Translation||"—"}</div></td>
                      <td>
                        {item.LessonName
                          ? <span className="vm-badge lesson">{item.LessonName}</span>
                          : <span style={{color:"var(--muted)"}}>—</span>}
                      </td>
                      <td>
                        <div className="vm-actions">
                          <button className="vm-icon-btn" title="Chỉnh sửa" onClick={() => handleEdit(item)}>✏️</button>
                          <button className="vm-icon-btn del" title="Xóa" onClick={() => setConfirmDel(item)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* ── Pagination bar ── */}
      {!loading && (
        <Pagination
          page={safePage} totalPages={totalPages} pageSize={pageSize}
          totalItems={filtered.length} onPage={setPage}
          onPageSize={n => { setPageSize(n); setPage(1); }}
        />
      )}

      {/* ── Modal thêm / sửa ── */}
      {showForm && (
        <div className="vm-overlay" onClick={e => { if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="vm-modal">
            <div className="vm-modal-head">
              <h3>{editingID ? "✏️ Chỉnh sửa từ vựng" : "📝 Thêm từ vựng mới"}</h3>
              <button className="vm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="vm-modal-body">
              <div className="vm-form-grid">
                <div className="vm-form-section">📖 Thông tin cơ bản</div>
                <F label="Từ tiếng Anh *">
                  <input className="vm-form-input" placeholder="e.g. perseverance"
                    value={form.Word} onChange={e=>setForm(p=>({...p,Word:e.target.value}))}/>
                </F>
                <F label="Nghĩa tiếng Việt *">
                  <input className="vm-form-input" placeholder="e.g. sự kiên trì"
                    value={form.Meaning} onChange={e=>setForm(p=>({...p,Meaning:e.target.value}))}/>
                </F>
                <F label="Category">
                  <select className="vm-form-input" value={form.CategoryID}
                    onChange={e=>setForm(p=>({...p,CategoryID:parseInt(e.target.value)}))}>
                    {categories.map(c=><option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
                  </select>
                </F>
                <F label="Độ khó">
                  <select className="vm-form-input" value={form.DifficultyLevel}
                    onChange={e=>setForm(p=>({...p,DifficultyLevel:parseInt(e.target.value)}))}>
                    <option value={1}>Easy</option><option value={2}>Medium</option><option value={3}>Hard</option>
                  </select>
                </F>

                <div className="vm-form-section">🔊 Phát âm</div>
                <F label="IPA">
                  <input className="vm-form-input" placeholder="/ˌpɜːsɪˈvɪər.əns/"
                    value={form.IPA} onChange={e=>setForm(p=>({...p,IPA:e.target.value}))}/>
                </F>
                <F label="Accent">
                  <select className="vm-form-input" value={form.Accent}
                    onChange={e=>setForm(p=>({...p,Accent:e.target.value}))}>
                    <option value="">-- Chọn Accent --</option>
                    <option value="US">US - Mỹ</option><option value="UK">UK - Anh</option>
                  </select>
                </F>
                <F label="Audio URL" full>
                  <input className="vm-form-input" placeholder="/uploads/audio/word.mp3"
                    value={form.AudioURL} onChange={e=>setForm(p=>({...p,AudioURL:e.target.value}))}/>
                </F>

                <div className="vm-form-section">📚 Lesson & Ví dụ</div>
                <F label="Lesson (Tùy chọn)" full>
                  <select className="vm-form-input" value={form.LessonID??""}
                    onChange={e=>setForm(p=>({...p,LessonID:e.target.value?parseInt(e.target.value):null}))}>
                    <option value="">-- Không thuộc bài học nào --</option>
                    {lessons.map(l=><option key={l.LessonID} value={l.LessonID}>{l.LessonName}</option>)}
                  </select>
                </F>
                <F label="Câu ví dụ (English)" full>
                  <input className="vm-form-input" placeholder="Perseverance is the key to success."
                    value={form.ExampleSentence} onChange={e=>setForm(p=>({...p,ExampleSentence:e.target.value}))}/>
                </F>
                <F label="Dịch nghĩa ví dụ" full>
                  <input className="vm-form-input" placeholder="Kiên trì là chìa khoá thành công."
                    value={form.Translation} onChange={e=>setForm(p=>({...p,Translation:e.target.value}))}/>
                </F>

                <div className="vm-form-section">🖼 Hình ảnh</div>
                <F label="Upload ảnh minh họa" full>
                  <label className="vm-file-label">
                    📁 Chọn file ảnh từ máy tính
                    <input className="vm-file-input" type="file" accept="image/*" onChange={handleImageUpload}/>
                  </label>
                  {form.ImageURL
                    ? <img className="vm-img-preview" src={getFullImageURL(form.ImageURL)} alt="preview"/>
                    : <div className="vm-img-placeholder">Chưa có ảnh minh họa</div>}
                </F>
              </div>
            </div>
            <div className="vm-modal-footer">
              <button className="vm-btn ghost" onClick={()=>setShowForm(false)}>Hủy bỏ</button>
              <button className="vm-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu..." : editingID ? "💾 Cập nhật" : "➕ Thêm từ vựng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirmDel && (
        <div className="vm-overlay" onClick={e=>{if(e.target===e.currentTarget)setConfirmDel(null);}}>
          <div className="vm-confirm">
            <div className="ci">🗑️</div>
            <h4>Xác nhận xóa từ vựng</h4>
            <p>Bạn sắp xóa từ <b style={{color:"var(--danger)"}}>"{confirmDel.Word}"</b>.<br/>Hành động này không thể hoàn tác.</p>
            <div className="vm-confirm-btns">
              <button className="vm-btn ghost" onClick={()=>setConfirmDel(null)}>Hủy</button>
              <button className="vm-btn danger" onClick={()=>handleDelete(confirmDel.WordID)}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}