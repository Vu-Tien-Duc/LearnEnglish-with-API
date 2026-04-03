// src/pages/admin/QuizManager.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .qm {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80;
    font-family:'DM Sans',sans-serif; font-size:13px;
    color:var(--text); background:var(--bg);
    height:100%; display:flex; flex-direction:column; overflow:hidden;
  }
  .qm *, .qm *::before, .qm *::after { box-sizing:border-box; margin:0; padding:0; }

  .qm-topbar {
    flex-shrink:0; padding:14px 20px 10px;
    border-bottom:1px solid var(--border); background:var(--surface);
    display:flex; flex-direction:column; gap:10px;
  }
  .qm-topbar-row1 { display:flex; align-items:center; justify-content:space-between; }
  .qm-topbar-row1 h2 { font-family:'DM Serif Display',serif; font-size:22px; line-height:1; }
  .qm-topbar-row1 h2 em { font-style:italic; color:var(--accent); }
  .qm-topbar-row2 { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

  .qm-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:6px 14px; border-radius:7px; font-size:12px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .18s;
  }
  .qm-btn.pri  { background:var(--accent); color:#0d0f14; }
  .qm-btn.pri:hover  { filter:brightness(1.1); box-shadow:0 0 16px rgba(110,231,183,.3); }
  .qm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .qm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .qm-btn.del  { background:rgba(248,113,113,.1); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .qm-btn.del:hover  { background:rgba(248,113,113,.2); }
  .qm-btn:disabled { opacity:.4; cursor:not-allowed; }

  .qm-search {
    background:var(--card); border:1px solid var(--border); border-radius:7px;
    padding:6px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:12px; width:200px; outline:none; transition:border-color .2s;
  }
  .qm-search:focus { border-color:var(--accent); }
  .qm-search::placeholder { color:var(--muted); }
  .qm-select {
    background:var(--card); border:1px solid var(--border); border-radius:7px;
    padding:6px 10px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:12px; outline:none; cursor:pointer;
  }
  .qm-select:focus { border-color:var(--accent); }
  .qm-total { font-size:12px; color:var(--muted); margin-left:auto; }
  .qm-total b { color:var(--text); }

  .qm-table-container { flex:1; overflow:auto; min-height:0; }
  .qm-tbl { width:100%; border-collapse:collapse; font-size:25px; }
  .qm-tbl thead th {
    font-size:10px; text-transform:uppercase; letter-spacing:.8px; color:var(--muted);
    padding:9px 12px; text-align:left; border-bottom:1px solid var(--border);
    white-space:nowrap; background:var(--surface); position:sticky; top:0; z-index:2;
  }
  .qm-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .12s; }
  .qm-tbl tbody tr:last-child { border-bottom:none; }
  .qm-tbl tbody tr:hover { background:rgba(110,231,183,.03); }
  .qm-tbl tbody td { padding:9px 12px; vertical-align:middle; }

  .qm-badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:500; }
  .qm-badge.cat    { background:rgba(56,189,248,.08);  color:var(--accent2); }
  .qm-badge.word   { background:rgba(110,231,183,.08); color:var(--accent); font-weight:600; }
  .qm-badge.opts   { background:rgba(251,191,36,.1);   color:var(--gold); }
  .qm-badge.lesson { background:rgba(244,114,182,.08); color:var(--accent3); }

  .qm-q-text { font-size:12px; font-weight:500; max-width:260px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
  .qm-num { font-family:'DM Serif Display',serif; font-size:15px; color:var(--muted); }

  .qm-actions { display:flex; gap:4px; justify-content:center; }
  .qm-icon-btn {
    width:24px; height:24px; border-radius:5px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted); font-size:11px;
    display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .qm-icon-btn:hover     { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.05); }
  .qm-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }

  .qm-empty { text-align:center; padding:48px 20px; color:var(--muted); }
  .qm-empty .ico { font-size:32px; margin-bottom:10px; }
  .qm-empty p { font-size:12px; }

  @keyframes qm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .qm-sk { display:block; border-radius:4px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:qm-shim 1.4s infinite; }

  @keyframes qm-tin { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .qm-toast {
    position:fixed; top:18px; right:18px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent); border-radius:8px;
    padding:11px 16px; color:var(--text); font-size:12px;
    font-family:'DM Sans',sans-serif; box-shadow:0 8px 28px rgba(0,0,0,.4);
    animation:qm-tin .25s ease; min-width:190px;
  }
  .qm-toast.err { border-left-color:var(--danger); }

  @keyframes qm-min { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .qm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.68);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }
  .qm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:560px; max-width:96vw;
    max-height:88vh; overflow-y:auto;
    animation:qm-min .2s ease;
  }
  .qm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 20px; border-bottom:1px solid var(--border);
    position:sticky; top:0; background:var(--card); z-index:2;
    border-radius:14px 14px 0 0;
  }
  .qm-modal-head h3 { font-size:14px; font-weight:600; display:flex; align-items:center; gap:7px; }
  .qm-modal-x {
    width:26px; height:26px; border-radius:6px; border:1px solid var(--border);
    background:none; color:var(--muted); font-size:13px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all .13s;
  }
  .qm-modal-x:hover { color:var(--danger); border-color:var(--danger); }
  .qm-modal-body { padding:18px 20px; display:flex; flex-direction:column; gap:14px; }
  .qm-modal-foot {
    padding:12px 20px; border-top:1px solid var(--border);
    display:flex; gap:8px; justify-content:flex-end;
    position:sticky; bottom:0; background:var(--card);
    border-radius:0 0 14px 14px;
  }

  .qm-fg { display:flex; flex-direction:column; gap:5px; }
  .qm-fg2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .qm-label { font-size:10px; text-transform:uppercase; letter-spacing:.9px; color:var(--muted); }
  .qm-finput {
    background:var(--surface); border:1px solid var(--border); border-radius:7px;
    padding:8px 12px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:12px; outline:none; transition:border-color .18s; width:100%;
  }
  .qm-finput:focus { border-color:var(--accent); }
  .qm-finput::placeholder { color:var(--muted); }
  .qm-sec { font-size:10px; text-transform:uppercase; letter-spacing:1.4px; color:var(--muted); padding-bottom:5px; border-bottom:1px solid var(--border); }

  .qm-vocab-info {
    padding:8px 12px; background:var(--surface); border-radius:7px;
    border:1px solid var(--border); font-size:12px; color:var(--muted);
    display:flex; align-items:center; gap:8px;
  }
  .qm-vocab-info b { color:var(--accent); }

  .qm-opts { display:flex; flex-direction:column; gap:8px; }
  .qm-opt-row {
    display:flex; align-items:center; gap:8px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:8px; padding:8px 12px; transition:border-color .18s;
  }
  .qm-opt-row.correct { border-color:var(--accent); background:rgba(110,231,183,.04); }
  .qm-opt-label {
    width:22px; height:22px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700;
    background:var(--border); color:var(--muted); transition:all .18s;
  }
  .qm-opt-row.correct .qm-opt-label { background:var(--accent); color:#0d0f14; }
  .qm-opt-text {
    flex:1; background:transparent; border:none; outline:none;
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:12px;
  }
  .qm-opt-text::placeholder { color:var(--muted); }
  .qm-opt-correct-btn {
    padding:3px 9px; border-radius:20px; font-size:10px; font-weight:600;
    border:1px solid var(--border); background:transparent; cursor:pointer;
    color:var(--muted); transition:all .13s; white-space:nowrap; font-family:'DM Sans',sans-serif;
  }
  .qm-opt-correct-btn.active { background:rgba(110,231,183,.12); color:var(--accent); border-color:var(--accent); }
  .qm-opt-del-btn {
    width:22px; height:22px; border-radius:5px; border:1px solid var(--border);
    background:transparent; color:var(--muted); cursor:pointer; font-size:11px;
    display:flex; align-items:center; justify-content:center; transition:all .13s; flex-shrink:0;
  }
  .qm-opt-del-btn:hover { color:var(--danger); border-color:var(--danger); }
  .qm-add-opt {
    display:flex; align-items:center; gap:7px; padding:8px 12px; border-radius:8px;
    border:1px dashed var(--border); background:transparent;
    color:var(--muted); font-size:12px; cursor:pointer;
    transition:all .13s; font-family:'DM Sans',sans-serif; width:100%;
  }
  .qm-add-opt:hover { border-color:var(--accent); color:var(--accent); }

  .qm-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:12px; width:320px; max-width:95vw;
    padding:22px; text-align:center; animation:qm-min .18s ease;
  }
  .qm-confirm .ci { font-size:30px; margin-bottom:8px; }
  .qm-confirm h4  { font-size:14px; font-weight:600; margin-bottom:5px; }
  .qm-confirm p   { font-size:12px; color:var(--muted); margin-bottom:14px; line-height:1.5; }
  .qm-confirm-btns { display:flex; gap:8px; justify-content:center; }
`;

const ALPHA = ["A","B","C","D","E","F"];
const emptyOption = () => ({ OptionText:"", IsCorrect:false });

function Toast({ msg, clear }) {
  useEffect(() => { const t = setTimeout(clear, 2800); return () => clearTimeout(t); }, [clear]);
  return <div className={`qm-toast${(msg.startsWith("❌")||msg.startsWith("⚠"))?" err":""}`}>{msg}</div>;
}

function SkelRow() {
  const S = ({ w="80px" }) => <span className="qm-sk" style={{height:10,width:w,display:"block"}}/>;
  return (
    <tr>
      {[28,240,80,90,80,65,44].map((w,i) => (
        <td key={i} style={{padding:"10px 12px"}}><S w={w}/></td>
      ))}
    </tr>
  );
}

export default function QuizManager() {
  const [questions,   setQuestions]   = useState([]);
  const [vocabList,   setVocabList]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [lessons,     setLessons]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [message,     setMessage]     = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);

  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterWord,   setFilterWord]   = useState("all");
  const [filterLesson, setFilterLesson] = useState("all");

  const [form, setForm] = useState({
    WordID:"", LessonID:null, QuestionText:"",
    options:[emptyOption(), emptyOption(), emptyOption(), emptyOption()],
  });

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(""), 3000); return () => clearTimeout(t); }
  }, [message]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/quiz/");
      setQuestions(res.data);
    } catch { setMessage("❌ Không tải được danh sách câu hỏi!"); }
    finally { setLoading(false); }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const [v, c, l] = await Promise.all([
        API.get("/admin/quiz/vocabulary"),
        API.get("/admin/quiz/categories"),
        API.get("/admin/quiz/lessons"),
      ]);
      setVocabList(v.data); setCategories(c.data); setLessons(l.data);
    } catch {}
  }, []);

  useEffect(() => { fetchQuestions(); fetchMeta(); }, [fetchQuestions, fetchMeta]);

  const filtered = questions.filter(q => {
    const s = search.toLowerCase();
    return (
      (!s || q.QuestionText?.toLowerCase().includes(s) || q.Word?.toLowerCase().includes(s)) &&
      (filterCat    === "all" || String(q.CategoryID) === filterCat) &&
      (filterWord   === "all" || String(q.WordID)     === filterWord) &&
      (filterLesson === "all" || String(q.LessonID)   === filterLesson)
    );
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ WordID: vocabList[0]?.WordID||"", LessonID:null, QuestionText:"",
      options:[emptyOption(),emptyOption(),emptyOption(),emptyOption()] });
    setShowForm(true);
  };

  const handleEdit = async (item) => {
    try {
      const res = await API.get(`/admin/quiz/${item.QuestionID}`);
      const q = res.data;
      setEditingId(q.QuestionID);
      setForm({
        WordID: q.WordID, LessonID: q.LessonID||null,
        QuestionText: q.QuestionText,
        options: q.options.length > 0
          ? q.options.map(o => ({ OptionText:o.OptionText, IsCorrect:!!o.IsCorrect }))
          : [emptyOption(),emptyOption(),emptyOption(),emptyOption()],
      });
      setShowForm(true);
    } catch { setMessage("❌ Không tải được câu hỏi!"); }
  };

  const handleSubmit = async () => {
    if (!form.WordID)              { setMessage("⚠ Vui lòng chọn từ vựng!"); return; }
    if (!form.QuestionText.trim()) { setMessage("⚠ Vui lòng nhập nội dung câu hỏi!"); return; }
    const validOpts = form.options.filter(o => o.OptionText.trim());
    if (validOpts.length < 2)               { setMessage("⚠ Cần ít nhất 2 options!"); return; }
    if (!validOpts.some(o => o.IsCorrect))  { setMessage("⚠ Phải chọn ít nhất 1 đáp án đúng!"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, options: validOpts };
      if (editingId) {
        await API.put(`/admin/quiz/${editingId}`, payload);
        setMessage("✅ Cập nhật câu hỏi thành công!");
      } else {
        await API.post("/admin/quiz/", payload);
        setMessage("➕ Thêm câu hỏi thành công!");
      }
      setShowForm(false); setEditingId(null); fetchQuestions();
    } catch { setMessage("❌ Lỗi khi lưu!"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/quiz/${id}`);
      setMessage("🗑 Xóa câu hỏi thành công!");
      fetchQuestions();
    } catch { setMessage("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  const updateOption = (i, field, value) => {
    setForm({ ...form, options: form.options.map((o, idx) => {
      if (field === "IsCorrect") return { ...o, IsCorrect: idx === i };
      return idx === i ? { ...o, [field]: value } : o;
    })});
  };
  const addOption    = () => form.options.length < 6 && setForm({ ...form, options:[...form.options, emptyOption()] });
  const removeOption = (i) => form.options.length > 2 && setForm({ ...form, options:form.options.filter((_,idx)=>idx!==i) });

  const selectedVocab = vocabList.find(v => String(v.WordID) === String(form.WordID));

  return (
    <div className="qm">
      <style>{STYLES}</style>

      {message && <Toast msg={message} clear={() => setMessage("")} />}

      <div className="qm-topbar">
        <div className="qm-topbar-row1">
          <h2>Quiz <em>Manager</em></h2>
          <button className="qm-btn pri" onClick={openAdd}>＋ Thêm câu hỏi</button>
        </div>
        <div className="qm-topbar-row2">
          <input className="qm-search" placeholder="🔍 Tìm câu hỏi, từ vựng…"
            value={search} onChange={e => setSearch(e.target.value)}/>
          <select className="qm-select" value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setFilterWord("all"); }}>
            <option value="all">Tất cả category</option>
            {categories.map(c => <option key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</option>)}
          </select>
          <select className="qm-select" value={filterWord} onChange={e => setFilterWord(e.target.value)}>
            <option value="all">Tất cả từ vựng</option>
            {(filterCat==="all" ? vocabList : vocabList.filter(v => String(v.CategoryID)===filterCat))
              .map(v => <option key={v.WordID} value={String(v.WordID)}>{v.Word}</option>)}
          </select>
          <select className="qm-select" value={filterLesson} onChange={e => setFilterLesson(e.target.value)}>
            <option value="all">Tất cả lesson</option>
            {lessons.map(l => <option key={l.LessonID} value={String(l.LessonID)}>{l.LessonName}</option>)}
          </select>
          <span className="qm-total">Hiển thị <b>{filtered.length}</b> / {questions.length} câu hỏi</span>
        </div>
      </div>

      <div className="qm-table-container">
        <table className="qm-tbl">
          <thead>
            <tr>
              <th>#</th><th>Câu hỏi</th><th>Từ vựng</th>
              <th>Category</th><th>Lesson</th><th>Options</th>
              <th style={{textAlign:"center"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3,4,5,6].map(k => <SkelRow key={k}/>)
              : filtered.length === 0
                ? (
                  <tr><td colSpan={7}>
                    <div className="qm-empty">
                      <div className="ico">❓</div>
                      <p>{search||filterCat!=="all"||filterWord!=="all"
                        ? "Không tìm thấy câu hỏi phù hợp"
                        : "Chưa có câu hỏi nào. Hãy tạo câu đầu tiên!"}</p>
                    </div>
                  </td></tr>
                )
                : filtered.map((item, i) => (
                  <tr key={item.QuestionID}>
                    <td><span className="qm-num">{String(i+1).padStart(3,"0")}</span></td>
                    <td><div className="qm-q-text">{item.QuestionText}</div></td>
                    <td><span className="qm-badge word">{item.Word||"—"}</span></td>
                    <td><span className="qm-badge cat">{item.CategoryName||"—"}</span></td>
                    <td>
                      {item.LessonName
                        ? <span className="qm-badge lesson">{item.LessonName}</span>
                        : <span style={{color:"var(--muted)"}}>—</span>}
                    </td>
                    <td><span className="qm-badge opts">{item.OptionCount} opts</span></td>
                    <td>
                      <div className="qm-actions">
                        <button className="qm-icon-btn" title="Chỉnh sửa" onClick={() => handleEdit(item)}>✏️</button>
                        <button className="qm-icon-btn del" title="Xóa" onClick={() => setConfirmDel(item)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="qm-overlay" onClick={e => { if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="qm-modal">
            <div className="qm-modal-head">
              <h3>{editingId ? "✏️ Chỉnh sửa câu hỏi" : "❓ Tạo câu hỏi mới"}</h3>
              <button className="qm-modal-x" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="qm-modal-body">
              <div className="qm-sec">📖 Từ vựng &amp; Lesson</div>
              <div className="qm-fg2">
                <div className="qm-fg">
                  <label className="qm-label">Chọn từ vựng *</label>
                  <select className="qm-finput" value={form.WordID}
                    onChange={e => setForm({...form, WordID:parseInt(e.target.value)})}>
                    <option value="">-- Chọn từ vựng --</option>
                    {vocabList.map(v => <option key={v.WordID} value={v.WordID}>{v.Word} — {v.Meaning}</option>)}
                  </select>
                </div>
                <div className="qm-fg">
                  <label className="qm-label">Lesson (optional)</label>
                  <select className="qm-finput" value={form.LessonID??""}
                    onChange={e => setForm({...form, LessonID:e.target.value?parseInt(e.target.value):null})}>
                    <option value="">-- Không thuộc lesson --</option>
                    {lessons.map(l => <option key={l.LessonID} value={l.LessonID}>{l.LessonName}</option>)}
                  </select>
                </div>
              </div>
              {selectedVocab && (
                <div className="qm-vocab-info">
                  <span>📖</span>
                  <span><b>{selectedVocab.Word}</b> — {selectedVocab.Meaning}</span>
                  <span className="qm-badge cat" style={{marginLeft:"auto"}}>{selectedVocab.CategoryName}</span>
                </div>
              )}
              <div className="qm-sec">💬 Câu hỏi</div>
              <div className="qm-fg">
                <label className="qm-label">Nội dung câu hỏi *</label>
                <input className="qm-finput" placeholder='"Ambitious" có nghĩa là gì?'
                  value={form.QuestionText} onChange={e => setForm({...form,QuestionText:e.target.value})}/>
              </div>
              <div className="qm-sec">🔤 Đáp án — click "Đúng" để đánh dấu đáp án đúng</div>
              <div className="qm-opts">
                {form.options.map((opt, i) => (
                  <div key={i} className={`qm-opt-row${opt.IsCorrect?" correct":""}`}>
                    <div className="qm-opt-label">{ALPHA[i]}</div>
                    <input className="qm-opt-text" placeholder={`Option ${ALPHA[i]}…`}
                      value={opt.OptionText} onChange={e => updateOption(i,"OptionText",e.target.value)}/>
                    <button className={`qm-opt-correct-btn${opt.IsCorrect?" active":""}`}
                      onClick={() => updateOption(i,"IsCorrect",true)} type="button">
                      {opt.IsCorrect ? "✓ Đúng" : "Đúng"}
                    </button>
                    {form.options.length > 2 && (
                      <button className="qm-opt-del-btn" onClick={() => removeOption(i)} type="button">✕</button>
                    )}
                  </div>
                ))}
                {form.options.length < 6 && (
                  <button className="qm-add-opt" onClick={addOption} type="button">＋ Thêm option</button>
                )}
              </div>
            </div>
            <div className="qm-modal-foot">
              <button className="qm-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="qm-btn pri" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingId ? "💾 Cập nhật" : "➕ Tạo câu hỏi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="qm-overlay" onClick={e => { if(e.target===e.currentTarget) setConfirmDel(null); }}>
          <div className="qm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa câu hỏi</h4>
            <p>Bạn sắp xóa:<br/><b style={{color:"var(--danger)"}}>"{confirmDel.QuestionText}"</b><br/>Tất cả options đi kèm cũng sẽ bị xóa.</p>
            <div className="qm-confirm-btns">
              <button className="qm-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="qm-btn del" onClick={() => handleDelete(confirmDel.QuestionID)}>🗑 Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}