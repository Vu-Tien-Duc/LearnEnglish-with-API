import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api/admin/users";

// ── helpers ────────────────────────────────────────────────
const avatarColors = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#a78bfa,#6ee7b7)",
];
const getColor = (name = "") =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const scoreClass = (v) => {
  if (v === null || v === undefined) return "score-mid";
  if (v >= 80) return "score-high";
  if (v >= 50) return "score-mid";
  return "score-low";
};

const pct = (mastered, total) =>
  total ? Math.round((mastered / total) * 100) : 0;

// ── empty form ──────────────────────────────────────────────
const emptyForm = {
  Username: "",
  Email: "",
  Role: "User",
  PasswordHash: "",
};

// ══════════════════════════════════════════════════════════════
export default function AdminUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [chipFilter, setChipFilter] = useState("all");

  // modal state
  const [modal, setModal]           = useState(null); // "create" | "edit" | "view"
  const [selected, setSelected]     = useState(null); // user being edited / viewed
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [err, setErr]               = useState("");

  // ── fetch ────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.append("q",    search);
      if (roleFilter) params.append("role", roleFilter);

      const url = search || roleFilter
        ? `${API}/search?${params}`
        : `${API}/`;

      const res  = await fetch(url);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── filtered list (chip) ─────────────────────────────────
  const displayed = users.filter((u) => {
    if (chipFilter === "admin")   return u.Role === "Admin";
    if (chipFilter === "user")    return u.Role === "User";
    return true;
  });

  // ── open modal helpers ───────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setErr("");
    setSelected(null);
    setModal("create");
  };

  const openEdit = (u) => {
    setForm({
      Username:     u.Username,
      Email:        u.Email || "",
      Role:         u.Role,
      PasswordHash: "",
    });
    setErr("");
    setSelected(u);
    setModal("edit");
  };

  const openView = async (u) => {
    setSelected(null);
    setModal("view");
    try {
      const res  = await fetch(`${API}/${u.UserID}`);
      const data = await res.json();
      setSelected(data);
    } catch {
      setSelected(u);
    }
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  // ── save (create / edit) ─────────────────────────────────
  const handleSave = async () => {
    setErr("");
    if (!form.Username.trim()) { setErr("Username không được để trống"); return; }
    if (modal === "create" && !form.PasswordHash.trim()) {
      setErr("Vui lòng nhập mật khẩu");
      return;
    }
    setSaving(true);
    try {
      const method = modal === "create" ? "POST" : "PUT";
      const url    = modal === "create" ? `${API}/` : `${API}/${selected.UserID}`;
      const body   = { ...form };
      if (!body.PasswordHash) delete body.PasswordHash;

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Có lỗi xảy ra"); return; }
      closeModal();
      fetchUsers();
    } catch {
      setErr("Không thể kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // ── delete ───────────────────────────────────────────────
  const handleDelete = async (u) => {
    if (!window.confirm(`Xóa user "${u.Username}"? Toàn bộ dữ liệu học sẽ mất!`)) return;
    try {
      await fetch(`${API}/${u.UserID}`, { method: "DELETE" });
      fetchUsers();
    } catch {
      alert("Xóa thất bại");
    }
  };

  // ══════════════════════════════════════════════════════════
  return (
    <div style={{ padding: "32px", flex: 1 }}>

      {/* ── header ─────────────────────────────────────────── */}
      <div className="section-header">
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "var(--text)", lineHeight: 1 }}>
            Quản lý <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Users</em>
          </h2>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
            Xem, chỉnh sửa và quản lý tài khoản người dùng.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo user</button>
      </div>

      {/* ── filter bar ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          className="topbar-search"
          style={{ width: 240 }}
          placeholder="🔍 Tìm user…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tất cả role</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        {[
          { key: "all",   label: "Tất cả" },
          { key: "admin", label: "Admin" },
          { key: "user",  label: "User" },
        ].map((c) => (
          <button
            key={c.key}
            className={`filter-chip${chipFilter === c.key ? " active" : ""}`}
            onClick={() => setChipFilter(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── table card ─────────────────────────────────────── */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            Đang tải…
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Người dùng", "Role", "Ngày tạo", "Tiến độ", "Quiz TB", "Hành động"].map((h) => (
                    <th key={h} style={{
                      fontSize: 11, textTransform: "uppercase", letterSpacing: 1,
                      color: "var(--muted)", padding: "10px 16px", textAlign: "left",
                      borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                      Không tìm thấy user nào
                    </td>
                  </tr>
                ) : displayed.map((u) => {
                  const progress = pct(u.MasteredWords, u.TotalWords);
                  return (
                    <tr key={u.UserID} style={{ borderBottom: "1px solid var(--border)" }}>

                      {/* avatar + name */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: getColor(u.Username),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "var(--bg)", flexShrink: 0,
                          }}>
                            {u.Username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{u.Username}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{u.Email}</div>
                          </div>
                        </div>
                      </td>

                      {/* role badge */}
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge ${u.Role === "Admin" ? "badge-admin" : "badge-user"}`}>
                          {u.Role}
                        </span>
                      </td>

                      {/* created date */}
                      <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>
                        {u.CreatedDate}
                      </td>

                      {/* progress bar */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 80, height: 6, background: "var(--border)",
                            borderRadius: 3, overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%", borderRadius: 3, width: `${progress}%`,
                              background: "linear-gradient(90deg,var(--accent2),var(--accent))",
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>{progress}%</span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                          {u.MasteredWords || 0}/{u.TotalWords || 0} từ
                        </div>
                      </td>

                      {/* quiz avg */}
                      <td style={{ padding: "12px 16px" }}>
                        {u.AvgScore != null ? (
                          <span className={`score-pill ${scoreClass(u.AvgScore)}`}>
                            {u.AvgScore}%
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>
                        )}
                      </td>

                      {/* actions */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="icon-btn" title="Xem chi tiết" onClick={() => openView(u)}>👁</button>
                          <button className="icon-btn" title="Sửa"          onClick={() => openEdit(u)}>✏️</button>
                          <button className="icon-btn del" title="Xóa"      onClick={() => handleDelete(u)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════ MODAL: CREATE / EDIT ══════════ */}
      {(modal === "create" || modal === "edit") && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 520, maxWidth: "95vw" }}>
            <ModalHead
              title={modal === "create" ? "👤 Tạo user mới" : "✏️ Chỉnh sửa User"}
              onClose={closeModal}
            />
            <div style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormGroup label="Username">
                  <input
                    className="form-input"
                    placeholder="e.g. mintu123"
                    value={form.Username}
                    onChange={(e) => setForm({ ...form, Username: e.target.value })}
                  />
                </FormGroup>
                <FormGroup label="Email">
                  <input
                    className="form-input"
                    type="email"
                    placeholder="e.g. user@gmail.com"
                    value={form.Email}
                    onChange={(e) => setForm({ ...form, Email: e.target.value })}
                  />
                </FormGroup>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormGroup label="Role">
                  <select
                    className="form-input"
                    value={form.Role}
                    onChange={(e) => setForm({ ...form, Role: e.target.value })}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </FormGroup>
                <FormGroup label={modal === "edit" ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu *"}>
                  <input
                    className="form-input"
                    type="password"
                    placeholder={modal === "edit" ? "Để trống = giữ nguyên" : "Nhập mật khẩu"}
                    value={form.PasswordHash}
                    onChange={(e) => setForm({ ...form, PasswordHash: e.target.value })}
                  />
                </FormGroup>
              </div>
              {err && (
                <div style={{
                  background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)",
                  borderRadius: 8, padding: "10px 14px", color: "var(--danger)", fontSize: 13, marginBottom: 8,
                }}>
                  ⚠ {err}
                </div>
              )}
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu…" : "💾 Lưu"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══════════ MODAL: VIEW DETAIL ══════════ */}
      {modal === "view" && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 560, maxWidth: "95vw" }}>
            <ModalHead
              title="👁 Chi tiết User"
              onClose={closeModal}
            />
            {!selected ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Đang tải…</div>
            ) : (
              <div style={{ padding: 24 }}>
                {/* avatar + info */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: getColor(selected.Username),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "var(--bg)", flexShrink: 0,
                  }}>
                    {selected.Username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{selected.Username}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{selected.Email}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${selected.Role === "Admin" ? "badge-admin" : "badge-user"}`}>
                        {selected.Role}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>
                        Ngày tạo: {selected.CreatedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* progress stats */}
                {selected.progress && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "New",      value: selected.progress.NewWords,      color: "var(--accent2)" },
                      { label: "Learning", value: selected.progress.LearningWords, color: "var(--gold)" },
                      { label: "Mastered", value: selected.progress.MasteredWords, color: "var(--success)" },
                    ].map((s) => (
                      <div key={s.label} style={{
                        textAlign: "center", padding: 14,
                        background: "var(--surface)", borderRadius: 10,
                      }}>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: s.color }}>
                          {s.value || 0}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* quiz history */}
                {selected.quizHistory?.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                      Lịch sử Quiz gần đây
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                      <thead>
                        <tr>
                          {["Từ vựng", "Score", "Ngày"].map((h) => (
                            <th key={h} style={{ fontSize: 11, color: "var(--muted)", textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--border)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.quizHistory.map((q, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 600, fontSize: 13 }}>{q.Word}</td>
                            <td style={{ padding: "8px 10px" }}>
                              <span className={`score-pill ${scoreClass(q.Score)}`}>{q.Score}%</span>
                            </td>
                            <td style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)" }}>{q.LearnDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {/* favorites */}
                {selected.favorites?.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                      Từ yêu thích ({selected.favorites.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selected.favorites.map((f, i) => (
                        <span key={i} style={{
                          background: "rgba(110,231,183,.08)", border: "1px solid rgba(110,231,183,.2)",
                          borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "var(--accent)",
                        }}>
                          ♡ {f.Word}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── reusable sub-components ────────────────────────────────
function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      }}
    >
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 16, animation: "fadeIn .2s ease", overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, onClose }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 24px", borderBottom: "1px solid var(--border)",
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <button onClick={onClose} style={{
        background: "none", border: "none", color: "var(--muted)",
        fontSize: 20, cursor: "pointer",
      }}>✕</button>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}