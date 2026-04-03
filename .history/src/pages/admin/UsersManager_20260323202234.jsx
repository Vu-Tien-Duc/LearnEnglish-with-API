import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:5000/api/admin/users";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#a78bfa,#38bdf8)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#fb923c,#fbbf24)",
];

const EMPTY_FORM = { Username: "", Email: "", Role: "User", PasswordHash: "" };

const avatarGrad = (name = "") =>
  AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
const avatarLetter = (name = "") => name[0]?.toUpperCase() ?? "?";

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchTimer = useRef(null);

  // modal state
  const [modal, setModal] = useState(null); // "create"|"edit"|"view"
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [deleting, setDeleting] = useState(null);

  // ── fetch users ───────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);

    try {
      const res = await fetch(`${API}/?${params}`);
      const json = await res.json();
      setUsers(json.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(), 400);
  };

  // ── modal actions ─────────────────────────
  const openView = async (u) => {
    setModal("view");
    setDetail(null);
    try {
      const res = await fetch(`${API}/${u.UserID}`);
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

  const closeModal = () => {
    setModal(null);
    setDetail(null);
    setFormErr("");
  };

  // ── save user ────────────────────────────
  const handleSave = async () => {
    setFormErr("");
    if (!form.Username.trim()) {
      setFormErr("Username không được để trống");
      return;
    }
    if (modal === "create" && !form.PasswordHash.trim()) {
      setFormErr("Mật khẩu không được để trống");
      return;
    }

    setSaving(true);
    try {
      const isCreate = modal === "create";
      const url = isCreate ? `${API}/` : `${API}/${detail.UserID}`;
      const method = isCreate ? "POST" : "PUT";
      const body = { ...form };
      if (!body.PasswordHash) delete body.PasswordHash;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) {
        setFormErr(json.error ?? "Có lỗi xảy ra");
        return;
      }
      closeModal();
      fetchUsers();
    } catch {
      setFormErr("Không thể kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // ── delete user ──────────────────────────
  const handleDelete = async (u) => {
    if (!window.confirm(`Xóa "${u.Username}"? Toàn bộ dữ liệu học sẽ bị xóa vĩnh viễn.`)) return;
    setDeleting(u.UserID);
    try {
      const res = await fetch(`${API}/${u.UserID}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { alert(json.error); return; }
      fetchUsers();
    } catch {
      alert("Xóa thất bại");
    } finally {
      setDeleting(null);
    }
  };

  // ── render ───────────────────────────────
  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Quản lý Users</h2>
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo user</button>
      </div>

      {/* Search */}
      <input
        className="topbar-search"
        style={{ width: 240, marginBottom: 16 }}
        placeholder="🔍 Tìm user…"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Users table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Tiến độ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const progress = u.progress?.Pct ?? 0;
                return (
                  <tr key={u.UserID}>
                    <td>
                      <div className="user-cell">
                        <div className="u-avatar" style={{ background: avatarGrad(u.Username) }}>
                          {avatarLetter(u.Username)}
                        </div>
                        <div>
                          <div className="u-name">{u.Username}</div>
                          <div className="u-email">{u.Email ?? "Chưa có email"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.Role === "Admin" ? "badge-admin" : "badge-user"}`}>
                        {u.Role}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{new Date(u.CreatedDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress-track" style={{ width: 80, height: 6, background: "var(--border)", borderRadius: 3 }}>
                          <div className="progress-fill" style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,var(--accent2),var(--accent))" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="icon-btn" title="Xem chi tiết" onClick={() => openView(u)}>👁</button>
                        <button className="icon-btn" title="Sửa" onClick={() => openEdit(u)}>✏️</button>
                        <button className="icon-btn del" title="Xóa" onClick={() => handleDelete(u)} disabled={deleting === u.UserID}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 520, padding: 24 }}>
            <ModalHead title={modal === "create" ? "＋ Tạo user" : "💾 Chỉnh sửa user"} onClose={closeModal} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <FormGroup label="Username *">
                <input className="form-input" value={form.Username} onChange={e => setForm(f => ({ ...f, Username: e.target.value }))} />
              </FormGroup>
              <FormGroup label="Email">
                <input className="form-input" value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} />
              </FormGroup>
              <FormGroup label={modal === "edit" ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu *"}>
                <input className="form-input" type="password" value={form.PasswordHash} placeholder={modal === "edit" ? "Để trống = giữ nguyên" : ""} onChange={e => setForm(f => ({ ...f, PasswordHash: e.target.value }))} />
              </FormGroup>
              <FormGroup label="Role">
                <select className="form-input" value={form.Role} onChange={e => setForm(f => ({ ...f, Role: e.target.value }))}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </FormGroup>
              {formErr && <div style={{ color: "var(--danger)" }}>⚠ {formErr}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu…" : (modal === "create" ? "＋ Tạo user" : "💾 Lưu thay đổi")}</button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── sub-components ─────────────────────────
function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
    >
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", maxWidth: "95vw", maxHeight: "95vh" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>{label}</label>
      {children}
    </div>
  );
}