// src/pages/admin/QuizManager.jsx
// ✅ Self-contained CSS — dữ liệu thật từ CSDL
// Options: cố định 4 A/B/C/D | Filter: chỉ search text
import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";

/* ─── Scoped CSS ────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .qm {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80; --warn:#fb923c;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg); min-height:100%;
  }
  .qm *, .qm *::before, .qm *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Header ── */
  .qm-hd { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; }
  .qm-hd h2 { font-family:'DM Serif Display',serif; font-size:28px; line-height:1; }
  .qm-hd h2 em { font-style:italic; color:var(--accent); }
  .qm-hd p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* ── Buttons ── */
  .qm-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .2s;
  }
  .qm-btn.pri   { background:var(--accent); color:#0d0f14; }
  .qm-btn.pri:hover   { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .qm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .qm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .qm-btn.del   { background:rgba(248,113,113,.1); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .qm-btn.del:hover   { background:rgba(248,113,113,.2); }
  .qm-btn:disabled { opacity:.4; cursor:not-allowed; }

  /* ── Search bar ── */
  .qm-bar { display:flex; gap:10px; align-items:center; margin-bottom:20px; }
  .qm-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; width:300px; outline:none; transition:border-color .2s;
  }
  .qm-search:focus { border-color:var(--accent); }
  .qm-search::placeholder { color:var(--muted); }
  .qm-total { margin-left:auto; font-size:13px; color:var(--muted); }
  .qm-total b { color:var(--text); }

  /* ── Card / Table ── */
  .qm-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .qm-tbl-wrap { overflow-x:auto; }
  .qm-tbl { width:100%; border-collapse:collapse; }
  .qm-tbl thead th {
    font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted);
    padding:12px 16px; text-align:left; border-bottom:1px solid var(--border);
    white-space:nowrap; background:var(--surface);
  }
  .qm-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
  .qm-tbl tbody tr:last-child { border-bottom:none; }
  .qm-tbl tbody tr:hover { background:rgba(110,231,183,.03); }
  .qm-tbl tbody td { padding:13px 16px; font-size:13px; vertical-align:middle; }

  /* ── Badges ── */
  .qm-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }
  .qm-badge.cat  { background:rgba(56,189,248,.08);  color:var(--accent2); }
  .qm-badge.word { background:rgba(110,231,183,.08); color:var(--accent); font-weight:600; }
  .qm-badge.opts { background:rgba(251,191,36,.1);   color:var(--gold); }

  /* ── Row number ── */
  .qm-num { font-family:'DM Serif Display',serif; font-size:18px; color:var(--border); }

  /* ── Actions ── */
  .qm-actions { display:flex; gap:6px; justify-content:center; }
  .qm-icon-btn {
    width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted); font-size:14px;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .qm-icon-btn:hover     { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.05); }
  .qm-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }

  /* ── Empty / Skeleton ── */
  .qm-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .qm-empty .ico { font-size:40px; margin-bottom:12px; }
  @keyframes qm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .qm-sk { display:block; border-radius:5px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:qm-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes qm-tin { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .qm-toast {
    position:fixed; top:24px; right:24px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent); border-radius:10px;
    padding:14px 20px; color:var(--text); font-size:13px;
    font-family:'DM Sans',sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,.4);
    animation:qm-tin .3s ease; min-width:220px;
  }
  .qm-toast.err { border-left-color:var(--danger); }

  /* ── Overlay ── */
  .qm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.68);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }

  /* ── Modal ── */
  @keyframes qm-min { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .qm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:16px; width:580px; max-width:96vw;
    max-height:92vh; overflow-y:auto;
    animation:qm-min .22s ease;
  }
  .qm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 26px; border-bottom:1px solid var(--border);
    position:sticky; top:0; background:var(--card); z-index:2;
    border-radius:16px 16px 0 0;
  }
  .qm-modal-head h3 { font-size:16px; font-weight:600; }
  .qm-modal-x {
    width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
    background:none; color:var(--muted); font-size:15px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .qm-modal-x:hover { color:var(--danger); border-color:var(--danger); }
  .qm-modal-body { padding:24px 26px; display:flex; flex-direction:column; gap:18px; }
  .qm-modal-foot {
    padding:16px 26px; border-top:1px solid var(--border);
    display:flex; gap:10px; justify-content:flex-end;
    position:sticky; bottom:0; background:var(--card);
    border-radius:0 0 16px 16px;
  }

  /* ── Form ── */
  .qm-fg { display:flex; flex-direction:column; gap:6px; }
  .qm-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .qm-finput {
    background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:9px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:border-color .2s; width:100%;
  }
  .qm-finput:focus { border-color:var(--accent); }
  .qm-finput::placeholder { color:var(--muted); }

  /* ── Section divider ── */
  .qm-sec {
    font-size:10px; text-transform:uppercase; letter-spacing:2px; color:var(--muted);
    padding-bottom:6px; border-bottom:1px solid var(--border);
  }

  /* ── Vocab info preview ── */
  .qm-vocab-info {
    display:flex; align-items:center; gap:10px; margin-top:6px;
    padding:10px 14px; background:var(--surface);
    border-radius:8px; border:1px solid var(--border); font-size:12px;
  }
  .qm-vocab-info b { color:var(--accent); }
  .qm-vocab-info .cat { margin-left:auto; }

  /* ── Options grid (cố định 4) ── */
  .qm-opts { display:flex; flex-direction:column; gap:10px; }
  .qm-opt-row {
    display:flex; align-items:center; gap:12px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:10px; padding:11px 14px;
    transition:border-color .2s, background .2s;
    cursor:pointer;
  }
  .qm-opt-row.correct {
    border-color:var(--accent);
    background:rgba(110,231,183,.06);
  }
  .qm-opt-row:hover:not(.correct) { border-color:var(--muted); }

  /* Label A/B/C/D */
  .qm-opt-alpha {
    width:30px; height:30px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:700; letter-spacing:.5px;
    background:var(--border); color:var(--muted);
    transition:all .2s; user-select:none;
  }
  .qm-opt-row.correct .qm-opt-alpha {
    background:var(--accent); color:#0d0f14;
  }

  /* Text input bên trong row */
  .qm-opt-text {
    flex:1; background:transparent; border:none; outline:none;
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px;
  }
  .qm-opt-text::placeholder { color:var(--muted); }

  /* Radio custom */
  .qm-radio-wrap { display:flex; align-items:center; gap:6px; flex-shrink:0; }
  .qm-radio {
    appearance:none; width:16px; height:16px; border-radius:50%;
    border:2px solid var(--border); cursor:pointer;
    transition:all .2s; background:transparent; flex-shrink:0;
  }
  .qm-opt-row.correct .qm-radio {
    background:var(--accent); border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(110,231,183,.15);
  }
  .qm-radio-label { font-size:11px; color:var(--muted); white-space:nowrap; }
  .qm-opt-row.correct .qm-radio-label { color:var(--accent); }

  /* ── Confirm dialog ── */
  .qm-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:360px; max-width:95vw;
    padding:28px; text-align:center; animation:qm-min .2s ease;
  }
  .qm-confirm .ci { font-size:36px; margin-bottom:12px; }
  .qm-confirm h4  { font-size:16px; font-weight:600; margin-bottom:8px; }
  .qm-confirm p   { font-size:13px; color:var(--muted); margin-bottom:20px; line-height:1.6; }
  .qm-confirm-btns { display:flex; gap:10px; justify-content:center; }

  /* ── Fade up ── */
  @keyframes qm-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .qm-up { animation:qm-up .35s ease both; }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
const ALPHA = ["A", "B", "C", "D"];

const defaultOptions = () => [
  { OptionText: "", IsCorrect: false },
  { OptionText: "", IsCorrect: false },
  { OptionText: "", IsCorrect: false },
  { OptionText: "", IsCorrect: false },
];

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, clear }) {
  useEffect(() => { const t = setTimeout(clear, 2800); return () => clearTimeout(t); }, [clear]);
  const isErr = msg.startsWith("❌") || msg.startsWith("⚠");
  return <div className={`qm-toast${isErr ? " err" : ""}`}>{msg}</div>;
}

/* ─── Skeleton rows ─────────────────────────────────────────── */
function SkelRow() {
  const S = ({ w = "100%" }) => (
    <span className="qm-sk" style={{ height: 13, width: w, display: "block" }} />
  );
  return (
    <tr>
      {[24, 300, 90, 100, 70, 70].map((w, i) => (
        <td key={i} style={{ padding: "16px" }}><S w={w} /></td>
      ))}
    </tr>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function QuizManager() {
  const [questions,  setQuestions]  = useState([]);
  const [vocabList,  setVocabList]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [search,     setSearch]     = useState("");

  // form
  const [form, setForm] = useState({
    WordID: "",
    QuestionText: "",
    options: defaultOptions(),
  });

  /* ── Auto-hide message ── */
  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(""), 3000); return () => clearTimeout(t); }
  }, [message]);

  /* ── Fetch questions ── */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/quiz/");
      setQuestions(res.data);
    } catch { setMessage("❌ Không tải được danh sách câu hỏi!"); }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch vocab list ── */
  const fetchVocab = useCallback(async () => {
    try {
      const res = await API.get("/admin/quiz/vocabulary");
      setVocabList(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchQuestions(); fetchVocab(); }, [fetchQuestions, fetchVocab]);

  /* ── Filter: chỉ search text ── */
  const filtered = questions.filter(q => {
    const s = search.toLowerCase();
    return !s
      || q.QuestionText?.toLowerCase().includes(s)
      || q.Word?.toLowerCase().includes(s);
  });

  /* ── Open add ── */
  const openAdd = () => {
    setEditingId(null);
    setForm({
      WordID: vocabList[0]?.WordID || "",
      QuestionText: "",
      options: defaultOptions(),
    });
    setShowForm(true);
  };

  /* ── Open edit ── */
  const handleEdit = async (item) => {
    try {
      const res = await API.get(`/admin/quiz/${item.QuestionID}`);
      const q = res.data;

      // Luôn đủ 4 options, pad nếu thiếu
      const opts = [...(q.options || [])];
      while (opts.length < 4) opts.push({ OptionText: "", IsCorrect: false });
      const normalized = opts.slice(0, 4).map(o => ({
        OptionText: o.OptionText || "",
        IsCorrect: !!o.IsCorrect,
      }));

      setEditingId(q.QuestionID);
      setForm({ WordID: q.WordID, QuestionText: q.QuestionText, options: normalized });
      setShowForm(true);
    } catch { setMessage("❌ Không tải được câu hỏi!"); }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.WordID)              { setMessage("⚠ Vui lòng chọn từ vựng!"); return; }
    if (!form.QuestionText.trim()) { setMessage("⚠ Vui lòng nhập nội dung câu hỏi!"); return; }

    const filled = form.options.filter(o => o.OptionText.trim());
    if (filled.length < 2)        { setMessage("⚠ Cần điền ít nhất 2 options!"); return; }
    if (!form.options.some(o => o.IsCorrect)) {
      setMessage("⚠ Phải chọn 1 đáp án đúng!"); return;
    }

    setSubmitting(true);
    try {
      // Chỉ gửi options có nội dung
      const payload = {
        WordID: form.WordID,
        QuestionText: form.QuestionText.trim(),
        options: form.options
          .filter(o => o.OptionText.trim())
          .map(o => ({ OptionText: o.OptionText.trim(), IsCorrect: o.IsCorrect })),
      };

      if (editingId) {
        await API.put(`/admin/quiz/${editingId}`, payload);
        setMessage("✅ Cập nhật thành công!");
      } else {
        await API.post("/admin/quiz/", payload);
        setMessage("➕ Thêm câu hỏi thành công!");
      }
      setShowForm(false);
      setEditingId(null);
      fetchQuestions();
    } catch { setMessage("❌ Lỗi khi lưu!"); }
    finally { setSubmitting(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/quiz/${id}`);
      setMessage("🗑 Xóa câu hỏi thành công!");
      fetchQuestions();
    } catch { setMessage("❌ Lỗi khi xóa!"); }
    finally { setConfirmDel(null); }
  };

  /* ── Option: chọn đáp án đúng (radio — chỉ 1) ── */
  const selectCorrect = (i) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((o, idx) => ({ ...o, IsCorrect: idx === i })),
    }));
  };

  /* ── Option: cập nhật text ── */
  const updateOptionText = (i, val) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((o, idx) => idx === i ? { ...o, OptionText: val } : o),
    }));
  };

  /* ── Vocab được chọn hiện tại ── */
  const selectedVocab = vocabList.find(v => String(v.WordID) === String(form.WordID));

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="qm">
      <style>{STYLES}</style>

      {message && <Toast msg={message} clear={() => setMessage("")} />}

      {/* Header */}
      <div className="qm-hd qm-up">
        <div>
          <h2>Quản lý <em>Quiz</em></h2>
          <p>Tạo câu hỏi và 4 đáp án A/B/C/D cho từng từ vựng.</p>
        </div>
        <button className="qm-btn pri" onClick={openAdd}>＋ Thêm câu hỏi</button>
      </div>

      {/* Search bar */}
      <div className="qm-bar qm-up" style={{ animationDelay: ".05s" }}>
        <input
          className="qm-search"
          placeholder="🔍  Tìm theo nội dung câu hỏi hoặc từ vựng…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="qm-total">
          Hiển thị <b>{filtered.length}</b> / {questions.length} câu hỏi
        </span>
      </div>

      {/* Table */}
      <div className="qm-card qm-up" style={{ animationDelay: ".1s" }}>
        <div className="qm-tbl-wrap">
          <table className="qm-tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Câu hỏi</th>
                <th>Từ vựng</th>
                <th>Category</th>
                <th>Options</th>
                <th style={{ textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(k => <SkelRow key={k} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="qm-empty">
                          <div className="ico">❓</div>
                          <p>
                            {search
                              ? "Không tìm thấy câu hỏi phù hợp"
                              : "Chưa có câu hỏi nào. Hãy tạo câu đầu tiên!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((item, i) => (
                    <tr key={item.QuestionID}>
                      <td>
                        <span className="qm-num">
                          {String(i + 1).padStart(3, "0")}
                        </span>
                      </td>
                      <td>
                        <div style={{
                          fontSize: 13, fontWeight: 500, maxWidth: 320,
                          overflow: "hidden", textOverflow: "ellipsis",
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {item.QuestionText}
                        </div>
                      </td>
                      <td>
                        <span className="qm-badge word">{item.Word || "—"}</span>
                      </td>
                      <td>
                        <span className="qm-badge cat">{item.CategoryName || "—"}</span>
                      </td>
                      <td>
                        <span className="qm-badge opts">{item.OptionCount} options</span>
                      </td>
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
      </div>

      {/* ── MODAL thêm / sửa ──────────────────────────────── */}
      {showForm && (
        <div className="qm-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="qm-modal">

            <div className="qm-modal-head">
              <h3>{editingId ? "✏️ Chỉnh sửa câu hỏi" : "❓ Tạo câu hỏi mới"}</h3>
              <button className="qm-modal-x" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="qm-modal-body">

              {/* Chọn từ vựng */}
              <div className="qm-sec">📖 Từ vựng</div>
              <div className="qm-fg">
                <label className="qm-label">Chọn từ vựng *</label>
                <select
                  className="qm-finput"
                  value={form.WordID}
                  onChange={e => setForm({ ...form, WordID: parseInt(e.target.value) })}
                >
                  <option value="">-- Chọn từ vựng --</option>
                  {vocabList.map(v => (
                    <option key={v.WordID} value={v.WordID}>
                      {v.Word} — {v.Meaning}  ({v.CategoryName})
                    </option>
                  ))}
                </select>

                {/* Vocab preview */}
                {selectedVocab && (
                  <div className="qm-vocab-info">
                    <span>📖</span>
                    <span><b>{selectedVocab.Word}</b> — {selectedVocab.Meaning}</span>
                    <span className="qm-badge cat cat">{selectedVocab.CategoryName}</span>
                  </div>
                )}
              </div>

              {/* Nội dung câu hỏi */}
              <div className="qm-sec">💬 Câu hỏi</div>
              <div className="qm-fg">
                <label className="qm-label">Nội dung câu hỏi *</label>
                <input
                  className="qm-finput"
                  placeholder='e.g. "Ambitious" có nghĩa là gì?'
                  value={form.QuestionText}
                  onChange={e => setForm({ ...form, QuestionText: e.target.value })}
                />
              </div>

              {/* 4 Options cố định A/B/C/D */}
              <div className="qm-sec">🔤 Đáp án — click vào ô để chọn đáp án đúng</div>
              <div className="qm-opts">
                {form.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`qm-opt-row${opt.IsCorrect ? " correct" : ""}`}
                    onClick={() => selectCorrect(i)}
                  >
                    {/* A / B / C / D */}
                    <div className="qm-opt-alpha">{ALPHA[i]}</div>

                    {/* Text input — stopPropagation để click input không trigger selectCorrect */}
                    <input
                      className="qm-opt-text"
                      placeholder={`Nhập đáp án ${ALPHA[i]}…`}
                      value={opt.OptionText}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateOptionText(i, e.target.value)}
                    />

                    {/* Radio + label */}
                    <div className="qm-radio-wrap" onClick={e => { e.stopPropagation(); selectCorrect(i); }}>
                      <input
                        type="radio"
                        className="qm-radio"
                        checked={opt.IsCorrect}
                        onChange={() => selectCorrect(i)}
                      />
                      <span className="qm-radio-label">{opt.IsCorrect ? "✓ Đúng" : "Đúng"}</span>
                    </div>
                  </div>
                ))}
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

      {/* ── Confirm xóa ─────────────────────────────────────── */}
      {confirmDel && (
        <div className="qm-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="qm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa câu hỏi</h4>
            <p>
              Bạn sắp xóa:<br />
              <b style={{ color: "var(--danger)" }}>"{confirmDel.QuestionText}"</b><br />
              Tất cả 4 đáp án đi kèm cũng sẽ bị xóa.
            </p>
            <div className="qm-confirm-btns">
              <button className="qm-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="qm-btn del" onClick={() => handleDelete(confirmDel.QuestionID)}>
                🗑 Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}