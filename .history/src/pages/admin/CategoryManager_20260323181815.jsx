import { useEffect, useState } from "react";
import API from "../../services/api";

/* ─── Scoped CSS (không ảnh hưởng trang khác) ──────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .cm {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg); min-height:100%;
  }
  .cm *, .cm *::before, .cm *::after { box-sizing:border-box; margin:0; padding:0; }

  /* Header */
  .cm-hd { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; }
  .cm-hd h2 { font-family:'DM Serif Display',serif; font-size:28px; line-height:1; }
  .cm-hd h2 em { font-style:italic; color:var(--accent); }
  .cm-hd p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* Buttons */
  .cm-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .2s;
  }
  .cm-btn.pri  { background:var(--accent); color:#0d0f14; }
  .cm-btn.pri:hover  { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .cm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .cm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .cm-btn.del  { background:rgba(248,113,113,.1); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .cm-btn.del:hover  { background:rgba(248,113,113,.2); }
  .cm-btn.sm   { padding:5px 12px; font-size:12px; }
  .cm-btn:disabled { opacity:.4; cursor:not-allowed; }

  /* Search bar */
  .cm-bar { display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:20px; }
  .cm-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; width:260px; outline:none; transition:border-color .2s;
  }
  .cm-search:focus { border-color:var(--accent); }
  .cm-search::placeholder { color:var(--muted); }
  .cm-total { margin-left:auto; font-size:13px; color:var(--muted); }
  .cm-total b { color:var(--text); }

  /* Card grid */
  .cm-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(258px,1fr));
    gap:16px;
  }

  /* Category card */
  @keyframes cm-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .cm-card {
    background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:22px; display:flex; flex-direction:column; gap:14px;
    position:relative; overflow:hidden;
    transition:border-color .2s, transform .2s;
    animation:cm-up .35s ease both;
  }
  .cm-card:hover { border-color:var(--accent); transform:translateY(-2px); }
  .cm-card::after {
    content:''; position:absolute; right:-16px; bottom:-16px;
    width:72px; height:72px; border-radius:50%;
    background:rgba(110,231,183,.06); transition:background .2s;
  }
  .cm-card:hover::after { background:rgba(110,231,183,.11); }

  .cm-card-id {
    position:absolute; top:16px; right:18px;
    font-size:10px; color:var(--muted); letter-spacing:.5px;
  }
  .cm-card-icon { font-size:30px; line-height:1; }
  .cm-card-name { font-size:16px; font-weight:600; }
  .cm-card-desc { font-size:12px; color:var(--muted); line-height:1.55; }
  .cm-card-desc.empty { font-style:italic; opacity:.5; }

  .cm-card-foot {
    display:flex; gap:8px;
    padding-top:12px; border-top:1px solid var(--border);
    margin-top:auto;
  }
  .cm-card-foot .cm-btn { flex:1; justify-content:center; }

  /* Add placeholder card */
  .cm-add-card {
    background:var(--card); border:2px dashed var(--border); border-radius:14px;
    min-height:180px; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:8px;
    cursor:pointer; color:var(--muted); transition:all .2s;
    animation:cm-up .35s ease both;
  }
  .cm-add-card:hover { border-color:var(--accent); color:var(--accent); background:rgba(110,231,183,.03); }
  .cm-add-card .plus { font-size:28px; }
  .cm-add-card span  { font-size:13px; }

  /* Skeleton */
  @keyframes cm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .cm-sk { display:block; border-radius:5px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:cm-shim 1.4s infinite; }

  /* Empty */
  .cm-empty { grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--muted); }
  .cm-empty .ico { font-size:40px; margin-bottom:12px; }

  /* Toast */
  @keyframes cm-tin { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .cm-toast {
    position:fixed; top:24px; right:24px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent); border-radius:10px;
    padding:14px 20px; color:var(--text); font-size:13px;
    box-shadow:0 8px 32px rgba(0,0,0,.4);
    animation:cm-tin .3s ease; min-width:220px;
    font-family:'DM Sans',sans-serif;
  }
  .cm-toast.err { border-left-color:var(--danger); }

  /* Overlay */
  .cm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }

  /* Modal */
  @keyframes cm-min { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .cm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:16px; width:420px; max-width:95vw;
    animation:cm-min .22s ease;
  }
  .cm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 24px; border-bottom:1px solid var(--border);
  }
  .cm-modal-head h3 { font-size:16px; font-weight:600; }
  .cm-modal-x {
    width:30px; height:30px; border-radius:7px;
    border:1px solid var(--border); background:none;
    color:var(--muted); font-size:15px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s;
  }
  .cm-modal-x:hover { color:var(--danger); border-color:var(--danger); }
  .cm-modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:14px; }
  .cm-modal-foot {
    padding:16px 24px; border-top:1px solid var(--border);
    display:flex; gap:10px; justify-content:flex-end;
  }

  /* Form */
  .cm-fg { display:flex; flex-direction:column; gap:6px; }
  .cm-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .cm-input {
    background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:9px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:border-color .2s; width:100%;
    resize:vertical;
  }
  .cm-input:focus { border-color:var(--accent); }
  .cm-input::placeholder { color:var(--muted); }

  /* Live preview inside modal */
  .cm-preview {
    display:flex; align-items:center; gap:12px;
    padding:12px 16px; background:var(--surface);
    border-radius:10px; border:1px solid var(--border);
  }
  .cm-preview-icon { font-size:26px; }
  .cm-preview-name { font-weight:600; font-size:14px; }
  .cm-preview-desc { font-size:12px; color:var(--muted); margin-top:2px; }

  /* Confirm dialog */
  .cm-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:350px; max-width:95vw;
    padding:28px; text-align:center;
    animation:cm-min .2s ease;
  }
  .cm-confirm .ci { font-size:36px; margin-bottom:12px; }
  .cm-confirm h4  { font-size:16px; font-weight:600; margin-bottom:8px; }
  .cm-confirm p   { font-size:13px; color:var(--muted); margin-bottom:20px; line-height:1.6; }
  .cm-confirm-btns { display:flex; gap:10px; justify-content:center; }
`;

/* ─── Auto-detect icon từ tên category ─────────────────────── */
const ICONS = [
  ["action","⚡"],["animal","🐾"],["food","🍜"],["travel","✈️"],["du lịch","✈️"],
  ["tech","💻"],["công nghệ","💻"],["business","💼"],["kinh doanh","💼"],
  ["health","🏥"],["y tế","🏥"],["daily","🗓"],["hàng ngày","🗓"],
  ["sport","⚽"],["music","🎵"],["nature","🌿"],["science","🔬"],
  ["art","🎨"],["education","📚"],["ẩm thực","🍜"],["thể thao","⚽"],
];
const getIcon = (name = "") => {
  const n = name.toLowerCase();
  for (const [k, ic] of ICONS) if (n.includes(k)) return ic;
  return "🗂";
};

/* ─── Toast component ───────────────────────────────────────── */
function Toast({ msg, clear }) {
  useEffect(() => { const t = setTimeout(clear, 2800); return () => clearTimeout(t); }, [clear]);
  const isErr = msg.startsWith("❌") || msg.startsWith("⚠");
  return <div className={`cm-toast${isErr ? " err" : ""}`}>{msg}</div>;
}

/* ─── Skeleton card ─────────────────────────────────────────── */
function SkelCard() {
  const S = ({ h = 13, w = "100%" }) => (
    <span className="cm-sk" style={{ height: h, width: w, display: "block" }} />
  );
  return (
    <div className="cm-card" style={{ cursor: "default", gap: 12 }}>
      <S h={30} w={40} /><S h={16} w="60%" /><S h={12} /><S h={12} w="75%" />
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <S h={30} /><S h={30} />
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
function CategoryManager() {
  // ── State (giữ nguyên từ code gốc) ──
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState({ CategoryName: "", Description: "" });
  const [editingId, setEditingId]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [message, setMessage]       = useState("");

  // ── thêm để hỗ trợ UI mới (không đổi logic) ──
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null); // item cần xóa
  const [search, setSearch]         = useState("");

  // ================= Auto-hide message =================
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ================= FETCH =================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/category/");
      setCategories(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("❌ Không tải được danh sách!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.CategoryName.trim()) { setMessage("⚠ Vui lòng nhập tên Category!"); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/admin/category/${editingId}`, form);
        setMessage("✅ Cập nhật thành công!");
        setEditingId(null);
      } else {
        await API.post("/admin/category/", form);
        setMessage("➕ Thêm thành công!");
      }
      setForm({ CategoryName: "", Description: "" });
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Lỗi thao tác!");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/category/${id}`);
      setMessage("🗑 Xóa thành công!");
      fetchCategories();
    } catch (err) {
      setMessage("❌ Không xoá được (đang dùng)");
    } finally {
      setConfirmDel(null);
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditingId(item.CategoryID);
    setForm({ CategoryName: item.CategoryName, Description: item.Description || "" });
    setShowForm(true);
  };

  // ── Filter chỉ phía FE ──
  const filtered = categories.filter(c => {
    const q = search.toLowerCase();
    return !q || c.CategoryName?.toLowerCase().includes(q) || c.Description?.toLowerCase().includes(q);
  });

  // ================= RENDER =================
  return (
    <div className="cm">
      <style>{STYLES}</style>

      {/* Toast */}
      {message && <Toast msg={message} clear={() => setMessage("")} />}

      {/* Header */}
      <div className="cm-hd">
        <div>
          <h2>Quản lý <em>Categories</em></h2>
          <p>Thêm và quản lý chủ đề từ vựng trong hệ thống.</p>
        </div>
        <button className="cm-btn pri" onClick={() => {
          setForm({ CategoryName: "", Description: "" });
          setEditingId(null);
          setShowForm(true);
        }}>
          ＋ Thêm category
        </button>
      </div>

      {/* Search bar */}
      <div className="cm-bar">
        <input
          className="cm-search"
          placeholder="🔍  Tìm category, mô tả…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="cm-total">
          Hiển thị <b>{filtered.length}</b> / {categories.length} category
        </span>
      </div>

      {/* Grid */}
      <div className="cm-grid">
        {loading
          ? [1,2,3,4,5,6].map(k => <SkelCard key={k} />)
          : filtered.length === 0
            ? (
              <div className="cm-empty">
                <div className="ico">📭</div>
                <p>{search ? "Không tìm thấy category phù hợp" : "Chưa có category nào."}</p>
              </div>
            )
            : filtered.map((item, i) => (
              <div
                className="cm-card"
                key={item.CategoryID}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span className="cm-card-id">#{item.CategoryID}</span>
                <div className="cm-card-icon">{getIcon(item.CategoryName)}</div>
                <div>
                  <div className="cm-card-name">{item.CategoryName}</div>
                  <div className={`cm-card-desc${!item.Description ? " empty" : ""}`}>
                    {item.Description || "Chưa có mô tả"}
                  </div>
                </div>
                <div className="cm-card-foot">
                  <button className="cm-btn ghost sm" onClick={() => handleEdit(item)}>✏️ Sửa</button>
                  <button className="cm-btn del sm"   onClick={() => setConfirmDel(item)}>🗑 Xóa</button>
                </div>
              </div>
            ))
        }

        {/* Placeholder card thêm mới */}
        {!loading && (
          <div
            className="cm-add-card"
            style={{ animationDelay: `${filtered.length * 0.04}s` }}
            onClick={() => { setForm({ CategoryName:"", Description:"" }); setEditingId(null); setShowForm(true); }}
          >
            <div className="plus">＋</div>
            <span>Thêm category mới</span>
          </div>
        )}
      </div>

      {/* ── Modal thêm / sửa ── */}
      {showForm && (
        <div className="cm-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="cm-modal">
            <div className="cm-modal-head">
              <h3>{editingId ? "✏️ Chỉnh sửa Category" : "🗂 Thêm Category mới"}</h3>
              <button className="cm-modal-x" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="cm-modal-body">
              {/* CategoryName */}
              <div className="cm-fg">
                <label className="cm-label">Tên Category *</label>
                <input
                  className="cm-input"
                  placeholder="e.g. Ẩm thực, Du lịch, Công nghệ…"
                  value={form.CategoryName}
                  onChange={e => setForm({ ...form, CategoryName: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* Description */}
              <div className="cm-fg">
                <label className="cm-label">Mô tả</label>
                <textarea
                  className="cm-input"
                  rows={3}
                  placeholder="Mô tả ngắn về chủ đề từ vựng này…"
                  value={form.Description}
                  onChange={e => setForm({ ...form, Description: e.target.value })}
                />
              </div>

              {/* Live preview */}
              {form.CategoryName && (
                <div className="cm-preview">
                  <span className="cm-preview-icon">{getIcon(form.CategoryName)}</span>
                  <div>
                    <div className="cm-preview-name">{form.CategoryName}</div>
                    <div className="cm-preview-desc">{form.Description || "Chưa có mô tả"}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="cm-modal-foot">
              <button className="cm-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="cm-btn pri" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingId ? "💾 Cập nhật" : "➕ Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm xóa ── */}
      {confirmDel && (
        <div className="cm-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="cm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa</h4>
            <p>
              Bạn sắp xóa <b style={{ color:"var(--danger)" }}>"{confirmDel.CategoryName}"</b>.<br />
              Nếu đang được dùng bởi từ vựng, thao tác sẽ thất bại.
            </p>
            <div className="cm-confirm-btns">
              <button className="cm-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="cm-btn del"   onClick={() => handleDelete(confirmDel.CategoryID)}>🗑 Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManager;