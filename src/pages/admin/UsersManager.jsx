import { useState, useEffect, useCallback } from "react";

const BASE = "http://localhost:5000/api/admin/users";

/* ─── Scoped CSS ────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .um {
    --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
    --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
    --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
    --danger:#f87171; --success:#4ade80; --warn:#fb923c;
    font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); background:var(--bg); min-height:100%;
  }
  .um *, .um *::before, .um *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Header ── */
  .um-hd { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; }
  .um-hd h2 { font-family:'DM Serif Display',serif; font-size:28px; line-height:1; }
  .um-hd h2 em { font-style:italic; color:var(--accent); }
  .um-hd p { color:var(--muted); margin-top:6px; font-size:13px; }

  /* ── Buttons ── */
  .um-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    cursor:pointer; border:none; transition:all .2s;
  }
  .um-btn.pri   { background:var(--accent); color:#0d0f14; }
  .um-btn.pri:hover   { filter:brightness(1.1); box-shadow:0 0 20px rgba(110,231,183,.3); }
  .um-btn.ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .um-btn.ghost:hover { color:var(--text); border-color:var(--muted); }
  .um-btn.del   { background:rgba(248,113,113,.1); color:var(--danger); border:1px solid rgba(248,113,113,.2); }
  .um-btn.del:hover   { background:rgba(248,113,113,.2); }
  .um-btn.pg    { background:var(--card); color:var(--muted); border:1px solid var(--border); padding:6px 14px; }
  .um-btn.pg:hover:not(:disabled) { color:var(--text); border-color:var(--accent); }
  .um-btn:disabled { opacity:.35; cursor:not-allowed; }

  /* ── Filter bar ── */
  .um-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:20px; }
  .um-search {
    background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:8px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; width:260px; outline:none; transition:border-color .2s;
  }
  .um-search:focus { border-color:var(--accent); }
  .um-search::placeholder { color:var(--muted); }
  .um-total { margin-left:auto; font-size:13px; color:var(--muted); }
  .um-total b { color:var(--text); }

  /* ── Filter chips ── */
  .um-chips { display:flex; gap:6px; }
  .um-chip {
    padding:5px 14px; border-radius:20px; font-size:12px;
    border:1px solid var(--border); background:transparent;
    color:var(--muted); cursor:pointer; transition:all .15s;
    font-family:'DM Sans',sans-serif;
  }
  .um-chip:hover { color:var(--text); border-color:var(--muted); }
  .um-chip.active { background:rgba(110,231,183,.1); border-color:var(--accent); color:var(--accent); }

  /* ── Card / Table ── */
  .um-card { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .um-tbl-wrap { overflow-x:auto; }
  .um-tbl { width:100%; border-collapse:collapse; }
  .um-tbl thead th {
    font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted);
    padding:12px 16px; text-align:left; border-bottom:1px solid var(--border);
    white-space:nowrap; background:var(--surface);
  }
  .um-tbl tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
  .um-tbl tbody tr:last-child { border-bottom:none; }
  .um-tbl tbody tr:hover { background:rgba(110,231,183,.03); }
  .um-tbl tbody td { padding:13px 16px; font-size:13px; vertical-align:middle; }

  /* ── Avatar + user cell ── */
  .um-user-cell { display:flex; align-items:center; gap:10px; }
  .um-avatar {
    width:32px; height:32px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; color:#0d0f14;
  }
  .um-uname { font-weight:500; font-size:13px; }
  .um-email { font-size:11px; color:var(--muted); margin-top:1px; }

  /* ── Badges ── */
  .um-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }
  .um-badge.admin { background:rgba(251,191,36,.12); color:var(--gold); }
  .um-badge.user  { background:rgba(56,189,248,.1);  color:var(--accent2); }

  /* ── Progress bar ── */
  .um-prog-wrap { display:flex; align-items:center; gap:8px; }
  .um-prog-track { width:80px; height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
  .um-prog-fill  { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--accent2),var(--accent)); }
  .um-prog-pct   { font-size:11px; color:var(--muted); width:32px; }

  /* ── Score pill ── */
  .um-score {
    display:inline-flex; align-items:center; gap:4px;
    font-size:12px; font-weight:600;
    padding:3px 10px; border-radius:20px;
  }
  .um-score.high { background:rgba(74,222,128,.1);  color:var(--success); }
  .um-score.mid  { background:rgba(251,191,36,.12); color:var(--gold); }
  .um-score.low  { background:rgba(248,113,113,.12);color:var(--danger); }
  .um-score.none { background:rgba(100,116,139,.1); color:var(--muted); }

  /* ── Actions ── */
  .um-actions { display:flex; gap:6px; justify-content:center; }
  .um-icon-btn {
    width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
    background:transparent; cursor:pointer; color:var(--muted); font-size:14px;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .um-icon-btn:hover     { color:var(--text); border-color:var(--accent); background:rgba(110,231,183,.05); }
  .um-icon-btn.del:hover { color:var(--danger); border-color:var(--danger); background:rgba(248,113,113,.06); }

  /* ── Pagination ── */
  .um-page { display:flex; align-items:center; justify-content:center; gap:12px; padding:18px; border-top:1px solid var(--border); }
  .um-page-info { font-size:13px; color:var(--muted); }
  .um-page-info b { color:var(--text); }

  /* ── Empty / Skeleton ── */
  .um-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .um-empty .ico { font-size:40px; margin-bottom:12px; }
  @keyframes um-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .um-sk { display:block; border-radius:5px; background:linear-gradient(90deg,#1a1f2e 25%,#222838 50%,#1a1f2e 75%); background-size:200% 100%; animation:um-shim 1.4s infinite; }

  /* ── Toast ── */
  @keyframes um-tin { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
  .um-toast {
    position:fixed; top:24px; right:24px; z-index:9999;
    background:var(--card); border:1px solid var(--border);
    border-left:3px solid var(--accent); border-radius:10px;
    padding:14px 20px; color:var(--text); font-size:13px;
    font-family:'DM Sans',sans-serif; box-shadow:0 8px 32px rgba(0,0,0,.4);
    animation:um-tin .3s ease; min-width:220px;
  }
  .um-toast.err { border-left-color:var(--danger); }

  /* ── Overlay ── */
  .um-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.68);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; backdrop-filter:blur(4px);
  }

  /* ── Modal ── */
  @keyframes um-min { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .um-modal {
    background:var(--card); border:1px solid var(--border);
    border-radius:16px; width:500px; max-width:96vw;
    animation:um-min .22s ease;
  }
  .um-modal-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 26px; border-bottom:1px solid var(--border);
    border-radius:16px 16px 0 0;
  }
  .um-modal-head h3 { font-size:16px; font-weight:600; }
  .um-modal-x {
    width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
    background:none; color:var(--muted); font-size:15px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .um-modal-x:hover { color:var(--danger); border-color:var(--danger); }
  .um-modal-body { padding:24px 26px; display:flex; flex-direction:column; gap:16px; }
  .um-modal-foot {
    padding:16px 26px; border-top:1px solid var(--border);
    display:flex; gap:10px; justify-content:flex-end;
    border-radius:0 0 16px 16px;
  }

  /* ── Form ── */
  .um-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .um-fg { display:flex; flex-direction:column; gap:6px; }
  .um-fg.full { grid-column:1/-1; }
  .um-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .um-finput {
    background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:9px 14px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:border-color .2s; width:100%;
  }
  .um-finput:focus { border-color:var(--accent); }
  .um-finput::placeholder { color:var(--muted); }
  .um-hint { font-size:11px; color:var(--muted); margin-top:4px; }

  /* ── Confirm ── */
  .um-confirm {
    background:var(--card); border:1px solid var(--border);
    border-radius:14px; width:360px; max-width:95vw;
    padding:28px; text-align:center; animation:um-min .2s ease;
  }
  .um-confirm .ci { font-size:36px; margin-bottom:12px; }
  .um-confirm h4  { font-size:16px; font-weight:600; margin-bottom:8px; }
  .um-confirm p   { font-size:13px; color:var(--muted); margin-bottom:20px; line-height:1.6; }
  .um-confirm-btns { display:flex; gap:10px; justify-content:center; }

  /* ── Fade up ── */
  @keyframes um-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .um-up { animation:um-up .35s ease both; }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
const GRADS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#a78bfa,#38bdf8)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#fb923c,#fbbf24)",
];
const avatarGrad = (name = "") => GRADS[name.charCodeAt(0) % GRADS.length];

// Score pill: màu theo điểm
function ScorePill({ score }) {
  if (score === 0) return <span className="um-score none">—</span>;
  const cls = score >= 80 ? "high" : score >= 60 ? "mid" : "low";
  return <span className={`um-score ${cls}`}>{score}%</span>;
}

const EMPTY_FORM = { Username: "", Email: "", Role: "User", PasswordHash: "" };

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, clear }) {
  useEffect(() => { const t = setTimeout(clear, 2800); return () => clearTimeout(t); }, [clear]);
  const isErr = msg.startsWith("❌") || msg.startsWith("⚠");
  return <div className={`um-toast${isErr ? " err" : ""}`}>{msg}</div>;
}

/* ─── Skeleton rows ─────────────────────────────────────────── */
function SkelRow() {
  const S = ({ w = "100%" }) => (
    <span className="um-sk" style={{ height: 13, width: w, display: "block" }} />
  );
  return (
    <tr>
      {[200, 70, 90, 110, 70, 70].map((w, i) => (
        <td key={i} style={{ padding: "16px" }}><S w={w} /></td>
      ))}
    </tr>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function UsersManager() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });

  /* ── Auto-hide message ── */
  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(""), 3000); return () => clearTimeout(t); }
  }, [message]);

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 10, q: search,
        ...(roleFilter ? { role: roleFilter } : {}),
      });
      const res  = await fetch(`${BASE}/?${params}`);
      const data = await res.json();
      setUsers(data.data ?? []);
      setTotalPages(data.total_pages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setMessage("❌ Không tải được danh sách users!");
      setUsers([]);
    } finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Reset page khi đổi filter ── */
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  /* ── Open add ── */
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  /* ── Open edit ── */
  const handleEdit = async (user) => {
    try {
      const res  = await fetch(`${BASE}/${user.UserID}`);
      const data = await res.json();
      setEditingId(data.UserID);
      setForm({ Username: data.Username, Email: data.Email || "", Role: data.Role, PasswordHash: "" });
      setShowForm(true);
    } catch { setMessage("❌ Không tải được thông tin user!"); }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.Username.trim())            { setMessage("⚠ Vui lòng nhập Username!"); return; }
    if (!editingId && !form.PasswordHash) { setMessage("⚠ Vui lòng nhập Password!"); return; }

    setSubmitting(true);
    try {
      const opts = {
        method:  editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      };
      const url  = editingId ? `${BASE}/${editingId}` : `${BASE}/`;
      const res  = await fetch(url, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi server");

      setMessage(editingId ? "✅ Cập nhật thành công!" : "➕ Tạo user thành công!");
      setShowForm(false);
      setEditingId(null);
      fetchUsers();
    } catch (e) { setMessage(`❌ ${e.message}`); }
    finally { setSubmitting(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi server");
      setMessage("🗑 Xóa user thành công!");
      fetchUsers();
    } catch (e) { setMessage(`❌ ${e.message}`); }
    finally { setConfirmDel(null); }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="um">
      <style>{STYLES}</style>

      {message && <Toast msg={message} clear={() => setMessage("")} />}

      {/* Header */}
      <div className="um-hd um-up">
        <div>
          <h2>Quản lý <em>Users</em></h2>
          <p>Xem, chỉnh sửa và quản lý tài khoản người dùng.</p>
        </div>
        <button className="um-btn pri" onClick={openAdd}>＋ Tạo user</button>
      </div>

      {/* Filter bar */}
      <div className="um-bar um-up" style={{ animationDelay: ".05s" }}>
        <input
          className="um-search"
          placeholder="🔍  Tìm username, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="um-chips">
          {["", "User", "Admin"].map(r => (
            <button
              key={r}
              className={`um-chip${roleFilter === r ? " active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "" ? "Tất cả" : r}
            </button>
          ))}
        </div>
        <span className="um-total"><b>{total}</b> users</span>
      </div>

      {/* Table */}
      <div className="um-card um-up" style={{ animationDelay: ".1s" }}>
        <div className="um-tbl-wrap">
          <table className="um-tbl">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Tiến độ</th>
                <th>Quiz TB</th>
                <th style={{ textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(k => <SkelRow key={k} />)
                : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="um-empty">
                          <div className="ico">👤</div>
                          <p>{search ? "Không tìm thấy user phù hợp" : "Chưa có user nào."}</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : users.map(u => (
                    <tr key={u.UserID}>
                      {/* Avatar + name */}
                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar" style={{ background: avatarGrad(u.Username) }}>
                            {u.Username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="um-uname">{u.Username}</div>
                            <div className="um-email">{u.Email || "—"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`um-badge ${u.Role === "Admin" ? "admin" : "user"}`}>
                          {u.Role}
                        </span>
                      </td>

                      {/* Ngày tạo */}
                      <td style={{ color: "var(--muted)", fontSize: 12 }}>
                        {u.CreatedDate}
                      </td>

                      {/* Tiến độ — Mastered / tổng từ hệ thống */}
                      <td>
                        <div className="um-prog-wrap">
                          <div className="um-prog-track">
                            <div className="um-prog-fill" style={{ width: `${u.Progress ?? 0}%` }} />
                          </div>
                          <span className="um-prog-pct">{u.Progress ?? 0}%</span>
                        </div>
                      </td>

                      {/* Quiz TB */}
                      <td>
                        <ScorePill score={u.AverageScore ?? 0} />
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="um-actions">
                          <button className="um-icon-btn" title="Chỉnh sửa" onClick={() => handleEdit(u)}>✏️</button>
                          <button className="um-icon-btn del" title="Xóa" onClick={() => setConfirmDel(u)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="um-page">
            <button className="um-btn pg" onClick={() => setPage(p => Math.max(p-1,1))} disabled={page <= 1}>
              ← Prev
            </button>
            <span className="um-page-info">Trang <b>{page}</b> / <b>{totalPages}</b></span>
            <button className="um-btn pg" onClick={() => setPage(p => Math.min(p+1,totalPages))} disabled={page >= totalPages}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Modal thêm / sửa ──────────────────────────────── */}
      {showForm && (
        <div className="um-overlay" onClick={e => { if (e.target===e.currentTarget) setShowForm(false); }}>
          <div className="um-modal">
            <div className="um-modal-head">
              <h3>{editingId ? "✏️ Chỉnh sửa User" : "👤 Tạo User mới"}</h3>
              <button className="um-modal-x" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="um-modal-body">
              <div className="um-form-grid">
                <div className="um-fg">
                  <label className="um-label">Username *</label>
                  <input className="um-finput" placeholder="e.g. nguyen_van_a"
                    value={form.Username}
                    onChange={e => setForm({ ...form, Username: e.target.value })} />
                </div>
                <div className="um-fg">
                  <label className="um-label">Email</label>
                  <input className="um-finput" placeholder="e.g. user@gmail.com"
                    value={form.Email}
                    onChange={e => setForm({ ...form, Email: e.target.value })} />
                </div>
                <div className="um-fg">
                  <label className="um-label">Role</label>
                  <select className="um-finput" value={form.Role}
                    onChange={e => setForm({ ...form, Role: e.target.value })}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="um-fg">
                  <label className="um-label">
                    {editingId ? "Mật khẩu mới (để trống = giữ nguyên)" : "Mật khẩu *"}
                  </label>
                  <input className="um-finput" type="password"
                    placeholder={editingId ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                    value={form.PasswordHash}
                    onChange={e => setForm({ ...form, PasswordHash: e.target.value })} />
                  {editingId && <span className="um-hint">Chỉ điền nếu muốn đặt lại mật khẩu</span>}
                </div>
              </div>
            </div>
            <div className="um-modal-foot">
              <button className="um-btn ghost" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="um-btn pri" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "⟳ Đang lưu…" : editingId ? "💾 Cập nhật" : "➕ Tạo user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm xóa ─────────────────────────────────────── */}
      {confirmDel && (
        <div className="um-overlay" onClick={e => { if (e.target===e.currentTarget) setConfirmDel(null); }}>
          <div className="um-confirm">
            <div className="ci">🗑</div>
            <h4>Xác nhận xóa User</h4>
            <p>
              Bạn sắp xóa user <b style={{ color:"var(--danger)" }}>"{confirmDel.Username}"</b>.<br />
              Toàn bộ tiến độ học, lịch sử quiz và từ yêu thích cũng sẽ bị xóa.
            </p>
            <div className="um-confirm-btns">
              <button className="um-btn ghost" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="um-btn del" onClick={() => handleDelete(confirmDel.UserID)}>
                🗑 Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}