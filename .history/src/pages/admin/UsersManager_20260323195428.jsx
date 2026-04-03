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
  const [deleting, setDeleting] = useState(null);

  // ── fetch list ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async (opts = {}) => {
    setLoading(true);
    const p   = opts.page  ?? page;
    const q   = opts.search ?? search;
    const r   = opts.role   ?? roleFilter;
    const s   = opts.sort   ?? sort;
    const params = new URLSearchParams({ page: p, limit: 10, sort: s });
    if (q) params.set("q", q);
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // ✅ ESLint warning fixed

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
      {/* …rest of your component remains unchanged… */}
      {/* Các modal, bảng, pagination, filter bar giống code cũ */}
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