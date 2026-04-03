// src/pages/admin/VocabularyManager.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";

/* ─── Scoped styles ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .vm-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80; --warn:#fb923c;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg); 
    min-height: 100vh;
    padding: 24px; /* Thêm padding để nội dung không sát mép màn hình */
    box-sizing: border-box;
  }
  .vm-root *, .vm-root *::before, .vm-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Header ── */
  .vm-header { 
    display:flex; align-items: center; justify-content:space-between; 
    margin-bottom:28px; flex-wrap: wrap; gap: 20px;
  }
  .vm-header h2 { font-family:'DM Serif Display',serif; font-size:28px; color:var(--text); line-height:1.2; }
  .vm-header h2 em { font-style:italic; color:var(--accent); }
  .vm-header p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* ── Buttons ── */
  .vm-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:10px 20px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:600;
    cursor:pointer; border:none; transition:all .2s;
    white-space: nowrap;
  }
  .vm-btn.primary { background:var(--accent); color:#0d0f14; }
  .vm-btn.primary:hover { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .vm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .vm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .vm-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .vm-btn.danger:hover { background:rgba(248,113,113,.22); }

  /* ── Filter bar ── */
  .vm-filter { 
    display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; align-items:center; 
    background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border);
  }
  .vm-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; min-width:200px; flex: 1; outline:none; transition:border-color .2s;
  }
  .vm-select {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; cursor:pointer; min-width: 140px;
  }
  .vm-count { font-size:13px; color:var(--muted); width: 100%; margin-top: 4px; }
  @media (min-width: 768px) { .vm-count { width: auto; margin-top: 0; margin-left: auto; } }

  /* ── Table wrapper ── */
  .vm-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow: hidden; width: 100%; }
  .vm-tbl-wrap { overflow-x:auto; width: 100%; }
  .vm-tbl { width:100%; border-collapse:collapse; table-layout: auto; }
  .vm-tbl thead th {
    font-size:11px; text-transform:uppercase; letter-spacing:1px;
    color:var(--muted); padding:14px 16px; text-align:left;
    border-bottom:1px solid var(--border); white-space:nowrap;
    background:var(--surface);
  }
  .vm-tbl tbody td { padding:14px 16px; font-size:13px; color:var(--text); vertical-align:middle; border-bottom:1px solid var(--border); }

  /* ── Form grid ── */
  .vm-form-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:16px; }
  .vm-form-group.full { grid-column: span 2; }
  .vm-form-input {
    background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:10px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; width:100%;
  }
  .vm-form-section {
    font-size:10px; text-transform:uppercase; letter-spacing:2px;
    color:var(--accent2); padding:20px 0 8px; border-bottom: 1px solid var(--border);
    margin-bottom: 4px; grid-column: span 2;
  }

  /* ── Utilities ── */
  .vm-audio { height:30px; width:120px; filter:invert(1) opacity(0.7); }
  .vm-thumb { width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid var(--border); }
  
  /* Responsive form */
  @media (max-width: 500px) {
    .vm-form-grid { grid-template-columns: 1fr; }
    .vm-form-group.full, .vm-form-section { grid-column: span 1; }
  }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
const DIFF_MAP = { 1: ["easy","Easy"], 2: ["medium","Medium"], 3: ["hard","Hard"] };

function getFullAudioURL(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://127.0.0.1:5000/${url.replace(/^\//, '')}`;
}
function getFullImageURL(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://127.0.0.1:5000/${url.replace(/^\//, '')}`;
}

const EMPTY_FORM = {
  Word:"", Meaning:"", CategoryID:1, DifficultyLevel:1,
  IPA:"", AudioURL:"", Accent:"US",
  ExampleSentence:"", Translation:"", ImageURL:"", LessonID: ""
};

/* ─── Main component ────────────────────────────────────────── */
export default function VocabularyManager() {
  const [vocabList, setVocabList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingID, setEditingID] = useState(null);
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [filterLesson, setFilterLesson] = useState("all");
  
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchLessons();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/vocabulary");
      setVocabList(Array.isArray(res.data) ? res.data : []);
    } catch { setVocabList([]); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/admin/vocabulary/categories");
      setCategories(res.data);
    } catch {}
  };

  const fetchLessons = async () => {
    try {
      const res = await API.get("/admin/vocabulary/lessons");
      setLessons(res.data);
    } catch {}
  };

  const filtered = vocabList.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.Word?.toLowerCase().includes(q) || v.Meaning?.toLowerCase().includes(q);
    const matchCat = filterCat === "all" || String(v.CategoryID) === filterCat;
    const matchDiff = filterDiff === "all" || String(v.DifficultyLevel) === filterDiff;
    const matchLesson = filterLesson === "all" || String(v.LessonID) === filterLesson;
    return matchSearch && matchCat && matchDiff && matchLesson;
  });

  const handleSubmit = async () => {
    if (!form.Word.trim() || !form.Meaning.trim()) {
      setToast("⚠️ Vui lòng nhập Word và Meaning!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, LessonID: form.LessonID || null };
      if (editingID) {
        await API.put(`/admin/vocabulary/${editingID}`, payload);
        setToast("✅ Cập nhật thành công!");
      } else {
        await API.post("/admin/vocabulary/", payload);
        setToast("➕ Thêm từ mới thành công!");
      }
      fetchData();
      setShowForm(false);
    } catch { setToast("❌ Lỗi khi lưu dữ liệu!"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (item) => {
    setEditingID(item.WordID);
    setForm({
      Word: item.Word || "",
      Meaning: item.Meaning || "",
      CategoryID: item.CategoryID || (categories[0]?.CategoryID),
      DifficultyLevel: item.DifficultyLevel || 1,
      IPA: item.IPA || "",
      AudioURL: item.AudioURL || "",
      Accent: item.Accent || "US",
      ExampleSentence: item.ExampleSentence || "",
      Translation: item.Translation || "",
      ImageURL: item.ImageURL || "",
      LessonID: item.LessonID || ""
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await API.post("/admin/vocabulary/upload-image", fd);
      setForm(p => ({ ...p, ImageURL: res.data.url }));
      setToast("🖼 Tải ảnh thành công!");
    } catch { setToast("❌ Upload ảnh lỗi!"); }
  };

  return (
    <div className="vm-root">
      <style>{STYLES}</style>
      
      {/* Header */}
      <div className="vm-header">
        <div>
          <h2>Quản lý <em>Vocabulary</em></h2>
          <p>Hệ thống quản trị từ vựng nội bộ</p>
        </div>
        <button className="vm-btn primary" onClick={() => { setEditingID(null); setForm({...EMPTY_FORM}); setShowForm(true); }}>
          ＋ Thêm từ mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="vm-filter">
        <input 
          className="vm-search" 
          placeholder="Tìm từ vựng..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <select className="vm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Tất cả Category</option>
          {categories.map(c => <option key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</option>)}
        </select>
        <select className="vm-select" value={filterLesson} onChange={e => setFilterLesson(e.target.value)}>
          <option value="all">Tất cả Lesson</option>
          {lessons.map(l => <option key={l.LessonID} value={String(l.LessonID)}>{l.LessonName}</option>)}
        </select>
        <select className="vm-select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
          <option value="all">Mọi độ khó</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>
        <div className="vm-count">Hiển thị <b>{filtered.length}</b> mục</div>
      </div>

      {/* Main Table */}
      <div className="vm-card">
        <div className="vm-tbl-wrap">
          <table className="vm-tbl">
            <thead>
              <tr>
                <th>Từ vựng</th>
                <th>Phân loại</th>
                <th>Phát âm</th>
                <th>Audio</th>
                <th>Ảnh</th>
                <th>Lesson</th>
                <th style={{textAlign:"right"}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.WordID}>
                  <td>
                    <div className="vm-word-en">{item.Word}</div>
                    <div className="vm-word-vi">{item.Meaning}</div>
                  </td>
                  <td>
                    <span className="vm-badge cat">{item.CategoryName}</span>
                    <div style={{marginTop:4}} className={`vm-badge ${DIFF_MAP[item.DifficultyLevel]?.[0]}`}>
                      {DIFF_MAP[item.DifficultyLevel]?.[1]}
                    </div>
                  </td>
                  <td>
                    <div className="vm-ipa">{item.IPA}</div>
                    {item.Accent && <span className={`vm-accent-tag ${item.Accent}`}>{item.Accent}</span>}
                  </td>
                  <td>
                    {item.AudioURL && <audio className="vm-audio" controls src={getFullAudioURL(item.AudioURL)} />}
                  </td>
                  <td>
                    {item.ImageURL ? <img src={getFullImageURL(item.ImageURL)} className="vm-thumb" alt="" /> : "—"}
                  </td>
                  <td>{item.LessonName || "—"}</td>
                  <td>
                    <div className="vm-actions" style={{justifyContent: "flex-end"}}>
                      <button className="vm-icon-btn" onClick={() => handleEdit(item)}>✏️</button>
                      <button className="vm-icon-btn del" onClick={() => setConfirmDel(item)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="vm-overlay">
          <div className="vm-modal">
            <div className="vm-modal-head">
              <h3>{editingID ? "✏️ Sửa từ vựng" : "📝 Thêm từ vựng"}</h3>
              <button className="vm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="vm-modal-body">
              <div className="vm-form-grid">
                <div className="vm-form-section">Thông tin từ</div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Từ tiếng Anh</label>
                  <input className="vm-form-input" value={form.Word} onChange={e => setForm({...form, Word: e.target.value})} />
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Nghĩa tiếng Việt</label>
                  <input className="vm-form-input" value={form.Meaning} onChange={e => setForm({...form, Meaning: e.target.value})} />
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Category</label>
                  <select className="vm-form-input" value={form.CategoryID} onChange={e => setForm({...form, CategoryID: e.target.value})}>
                    {categories.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
                  </select>
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Lesson</label>
                  <select className="vm-form-input" value={form.LessonID} onChange={e => setForm({...form, LessonID: e.target.value})}>
                    <option value="">-- Không có --</option>
                    {lessons.map(l => <option key={l.LessonID} value={l.LessonID}>{l.LessonName}</option>)}
                  </select>
                </div>

                <div className="vm-form-section">Phát âm & Ví dụ</div>
                <div className="vm-form-group">
                  <label className="vm-form-label">IPA</label>
                  <input className="vm-form-input" value={form.IPA} onChange={e => setForm({...form, IPA: e.target.value})} />
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Accent</label>
                  <select className="vm-form-input" value={form.Accent} onChange={e => setForm({...form, Accent: e.target.value})}>
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
                <div className="vm-form-group full">
                  <label className="vm-form-label">Câu ví dụ</label>
                  <input className="vm-form-input" value={form.ExampleSentence} onChange={e => setForm({...form, ExampleSentence: e.target.value})} />
                </div>

                <div className="vm-form-section">Hình ảnh</div>
                <div className="vm-form-group full">
                  <input type="file" onChange={handleImageUpload} style={{marginBottom: 8}} />
                  {form.ImageURL && <img src={getFullImageURL(form.ImageURL)} className="vm-img-preview" alt="" />}
                </div>
              </div>
            </div>
            <div className="vm-modal-footer">
              <button className="vm-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="vm-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu dữ liệu"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast thông báo */}
      {toast && <div className="vm-toast">{toast}</div>}
    </div>
  );
}