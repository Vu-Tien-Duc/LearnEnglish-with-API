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
  sidebarW: "240px",
};

/* ═══════════════ STYLES ═══════════════ */
const S = {
  root: {
    display: "flex",
    background: T.bg,
    color: T.text,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    minHeight: "100vh",
    position: "relative",
  },
  sidebar: {
    width: T.sidebarW,
    background: T.surface,
    borderRight: `1px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
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
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "13px", color: T.bg, flexShrink: 0,
  },
  adminName:  { fontSize: "13px", fontWeight: 500 },
  adminRole:  { fontSize: "10px", color: T.accent, textTransform: "uppercase", letterSpacing: "1px" },
  main:       { marginLeft: T.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
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
  topbarRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" },
  topbarBtn: {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: "8px", width: "36px", height: "36px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: T.muted, fontSize: "16px",
    transition: "color .2s, border-color .2s",
  },
  content: { padding: "32px", flex: 1 },
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
   SETTINGS SLIDE-IN PANEL
   Fields mapped to DB:
     Users: Username, PasswordHash, Email, Role
   (no extra fields beyond what the schema stores)
═══════════════════════════════════════════════ */
function SettingsPanel({ open, onClose, user, onLogout }) {
  // Users table: Username, Email, PasswordHash (write-only), Role
  const [username, setUsername]   = useState(user?.Username || "");
  const [email,    setEmail]      = useState(user?.Email    || "");
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");

  const inputSt = {
    width: "100%", padding: "8px 12px",
    background: T.bg, border: `1px solid ${T.border}`,
    borderRadius: "8px", color: T.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
    outline: "none", boxSizing: "border-box",
  };
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
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 149 }}
        />
      )}

      {/* Slide panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "380px",
        background: T.surface, borderLeft: `1px solid ${T.border}`,
        zIndex: 150,
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
        boxShadow: open ? "-20px 0 60px rgba(0,0,0,.4)" : "none",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Cài đặt</div>
            <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>
              Tuỳ chỉnh tài khoản Admin
            </div>
          </div>
          <button onClick={onClose} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: "8px", width: "32px", height: "32px",
            cursor: "pointer", color: T.muted, fontSize: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Profile card — Users: Username, Email, Role */}
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
              {/* Users.Email */}
              <div style={{ fontSize: "12px", color: T.muted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.Email || "—"}
              </div>
            </div>
            {/* Users.Role */}
            <span style={{
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px",
              background: "rgba(110,231,183,0.1)", color: T.accent,
              padding: "3px 8px", borderRadius: "20px", flexShrink: 0,
            }}>{user?.Role || "Admin"}</span>
          </div>

          {/* ── Thông tin tài khoản ──
               Maps to Users: Username, Email, PasswordHash
               (CreatedDate, UserID, Role are read-only / server-managed) */}
          <div style={secTitle}>👤 Thông tin tài khoản</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              {/* Users.Username */}
              <label style={labelSt}>Username</label>
              <input
                style={inputSt}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div>
              {/* Users.Email */}
              <label style={labelSt}>Email</label>
              <input
                style={inputSt}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              {/* Users.PasswordHash — nhập để đổi mật khẩu */}
              <label style={labelSt}>Mật khẩu mới</label>
              <input
                style={inputSt}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label style={labelSt}>Xác nhận mật khẩu</label>
              <input
                style={inputSt}
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
          </div>

          {/* Thông tin chỉ đọc từ DB */}
          <div style={{
            marginTop: "16px",
            background: T.card, borderRadius: "10px", border: `1px solid ${T.border}`,
            padding: "14px 16px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
          }}>
            <div>
              {/* Users.Role */}
              <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Role</div>
              <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "3px", color: T.accent }}>{user?.Role || "Admin"}</div>
            </div>
            <div>
              {/* Users.CreatedDate */}
              <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Ngày tạo</div>
              <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "3px" }}>
                {user?.CreatedDate
                  ? new Date(user.CreatedDate).toLocaleDateString("vi-VN")
                  : "—"}
              </div>
            </div>
            <div>
              {/* Users.UserID */}
              <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "1px" }}>User ID</div>
              <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "3px" }}>#{user?.UserID || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Môi trường</div>
              <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "3px" }}>Production</div>
            </div>
          </div>

          <div style={divider} />

          {/* ── Đăng xuất ── */}
          <div style={secTitle}>🔐 Phiên đăng nhập</div>
          <div style={{
            background: "rgba(248,113,113,0.05)",
            border: `1px solid rgba(248,113,113,0.15)`,
            borderRadius: "12px",
            padding: "16px",
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
                borderRadius: "8px",
                color: T.danger, fontWeight: 600, fontSize: "13px",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background .2s",
              }}
            >
              ⏏ Đăng xuất
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.border}`,
          display: "flex", gap: "10px",
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "9px", borderRadius: "8px",
            background: "transparent", border: `1px solid ${T.border}`,
            color: T.muted, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
          }}>Huỷ</button>
          <button onClick={onClose} style={{
            flex: 2, padding: "9px", borderRadius: "8px",
            background: T.accent, border: "none",
            color: T.bg, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            boxShadow: `0 0 20px rgba(110,231,183,.25)`,
          }}>💾 Lưu thay đổi</button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN LAYOUT
   Nav sections map to actual DB tables:
     Users            → /admin/users
     Vocabulary       → /admin/vocabulary
     Categories       → /admin/categories
     QuizQuestions    → /admin/quiz
     LearningProgress → /admin/progress
     FavoriteWords    → /admin/favorites
═══════════════════════════════════════════════ */
function AdminLayout() {
  const location       = useLocation();
  const navigate       = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  /* Auth guard — Users.Role must be 'Admin' */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.Role !== "Admin") navigate("/login", { replace: true });
  }, [navigate]);

  const isActive = (path) => location.pathname === path;

  /* user object stored at login: { UserID, Username, Email, Role, CreatedDate } */
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

        {/* Topbar */}
        <header style={S.topbar}>
          <div style={S.topbarTitle}>
            Lexi<span style={{ color: T.accent }}>Admin</span>
          </div>

          <input
            style={S.topbarSearch}
            type="text"
            placeholder="🔍  Tìm kiếm nhanh…"
          />

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

        {/* Page content — child routes render here */}
        <main style={S.content}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={S.footer}>
          <span>© 2026 LexiAdmin — EnglishVocabularyDB</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.versionBadge}>v2.4.1</span>
            <span>Cập nhật: 23/03/2026</span>
          </div>
        </footer>
      </div>

      {/* Settings slide-in — chỉ edit Users table */}
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