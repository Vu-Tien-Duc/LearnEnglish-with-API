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
  gold:     "#fbbf24",
  text:     "#e2e8f0",
  muted:    "#64748b",
  danger:   "#f87171",
  success:  "#4ade80",
  warn:     "#fb923c",
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
    transition: "color .2s, border-color .2s", position: "relative",
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
function NavItem({ to, icon, label, badge, active }) {
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
      {badge && (
        <span style={{
          marginLeft: "auto", background: T.accent, color: T.bg,
          fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "20px",
        }}>{badge}</span>
      )}
    </Link>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS SLIDE-IN PANEL
═══════════════════════════════════════════════ */
function SettingsPanel({ open, onClose, user, onLogout }) {
  const [form, setForm] = useState({
    username:   user?.Username || user?.username || "Admin",
    email:      user?.Email    || user?.email    || "admin@lexi.vn",
    password:   "",
    confirm:    "",
    theme:      "dark",
    font:       "DM Sans",
    lang:       "vi",
    timezone:   "Asia/Ho_Chi_Minh",
    notifUser:  true,
    notifQuiz:  true,
    notifVocab: false,
    notifSys:   true,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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

  /* Toggle switch */
  const Toggle = ({ checked, onChange, label, sub }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>{sub}</div>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: "38px", height: "22px", borderRadius: "11px",
          background: checked ? T.accent : T.border,
          position: "relative", cursor: "pointer",
          transition: "background .2s", flexShrink: 0, marginLeft: "12px",
        }}
      >
        <div style={{
          position: "absolute", top: "3px",
          left: checked ? "19px" : "3px",
          width: "16px", height: "16px", borderRadius: "50%",
          background: checked ? T.bg : T.muted,
          transition: "left .2s",
        }} />
      </div>
    </div>
  );

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

        {/* ── Panel header ── */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Cài đặt</div>
            <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>
              Tuỳ chỉnh tài khoản &amp; hệ thống
            </div>
          </div>
          <button onClick={onClose} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: "8px", width: "32px", height: "32px",
            cursor: "pointer", color: T.muted, fontSize: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Admin profile card */}
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
              {(user?.Username || user?.username || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{user?.Username || user?.username || "Admin"}</div>
              <div style={{ fontSize: "12px", color: T.muted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.Email || user?.email || "admin@lexi.vn"}
              </div>
            </div>
            <span style={{
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px",
              background: "rgba(110,231,183,0.1)", color: T.accent,
              padding: "3px 8px", borderRadius: "20px", flexShrink: 0,
            }}>Super Admin</span>
          </div>

          {/* ① Thông tin tài khoản */}
          <div style={secTitle}>👤 Thông tin tài khoản</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelSt}>Tên hiển thị</label>
              <input style={inputSt} value={form.username} onChange={e => set("username", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Email</label>
              <input style={inputSt} value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelSt}>Mật khẩu mới</label>
              <input style={inputSt} type="password" placeholder="••••••••"
                value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Xác nhận mật khẩu</label>
              <input style={inputSt} type="password" placeholder="••••••••"
                value={form.confirm} onChange={e => set("confirm", e.target.value)} />
            </div>
          </div>

          <div style={divider} />

          {/* ② Giao diện */}
          <div style={secTitle}>🎨 Giao diện</div>
          <div style={{ marginBottom: "12px" }}>
            <label style={labelSt}>Theme</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["dark", "darker", "midnight"].map(th => (
                <div
                  key={th}
                  onClick={() => set("theme", th)}
                  style={{
                    flex: 1, padding: "8px", textAlign: "center",
                    borderRadius: "8px", cursor: "pointer", fontSize: "12px",
                    border: `1px solid ${form.theme === th ? T.accent : T.border}`,
                    color: form.theme === th ? T.accent : T.muted,
                    background: form.theme === th ? "rgba(110,231,183,0.06)" : "transparent",
                    transition: "all .15s", textTransform: "capitalize",
                  }}
                >{th}</div>
              ))}
            </div>
          </div>
          <div>
            <label style={labelSt}>Font chữ</label>
            <select style={{ ...inputSt, cursor: "pointer" }}
              value={form.font} onChange={e => set("font", e.target.value)}>
              <option>DM Sans</option>
              <option>Inter</option>
              <option>Geist</option>
              <option>IBM Plex Sans</option>
            </select>
          </div>

          <div style={divider} />

          {/* ③ Hệ thống */}
          <div style={secTitle}>🖥 Hệ thống</div>
          <div style={{ marginBottom: "12px" }}>
            <label style={labelSt}>Ngôn ngữ giao diện</label>
            <select style={{ ...inputSt, cursor: "pointer" }}
              value={form.lang} onChange={e => set("lang", e.target.value)}>
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelSt}>Múi giờ</label>
            <select style={{ ...inputSt, cursor: "pointer" }}
              value={form.timezone} onChange={e => set("timezone", e.target.value)}>
              <option value="Asia/Ho_Chi_Minh">UTC+7 — Hồ Chí Minh</option>
              <option value="Asia/Bangkok">UTC+7 — Bangkok</option>
              <option value="Asia/Singapore">UTC+8 — Singapore</option>
            </select>
          </div>

          {/* System info card */}
          <div style={{
            background: T.card, borderRadius: "10px", border: `1px solid ${T.border}`,
            padding: "14px 16px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
          }}>
            {[
              ["Phiên bản", "v2.4.1"],
              ["Môi trường", "Production"],
              ["Database", "PostgreSQL 16"],
              ["Cập nhật", "23/03/2026"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{k}</div>
                <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "3px" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={divider} />

          {/* ④ Thông báo */}
          <div style={secTitle}>🔔 Loại thông báo nhận</div>
          <Toggle checked={form.notifUser}  onChange={v => set("notifUser",  v)} label="User mới đăng ký"       sub="Nhận thông báo khi có tài khoản mới" />
          <Toggle checked={form.notifQuiz}  onChange={v => set("notifQuiz",  v)} label="Quiz hoàn thành"         sub="Khi user submit kết quả quiz" />
          <Toggle checked={form.notifVocab} onChange={v => set("notifVocab", v)} label="Từ vựng mới được thêm"  sub="Thông báo khi từ mới được tạo" />
          <Toggle checked={form.notifSys}   onChange={v => set("notifSys",   v)} label="Hoạt động hệ thống"     sub="Backup, deploy, lỗi hệ thống" />

          <div style={divider} />

          {/* ⑤ Đăng xuất */}
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
              style={{
                width: "100%", padding: "10px",
                background: "rgba(248,113,113,0.1)",
                border: `1px solid rgba(248,113,113,0.25)`,
                borderRadius: "8px",
                color: T.danger, fontWeight: 600, fontSize: "13px",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background .2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.10)"}
            >
              ⏏ Đăng xuất
            </button>
          </div>

        </div>

        {/* ── Panel footer – Save / Cancel ── */}
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
═══════════════════════════════════════════════ */
function AdminLayout() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  /* Auth guard */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.Role !== "Admin") navigate("/login", { replace: true });
  }, [navigate]);

  const isActive    = (path) => location.pathname === path;
  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.Username || user?.username || "Admin";
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
          <NavItem to="/admin"            icon="⬡" label="Dashboard"          active={isActive("/admin")} />

          <span style={S.navSectionLabel}>Người dùng</span>
          <NavItem to="/admin/users"      icon="◎" label="Users"              badge="142" active={isActive("/admin/users")} />

          <span style={S.navSectionLabel}>Nội dung</span>
          <NavItem to="/admin/vocabulary" icon="◈" label="Vocabulary"         active={isActive("/admin/vocabulary")} />
          <NavItem to="/admin/categories" icon="⊡" label="Categories"         active={isActive("/admin/categories")} />
          <NavItem to="/admin/quiz"       icon="◇" label="Quiz Questions"     active={isActive("/admin/quiz")} />

          <span style={S.navSectionLabel}>Theo dõi</span>
          <NavItem to="/admin/progress"   icon="⊛" label="Learning Progress"  active={isActive("/admin/progress")} />
          <NavItem to="/admin/favorites"  icon="♡" label="Favorite Words"     active={isActive("/admin/favorites")} />
        </nav>

        <div style={S.sidebarFooter}>
          <div style={S.adminAvatar}>{avatarChar}</div>
          <div>
            <div style={S.adminName}>{displayName}</div>
            <div style={S.adminRole}>Super Admin</div>
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

          <input style={S.topbarSearch} type="text" placeholder="🔍  Tìm kiếm nhanh…" />

          <div style={S.topbarRight}>
            {/* ⚙ Settings – only button remaining */}
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

      {/* ⚙ Settings slide-in panel */}
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