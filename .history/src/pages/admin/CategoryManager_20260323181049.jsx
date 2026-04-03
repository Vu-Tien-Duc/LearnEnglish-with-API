// src/pages/admin/CategoryManager.jsx
// ✅ Self-contained CSS — giữ nguyên toàn bộ luồng dữ liệu
import { useEffect, useState } from "react";
import API from "../../services/api";

/* ─── Scoped styles ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .cm-root {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80; --warn:#fb923c;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg); min-height:100%;
  }
  .cm-root *, .cm-root *::before, .cm-root *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Header ── */
  .cm-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; }
  .cm-header h2 { font-family:'DM Serif Display',serif; font-size:28px; color:var(--text); line-height:1; }
  .cm-header h2 em { font-style:italic; color:var(--accent); }
  .cm-header p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* ── Buttons ── */
  .cm-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .2s;
  }
  .cm-btn.primary { background:var(--accent); color:#0d0f14; }
  .cm-btn.primary:hover { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .cm-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .cm-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .cm-btn.danger { background:rgba(248,113,113,.12); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .cm-btn.danger:hover { background:rgba(248,113,113,.22); }
  .cm-btn:disabled { opacity:.45; cursor:not-allowed; }

  /* ── Filter / search bar ── */
  .cm-filter { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; align-items:center; }
  .cm-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; width:260px; outline:none; transition:border-color .2s;
  }
  .cm-search:focus { border-color:var(--accent); }
  .cm-search::placeholder { color:var(--muted); }
  .cm-count { font-size:13px; color:var(--muted); margin-left:auto; }
  .cm-count b { color:var(--text); }

  /* ── Card grid ── */
  .cm-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));
    gap:16px;
    margin-bottom:24px;
  }

  /* ── Category card ── */
  @keyframes cm-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .cm-cat-card {
    background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:22px; display:flex; flex-direction:column; gap:14px;
    transition:border-color .2s, transform .2s;
    animation:cm-up .35s ease both;
    position:relative; overflow:hidden;
  }
  .cm-cat-card::after {
    content:''; position:absolute; right:-16px; bottom:-16px;
    width:72px; height:72px; border-radius:50%;
    background:rgba(110,231,183,.06);
    transition:background .2s;
  }
  .cm-cat-card:hover { border-color:var(--accent); transform:translateY(-2px); }
  .cm-cat-card:hover::after { background:rgba(110,231,183,.1); }

  .cm-cat-id {
    position:absolute; top:16px; right:20px;
    font-size:10px; color:var(--muted);
    font-variant-numeric:tabular-nums;
    letter-spacing:.5px;
  }
  .cm-cat-icon { font-size:30px; line-height:1; }
  .cm-cat-body { flex:1; }
  .cm-cat-name { font-size:16px; font-weight:600; color:var(--text); margin-bottom:5px; }
  .cm-cat-desc { font-size:12px; color:var(--muted); line-height:1.5; }
  .cm-cat-desc.empty { font-style:italic; opacity:.5; }

  .cm-cat-footer {
    display:flex; gap:8px; padding-top:4px;
    border-top:1px solid var(--border);
  }
  .cm-cat-footer .cm-btn { flex:1; justify-content:center; font-size:12px; padding:6px 10px; }

  /* ── Add placeholder card ── */
  .cm-add-card {
    background:var(--card); border:2px dashed var(--border); border-radius:14px;
    min-height:180px; display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .2s;
    animation:cm-up .35s ease both;
    flex-direction:column; gap:8px; color:var(--muted);
  }
  .cm-add-card:hover { border-color:var(--accent); color:var(--accent); background:rgba(110,231,183,.03); }
  .cm-add-card .plus { font-size:30px; line-height:1; }
  .cm-add-card span { font-size:13px; }

  /* ── Toast ── */
  @keyframes cm-toast-in { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
  .cm-toast {
    position:fixed; top:24px; right:24px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent);
    border-radius:10px; padding:14px 20px;
    color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,.4);
    animation:cm-toast-in .3s ease;
    display:flex; align-items:center; gap:10px; min-width:220px;
  }
  .cm-toast.error { border-left-color:var(--danger); }

  /* ── Modal overlay ── */
  @keyframes cm-modal-in { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .cm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }
  .cm-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:16px; width:440px; max-width:95vw;
    animation:cm-modal-in .22s ease; position:relative;
  }
  .cm-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:22px 26px; border-bottom:1px solid var(--border);
    border-radius:16px 16px 0 0;
  }
  .cm-modal-head h3 { font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .cm-modal-close {
    background:none; border:1px solid var(--border); border-radius:7px;
    width:30px; height:30px; color:var(--muted); font-size:16px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:all .15s;
  }
  .cm-modal-close:hover { color:var(--danger); border-color:var(--danger); }
  .cm-modal-body { padding:24px 26px; display:flex; flex-direction:column; gap:16px; }
  .cm-modal-footer {
    padding:18px 26px; border-top:1px solid var(--border);
    display:flex; gap:10px; justify-content:flex-end;
    border-radius:0 0 16px 16px;
  }

  /* ── Form ── */
  .cm-form-group { display:flex; flex-direction:column; gap:6px; }
  .cm-form-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .cm-form-input {
    background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:10px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:border-color .2s; width:100%;
  }
  .cm-form-input:focus { border-color:var(--accent); }
  .cm-form-input::placeholder { color:var(--muted); }
  textarea.cm-form-input { resize:vertical; min-height:80px; line-height:1.6; }

  /* ── Confirm dialog ── */
  .cm-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:360px; max-width:95vw;
    padding:28px; animation:cm-modal-in .2s ease; text-align:center;
  }
  .cm-confirm .ci { font-size:36px; margin-bottom:12px; }
  .cm-confirm h4 { font-size:16px; font-weight:600; margin-bottom:8px; }
  .cm-confirm p { font-size:13px; color:var(--muted); margin-bottom:20px; line-height:1.6; }
  .cm-confirm-btns { display:flex; gap:10px; justify-content:center; }

  /* ── Skeleton ── */
  @keyframes cm-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .cm-skel { display:block; border-radius:5px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:cm-shim 1.4s infinite; }

  /* ── Empty state ── */
  .cm-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .cm-empty .em-icon { font-size:40px; margin-bottom:12px; }
  .cm-empty p { font-size:13px; }

  /* ── Fade up ── */
  .cm-up { animation:cm-up .35s ease both; }
`;

/* ─── Icon mapping (dựa theo tên category) ──────────────────── */
const ICON_MAP = {
  action: "⚡", animals: "🐾", food: "🍜", travel: "✈️",
  technology: "💻", business: "💼", health: "🏥", daily: "🗓",
  sport: "⚽", music: "🎵", nature: "🌿", science: "🔬",
  art: "🎨", education: "📚", weather: "🌤",
};
function getCatIcon(name = "") {
  const key = name.toLowerCase().trim();
  for (const [k, icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return icon;
  }
  return "🗂";
}

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const isErr = msg.startsWith("❌") || msg.startsWith("⚠");
  return <div className={`cm-toast${isErr ? " error" : ""}`}>{msg}</div>;
}

/* ─── Skeleton card ─────────────────────────────────────────── */
function SkelCard() {
  const S = ({ h = 14, w = "100%" }) => (
    <span className="cm-skel" style={{ height: h, width: w, display: "block", borderRadius: 5 }} />
  );
  return (
    <div className="cm-cat-card" style={{ gap: 12, cursor: "default" }}>
      <S h={30} w={40} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <S h={16} w="60%" />
        <S h={12} w="90%" />
        <S h={12} w="70%" />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <S h={30} /><S h={30} />
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function CategoryManager() {
  const [categories,  setCategories]  = useState([]);
  const [form,        setForm]        = useState({ CategoryName: "", Description: "" });
  const [editingId,   setEditingId]   = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null); // item to delete
  const [toast,       setToast]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [search,      setSearch]      = useState("");

  /* ── Fetch ── */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/category/");
      setCategories(res.data);
    } catch { setToast("❌ Không tải được danh sách!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  /* ── Filter ── */
  const filtered = categories.filter(c => {
    const q = search.toLowerCase();
    return !q || c.CategoryName?.toLowerCase().includes(q) || c.Description?.toLowerCase().includes(q);
  });

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.CategoryName.trim()) {
      setToast("⚠ Vui lòng nhập tên Category!");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/admin/category/${editingId}`, form);
        setToast("✅ Cập nhật thành công!");
        setEditingId(null);
      } else {
        await API.post("/admin/category/", form);
        setToast("➕ Thêm category thành công!");
      }
      setForm({ CategoryName: "", Description: "" });
      setShowForm(false);
      fetchCategories();
    } catch {
      setToast("❌ Lỗi thao tác!");
    } finally { setSubmitting(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/category/${id}`);
      setToast("🗑 Xóa thành công!");
      fetchCategories();
    } catch {
      setToast("❌ Không xóa được — Category đang được sử dụng!");
    } finally { setConfirmDel(null); }
  };

  /* ── Edit ── */
  const handleEdit = (item) => {
    setEditingId(item.CategoryID);
    setForm({ CategoryName: item.CategoryName, Description: item.Description || "" });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ CategoryName: "", Description: "" });
    setShowForm(true);
  };

  /* ── Render ── */
  return (
    <div className="cm-root">
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* Header */}
      <div className="cm-header cm-up">
        <div>
          <h2>Quản lý <em>Categories</em></h2>
          <p>Thêm và quản lý chủ đề từ vựng trong hệ thống.</p>
        </div>
        <button className="cm-btn primary" onClick={openAdd}>＋ Thêm category</button>
      </div>

      {/* Filter */}
      <div className="cm-filter cm-up" style={{ animationDelay: ".05s" }}>
        <input
          className="cm-search"
          placeholder="🔍  Tìm category, mô tả…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="cm-count">
          Hiển thị <b>{filtered.length}</b> / {categories.length} category
        </span>
      </div>

      {/* Grid */}
      <div className="cm-grid">
        {loading
          ? [1,2,3,4,5,6].map(k => <SkelCard key={k}/>)
          : filtered.length === 0 && !loading
            ? (
              <div style={{ gridColumn: "1/-1" }}>
                <div className="cm-empty">
                  <div className="em-icon">📭</div>
                  <p>{search ? "Không tìm thấy category phù hợp" : "Chưa có category nào."}</p>
                </div>
              </div>
            )
            : filtered.map((item, i) => (
              <div
                className="cm-cat-card"
                key={item.CategoryID}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span className="cm-cat-id">#{item.CategoryID}</span>
                <div className="cm-cat-icon">{getCatIcon(item.CategoryName)}</div>
                <div className="cm-cat-body">
                  <div className="cm-cat-name">{item.CategoryName}</div>
                  <div className={`cm-cat-desc${!item.Description ? " empty" : ""}`}>
                    {item.Description || "Chưa có mô tả"}
                  </div>
                </div>
                <div className="cm-cat-footer">
                  <button className="cm-btn ghost" onClick={() => handleEdit(item)}>
                    ✏️ Sửa
                  </button>
                  <button className="cm-btn danger" onClick={() => setConfirmDel(item)}>
                    🗑 Xóa
                  </button>
                </div>
              </div>
            ))
        }

        {/* Add placeholder card */}
        {!loading && (
          <div
            className="cm-add-card"
            style={{ animationDelay: `${filtered.length * 0.04}s` }}
            onClick={openAdd}
          >
            <div className="plus">＋</div>
            <span>Thêm category mới</span>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ───────────────────── */}
      {showForm && (
        <div className="cm-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="cm-modal">
            <div className="cm-modal-head">
              <h3>{editingId ? "✏️ Chỉnh sửa Category" : "🗂 Thêm Category mới"}</h3>
              <button className="cm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="cm-modal-body">
              <div className="cm-form-group">
                <label className="cm-form-label">Tên Category *</label>
                <input
                  className="cm-form-input"
                  placeholder="e.g. Ẩm thực, Du lịch, Công nghệ…"
                  value={form.CategoryName}
                  onChange={e => setForm({ ...form, CategoryName: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <div className="cm-form-group">
                <label className="cm-form-label">Mô tả</label>
                <textarea
                  className="cm-form-input"
                  placeholder="Mô tả ngắn về chủ đề từ vựng này…"
                  value={form.Description}
                  onChange={e => setForm({ ...form, Description: e.target.value })}
                />
              </div>

              {/* Preview icon */}
              {form.CategoryName && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", background: "var(--surface)",
                  borderRadius: 10, border: "1px solid var(--border)"
                }}>
                  <span style={{ fontSize: 28 }}>{getCatIcon(form.CategoryName)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{form.CategoryName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {form.Description || "Chưa có mô tả"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="cm-modal-footer">
              <button className="cm-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="cm-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingId ? "💾 Cập nhật" : "➕ Thêm category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE DIALOG ──────────────── */}
      {confirmDel && (
        <div className="cm-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="cm-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa Category</h4>
            <p>
              Bạn sắp xóa category <b style={{ color: "var(--danger)" }}>&ldquo;{confirmDel.CategoryName}&rdquo;</b>.<br />
              Nếu category đang được sử dụng bởi từ vựng, thao tác này sẽ thất bại.
            </p>
            <div className="cm-confirm-btns">
              <button className="cm-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="cm-btn danger" onClick={() => handleDelete(confirmDel.CategoryID)}>
                🗑 Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}