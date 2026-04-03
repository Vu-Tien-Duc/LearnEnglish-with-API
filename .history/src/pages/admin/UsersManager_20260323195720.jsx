import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:5000/api/admin/users";

// ── constants ───────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#a78bfa,#38bdf8)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#fb923c,#fbbf24)",
];

const SORT_OPTIONS = [
  { value: "created_desc",  label: "Mới nhất" },
  { value: "created_asc",   label: "Cũ nhất" },
  { value: "username_asc",  label: "Tên A→Z" },
  { value: "username_desc", label: "Tên Z→A" },
  { value: "progress_desc", label: "Tiến độ cao nhất" },
  { value: "score_desc",    label: "Quiz cao nhất" },
];

const EMPTY_FORM = { Username: "", Email: "", Role: "User", PasswordHash: "" };

// ── helpers ──────────────────────────────────────────────────────────
const avatarGrad  = (name = "") => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
const avatarLetter= (name = "") => name[0]?.toUpperCase() ?? "?";

const scoreColor = (v) => {
  if (v >= 80) return "var(--success)";
  if (v >= 50) return "var(--gold)";
  return "var(--danger)";
};
const scoreBg = (v) => {
  if (v >= 80) return "rgba(74,222,128,.1)";
  if (v >= 50) return "rgba(251,191,36,.12)";
  return "rgba(248,113,113,.12)";
};

const pctColor = (p) => {
  if (p >= 70) return "var(--success)";
  if (p >= 30) return "var(--gold)";
  return "var(--accent2)";
};

// ════════════════════════════════════════════════════════════════════
export default function UsersManager() {
  // list state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sort, setSort] = useState("created_desc");
  const searchTimer = useRef(null);

  // stats bar
  const [stats, setStats] = useState(null);

  // modal
  const [modal, setModal] = useState(null); // "create"|"edit"|"view"
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [deleting, setDeleting] = useState(null);

  // ── fetch list ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async (opts = {}) => {
    setLoading(true);
    const p = opts.page ?? page;
    const q = opts.search ?? search;
    const r = opts.role ?? roleFilter;
    const s = opts.sort ?? sort;
    const params = new URLSearchParams({ page: p, limit: 10, sort: s });
    if (q) params.set("q", q);
    if (r) params.set("role", r);
    try {
      const res  = await fetch(`${API}/?${params}`);
      const json = await res.json();
      setUsers(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.total_pages ?? 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // debounce search
  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers({ search: v, page: 1 }), 400);
  };

  useEffect(() => {
    return () => clearTimeout(searchTimer.current); // cleanup debounce
  }, []);

  // ── fetch stats ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // ── fetch detail ───────────────────────────────────────────────
  const openView = async (u) => {
    setModal("view");
    setDetail(null);
    try {
      const res  = await fetch(`${API}/${u.UserID}`);
      const data = await res.json();
      setDetail(data);
    } catch {
      setDetail(u);
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErr("");
    setDetail(null);
    setModal("create");
  };

  const openEdit = (u) => {
    setForm({ Username: u.Username, Email: u.Email ?? "", Role: u.Role, PasswordHash: "" });
    setFormErr("");
    setDetail(u);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setDetail(null); setFormErr(""); };

  // ── save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setFormErr("");
    if (!form.Username.trim()) { setFormErr("Username không được để trống"); return; }
    if (modal === "create" && !form.PasswordHash.trim()) { setFormErr("Mật khẩu không được để trống"); return; }

    setSaving(true);
    try {
      const isCreate = modal === "create";
      const url    = isCreate ? `${API}/` : `${API}/${detail.UserID}`;
      const method = isCreate ? "POST" : "PUT";
      const body   = { ...form };
      if (!body.PasswordHash) delete body.PasswordHash;

      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormErr(json.error ?? "Có lỗi xảy ra"); return; }

      closeModal();
      fetchUsers();
      fetch(`${API}/stats`).then(r => r.json()).then(setStats).catch(() => {});
    } catch {
      setFormErr("Không thể kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────
  const handleDelete = async (u) => {
    if (!window.confirm(`Xóa "${u.Username}"? Toàn bộ dữ liệu học sẽ bị xóa vĩnh viễn.`)) return;
    setDeleting(u.UserID);
    try {
      const res  = await fetch(`${API}/${u.UserID}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { alert(json.error); return; }
      fetchUsers();
      fetch(`${API}/stats`).then(r => r.json()).then(setStats).catch(() => {});
    } catch {
      alert("Xóa thất bại");
    } finally {
      setDeleting(null);
    }
  };

  // ── render helpers ─────────────────────────────────────────────
  const ProgressBar = ({ pct, color }) => (
    <div style={{ width: 80, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color ?? "linear-gradient(90deg,var(--accent2),var(--accent))", borderRadius: 3, transition: "width .4s ease" }} />
    </div>
  );

  // ── render main ───────────────────────────────────────────────
  return (
    <div style={{ padding: "32px", flex: 1, minHeight: "100vh" }}>
      {/* header + action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Quản lý User</h2>
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo user</button>
      </div>

      {/* search + filter + sort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input type="text" placeholder="Tìm kiếm username/email..." className="form-input"
          value={search} onChange={e => handleSearch(e.target.value)} />

        <select className="form-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); fetchUsers({ role: e.target.value, page: 1 }); }}>
          <option value="">Tất cả role</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>

        <select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); fetchUsers({ sort: e.target.value, page: 1 }); }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* users table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Tiến độ</th>
            <th>Quiz TB</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: "center", padding: 16 }}>Đang tải…</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", padding: 16 }}>Không có user</td></tr>
          ) : users.map(u => (
            <tr key={u.UserID}>
              <td>{u.Username}</td>
              <td>{u.Email}</td>
              <td>{u.Role}</td>
              <td>
                {u.progress?.Pct != null ? <ProgressBar pct={u.progress.Pct} color={pctColor(u.progress.Pct)} /> : "-"}
              </td>
              <td>{u.quizStat?.AvgScore != null ? `${u.quizStat.AvgScore}%` : "-"}</td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => openView(u)}>👁</button>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u)} disabled={deleting === u.UserID}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* pagination */}
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i+1} className={`btn btn-ghost btn-sm ${page === i+1 ? "active" : ""}`} onClick={() => { setPage(i+1); fetchUsers({ page: i+1 }); }}>{i+1}</button>
        ))}
      </div>

      {/* modals */}
      {modal && modal !== "view" && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 420, padding: 24 }}>
            <ModalHead title={modal === "create" ? "＋ Tạo user" : "💾 Chỉnh sửa user"} onClose={closeModal} />
            <FormGroup label="Username *">
              <input className="form-input" value={form.Username} onChange={e => setForm(f => ({ ...f, Username: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Email">
              <input className="form-input" value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Role">
              <select className="form-select" value={form.Role} onChange={e => setForm(f => ({ ...f, Role: e.target.value }))}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </FormGroup>
            <FormGroup label={modal === "edit" ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu *"}>
              <input className="form-input" type="password" placeholder={modal === "edit" ? "Để trống = giữ nguyên" : "Nhập mật khẩu"} value={form.PasswordHash} onChange={e => setForm(f => ({ ...f, PasswordHash: e.target.value }))} />
            </FormGroup>
            {formErr && <div style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 8, padding: "10px 14px", color: "var(--danger)", fontSize: 13 }}>⚠ {formErr}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu…" : modal === "create" ? "＋ Tạo user" : "💾 Lưu thay đổi"}</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* view modal */}
      {modal === "view" && detail && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 620, maxHeight: "80vh", overflowY: "auto", padding: 24 }}>
            <ModalHead title={`👁 Chi tiết ${detail.Username}`} onClose={closeModal} />
            <div>
              <strong>Email:</strong> {detail.Email || "-"} <br />
              <strong>Role:</strong> {detail.Role} <br />
              <strong>Tham gia:</strong> {detail.CreatedDate} <br />
              <strong>Tiến độ:</strong> {detail.progress?.Pct ?? 0}% <br />
              <strong>Quiz TB:</strong> {detail.quizStat?.AvgScore ?? 0}%
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => { closeModal(); openEdit(detail); }}>✏️ Chỉnh sửa</button>
              <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────
function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
    >
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", maxWidth: "95vw", maxHeight: "95vh", animation: "fadeIn .2s ease" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)" }}>{label}</label>
      {children}
    </div>
  );
}