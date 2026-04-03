import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap";
if (!document.head.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

/* ═══════════════ TOKEN MAP ═══════════════ */
const T = {
  bg:       "#0d0f14",
  surface:  "#13161e",
  card:     "#181c26",
  border:   "#252a38",
  accent:   "#6ee7b7",
  accent2:  "#38bdf8",
  text:     "#e2e8f0",
  muted:    "#64748b",
  danger:   "#f87171",
  success:  "#4ade80",
  sidebarW: "240px",
};

/* ═══════════════ STYLES ═══════════════ */
const S = {
  root: {
    display: "flex", background: T.bg, color: T.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
    minHeight: "100vh", position: "relative",
  },
  sidebar: {
    width: T.sidebarW, background: T.surface,
    borderRight: `1px solid ${T.border}`,
    display: "flex", flexDirection: "column",
    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
  },
  sidebarLogo:     { padding: "28px 24px 20px", borderBottom: `1px solid ${T.border}` },
  wordmark:        { fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: T.accent, letterSpacing: "-0.5px" },
  logoSub:         { fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "2px", marginTop: "2px" },
  navSectionLabel: { fontSize: "9px", textTransform: "uppercase", letterSpacing: "2px", color: T.muted, padding: "20px 24px 8px", display: "block" },
  navItemBase: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 24px", cursor: "pointer", color: T.muted,
    textDecoration: "none", fontSize: "13.5px", fontWeight: 400,
    position: "relative", transition: "color .2s, background .2s",
  },
  navItemActive:  { color: T.accent, background: "rgba(110,231,183,0.06)" },
  sidebarFooter:  { marginTop: "auto", padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "10px" },
  adminAvatar: {
    width: "32px", height: "32px",
    background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "13px", color: T.bg, flexShrink: 0,
  },
  adminName:    { fontSize: "13px", fontWeight: 500 },
  adminRole:    { fontSize: "10px", color: T.accent, textTransform: "uppercase", letterSpacing: "1px" },
  main:         { marginLeft: T.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: {
    height: "60px", background: T.surface, borderBottom: `1px solid ${T.border}`,
    display: "flex", alignItems: "center", padding: "0 32px", gap: "16px",
    position: "sticky", top: 0, zIndex: 50,
  },
  topbarTitle:  { fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: T.text, whiteSpace: "nowrap" },
  topbarSearch: {
    marginLeft: "8px", padding: "6px 14px",
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: "8px", color: T.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
    width: "220px", outline: "none",
  },
  topbarRight:  { marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" },
  topbarBtn: {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: "8px", width: "36px", height: "36px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: T.muted, fontSize: "16px",
    transition: "color .2s, border-color .2s",
  },
  content:      { padding: "32px", flex: 1 },
  footer: {
    padding: "16px 32px", borderTop: `1px solid ${T.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontSize: "11px", color: T.muted, background: T.surface,
  },
  versionBadge: {
    background: "rgba(110,231,183,0.1)", color: T.accent,
    padding: "2px 8px", borderRadius: "20px", fontSize: "10px", marginRight: "8px",
  },
  noise: {
    position: "fixed", inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none", zIndex: 999,
  },
};

/* ═══════════════ NAV ITEM ═══════════════ */
function NavItem({ to, icon, label, active }) {
  return (
    <Link to={to} style={{ ...S.navItemBase, ...(active ? S.navItemActive : {}) }}>
      {active && (
        <span style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "2px", background: T.accent,
          boxShadow: `0 0 12px ${T.accent}`,
          borderRadius: "0 2px 2px 0",
        }} />
      )}
      <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{icon}</span>
      {label}
    </Link>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS PANEL
   - Hiển thị: UserID, Username, Role (từ localStorage)
   - Form đổi pass: gọi PUT /auth/change-password
       Body: { UserID, OldPassword, NewPassword }
═══════════════════════════════════════════════ */
function SettingsPanel({ open, onClose, user, onLogout }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm,     setConfirm]     = useState("");

  // "idle" | "loading" | "success" | "error"
  const [status,  setStatus]  = useState("idle");
  const [message, setMessage] = useState("");

  /* Reset form khi đóng panel */
  useEffect(() => {
    if (!open) {
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      setStatus("idle");
      setMessage("");
    }
  }, [open]);

  const handleChangePassword = async () => {
    setMessage("");

    /* ── Validate phía client trước khi gọi API ── */
    if (!oldPassword || !newPassword || !confirm) {
      setStatus("error");
      setMessage("Vui lòng điền đầy đủ các trường mật khẩu.");
      return;
    }
    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirm) {
      setStatus("error");
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword === oldPassword) {
      setStatus("error");
      setMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setStatus("loading");

    try {
      /* ── Gọi PUT /auth/change-password ── */
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserID:      user?.UserID,      // Users.UserID
          OldPassword: oldPassword,        // verify bcrypt
          NewPassword: newPassword,        // hash → Users.PasswordHash
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Đổi mật khẩu thất bại.");
      } else {
        setStatus("success");
        setMessage(data.message || "Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirm("");
      }
    } catch {
      setStatus("error");
      setMessage("Không thể kết nối server.");
    }
  };

  /* ── Shared input style ── */
  const inputSt = (hasError = false) => ({
    width: "100%", padding: "8px 12px",
    background: T.bg,
    border: `1px solid ${hasError ? T.danger : T.border}`,
    borderRadius: "8px", color: T.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
    outline: "none", boxSizing: "border-box",
    transition: "border-color .2s",
  });

  const labelSt = {
    fontSize: "10px", textTransform: "uppercase",
    letterSpacing: "1.5px", color: T.muted,
    display: "block", marginBottom: "6px",
  };

  const secTitle = {
    fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "1.5px", color: T.accent,
    marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px",
  };

  const divider = { borderTop: `1px solid ${T.border}`, margin: "20px 0" };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 149 }}
        />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "380px",
        background: T.surface, borderLeft: `1px solid ${T.border}`,
        zIndex: 150, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
        boxShadow: open ? "-20px 0 60px rgba(0,0,0,.4)" : "none",
      }}>

        {/* ── Panel header ── */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Cài đặt</div>
            <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>Tuỳ chỉnh tài khoản Admin</div>
          </div>
          <button onClick={onClose} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: "8px", width: "32px", height: "32px",
            cursor: "pointer", color: T.muted, fontSize: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Profile card — từ Users: UserID, Username, Role */}
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "16px", borderRadius: "12px",
            background: T.card, border: `1px solid ${T.border}`,
            marginBottom: "20px",
          }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "18px", color: T.bg,
            }}>
              {(user?.Username || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Users.Username */}
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{user?.Username || "—"}</div>
              {/* Users.UserID */}
              <div style={{ fontSize: "12px", color: T.muted, marginTop: "2px" }}>
                ID: #{user?.UserID || "—"}
              </div>
            </div>
            {/* Users.Role */}
            <span style={{
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px",
              background: "rgba(110,231,183,0.1)", color: T.accent,
              padding: "3px 8px", borderRadius: "20px", flexShrink: 0,
            }}>{user?.Role || "Admin"}</span>
          </div>

          {/* ── Đổi mật khẩu ──
               Gọi PUT /auth/change-password
               { UserID, OldPassword, NewPassword } → UPDATE Users.PasswordHash */}
          <div style={secTitle}>🔑 Đổi mật khẩu</div>

          {/* Mật khẩu hiện tại */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelSt}>Mật khẩu hiện tại</label>
            <input
              style={inputSt(status === "error" && !oldPassword)}
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={e => { setOldPassword(e.target.value); setStatus("idle"); setMessage(""); }}
            />
          </div>

          {/* Mật khẩu mới */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelSt}>Mật khẩu mới</label>
            <input
              style={inputSt(status === "error" && newPassword.length > 0 && newPassword.length < 6)}
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setStatus("idle"); setMessage(""); }}
            />
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelSt}>Xác nhận mật khẩu mới</label>
            <input
              style={inputSt(status === "error" && confirm.length > 0 && confirm !== newPassword)}
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setStatus("idle"); setMessage(""); }}
            />
          </div>

          {/* Feedback message */}
          {message && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px", fontSize: "12px",
              marginBottom: "14px",
              background: status === "success"
                ? "rgba(74,222,128,0.08)"
                : "rgba(248,113,113,0.08)",
              border: `1px solid ${status === "success"
                ? "rgba(74,222,128,0.2)"
                : "rgba(248,113,113,0.2)"}`,
              color: status === "success" ? T.success : T.danger,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span>{status === "success" ? "✓" : "✕"}</span>
              {message}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleChangePassword}
            disabled={status === "loading"}
            style={{
              width: "100%", padding: "10px",
              background: status === "loading"
                ? "rgba(110,231,183,0.5)"
                : T.accent,
              border: "none", borderRadius: "8px",
              color: T.bg, fontWeight: 600, fontSize: "13px",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: status === "loading" ? "none" : `0 0 20px rgba(110,231,183,.25)`,
              transition: "all .2s",
            }}
          >
            {status === "loading" ? "Đang xử lý…" : "🔑 Xác nhận đổi mật khẩu"}
          </button>

          <div style={divider} />

          {/* ── Đăng xuất ── */}
          <div style={secTitle}>🔐 Phiên đăng nhập</div>
          <div style={{
            background: "rgba(248,113,113,0.05)",
            border: `1px solid rgba(248,113,113,0.15)`,
            borderRadius: "12px", padding: "16px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>
              Đăng xuất khỏi hệ thống
            </div>
            <div style={{ fontSize: "12px", color: T.muted, marginBottom: "14px" }}>
              Phiên hiện tại sẽ bị kết thúc. Bạn cần đăng nhập lại để tiếp tục.
            </div>
            <button
              onClick={onLogout}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.10)"}
              style={{
                width: "100%", padding: "10px",
                background: "rgba(248,113,113,0.10)",
                border: `1px solid rgba(248,113,113,0.25)`,
                borderRadius: "8px", color: T.danger,
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background .2s",
              }}
            >
              ⏏ Đăng xuất
            </button>
          </div>

        </div>

        {/* ── Panel footer ── */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.border}`,
          display: "flex", gap: "10px",
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "9px", borderRadius: "8px",
            background: "transparent", border: `1px solid ${T.border}`,
            color: T.muted, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
          }}>Đóng</button>
        </div>

      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════════ */
function AdminLayout() {
  const location       = useLocation();
  const navigate       = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  /* Auth guard — Users.Role phải là 'Admin' */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.Role !== "Admin") navigate("/login", { replace: true });
  }, [navigate]);

  const isActive    = (path) => location.pathname === path;

  /* localStorage lưu: { UserID, Username, Role } — đúng với response /login */
  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.Username || "Admin";
  const avatarChar  = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={S.root}>
      <div style={S.noise} aria-hidden="true" />

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.wordmark}>✦ LexiAdmin</div>
          <div style={S.logoSub}>Quản trị hệ thống</div>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          <span style={S.navSectionLabel}>Tổng quan</span>
          {/* Dashboard — tổng hợp từ tất cả bảng */}
          <NavItem to="/admin"            icon="⬡" label="Dashboard"         active={isActive("/admin")} />

          <span style={S.navSectionLabel}>Người dùng</span>
          {/* Bảng: Users */}
          <NavItem to="/admin/users"      icon="◎" label="Users"             active={isActive("/admin/users")} />

          <span style={S.navSectionLabel}>Nội dung</span>
          {/* Bảng: Vocabulary + Pronunciations + Examples */}
          <NavItem to="/admin/vocabulary" icon="◈" label="Vocabulary"        active={isActive("/admin/vocabulary")} />
          {/* Bảng: Categories */}
          <NavItem to="/admin/categories" icon="⊡" label="Categories"        active={isActive("/admin/categories")} />
          {/* Bảng: QuizQuestions + QuizOptions */}
          <NavItem to="/admin/quiz"       icon="◇" label="Quiz Questions"    active={isActive("/admin/quiz")} />

          <span style={S.navSectionLabel}>Theo dõi</span>
          {/* Bảng: LearningProgress + UserLearning */}
          <NavItem to="/admin/progress"   icon="⊛" label="Learning Progress" active={isActive("/admin/progress")} />
          {/* Bảng: FavoriteWords */}
          <NavItem to="/admin/favorites"  icon="♡" label="Favorite Words"    active={isActive("/admin/favorites")} />
        </nav>

        {/* Users.Username + Users.Role */}
        <div style={S.sidebarFooter}>
          <div style={S.adminAvatar}>{avatarChar}</div>
          <div>
            <div style={S.adminName}>{displayName}</div>
            <div style={S.adminRole}>{user?.Role || "Admin"}</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={S.main}>

        <header style={S.topbar}>
          <div style={S.topbarTitle}>
            Lexi<span style={{ color: T.accent }}>Admin</span>
          </div>
          <input style={S.topbarSearch} type="text" placeholder="🔍  Tìm kiếm nhanh…" />
          <div style={S.topbarRight}>
            <button
              title="Cài đặt"
              onClick={() => setShowSettings(v => !v)}
              style={{
                ...S.topbarBtn,
                ...(showSettings ? { borderColor: T.accent, color: T.accent } : {}),
              }}
            >⚙</button>
          </div>
        </header>

        <main style={S.content}>
          <Outlet />
        </main>

        <footer style={S.footer}>
          <span>© 2026 LexiAdmin — EnglishVocabularyDB</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.versionBadge}>v2.4.1</span>
            <span>Cập nhật: 23/03/2026</span>
          </div>
        </footer>
      </div>

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default AdminLayout;