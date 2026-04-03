import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:5000/api/admin/users";

// ── constants ───────────────────────────────────────────────────────
const EMPTY_FORM = { Username: "", Email: "", Role: "User", PasswordHash: "" };

// ════════════════════════════════════════════════════════════════════
export default function UsersManager() {
  // list state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const searchTimer = useRef(null);

  // modal
  const [modal, setModal] = useState(null);  // "create"|"edit"|"view"
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

    const params = new URLSearchParams({ page: p, limit: 10 });
    if (q) params.set("q", q);
    if (r) params.set("role", r);

    try {
      const res = await fetch(`${API}/?${params}`);
      const json = await res.json();
      setUsers(json.data ?? []);
      setTotalPages(json.total_pages ?? 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

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

  // ── fetch detail ───────────────────────────────────────────────
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

  const closeModal = () => { setModal(null); setDetail(null); setFormErr(""); };

  // ── save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setFormErr("");
    if (!form.Username.trim()) { setFormErr("Username không được để trống"); return; }
    if (modal === "create" && !form.PasswordHash.trim()) { setFormErr("Mật khẩu không được để trống"); return; }

    setSaving(true);
    try {
      const isCreate = modal === "create";
      const url = isCreate ? `${API}/` : `${API}/${detail.UserID}`;
      const method = isCreate ? "POST" : "PUT";
      const body = { ...form };
      if (!body.PasswordHash) delete body.PasswordHash;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormErr(json.error ?? "Có lỗi xảy ra"); return; }

      closeModal();
      fetchUsers();
    } catch {
      setFormErr("Không thể kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────
  const handleDelete = async (u) => {
    if (!window.confirm(`Xóa "${u.Username}"? Toàn bộ dữ liệu học sẽ bị xóa.`)) return;
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

  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: 32, minHeight: "100vh" }}>
      <h2>Quản lý User</h2>

      {/* Search & Create */}
      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          placeholder="Tìm kiếm username hoặc email..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo user</button>
      </div>

      {/* Users Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Username</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Email</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Role</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "right", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} style={{ padding: 8 }}>Đang tải…</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: 8 }}>Không có dữ liệu</td></tr>
          ) : users.map(u => (
            <tr key={u.UserID}>
              <td style={{ padding: 8 }}>{u.Username}</td>
              <td style={{ padding: 8 }}>{u.Email}</td>
              <td style={{ padding: 8 }}>{u.Role}</td>
              <td style={{ padding: 8, textAlign: "right" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openView(u)}>👁️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u)}
                  disabled={deleting === u.UserID}
                >
                  {deleting === u.UserID ? "…" : "🗑️"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i+1)} disabled={i+1 === page}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 420, padding: 16 }}>
            <ModalHead title={modal === "create" ? "＋ Tạo User" : modal === "edit" ? "💾 Chỉnh sửa User" : "👁 Chi tiết User"} onClose={closeModal} />

            {(modal === "create" || modal === "edit") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                <FormGroup label="Username *">
                  <input
                    value={form.Username}
                    onChange={e => setForm(f => ({ ...f, Username: e.target.value }))}
                  />
                </FormGroup>
                <FormGroup label="Email">
                  <input
                    value={form.Email}
                    onChange={e => setForm(f => ({ ...f, Email: e.target.value }))}
                  />
                </FormGroup>
                <FormGroup label="Role">
                  <select value={form.Role} onChange={e => setForm(f => ({ ...f, Role: e.target.value }))}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </FormGroup>
                <FormGroup label={modal === "edit" ? "Mật khẩu mới (tùy chọn)" : "Mật khẩu *"}>
                  <input
                    type="password"
                    placeholder={modal === "edit" ? "Để trống = giữ nguyên" : "Nhập mật khẩu"}
                    value={form.PasswordHash}
                    onChange={e => setForm(f => ({ ...f, PasswordHash: e.target.value }))}
                  />
                </FormGroup>

                {formErr && (
                  <div style={{ color: "red", fontSize: 13 }}>{formErr}</div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Đang lưu…" : modal === "create" ? "＋ Tạo user" : "💾 Lưu thay đổi"}
                  </button>
                </div>
              </div>
            )}

            {modal === "view" && detail && (
              <div style={{ marginTop: 8 }}>
                <p><b>Username:</b> {detail.Username}</p>
                <p><b>Email:</b> {detail.Email ?? "-"}</p>
                <p><b>Role:</b> {detail.Role}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn btn-ghost" onClick={() => { closeModal(); openEdit(detail); }}>✏️ Chỉnh sửa</button>
                  <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────
function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16,
    }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", maxWidth: "95vw", maxHeight: "95vh" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", color: "#555" }}>{label}</label>
      {children}
    </div>
  );
}