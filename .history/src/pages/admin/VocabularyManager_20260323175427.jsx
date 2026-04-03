// src/pages/admin/VocabularyManager.jsx
// ✅ Self-contained CSS — giữ nguyên toàn bộ luồng dữ liệu
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
    color:var(--text); background:var(--bg); min-height:100%;
  }
  .vm-root *, .vm-root *::before, .vm-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Header ── */
  .vm-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; }
  .vm-header h2 { font-family:'DM Serif Display',serif; font-size:28px; color:var(--text); line-height:1; }
  .vm-header h2 em { font-style:italic; color:var(--accent); }
  .vm-header p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* ── Buttons ── */
  .vm-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .2s;
  }
  .vm-btn.primary { background:var(--accent); color:#0d0f14; }
  .vm-btn.primary:hover { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .vm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .vm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .vm-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .vm-btn.danger:hover { background:rgba(248,113,113,.22); }
  .vm-btn.sm { padding:5px 12px; font-size:12px; }
  .vm-btn:disabled { opacity:.45; cursor:not-allowed; }

  /* ── Filter bar ── */
  .vm-filter { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; align-items:center; }
  .vm-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; width:240px; outline:none; transition:border-color .2s;
  }
  .vm-search:focus { border-color:var(--accent); }
  .vm-search::placeholder { color:var(--muted); }
  .vm-select {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; cursor:pointer; transition:border-color .2s;
  }
  .vm-select:focus { border-color:var(--accent); }
  .vm-count { font-size:13px; color:var(--muted); margin-left:auto; }
  .vm-count b { color:var(--text); }

  /* ── Card / Table wrapper ── */
  .vm-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .vm-tbl-wrap { overflow-x:auto; }
  .vm-tbl { width:100%; border-collapse:collapse; }
  .vm-tbl thead th {
    font-size:11px; text-transform:uppercase; letter-spacing:1px;
    color:var(--muted); padding:12px 16px; text-align:left;
    border-bottom:1px solid var(--border); white-space:nowrap;
    background:var(--surface);
  }
  .vm-tbl thead th:first-child { border-radius:0; }
  .vm-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
  .vm-tbl tbody tr:last-child { border-bottom:none; }
  .vm-tbl tbody tr:hover { background:rgba(110,231,183,.03); }
  .vm-tbl tbody td { padding:13px 16px; font-size:13px; color:var(--text); vertical-align:middle; }

  /* ── Word cell ── */
  .vm-word-en { font-weight:600; font-size:14px; color:var(--text); }
  .vm-word-vi { font-size:12px; color:var(--muted); margin-top:2px; }
  .vm-ipa { font-size:12px; color:var(--accent2); font-style:italic; }

  /* ── Badges ── */
  .vm-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }
  .vm-badge.easy   { background:rgba(74,222,128,.1);  color:var(--success); }
  .vm-badge.medium { background:rgba(251,191,36,.12); color:var(--gold); }
  .vm-badge.hard   { background:rgba(248,113,113,.12);color:var(--danger); }
  .vm-badge.cat    { background:rgba(56,189,248,.08); color:var(--accent2); font-size:12px; }

  /* ── Actions ── */
  .vm-actions { display:flex; gap:6px; }
  .vm-icon-btn {
    width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted);
    font-size:14px; display:flex; align-items:center; justify-content:center;
    transition:all .15s;
  }
  .vm-icon-btn:hover { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.05); }
  .vm-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }

  /* ── Image thumbnail ── */
  .vm-thumb { width:44px; height:44px; border-radius:8px; object-fit:cover; border:1px solid var(--border); display:block; }
  .vm-no-img { width:44px; height:44px; border-radius:8px; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:16px; }

  /* ── Audio ── */
  .vm-audio { height:28px; width:140px; filter:invert(1) hue-rotate(145deg) brightness(.8); border-radius:20px; }

  /* ── Accent tag ── */
  .vm-accent-tag { display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
  .vm-accent-tag.US { background:rgba(56,189,248,.1); color:var(--accent2); }
  .vm-accent-tag.UK { background:rgba(251,191,36,.1); color:var(--gold); }

  /* ── Empty state ── */
  .vm-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .vm-empty .em-icon { font-size:40px; margin-bottom:12px; }
  .vm-empty p { font-size:13px; }

  /* ── Loading rows ── */
  @keyframes vm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .vm-skel { display:block; border-radius:5px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:vm-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes vm-toast-in  { from{transform:translateX(120%) opacity:0} to{transform:translateX(0) opacity:1} }
  @keyframes vm-toast-out { from{opacity:1} to{opacity:0 transform:translateX(60%)} }
  .vm-toast {
    position:fixed; top:24px; right:24px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent);
    border-radius:10px; padding:14px 20px;
    color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,.4);
    animation:vm-toast-in .3s ease;
    display:flex; align-items:center; gap:10px; min-width:220px;
    max-width:360px;
  }
  .vm-toast.error { border-left-color:var(--danger); }

  /* ── Modal overlay ── */
  @keyframes vm-modal-in { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .vm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }
  .vm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:16px; width:580px; max-width:95vw;
    max-height:90vh; overflow-y:auto;
    animation:vm-modal-in .22s ease;
    position:relative;
  }
  .vm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:22px 26px; border-bottom:1px solid var(--border);
    position:sticky; top:0; background:var(--card); z-index:2;
    border-radius:16px 16px 0 0;
  }
  .vm-modal-head h3 { font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .vm-modal-close {
    background:none; border:1px solid var(--border); border-radius:7px;
    width:30px; height:30px; color:var(--muted); font-size:16px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:all .15s;
  }
  .vm-modal-close:hover { color:var(--danger); border-color:var(--danger); }
  .vm-modal-body { padding:24px 26px; }
  .vm-modal-footer {
    padding:18px 26px; border-top:1px solid var(--border);
    display:flex; gap:10px; justify-content:flex-end;
    position:sticky; bottom:0; background:var(--card);
    border-radius:0 0 16px 16px;
  }

  /* ── Form grid ── */
  .vm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .vm-form-group { display:flex; flex-direction:column; gap:6px; }
  .vm-form-group.full { grid-column:1/-1; }
  .vm-form-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .vm-form-input {
    background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:9px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:border-color .2s; width:100%;
  }
  .vm-form-input:focus { border-color:var(--accent); }
  .vm-form-input::placeholder { color:var(--muted); }

  /* ── Section divider inside form ── */
  .vm-form-section {
    font-size:10px; text-transform:uppercase; letter-spacing:2px;
    color:var(--muted); padding:14px 0 6px;
    border-top:1px solid var(--border); margin-top:6px;
    grid-column:1/-1;
  }

  /* ── Image preview in form ── */
  .vm-img-preview {
    width:100%; height:100px; border-radius:8px; object-fit:cover;
    border:1px solid var(--border); margin-top:8px; display:block;
  }
  .vm-img-placeholder {
    width:100%; height:100px; border-radius:8px;
    border:1px dashed var(--border);
    display:flex; align-items:center; justify-content:center;
    color:var(--muted); font-size:12px; margin-top:8px;
    background:var(--surface);
  }
  .vm-file-label {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:8px;
    border:1px solid var(--border); background:var(--surface);
    color:var(--muted); font-size:12px; cursor:pointer;
    transition:all .15s; margin-top:6px;
  }
  .vm-file-label:hover { border-color:var(--accent); color:var(--accent); }
  .vm-file-input { display:none; }

  /* ── Confirm delete dialog ── */
  .vm-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:380px; padding:28px;
    animation:vm-modal-in .2s ease; text-align:center;
  }
  .vm-confirm .ci { font-size:36px; margin-bottom:12px; }
  .vm-confirm h4 { font-size:16px; font-weight:600; margin-bottom:8px; }
  .vm-confirm p { font-size:13px; color:var(--muted); margin-bottom:20px; }
  .vm-confirm-btns { display:flex; gap:10px; justify-content:center; }

  /* ── Fade-up ── */
  @keyframes vm-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .vm-up { animation:vm-up .35s ease both; }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
const DIFF_MAP = { 1: ["easy","Easy"], 2: ["medium","Medium"], 3: ["hard","Hard"] };

function getFullAudioURL(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `http://127.0.0.1:5000${url}`;
  return `http://127.0.0.1:5000/${url}`;
}
function getFullImageURL(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://127.0.0.1:5000${url}`;
}

const EMPTY_FORM = {
  Word:"", Meaning:"", CategoryID:1, DifficultyLevel:1,
  IPA:"", AudioURL:"", Accent:"US",
  ExampleSentence:"", Translation:"", ImageURL:""
};

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return ()=>clearTimeout(t); }, [onDone]);
  const isErr = msg.startsWith("❌") || msg.startsWith("⚠");
  return <div className={`vm-toast${isErr?" error":""}`}>{msg}</div>;
}

/* ─── Skeleton rows ─────────────────────────────────────────── */
function SkelRow() {
  const S = ({ w="100%" }) => <span className="vm-skel" style={{height:13,width:w,display:"block"}}/>;
  return (
    <tr>
      {[140,100,80,60,90,150,50,160,120,60,80].map((w,i)=>(
        <td key={i} style={{padding:"16px"}}><S w={w}/></td>
      ))}
    </tr>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function VocabularyManager() {
  const [vocabList,    setVocabList]    = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [editingID,    setEditingID]    = useState(null);
  const [toast,        setToast]        = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(null); // wordID to delete
  const [submitting,   setSubmitting]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterDiff,   setFilterDiff]   = useState("all");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  /* ── Auth guard ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.Role !== "Admin") {
      alert("🚫 Bạn không có quyền!");
      window.location.href = "/login";
    }
  }, []);

  /* ── Fetch ── */
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
      if (res.data.length > 0)
        setForm(p => ({ ...p, CategoryID: res.data[0].CategoryID }));
    } catch {}
  };

  useEffect(() => { fetchCategories(); fetchData(); }, []);

  /* ── Filter logic ── */
  const filtered = vocabList.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.Word?.toLowerCase().includes(q) || v.Meaning?.toLowerCase().includes(q);
    const matchCat  = filterCat  === "all" || String(v.CategoryID) === filterCat;
    const matchDiff = filterDiff === "all" || String(v.DifficultyLevel) === filterDiff;
    return matchSearch && matchCat && matchDiff;
  });

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.Word.trim() || !form.Meaning.trim()) {
      setToast("⚠ Vui lòng nhập Word và Meaning!");
      return;
    }
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
      setShowForm(false);
      setEditingID(null);
    } catch { setToast("❌ Lỗi khi lưu dữ liệu!"); }
    finally { setSubmitting(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/vocabulary/${id}`);
      setToast("🗑 Xóa thành công!");
      fetchData();
    } catch { setToast("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  /* ── Edit ── */
  const handleEdit = (item) => {
    setEditingID(item.WordID);
    setForm({
      Word: item.Word || "",
      Meaning: item.Meaning || "",
      CategoryID: item.CategoryID || categories[0]?.CategoryID,
      DifficultyLevel: item.DifficultyLevel || 1,
      IPA: item.IPA || "",
      AudioURL: item.AudioURL || "",
      Accent: item.Accent || "US",
      ExampleSentence: item.ExampleSentence || "",
      Translation: item.Translation || "",
      ImageURL: item.ImageURL || ""
    });
    setShowForm(true);
  };

  /* ── Image upload ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await API.post("/admin/vocabulary/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(p => ({ ...p, ImageURL: res.data.url }));
      setToast("🖼 Tải ảnh thành công!");
    } catch { setToast("❌ Upload ảnh lỗi!"); }
  };

  const openAdd = () => {
    setEditingID(null);
    setForm({ ...EMPTY_FORM, CategoryID: categories[0]?.CategoryID || 1 });
    setShowForm(true);
  };

  /* ── Render ── */
  return (
    <div className="vm-root">
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* Header */}
      <div className="vm-header vm-up">
        <div>
          <h2>Quản lý <em>Vocabulary</em></h2>
          <p>Thêm, chỉnh sửa từ vựng, phát âm và ví dụ minh hoạ.</p>
        </div>
        <button className="vm-btn primary" onClick={openAdd}>＋ Thêm từ mới</button>
      </div>

      {/* Filter bar */}
      <div className="vm-filter vm-up" style={{animationDelay:".05s"}}>
        <input
          className="vm-search"
          placeholder="🔍  Tìm từ vựng, nghĩa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="vm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Tất cả category</option>
          {categories.map(c => (
            <option key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</option>
          ))}
        </select>
        <select className="vm-select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
          <option value="all">Tất cả độ khó</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>
        <span className="vm-count">
          Hiển thị <b>{filtered.length}</b> / {vocabList.length} từ
        </span>
      </div>

      {/* Table */}
      <div className="vm-card vm-up" style={{animationDelay:".1s"}}>
        <div className="vm-tbl-wrap">
          <table className="vm-tbl">
            <thead>
              <tr>
                <th>Từ vựng</th>
                <th>Category</th>
                <th>Độ khó</th>
                <th>Phát âm</th>
                <th>Accent</th>
                <th>Audio</th>
                <th>Ảnh</th>
                <th>Ví dụ</th>
                <th>Dịch ví dụ</th>
                <th style={{textAlign:"center"}}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(k => <SkelRow key={k}/>)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={10}>
                        <div className="vm-empty">
                          <div className="em-icon">📭</div>
                          <p>{search || filterCat!=="all" || filterDiff!=="all"
                            ? "Không tìm thấy từ vựng phù hợp"
                            : "Chưa có từ vựng nào. Hãy thêm từ đầu tiên!"
                          }</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((item, i) => {
                    const [diffClass, diffLabel] = DIFF_MAP[item.DifficultyLevel] || ["easy","Easy"];
                    const audioSrc = getFullAudioURL(item.AudioURL);
                    const imgSrc   = getFullImageURL(item.ImageURL);
                    return (
                      <tr key={item.WordID} style={{animationDelay:`${i*0.03}s`}}>
                        {/* Word */}
                        <td>
                          <div className="vm-word-en">{item.Word}</div>
                          <div className="vm-word-vi">{item.Meaning}</div>
                        </td>
                        {/* Category */}
                        <td>
                          <span className="vm-badge cat">{item.CategoryName || "—"}</span>
                        </td>
                        {/* Difficulty */}
                        <td>
                          <span className={`vm-badge ${diffClass}`}>{diffLabel}</span>
                        </td>
                        {/* IPA */}
                        <td>
                          <span className="vm-ipa">{item.IPA || "—"}</span>
                        </td>
                        {/* Accent */}
                        <td>
                          {item.Accent
                            ? <span className={`vm-accent-tag ${item.Accent}`}>{item.Accent}</span>
                            : <span style={{color:"var(--muted)"}}>—</span>}
                        </td>
                        {/* Audio */}
                        <td>
                          {audioSrc
                            ? <audio className="vm-audio" controls><source src={audioSrc} type="audio/mpeg"/></audio>
                            : <span style={{color:"var(--muted)",fontSize:12}}>—</span>}
                        </td>
                        {/* Image */}
                        <td>
                          {imgSrc
                            ? <img className="vm-thumb" src={imgSrc} alt={item.Word}/>
                            : <div className="vm-no-img">🖼</div>}
                        </td>
                        {/* Example */}
                        <td style={{maxWidth:180,color:"var(--muted)",fontSize:12}}>
                          <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>
                            {item.ExampleSentence || "—"}
                          </div>
                        </td>
                        {/* Translation */}
                        <td style={{maxWidth:160,color:"var(--muted)",fontSize:12}}>
                          <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>
                            {item.Translation || "—"}
                          </div>
                        </td>
                        {/* Actions */}
                        <td>
                          <div className="vm-actions" style={{justifyContent:"center"}}>
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
      </div>

      {/* ── ADD / EDIT MODAL ───────────────────── */}
      {showForm && (
        <div className="vm-overlay" onClick={e => { if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="vm-modal">
            <div className="vm-modal-head">
              <h3>{editingID ? "✏️ Chỉnh sửa từ vựng" : "📝 Thêm từ vựng mới"}</h3>
              <button className="vm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="vm-modal-body">
              <div className="vm-form-grid">

                {/* ── Basic info ── */}
                <div className="vm-form-section">📖 Thông tin cơ bản</div>

                <div className="vm-form-group">
                  <label className="vm-form-label">Từ tiếng Anh *</label>
                  <input className="vm-form-input" placeholder="e.g. perseverance"
                    value={form.Word} onChange={e => setForm({...form, Word:e.target.value})}/>
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Nghĩa tiếng Việt *</label>
                  <input className="vm-form-input" placeholder="e.g. sự kiên trì"
                    value={form.Meaning} onChange={e => setForm({...form, Meaning:e.target.value})}/>
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Category</label>
                  <select className="vm-form-input"
                    value={form.CategoryID} onChange={e => setForm({...form, CategoryID:parseInt(e.target.value)})}>
                    {categories.map(c => (
                      <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Độ khó</label>
                  <select className="vm-form-input"
                    value={form.DifficultyLevel} onChange={e => setForm({...form, DifficultyLevel:parseInt(e.target.value)})}>
                    <option value={1}>Easy</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Hard</option>
                  </select>
                </div>

                {/* ── Pronunciation ── */}
                <div className="vm-form-section">🔊 Phát âm</div>

                <div className="vm-form-group">
                  <label className="vm-form-label">IPA</label>
                  <input className="vm-form-input" placeholder="e.g. /ˌpɜːsɪˈvɪər.əns/"
                    value={form.IPA} onChange={e => setForm({...form, IPA:e.target.value})}/>
                </div>
                <div className="vm-form-group">
                  <label className="vm-form-label">Accent</label>
                  <select className="vm-form-input"
                    value={form.Accent} onChange={e => setForm({...form, Accent:e.target.value})}>
                    <option value="">-- Chọn Accent --</option>
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
                <div className="vm-form-group full">
                  <label className="vm-form-label">Audio URL</label>
                  <input className="vm-form-input" placeholder="e.g. /uploads/audio/word.mp3"
                    value={form.AudioURL} onChange={e => setForm({...form, AudioURL:e.target.value})}/>
                </div>

                {/* ── Example ── */}
                <div className="vm-form-section">💬 Ví dụ</div>

                <div className="vm-form-group full">
                  <label className="vm-form-label">Câu ví dụ (English)</label>
                  <input className="vm-form-input" placeholder="e.g. Perseverance is the key to success."
                    value={form.ExampleSentence} onChange={e => setForm({...form, ExampleSentence:e.target.value})}/>
                </div>
                <div className="vm-form-group full">
                  <label className="vm-form-label">Dịch nghĩa ví dụ</label>
                  <input className="vm-form-input" placeholder="e.g. Kiên trì là chìa khoá thành công."
                    value={form.Translation} onChange={e => setForm({...form, Translation:e.target.value})}/>
                </div>

                {/* ── Image ── */}
                <div className="vm-form-section">🖼 Hình ảnh</div>

                <div className="vm-form-group full">
                  <label className="vm-form-label">Upload ảnh minh hoạ</label>
                  <label className="vm-file-label">
                    📁 Chọn file ảnh
                    <input className="vm-file-input" type="file" accept="image/*" onChange={handleImageUpload}/>
                  </label>
                  {form.ImageURL
                    ? <img className="vm-img-preview" src={getFullImageURL(form.ImageURL)} alt="preview"/>
                    : <div className="vm-img-placeholder">Chưa có ảnh</div>
                  }
                </div>

              </div>
            </div>

            <div className="vm-modal-footer">
              <button className="vm-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="vm-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingID ? "💾 Cập nhật" : "➕ Thêm từ mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE DIALOG ──────────────── */}
      {confirmDel && (
        <div className="vm-overlay" onClick={e => { if(e.target===e.currentTarget) setConfirmDel(null); }}>
          <div className="vm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa từ vựng</h4>
            <p>Bạn sắp xóa từ <b style={{color:"var(--danger)"}}>&ldquo;{confirmDel.Word}&rdquo;</b>.<br/>Hành động này không thể hoàn tác.</p>
            <div className="vm-confirm-btns">
              <button className="vm-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="vm-btn danger" onClick={() => handleDelete(confirmDel.WordID)}>🗑 Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}