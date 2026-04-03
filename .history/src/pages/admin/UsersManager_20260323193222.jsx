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
export default function AdminUsers() {
  // list state
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sort,       setSort]       = useState("created_desc");
  const searchTimer = useRef(null);

  // stats bar
  const [stats, setStats] = useState(null);

  // modal
  const [modal,    setModal]    = useState(null);  // "create"|"edit"|"view"
  const [detail,   setDetail]   = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");
  const [deleting, setDeleting] = useState(null);   // userId đang xóa

  // ── fetch list ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async (opts = {}) => {
    setLoading(true);
    const p   = opts.page  ?? page;
    const q   = opts.search ?? search;
    const r   = opts.role   ?? roleFilter;
    const s   = opts.sort   ?? sort;
    const params = new URLSearchParams({ page: p, limit: 10, sort: s });
    if (q) params.set("q",    q);
    if (r) params.set("role", r);
    try {
      const res  = await fetch(`${API}/?${params}`);
      const json = await res.json();
      setUsers(json.data        ?? []);
      setTotal(json.total       ?? 0);
      setTotalPages(json.total_pages ?? 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, sort]);

  useEffect(() => { fetchUsers(); }, [page, roleFilter, sort]);

  // debounce search
  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers({ search: v, page: 1 }), 400);
  };

  // ── fetch stats ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
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

  // ── open create/edit ───────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: "32px", flex: 1, minHeight: "100vh" }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "var(--text)", lineHeight: 1, marginBottom: 6 }}>
            Quản lý <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Users</em>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Xem, chỉnh sửa và quản lý tài khoản người dùng.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo user mới</button>
      </div>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Tổng users",    value: stats.TotalUsers,   emoji: "👤", color: "var(--accent2)" },
            { label: "Admin",         value: stats.TotalAdmins,  emoji: "🔑", color: "var(--gold)" },
            { label: "Mới hôm nay",   value: stats.NewToday,     emoji: "🆕", color: "var(--success)" },
            { label: "Tuần này",      value: stats.NewThisWeek,  emoji: "📅", color: "var(--accent)" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ fontSize: 22 }}>{s.emoji}</div>
              <div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: s.color, lineHeight: 1 }}>
                  {s.value ?? 0}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FILTER BAR ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <input
          className="topbar-search"
          style={{ width: 240 }}
          placeholder="🔍  Tìm username, email…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <select className="filter-select" value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); fetchUsers({ role: e.target.value, page: 1 }); }}>
          <option value="">Tất cả role</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        <select className="filter-select" value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); fetchUsers({ sort: e.target.value, page: 1 }); }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
          {loading ? "Đang tải…" : `${total} users`}
        </span>
      </div>

      {/* ── TABLE ────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Người dùng", "Role", "Từ vựng", "Tiến độ", "Quiz TB", "Yêu thích", "Ngày tạo", ""].map(h => (
                  <th key={h} style={{
                    fontSize: 11, textTransform: "uppercase", letterSpacing: 1,
                    color: "var(--muted)", padding: "10px 16px", textAlign: "left",
                    borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                  Đang tải dữ liệu…
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  Không tìm thấy user nào
                </td></tr>
              ) : users.map(u => (
                <tr key={u.UserID} style={{ borderBottom: "1px solid var(--border)", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                  {/* avatar + name */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: avatarGrad(u.Username),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#0d0f14", flexShrink: 0,
                      }}>
                        {avatarLetter(u.Username)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{u.Username}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{u.Email || "—"}</div>
                      </div>
                    </div>
                  </td>

                  {/* role */}
                  <td style={{ padding: "14px 16px" }}>
                    <span className={`badge ${u.Role === "Admin" ? "badge-admin" : "badge-user"}`}>{u.Role}</span>
                  </td>

                  {/* word count */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.TotalWords ?? 0}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {u.MasteredWords ?? 0} mastered
                    </div>
                  </td>

                  {/* progress */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProgressBar pct={u.ProgressPct ?? 0} />
                      <span style={{ fontSize: 11, color: pctColor(u.ProgressPct ?? 0), fontWeight: 500 }}>
                        {u.ProgressPct ?? 0}%
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                      {u.NewWords ?? 0}N · {u.LearningWords ?? 0}L · {u.MasteredWords ?? 0}M
                    </div>
                  </td>

                  {/* quiz avg */}
                  <td style={{ padding: "14px 16px" }}>
                    {u.AvgScore > 0 ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "3px 10px",
                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: scoreBg(u.AvgScore), color: scoreColor(u.AvgScore),
                      }}>
                        {u.AvgScore}%
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>
                    )}
                  </td>

                  {/* favorite count */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 13, color: "var(--accent3)" }}>♥</span>{" "}
                    <span style={{ fontSize: 13 }}>{u.FavoriteCount ?? 0}</span>
                  </td>

                  {/* date */}
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {u.CreatedDate}
                  </td>

                  {/* actions */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn" title="Xem chi tiết" onClick={() => openView(u)}>👁</button>
                      <button className="icon-btn" title="Chỉnh sửa"   onClick={() => openEdit(u)}>✏️</button>
                      <button
                        className="icon-btn del" title="Xóa"
                        onClick={() => handleDelete(u)}
                        disabled={deleting === u.UserID}
                        style={{ opacity: deleting === u.UserID ? .5 : 1 }}
                      >
                        {deleting === u.UserID ? "…" : "🗑"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ───────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 32 }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1}
            onClick={() => { setPage(p => p - 1); fetchUsers({ page: page - 1 }); }}>
            ← Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce((acc, n, idx, arr) => {
              if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
              acc.push(n);
              return acc;
            }, [])
            .map((n, i) => n === "…" ? (
              <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "var(--muted)" }}>…</span>
            ) : (
              <button key={n}
                onClick={() => { setPage(n); fetchUsers({ page: n }); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid",
                  borderColor: n === page ? "var(--accent)" : "var(--border)",
                  background: n === page ? "rgba(110,231,183,.1)" : "transparent",
                  color: n === page ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                }}>
                {n}
              </button>
            ))
          }
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages}
            onClick={() => { setPage(p => p + 1); fetchUsers({ page: page + 1 }); }}>
            Sau →
          </button>
        </div>
      )}

      {/* ══════════════ MODAL: CREATE / EDIT ══════════════ */}
      {(modal === "create" || modal === "edit") && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 520 }}>
            <ModalHead
              title={modal === "create" ? "👤 Tạo user mới" : `✏️ Sửa — ${detail?.Username}`}
              onClose={closeModal}
            />
            <div style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormGroup label="Username *">
                  <input className="form-input" placeholder="vd: mintu123" value={form.Username}
                    onChange={e => setForm(f => ({ ...f, Username: e.target.value }))} />
                </FormGroup>
                <FormGroup label="Email">
                  <input className="form-input" type="email" placeholder="vd: user@gmail.com" value={form.Email}
                    onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} />
                </FormGroup>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormGroup label="Role">
                  <select className="form-input" value={form.Role}
                    onChange={e => setForm(f => ({ ...f, Role: e.target.value }))}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </FormGroup>
                <FormGroup label={modal === "edit" ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu *"}>
                  <input className="form-input" type="password"
                    placeholder={modal === "edit" ? "Để trống = giữ nguyên" : "Nhập mật khẩu"}
                    value={form.PasswordHash}
                    onChange={e => setForm(f => ({ ...f, PasswordHash: e.target.value }))} />
                </FormGroup>
              </div>

              {formErr && (
                <div style={{
                  background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)",
                  borderRadius: 8, padding: "10px 14px", color: "var(--danger)", fontSize: 13,
                }}>
                  ⚠ {formErr}
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu…" : modal === "create" ? "＋ Tạo user" : "💾 Lưu thay đổi"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══════════════ MODAL: VIEW DETAIL ══════════════ */}
      {modal === "view" && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ width: 620 }}>
            <ModalHead title="👁 Chi tiết User" onClose={closeModal} />

            {!detail ? (
              <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Đang tải…</div>
            ) : (
              <div style={{ padding: 24, maxHeight: "80vh", overflowY: "auto" }}>

                {/* avatar + basic info */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
                  padding: 16, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: avatarGrad(detail.Username),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "#0d0f14",
                  }}>
                    {avatarLetter(detail.Username)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 3 }}>{detail.Username}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{detail.Email || "Chưa có email"}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge ${detail.Role === "Admin" ? "badge-admin" : "badge-user"}`}>{detail.Role}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Tham gia {detail.CreatedDate}</span>
                      {detail.progress?.LastActivity && (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>· Hoạt động {detail.progress.LastActivity}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "var(--accent)", lineHeight: 1 }}>
                      {detail.progress?.ProgressPct ?? 0}%
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>tiến độ</div>
                  </div>
                </div>

                {/* progress stats 3 cột */}
                {detail.progress && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "Tổng từ",  value: detail.progress.TotalWords,    color: "var(--text)" },
                      { label: "New",      value: detail.progress.NewWords,      color: "var(--accent2)" },
                      { label: "Learning", value: detail.progress.LearningWords, color: "var(--gold)" },
                      { label: "Mastered", value: detail.progress.MasteredWords, color: "var(--success)" },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: "center", padding: "12px 8px",
                        background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: s.color, lineHeight: 1 }}>
                          {s.value ?? 0}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* quiz stat */}
                {detail.quizStat && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <div style={{ flex: 1, padding: "12px 16px", background: "var(--surface)",
                      borderRadius: 10, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 20 }}>📊</div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>QUIZ SCORE TB</div>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22,
                          color: scoreColor(detail.quizStat.AvgScore) }}>
                          {detail.quizStat.AvgScore}%
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: "12px 16px", background: "var(--surface)",
                      borderRadius: 10, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 20 }}>🎯</div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>TỔNG LẦN LÀM</div>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "var(--text)" }}>
                          {detail.quizStat.TotalQuiz}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* category progress */}
                {detail.categoryProgress?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
                      letterSpacing: 1, marginBottom: 10 }}>Tiến độ theo chủ đề</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {detail.categoryProgress.map(c => (
                        <div key={c.CategoryName} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 100, fontSize: 12, color: "var(--muted)", textAlign: "right", flexShrink: 0 }}>
                            {c.CategoryName}
                          </div>
                          <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${c.Pct}%`,
                              background: "linear-gradient(90deg,var(--accent2),var(--accent))", borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", width: 60, flexShrink: 0 }}>
                            {c.Mastered}/{c.Total} ({c.Pct}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* quiz history */}
                {detail.quizHistory?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
                      letterSpacing: 1, marginBottom: 10 }}>Lịch sử Quiz gần nhất</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Từ vựng", "Score", "Thời gian"].map(h => (
                            <th key={h} style={{ fontSize: 11, color: "var(--muted)", textAlign: "left",
                              padding: "6px 12px", borderBottom: "1px solid var(--border)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.quizHistory.map((q, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "8px 12px", fontWeight: 500, fontSize: 13 }}>{q.Word}</td>
                            <td style={{ padding: "8px 12px" }}>
                              <span style={{
                                display: "inline-flex", padding: "2px 10px", borderRadius: 20,
                                fontSize: 12, fontWeight: 600,
                                background: scoreBg(q.Score), color: scoreColor(q.Score),
                              }}>{q.Score}%</span>
                            </td>
                            <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)" }}>{q.LearnDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* favorites */}
                {detail.favorites?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
                      letterSpacing: 1, marginBottom: 10 }}>Từ yêu thích ({detail.favorites.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {detail.favorites.map((f, i) => (
                        <span key={i} title={f.Meaning} style={{
                          background: "rgba(110,231,183,.07)", border: "1px solid rgba(110,231,183,.18)",
                          borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "var(--accent)",
                          cursor: "default",
                        }}>♡ {f.Word}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {detail && (
                <button className="btn btn-ghost btn-sm" onClick={() => { closeModal(); openEdit(detail); }}>
                  ✏️ Chỉnh sửa user này
                </button>
              )}
              <button className="btn btn-ghost" onClick={closeModal} style={{ marginLeft: "auto" }}>Đóng</button>
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
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 16,
      }}
    >
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 16, overflow: "hidden", maxWidth: "95vw", maxHeight: "95vh",
        animation: "fadeIn .2s ease",
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none",
        color: "var(--muted)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
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