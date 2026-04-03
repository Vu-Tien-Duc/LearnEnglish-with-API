// src/pages/admin/VocabularyManager.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .vm-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80;
    font-family:'DM Sans',sans-serif; font-size:13px;
    color:var(--text); background:var(--bg);
    height:100%; display:flex; flex-direction:column; overflow:hidden;
  }
  .vm-root *, .vm-root *::before, .vm-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Top bar (header + filters merged) ── */
  .vm-topbar {
    flex-shrink:0;
    padding:14px 20px 10px;
    border-bottom:1px solid var(--border);
    background:var(--surface);
    display:flex; flex-direction:column; gap:10px;
  }
  .vm-topbar-row1 { display:flex; align-items:center; justify-content:space-between; }
  .vm-topbar-row1 h2 {
    font-family:'DM Serif Display',serif; font-size:22px; line-height:1;
  }
  .vm-topbar-row1 h2 em { font-style:italic; color:var(--accent); }
  .vm-topbar-row2 { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

  /* ── Buttons ── */
  .vm-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:6px 14px; border-radius:7px; font-size:12px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .18s;
  }
  .vm-btn.primary { background:var(--accent); color:#0d0f14; }
  .vm-btn.primary:hover { filter:brightness(1.1); box-shadow:0 0 16px rgba(110,231,183,.3); }
  .vm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .vm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .vm-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .vm-btn.danger:hover { background:rgba(248,113,113,.22); }
  .vm-btn:disabled { opacity:.45; cursor:not-allowed; }

  /* ── Filter inputs ── */
  .vm-search {
    background:var(--card); border:1px solid var(--border); border-radius:7px;
    padding:6px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:12px; width:190px; outline:none; transition:border-color .2s;
  }
  .vm-search:focus { border-color:var(--accent); }
  .vm-search::placeholder { color:var(--muted); }
  .vm-select {
    background:var(--card); border:1px solid var(--border); border-radius:7px;
    padding:6px 10px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:12px; outline:none; cursor:pointer;
  }
  .vm-select:focus { border-color:var(--accent); }
  .vm-count { font-size:12px; color:var(--muted); margin-left:auto; }
  .vm-count b { color:var(--text); }

  /* ── Scrollable table fills remaining height ── */
  .vm-table-container { flex:1; overflow:auto; min-height:0; }
  .vm-tbl { width:100%; border-collapse:collapse; font-size:12px; }
  .vm-tbl thead th {
    font-size:10px; text-transform:uppercase; letter-spacing:.8px;
    color:var(--muted); padding:9px 12px; text-align:left;
    border-bottom:1px solid var(--border); white-space:nowrap;
    background:var(--surface); position:sticky; top:0; z-index:2;
  }
  .vm-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .12s; }
  .vm-tbl tbody tr:last-child { border-bottom:none; }
  .vm-tbl tbody tr:hover { background:rgba(110,231,183,.03); }
  .vm-tbl tbody td { padding:8px 12px; vertical-align:middle; }

  /* ── Cell content ── */
  .vm-word-en { font-weight:600; font-size:13px; }
  .vm-word-vi { font-size:11px; color:var(--muted); margin-top:1px; }
  .vm-ipa     { font-size:11px; color:var(--accent2); font-style:italic; }
  .vm-trunc   { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:150px; color:var(--muted); font-size:11px; }

  /* ── Badges ── */
  .vm-badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:500; }
  .vm-badge.easy   { background:rgba(74,222,128,.1);  color:var(--success); }
  .vm-badge.medium { background:rgba(251,191,36,.12); color:var(--gold); }
  .vm-badge.hard   { background:rgba(248,113,113,.12);color:var(--danger); }
  .vm-badge.cat    { background:rgba(56,189,248,.08); color:var(--accent2); }
  .vm-badge.lesson { background:rgba(244,114,182,.08);color:var(--accent3); }

  .vm-accent-tag { display:inline-block; padding:1px 6px; border-radius:20px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
  .vm-accent-tag.US { background:rgba(56,189,248,.1); color:var(--accent2); }
  .vm-accent-tag.UK { background:rgba(251,191,36,.1); color:var(--gold); }

  .vm-thumb  { width:32px; height:32px; border-radius:5px; object-fit:cover; border:1px solid var(--border); display:block; }
  .vm-no-img { width:32px; height:32px; border-radius:5px; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:12px; }
  .vm-audio  { height:22px; width:100px; filter:invert(1) hue-rotate(145deg) brightness(.8); border-radius:20px; }

  /* ── Icon buttons ── */
  .vm-actions { display:flex; gap:4px; justify-content:center; }
  .vm-icon-btn {
    width:24px; height:24px; border-radius:5px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted); font-size:11px;
    display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .vm-icon-btn:hover     { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.05); }
  .vm-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }

  /* ── Empty ── */
  .vm-empty { text-align:center; padding:48px 20px; color:var(--muted); }
  .vm-empty .em-icon { font-size:32px; margin-bottom:10px; }
  .vm-empty p { font-size:12px; }

  /* ── Skeleton ── */
  @keyframes vm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .vm-skel { display:block; border-radius:4px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:vm-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes vm-toast-in { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .vm-toast {
    position:fixed; top:18px; right:18px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent); border-radius:8px;
    padding:11px 16px; color:var(--text); font-size:12px;
    font-family:'DM Sans',sans-serif; box-shadow:0 8px 28px rgba(0,0,0,.4);
    animation:vm-toast-in .25s ease; min-width:190px;
  }
  .vm-toast.error { border-left-color:var(--danger); }

  /* ── Modal ── */
  @keyframes vm-modal-in { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .vm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }
  .vm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:540px; max-width:96vw;
    max-height:88vh; overflow-y:auto;
    animation:vm-modal-in .2s ease;
  }
  .vm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 20px; border-bottom:1px solid var(--border);
    position:sticky; top:0; background:var(--card); z-index:2;
    border-radius:14px 14px 0 0;
  }
  .vm-modal-head h3 { font-size:14px; font-weight:600; display:flex; align-items:center; gap:7px; }
  .vm-modal-close {
    background:none; border:1px solid var(--border); border-radius:6px;
    width:26px; height:26px; color:var(--muted); font-size:13px;
    cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .vm-modal-close:hover { color:var(--danger); border-color:var(--danger); }
  .vm-modal-body { padding:18px 20px; }
  .vm-modal-footer {
    padding:12px 20px; border-top:1px solid var(--border);
    display:flex; gap:8px; justify-content:flex-end;
    position:sticky; bottom:0; background:var(--card);
    border-radius:0 0 14px 14px;
  }

  /* ── Form grid ── */
  .vm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .vm-form-group { display:flex; flex-direction:column; gap:4px; }
  .vm-form-group.full { grid-column:1/-1; }
  .vm-form-label { font-size:10px; text-transform:uppercase; letter-spacing:.9px; color:var(--muted); }
  .vm-form-input {
    background:var(--surface); border:1px solid var(--border); border-radius:6px;
    padding:7px 11px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:12px; outline:none; transition:border-color .18s; width:100%;
  }
  .vm-form-input:focus { border-color:var(--accent); }
  .vm-form-input::placeholder { color:var(--muted); }
  .vm-form-section {
    font-size:10px; text-transform:uppercase; letter-spacing:1.4px;
    color:var(--muted); padding:10px 0 3px;
    border-top:1px solid var(--border); margin-top:2px;
    grid-column:1/-1;
  }
  .vm-form-section:first-child { border-top:none; padding-top:0; }

  /* ── Image in form ── */
  .vm-img-preview { width:100%; height:80px; border-radius:6px; object-fit:cover; border:1px solid var(--border); margin-top:5px; display:block; }
  .vm-img-placeholder { width:100%; height:80px; border-radius:6px; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:11px; margin-top:5px; background:var(--surface); }
  .vm-file-label { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-size:11px; cursor:pointer; transition:all .13s; margin-top:4px; }
  .vm-file-label:hover { border-color:var(--accent); color:var(--accent); }
  .vm-file-input { display:none; }

  /* ── Confirm dialog ── */
  .vm-confirm { background:var(--card); border:1px solid var(--border); border-radius:12px; width:320px; padding:22px; animation:vm-modal-in .18s ease; text-align:center; }
  .vm-confirm .ci { font-size:30px; margin-bottom:8px; }
  .vm-confirm h4 { font-size:14px; font-weight:600; margin-bottom:5px; }
  .vm-confirm p  { font-size:12px; color:var(--muted); margin-bottom:14px; line-height:1.5; }
  .vm-confirm-btns { display:flex; gap:8px; justify-content:center; }
`;

const DIFF_MAP = { 1:["easy","Easy"], 2:["medium","Medium"], 3:["hard","Hard"] };

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

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className={`vm-toast${(msg.startsWith("❌")||msg.startsWith("⚠"))?" error":""}`}>{msg}</div>;
}

function SkelRow() {
  const S = ({ w="80px" }) => <span className="vm-skel" style={{height:10,width:w,display:"block"}}/>;
  return (
    <tr>
      {[110,70,55,55,45,110,36,140,120,55,44].map((w,i) => (
        <td key={i} style={{padding:"9px 12px"}}><S w={w}/></td>
      ))}
    </tr>
  );
}

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
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.Role !== "Admin") {
      alert("🚫 Bạn không có quyền!");
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

  const filtered = vocabList.filter(v => {
    const q = search.toLowerCase();
    return (
      (!q || v.Word?.toLowerCase().includes(q) || v.Meaning?.toLowerCase().includes(q)) &&
      (filterCat    === "all" || String(v.CategoryID)      === filterCat) &&
      (filterDiff   === "all" || String(v.DifficultyLevel) === filterDiff) &&
      (filterLesson === "all" || String(v.LessonID)        === filterLesson)
    );
  });

  const handleSubmit = async () => {
    if (!form.Word.trim() || !form.Meaning.trim()) { setToast("⚠ Vui lòng nhập Word và Meaning!"); return; }
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

  const F = ({ label, children, full }) => (
    <div className={`vm-form-group${full?" full":""}`}>
      <label className="vm-form-label">{label}</label>
      {children}
    </div>
  );

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
          <input className="vm-search" placeholder="🔍 Tìm từ vựng, nghĩa…"
            value={search} onChange={e => setSearch(e.target.value)}/>
          <select className="vm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">Tất cả category</option>
            {categories.map(c => <option key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</option>)}
          </select>
          <select className="vm-select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
            <option value="all">Tất cả độ khó</option>
            <option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option>
          </select>
          <select className="vm-select" value={filterLesson} onChange={e => setFilterLesson(e.target.value)}>
            <option value="all">Tất cả lesson</option>
            {lessons.map(l => <option key={l.LessonID} value={String(l.LessonID)}>{l.LessonName}</option>)}
          </select>
          <span className="vm-count">Hiển thị <b>{filtered.length}</b> / {vocabList.length} từ</span>
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
              : filtered.length === 0
                ? (
                  <tr><td colSpan={11}>
                    <div className="vm-empty">
                      <div className="em-icon">📭</div>
                      <p>{search||filterCat!=="all"||filterDiff!=="all"
                        ? "Không tìm thấy từ vựng phù hợp"
                        : "Chưa có từ vựng nào. Hãy thêm từ đầu tiên!"}</p>
                    </div>
                  </td></tr>
                )
                : filtered.map(item => {
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
                          : <div className="vm-no-img">🖼</div>}
                      </td>
                      <td><div className="vm-trunc">{item.ExampleSentence||"—"}</div></td>
                      <td><div className="vm-trunc">{item.Translation||"—"}</div></td>
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
                    value={form.Word} onChange={e=>setForm({...form,Word:e.target.value})}/>
                </F>
                <F label="Nghĩa tiếng Việt *">
                  <input className="vm-form-input" placeholder="e.g. sự kiên trì"
                    value={form.Meaning} onChange={e=>setForm({...form,Meaning:e.target.value})}/>
                </F>
                <F label="Category">
                  <select className="vm-form-input" value={form.CategoryID}
                    onChange={e=>setForm({...form,CategoryID:parseInt(e.target.value)})}>
                    {categories.map(c=><option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
                  </select>
                </F>
                <F label="Độ khó">
                  <select className="vm-form-input" value={form.DifficultyLevel}
                    onChange={e=>setForm({...form,DifficultyLevel:parseInt(e.target.value)})}>
                    <option value={1}>Easy</option><option value={2}>Medium</option><option value={3}>Hard</option>
                  </select>
                </F>

                <div className="vm-form-section">🔊 Phát âm</div>
                <F label="IPA">
                  <input className="vm-form-input" placeholder="/ˌpɜːsɪˈvɪər.əns/"
                    value={form.IPA} onChange={e=>setForm({...form,IPA:e.target.value})}/>
                </F>
                <F label="Accent">
                  <select className="vm-form-input" value={form.Accent}
                    onChange={e=>setForm({...form,Accent:e.target.value})}>
                    <option value="">-- Chọn --</option>
                    <option value="US">US</option><option value="UK">UK</option>
                  </select>
                </F>
                <F label="Audio URL" full>
                  <input className="vm-form-input" placeholder="/uploads/audio/word.mp3"
                    value={form.AudioURL} onChange={e=>setForm({...form,AudioURL:e.target.value})}/>
                </F>

                <div className="vm-form-section">📚 Lesson & Ví dụ</div>
                <F label="Lesson (optional)" full>
                  <select className="vm-form-input" value={form.LessonID??""}
                    onChange={e=>setForm({...form,LessonID:e.target.value?parseInt(e.target.value):null})}>
                    <option value="">-- Không thuộc lesson --</option>
                    {lessons.map(l=><option key={l.LessonID} value={l.LessonID}>{l.LessonName}</option>)}
                  </select>
                </F>
                <F label="Câu ví dụ (English)" full>
                  <input className="vm-form-input" placeholder="Perseverance is the key to success."
                    value={form.ExampleSentence} onChange={e=>setForm({...form,ExampleSentence:e.target.value})}/>
                </F>
                <F label="Dịch nghĩa ví dụ" full>
                  <input className="vm-form-input" placeholder="Kiên trì là chìa khoá thành công."
                    value={form.Translation} onChange={e=>setForm({...form,Translation:e.target.value})}/>
                </F>

                <div className="vm-form-section">🖼 Hình ảnh</div>
                <F label="Upload ảnh minh hoạ" full>
                  <label className="vm-file-label">
                    📁 Chọn file ảnh
                    <input className="vm-file-input" type="file" accept="image/*" onChange={handleImageUpload}/>
                  </label>
                  {form.ImageURL
                    ? <img className="vm-img-preview" src={getFullImageURL(form.ImageURL)} alt="preview"/>
                    : <div className="vm-img-placeholder">Chưa có ảnh</div>}
                </F>
              </div>
            </div>
            <div className="vm-modal-footer">
              <button className="vm-btn ghost" onClick={()=>setShowForm(false)}>Hủy</button>
              <button className="vm-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingID ? "💾 Cập nhật" : "➕ Thêm từ mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirmDel && (
        <div className="vm-overlay" onClick={e=>{if(e.target===e.currentTarget)setConfirmDel(null);}}>
          <div className="vm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa từ vựng</h4>
            <p>Bạn sắp xóa từ <b style={{color:"var(--danger)"}}>"{confirmDel.Word}"</b>.<br/>Hành động này không thể hoàn tác.</p>
            <div className="vm-confirm-btns">
              <button className="vm-btn ghost" onClick={()=>setConfirmDel(null)}>Hủy</button>
              <button className="vm-btn danger" onClick={()=>handleDelete(confirmDel.WordID)}>🗑 Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}