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
  accent3:  "#f472b6",
  gold:     "#fbbf24",
  text:     "#e2e8f0",
  muted:    "#64748b",
  danger:   "#f87171",
  success:  "#4ade80",
  sidebarW: "248px",
};

/* ═══════════════ INJECT GLOBAL CSS ═══════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:${T.bg}}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:${T.muted}}

.nav-link{
  display:flex;align-items:center;gap:10px;
  padding:9px 20px;cursor:pointer;color:${T.muted};
  text-decoration:none;font-size:13px;font-weight:400;
  position:relative;transition:color .18s,background .18s;
  border-radius:8px;margin:1px 8px;
}
.nav-link:hover{color:${T.text};background:rgba(255,255,255,0.04)}
.nav-link.active{color:${T.accent};background:rgba(110,231,183,0.07);font-weight:500}
.nav-link.active::before{
  content:'';position:absolute;left:-8px;top:50%;transform:translateY(-50%);
  width:3px;height:18px;background:${T.accent};
  border-radius:0 3px 3px 0;box-shadow:0 0 10px ${T.accent}80;
}

.top-btn{
  background:${T.card};border:1px solid ${T.border};
  border-radius:8px;width:36px;height:36px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:${T.muted};font-size:15px;
  transition:color .18s,border-color .18s,background .18s;
}
.top-btn:hover{color:${T.accent};border-color:${T.accent}60;background:rgba(110,231,183,0.06)}
.top-btn.active{color:${T.accent};border-color:${T.accent};background:rgba(110,231,183,0.08)}

.settings-slide{
  position:fixed;top:0;right:0;bottom:0;width:380px;
  background:${T.surface};border-left:1px solid ${T.border};
  z-index:300;display:flex;flex-direction:column;
  box-shadow:-16px 0 48px rgba(0,0,0,.45);
  transition:transform .28s cubic-bezier(.4,0,.2,1);
}
.settings-slide.open{transform:translateX(0)}
.settings-slide.closed{transform:translateX(100%)}

.lex-input{
  width:100%;padding:9px 13px;
  background:${T.bg};border:1px solid ${T.border};border-radius:8px;
  color:${T.text};font-family:'DM Sans',sans-serif;font-size:13px;outline:none;
  transition:border-color .2s,box-shadow .2s;
}
.lex-input:focus{border-color:${T.accent};box-shadow:0 0 0 3px rgba(110,231,183,.1)}
.lex-input.err{border-color:${T.danger}}

.settings-tab{
  background:none;border:none;cursor:pointer;
  padding:11px 14px;font-size:12.5px;font-family:'DM Sans',sans-serif;
  color:${T.muted};border-bottom:2px solid transparent;
  transition:all .15s;display:flex;align-items:center;gap:6px;
}
.settings-tab:hover{color:${T.text}}
.settings-tab.active{color:${T.accent};border-bottom-color:${T.accent};font-weight:600}

.sect-lbl{
  font-size:9px;text-transform:uppercase;letter-spacing:2px;
  color:${T.muted};padding:18px 20px 7px;display:block;opacity:.7;
}

@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.page-in{animation:fadeUp .22s ease}

@keyframes noiseAnim{0%{transform:translate(0,0)}25%{transform:translate(-1%,-1%)}50%{transform:translate(1%,0)}75%{transform:translate(0,1%)}100%{transform:translate(-1%,0)}}
`;
if (!document.getElementById("lea-css")) {
  const s = document.createElement("style");
  s.id = "lea-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ═══════════════ ROUTE META ═══════════════ */
const ROUTES = {
  "/admin":            { label: "Dashboard",         icon: "⬡" },
  "/admin/users":      { label: "Users",             icon: "◎" },
  "/admin/vocabulary": { label: "Vocabulary",        icon: "◈" },
  "/admin/categories": { label: "Categories",        icon: "⊡" },
  "/admin/lessons":    { label: "Lessons",           icon: "▣" },
  "/admin/quiz":       { label: "Quiz Questions",    icon: "◇" },
  "/admin/progress":   { label: "Learning Progress", icon: "⊛" },
  "/admin/favorites":  { label: "Favorites",         icon: "♡" },
};

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/admin", icon: "⬡", label: "Dashboard" }],
  },
  {
    label: "Users",
    items: [{ to: "/admin/users", icon: "◎", label: "Users" }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/vocabulary", icon: "◈", label: "Vocabulary" },
      { to: "/admin/categories", icon: "⊡", label: "Categories" },
      { to: "/admin/lessons",    icon: "▣", label: "Lessons" },
      { to: "/admin/quiz",       icon: "◇", label: "Quiz Questions" },
    ],
  },
  {
    label: "Tracking",
    items: [
      { to: "/admin/progress",  icon: "⊛", label: "Learning Progress" },
      { to: "/admin/favorites", icon: "♡", label: "Favorites" },
    ],
  },
];

/* ═══════════════ NAV ITEM ═══════════════ */
function NavItem({ to, icon, label, active }) {
  return (
    <Link to={to} className={`nav-link${active ? " active" : ""}`}>
      <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {active && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: T.accent, boxShadow: `0 0 6px ${T.accent}`,
        }} />
      )}
    </Link>
  );
}

/* ═══════════════ SETTINGS PANEL ═══════════════ */
function SettingsPanel({ open, onClose, user, onLogout }) {
  const [tab, setTab]     = useState("account");
  const [old, setOld]     = useState("");
  const [nw,  setNw]      = useState("");
  const [cf,  setCf]      = useState("");
  const [st,  setSt]      = useState("idle");   // idle | loading | success | error
  const [msg, setMsg]     = useState("");

  useEffect(() => {
    if (!open) { setOld(""); setNw(""); setCf(""); setSt("idle"); setMsg(""); setTab("account"); }
  }, [open]);

  const changePw = async () => {
    setMsg("");
    if (!old || !nw || !cf)   { setSt("error"); setMsg("Vui lòng điền đầy đủ các trường."); return; }
    if (nw.length < 6)         { setSt("error"); setMsg("Mật khẩu mới phải ≥ 6 ký tự."); return; }
    if (nw !== cf)             { setSt("error"); setMsg("Xác nhận mật khẩu không khớp."); return; }
    if (nw === old)            { setSt("error"); setMsg("Mật khẩu mới phải khác mật khẩu cũ."); return; }
    setSt("loading");
    try {
      const res  = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: user?.UserID, OldPassword: old, NewPassword: nw }),
      });
      const data = await res.json();
      if (!res.ok) { setSt("error"); setMsg(data.error || "Đổi mật khẩu thất bại."); }
      else         { setSt("success"); setMsg("Đổi mật khẩu thành công!"); setOld(""); setNw(""); setCf(""); }
    } catch { setSt("error"); setMsg("Không thể kết nối server."); }
  };

  const avatarCh = (user?.Username || "A").charAt(0).toUpperCase();
  const TABS = [
    { id: "account",  label: "Tài khoản", icon: "◎" },
    { id: "security", label: "Bảo mật",   icon: "🔑" },
    { id: "session",  label: "Phiên",     icon: "⏏" },
  ];

  const LabelSt = { fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: T.muted, display: "block", marginBottom: 6, fontWeight: 600 };
  const SectionTitle = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.accent, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 };
  const Divider = { borderTop: `1px solid ${T.border}`, margin: "20px 0" };

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 299, backdropFilter: "blur(2px)" }} />
      )}
      <div className={`settings-slide ${open ? "open" : "closed"}`}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, color: T.text }}>Cài đặt</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Quản lý tài khoản admin</div>
          </div>
          <button onClick={onClose} className="top-btn" style={{ fontSize: 13 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, padding: "0 12px", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} className={`settings-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>

          {/* ── ACCOUNT ── */}
          {tab === "account" && (
            <div>
              {/* Profile card */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, marginBottom: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: T.bg, fontFamily: "'DM Serif Display',serif" }}>
                  {avatarCh}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.Username || "—"}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>ID: #{user?.UserID || "—"}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", background: "rgba(110,231,183,.1)", color: T.accent, padding: "3px 9px", borderRadius: 20, flexShrink: 0 }}>
                  {user?.Role || "Admin"}
                </span>
              </div>

              {[
                { label: "Username", value: user?.Username || "—" },
                { label: "Role",     value: user?.Role || "Admin" },
                { label: "User ID",  value: `#${user?.UserID || "—"}` },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.muted }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab === "security" && (
            <div>
              <div style={SectionTitle}>🔑 Đổi mật khẩu</div>
              {[
                { label: "Mật khẩu hiện tại", val: old, set: setOld },
                { label: "Mật khẩu mới",      val: nw,  set: setNw },
                { label: "Xác nhận mật khẩu", val: cf,  set: setCf },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 12 }}>
                  <label style={LabelSt}>{f.label}</label>
                  <input className={`lex-input${st === "error" ? " err" : ""}`} type="password" placeholder="••••••••"
                    value={f.val} onChange={e => { f.set(e.target.value); setSt("idle"); setMsg(""); }} />
                </div>
              ))}

              {msg && (
                <div style={{ padding: "10px 13px", borderRadius: 8, fontSize: 12, marginBottom: 12,
                  background: st === "success" ? "rgba(74,222,128,.08)" : "rgba(248,113,113,.08)",
                  border: `1px solid ${st === "success" ? "rgba(74,222,128,.2)" : "rgba(248,113,113,.2)"}`,
                  color: st === "success" ? T.success : T.danger, display: "flex", gap: 7 }}>
                  <span>{st === "success" ? "✓" : "✕"}</span>{msg}
                </div>
              )}

              <button onClick={changePw} disabled={st === "loading"} style={{
                width: "100%", padding: "10px", borderRadius: 8, border: "none",
                background: st === "loading" ? "rgba(110,231,183,.5)" : T.accent,
                color: T.bg, fontWeight: 700, fontSize: 13,
                cursor: st === "loading" ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: st === "loading" ? "none" : `0 0 18px rgba(110,231,183,.25)`,
                transition: "all .2s",
              }}>
                {st === "loading" ? "Đang xử lý…" : "🔑 Xác nhận đổi mật khẩu"}
              </button>
            </div>
          )}

          {/* ── SESSION ── */}
          {tab === "session" && (
            <div>
              <div style={SectionTitle}>🔐 Phiên đăng nhập</div>
              {[
                { label: "Đăng nhập với",     value: user?.Username || "—" },
                { label: "Role",              value: user?.Role || "Admin" },
                { label: "Trạng thái phiên",  value: "Đang hoạt động" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.muted }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.label === "Trạng thái phiên" ? T.success : T.text }}>{r.value}</span>
                </div>
              ))}

              <div style={{ ...Divider }} />

              <div style={{ background: "rgba(248,113,113,.05)", border: "1px solid rgba(248,113,113,.15)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Đăng xuất khỏi hệ thống</div>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 14, lineHeight: 1.6 }}>
                  Phiên hiện tại sẽ bị kết thúc. Bạn cần đăng nhập lại để tiếp tục.
                </div>
                <button onClick={onLogout}
                  style={{ width: "100%", padding: "10px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 8, color: T.danger, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "background .18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,.1)"}
                >⏏ Đăng xuất</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: "100%", padding: 9, borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, color: T.muted, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.muted; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >Đóng</button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════ SIDEBAR LIVE STATS ═══════════════ */
function SidebarStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/dashboard/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const items = [
    { label: "Users",  value: stats?.total_users,      color: T.accent2 },
    { label: "Words",  value: stats?.total_vocab,      color: T.accent },
    { label: "Quiz",   value: stats?.total_quiz,       color: T.gold },
  ];

  return (
    <div style={{ margin: "8px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: T.muted, marginBottom: 10, opacity: 0.7 }}>
        Live Stats
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {items.map(it => (
          <div key={it.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 17, color: it.color, lineHeight: 1 }}>
              {it.value != null ? it.value.toLocaleString() : "—"}
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ ADMIN LAYOUT ═══════════════ */
export default function AdminLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.Role !== "Admin") navigate("/login", { replace: true });
  }, [navigate]);

  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.Username || "Admin";
  const avatarChar  = displayName.charAt(0).toUpperCase();
  const isActive    = p => location.pathname === p;
  const current     = ROUTES[location.pathname] || { label: "Page", icon: "·" };

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  return (
    <div style={{ display: "flex", background: T.bg, color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, minHeight: "100vh" }}>

      {/* ── Noise overlay ── */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 999, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
      }} />

      {/* ════════════ SIDEBAR ════════════ */}
      <aside style={{
        width: T.sidebarW, background: T.surface,
        borderRight: `1px solid ${T.border}`,
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: T.accent, letterSpacing: "-0.3px" }}>
            ✦ LearnEnglish<em style={{ fontStyle: "italic", color: T.text, opacity: 0.9 }}>Admin</em>
          </div>
          <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "2px", marginTop: 3, opacity: 0.7 }}>
            Quản trị hệ thống
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingBottom: 8, paddingTop: 6 }}>
          {NAV_GROUPS.map(g => (
            <div key={g.label}>
              <span className="sect-lbl">{g.label}</span>
              {g.items.map(it => <NavItem key={it.to} {...it} active={isActive(it.to)} />)}
            </div>
          ))}
        </nav>

        {/* Live stats widget */}
        <SidebarStats />

        {/* User footer */}
        <div style={{ padding: "13px 16px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 15, color: T.bg,
          }}>{avatarChar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
            <div style={{ fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{user?.Role || "Admin"}</div>
          </div>
          <button
            className="top-btn" style={{ width: 30, height: 30, fontSize: 13, border: "none", background: "transparent" }}
            onClick={() => setShowSettings(v => !v)} title="Cài đặt"
          >⚙</button>
        </div>
      </aside>

      {/* ════════════ MAIN ════════════ */}
      <div style={{ marginLeft: T.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Topbar ── */}
        <header style={{
          height: 58, background: T.surface, borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: 14,
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 0 rgba(255,255,255,0.03)",
        }}>
          {/* Page title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, opacity: 0.6 }}>{current.icon}</span>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: T.text }}>
              {current.label}
            </span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Divider */}
            <div style={{ width: 1, height: 22, background: T.border, marginRight: 2 }} />

            {/* Settings button */}
            <button className={`top-btn${showSettings ? " active" : ""}`} onClick={() => setShowSettings(v => !v)} title="Cài đặt">
              ⚙
            </button>

            {/* Avatar */}
            <div
              onClick={() => setShowSettings(v => !v)}
              style={{
                width: 34, height: 34, borderRadius: 9, cursor: "pointer", flexShrink: 0,
                background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, color: T.bg,
                border: `2px solid ${showSettings ? T.accent : "transparent"}`,
                boxShadow: showSettings ? `0 0 0 3px rgba(110,231,183,.15)` : "none",
                transition: "all .18s",
              }}
              title={displayName}
            >{avatarChar}</div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="page-in" style={{ flex: 1, padding: "28px" }}>
          <Outlet />
        </main>
      </div>

      {/* ── Settings Panel ── */}
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}