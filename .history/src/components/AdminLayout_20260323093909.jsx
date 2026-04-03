import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

/* ── Google Fonts (DM Serif Display + DM Sans) ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap";
if (!document.head.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

/* ═══════════════════════════════════════════════
   TOKEN MAP  (mirrors CSS variables in the HTML)
═══════════════════════════════════════════════ */
const T = {
  bg:      "#0d0f14",
  surface: "#13161e",
  card:    "#181c26",
  border:  "#252a38",
  accent:  "#6ee7b7",
  accent2: "#38bdf8",
  accent3: "#f472b6",
  gold:    "#fbbf24",
  text:    "#e2e8f0",
  muted:   "#64748b",
  danger:  "#f87171",
  success: "#4ade80",
  warn:    "#fb923c",
  sidebarW: "240px",
};

/* ═══════════════════════════════════════════════
   STYLES  (plain objects – no CSS-in-JS lib needed)
═══════════════════════════════════════════════ */
const S = {
  /* Layout shell */
  root: {
    display: "flex",
    background: T.bg,
    color: T.text,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    minHeight: "100vh",
    position: "relative",
  },

  /* ── Sidebar ── */
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

  sidebarLogo: {
    padding: "28px 24px 20px",
    borderBottom: `1px solid ${T.border}`,
  },
  wordmark: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "22px",
    color: T.accent,
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: "10px",
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginTop: "2px",
  },

  navSectionLabel: {
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: T.muted,
    padding: "20px 24px 8px",
    display: "block",
  },

  navItemBase: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 24px",
    cursor: "pointer",
    color: T.muted,
    textDecoration: "none",
    fontSize: "13.5px",
    fontWeight: 400,
    position: "relative",
    transition: "color .2s, background .2s",
  },
  navItemActive: {
    color: T.accent,
    background: "rgba(110,231,183,0.06)",
  },

  sidebarFooter: {
    marginTop: "auto",
    padding: "16px 24px",
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  adminAvatar: {
    width: "32px", height: "32px",
    background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "13px", color: T.bg,
    flexShrink: 0,
  },
  adminName: { fontSize: "13px", fontWeight: 500 },
  adminRole: {
    fontSize: "10px", color: T.accent,
    textTransform: "uppercase", letterSpacing: "1px",
  },

  /* ── Main column ── */
  main: {
    marginLeft: T.sidebarW,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },

  /* ── Topbar ── */
  topbar: {
    height: "60px",
    background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    padding: "0 32px",
    gap: "16px",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  topbarTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "20px",
    color: T.text,
    whiteSpace: "nowrap",
  },
  topbarSearch: {
    marginLeft: "8px",
    padding: "6px 14px",
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    color: T.text,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    width: "220px",
    outline: "none",
  },
  topbarRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  topbarBtn: {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    width: "36px", height: "36px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    color: T.muted,
    fontSize: "16px",
    transition: "color .2s, border-color .2s",
  },

  /* ── Content area ── */
  content: {
    padding: "32px",
    flex: 1,
  },

  /* ── Footer ── */
  footer: {
    padding: "16px 32px",
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "11px",
    color: T.muted,
    background: T.surface,
  },
  versionBadge: {
    background: "rgba(110,231,183,0.1)",
    color: T.accent,
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    marginRight: "8px",
  },

  /* Noise overlay */
  noise: {
    position: "fixed", inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 999,
  },
};

/* ═══════════════════════════════════════════════
   NAV ITEM
═══════════════════════════════════════════════ */
function NavItem({ to, icon, label, badge, active }) {
  return (
    <Link
      to={to}
      style={{
        ...S.navItemBase,
        ...(active ? S.navItemActive : {}),
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "2px",
            background: T.accent,
            boxShadow: `0 0 12px ${T.accent}`,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}

      <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>
        {icon}
      </span>

      {label}

      {badge && (
        <span
          style={{
            marginLeft: "auto",
            background: T.accent,
            color: T.bg,
            fontSize: "10px",
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: "20px",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════════ */
function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  /* Auth guard */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.Role !== "Admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const isActive = (path) => location.pathname === path;

  /* Get display name from localStorage */
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.Username || user?.username || "Admin";
  const avatarChar  = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={S.root}>
      {/* Noise texture overlay */}
      <div style={S.noise} aria-hidden="true" />

      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside style={S.sidebar}>

        {/* Logo */}
        <div style={S.sidebarLogo}>
          <div style={S.wordmark}>✦ LexiAdmin</div>
          <div style={S.logoSub}>Quản trị hệ thống</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto" }}>
          <span style={S.navSectionLabel}>Tổng quan</span>
          <NavItem
            to="/admin"
            icon="⬡"
            label="Dashboard"
            active={isActive("/admin")}
          />

          <span style={S.navSectionLabel}>Người dùng</span>
          <NavItem
            to="/admin/users"
            icon="◎"
            label="Users"
            badge="142"
            active={isActive("/admin/users")}
          />

          <span style={S.navSectionLabel}>Nội dung</span>
          <NavItem
            to="/admin/vocabulary"
            icon="◈"
            label="Vocabulary"
            active={isActive("/admin/vocabulary")}
          />
          <NavItem
            to="/admin/categories"
            icon="⊡"
            label="Categories"
            active={isActive("/admin/categories")}
          />
          <NavItem
            to="/admin/quiz"
            icon="◇"
            label="Quiz Questions"
            active={isActive("/admin/quiz")}
          />

          <span style={S.navSectionLabel}>Theo dõi</span>
          <NavItem
            to="/admin/progress"
            icon="⊛"
            label="Learning Progress"
            active={isActive("/admin/progress")}
          />
          <NavItem
            to="/admin/favorites"
            icon="♡"
            label="Favorite Words"
            active={isActive("/admin/favorites")}
          />
        </nav>

        {/* Sidebar footer – Admin info */}
        <div style={S.sidebarFooter}>
          <div style={S.adminAvatar}>{avatarChar}</div>
          <div>
            <div style={S.adminName}>{displayName}</div>
            <div style={S.adminRole}>Super Admin</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────── */}
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
            <button style={S.topbarBtn} title="Thông báo">🔔</button>
            <button style={S.topbarBtn} title="Cài đặt">⚙</button>
            <button
              style={{ ...S.topbarBtn, color: T.danger }}
              title="Đăng xuất"
              onClick={handleLogout}
            >
              ⏏
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={S.content}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={S.footer}>
          <span>© 2026 LexiAdmin — Hệ thống quản trị học từ vựng</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.versionBadge}>v2.4.1</span>
            <span>Cập nhật: 23/03/2026</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default AdminLayout;