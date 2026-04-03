import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

/* ══════════════════════════════════════════════
   GOOGLE FONTS — Playfair Display + Plus Jakarta Sans
══════════════════════════════════════════════ */
const injectFonts = () => {
  const href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
  if (!document.head.querySelector(`link[href="${href}"]`)) {
    const el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = href;
    document.head.appendChild(el);
  }
};
injectFonts();

/* ══════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════ */
const T = {
  // Backgrounds
  bg:        "#F7F5F0",       // warm off-white — like a page
  surface:   "#FFFFFF",
  card:      "#FEFEFE",
  sidebar:   "#1C1917",       // rich warm black
  sidebarSurface: "#28231F",

  // Accent palette
  ink:       "#1C1917",       // near-black for headings
  sage:      "#4A7C59",       // primary — forest green (learning growth)
  sageLight: "#E8F0EB",
  sageMid:   "#739E82",
  gold:      "#B5850A",       // secondary — dictionary gold
  goldLight: "#FDF3D0",
  coral:     "#D05A3E",       // danger / highlights
  coralLight:"#FBE9E4",
  sky:       "#3A7BD5",       // info
  skyLight:  "#E5EEFA",

  // Text
  text:      "#2C2C2C",
  muted:     "#7A7269",
  faint:     "#BAB4A9",

  // Borders
  border:    "#E5E0D8",
  borderDark:"#D4CEC5",

  sidebarW:  "264px",
};

/* ══════════════════════════════════════════════
   GLOBAL STYLES (injected once)
══════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --font-serif: 'Playfair Display', Georgia, serif;
    --font-sans:  'Plus Jakarta Sans', system-ui, sans-serif;
    --sage: ${T.sage};
    --gold: ${T.gold};
  }

  body {
    font-family: var(--font-sans);
    background: ${T.bg};
    color: ${T.text};
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.faint}; }

  /* ── Nav link hover ── */
  .lex-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 20px; border-radius: 10px; margin: 1px 12px;
    text-decoration: none; font-size: 13.5px; font-weight: 500;
    color: ${T.faint}; cursor: pointer;
    transition: background 0.18s, color 0.18s;
    position: relative;
  }
  .lex-nav-link:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.85);
  }
  .lex-nav-link.active {
    background: rgba(255,255,255,0.1);
    color: #FFFFFF;
  }
  .lex-nav-link.active::before {
    content: '';
    position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 20px;
    background: ${T.sage};
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px ${T.sage}80;
  }

  /* ── Top search ── */
  .lex-search {
    flex: 1; max-width: 360px;
    padding: 9px 14px 9px 38px;
    background: ${T.bg};
    border: 1.5px solid ${T.border};
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 13.5px; color: ${T.text};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lex-search:focus {
    border-color: ${T.sage};
    box-shadow: 0 0 0 3px ${T.sageLight};
  }
  .lex-search::placeholder { color: ${T.faint}; }

  /* ── Card hover ── */
  .lex-card-hover {
    transition: box-shadow 0.2s, transform 0.18s;
  }
  .lex-card-hover:hover {
    box-shadow: 0 4px 20px rgba(28,25,23,0.09);
    transform: translateY(-1px);
  }

  /* ── Settings panel slide ── */
  .settings-panel {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 400px;
    background: ${T.surface};
    border-left: 1.5px solid ${T.border};
    z-index: 300;
    display: flex; flex-direction: column;
    box-shadow: -12px 0 40px rgba(28,25,23,0.1);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .settings-panel.hidden { transform: translateX(100%); }
  .settings-panel.visible { transform: translateX(0); }

  /* ── Topbar btn ── */
  .lex-topbar-btn {
    width: 38px; height: 38px;
    border-radius: 10px;
    border: 1.5px solid ${T.border};
    background: ${T.surface};
    color: ${T.muted};
    cursor: pointer; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
  }
  .lex-topbar-btn:hover { border-color: ${T.sageMid}; color: ${T.sage}; background: ${T.sageLight}; }
  .lex-topbar-btn.active { border-color: ${T.sage}; color: ${T.sage}; background: ${T.sageLight}; }

  /* ── Form inputs in settings ── */
  .lex-input {
    width: 100%;
    padding: 10px 14px;
    background: ${T.bg};
    border: 1.5px solid ${T.border};
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 13.5px; color: ${T.text};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lex-input:focus {
    border-color: ${T.sage};
    box-shadow: 0 0 0 3px ${T.sageLight};
  }
  .lex-input.error { border-color: ${T.coral}; }

  /* ── Animated badge ── */
  @keyframes badge-pop {
    0%  { transform: scale(0.7); opacity: 0; }
    60% { transform: scale(1.15); }
    100%{ transform: scale(1);   opacity: 1; }
  }
  .badge-pop { animation: badge-pop 0.3s ease forwards; }

  /* ── Page transition ── */
  @keyframes page-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-animate { animation: page-in 0.25s ease; }
`;

function injectStyles() {
  if (document.getElementById("lexi-admin-css")) return;
  const s = document.createElement("style");
  s.id = "lexi-admin-css";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}
injectStyles();

/* ══════════════════════════════════════════════
   NAV STRUCTURE
══════════════════════════════════════════════ */
const NAV = [
  {
    section: "Overview",
    items: [
      { to: "/admin",            icon: "⬡", label: "Dashboard",         hint: "Tổng quan hệ thống" },
    ],
  },
  {
    section: "Users",
    items: [
      { to: "/admin/users",      icon: "◎", label: "Users",             hint: "Quản lý tài khoản" },
    ],
  },
  {
    section: "Content",
    items: [
      { to: "/admin/vocabulary", icon: "◈", label: "Vocabulary",        hint: "Từ vựng & phát âm" },
      { to: "/admin/categories", icon: "⊡", label: "Categories",        hint: "Chủ đề học" },
      { to: "/admin/lessons",    icon: "▣", label: "Lessons",           hint: "Bài học" },
      { to: "/admin/quiz",       icon: "◇", label: "Quiz Questions",    hint: "Câu hỏi kiểm tra" },
    ],
  },
  {
    section: "Tracking",
    items: [
      { to: "/admin/progress",   icon: "⊛", label: "Learning Progress", hint: "Tiến độ học" },
      { to: "/admin/favorites",  icon: "♡", label: "Favorites",         hint: "Từ yêu thích" },
    ],
  },
];

/* — Brand / logo SVG wordmark — */
function Wordmark({ size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Open-book icon */}
      <svg width={size + 4} height={size} viewBox="0 0 28 24" fill="none">
        <path d="M14 5C14 5 11 3 6 3C3 3 1 4 1 4V20C1 20 3 19 6 19C11 19 14 21 14 21" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 5C14 5 17 3 22 3C25 3 27 4 27 4V20C27 20 25 19 22 19C17 19 14 21 14 21" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="5" x2="14" y2="21" stroke="#4A7C59" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: size, fontWeight: 700,
        color: "#FFFFFF",
        letterSpacing: "-0.5px",
      }}>
        Lexi<em style={{ fontStyle: "italic", color: T.sage }}>Admin</em>
      </span>
    </div>
  );
}

/* — Single nav item — */
function NavItem({ to, icon, label, hint, active }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      className={`lex-nav-link${active ? " active" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, opacity: active ? 1 : 0.7 }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {active && (
        <span style={{
          fontSize: 10, fontWeight: 700,
          background: `${T.sage}25`,
          color: T.sage,
          padding: "2px 7px", borderRadius: 20,
          letterSpacing: "0.5px",
        }}>✓</span>
      )}
      {hovered && !active && (
        <span style={{
          fontSize: 10, color: T.faint,
          maxWidth: 100, whiteSpace: "nowrap", overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {hint}
        </span>
      )}
    </Link>
  );
}

/* — Sidebar vocabulary counter widget — */
function VocabStats() {
  const stats = [
    { label: "Words", value: "12.4k", color: T.sage },
    { label: "Lessons", value: "84", color: T.gold },
    { label: "Users", value: "2.3k", color: "#3A7BD5" },
  ];
  return (
    <div style={{
      margin: "12px",
      padding: "14px 16px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.faint, marginBottom: 12 }}>
        Quick stats
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1,
            }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.faint, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SETTINGS PANEL
══════════════════════════════════════════════ */
function SettingsPanel({ open, onClose, user, onLogout }) {
  const [tab, setTab]           = useState("account");
  const [oldPw, setOldPw]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [status, setStatus]     = useState("idle");
  const [message, setMessage]   = useState("");

  useEffect(() => {
    if (!open) {
      setOldPw(""); setNewPw(""); setConfirmPw("");
      setStatus("idle"); setMessage(""); setTab("account");
    }
  }, [open]);

  const handleChangePassword = async () => {
    setMessage("");
    if (!oldPw || !newPw || !confirmPw) { setStatus("error"); setMessage("Please fill in all fields."); return; }
    if (newPw.length < 6)               { setStatus("error"); setMessage("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw)            { setStatus("error"); setMessage("Passwords do not match."); return; }
    if (newPw === oldPw)                { setStatus("error"); setMessage("New password must differ from current."); return; }

    setStatus("loading");
    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: user?.UserID, OldPassword: oldPw, NewPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setMessage(data.error || "Failed to change password."); }
      else         { setStatus("success"); setMessage("Password changed successfully!"); setOldPw(""); setNewPw(""); setConfirmPw(""); }
    } catch { setStatus("error"); setMessage("Cannot connect to server."); }
  };

  const TABS = [
    { id: "account", icon: "◎", label: "Account" },
    { id: "security", icon: "🔑", label: "Security" },
    { id: "session",  icon: "⏏", label: "Session" },
  ];

  const avatarInitial = (user?.Username || "A").charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.35)", zIndex: 299, backdropFilter: "blur(3px)" }}
        />
      )}

      {/* Panel */}
      <div className={`settings-panel ${open ? "visible" : "hidden"}`}>
        {/* Header */}
        <div style={{
          padding: "22px 24px",
          borderBottom: `1.5px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.ink }}>
              Settings
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Manage your account</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: `1.5px solid ${T.border}`, borderRadius: 10, width: 34, height: 34, cursor: "pointer", color: T.muted, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.coral; e.currentTarget.style.color = T.coral; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", padding: "0 16px", borderBottom: `1.5px solid ${T.border}`, gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "12px 14px",
                fontSize: 12.5, fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? T.sage : T.muted,
                borderBottom: `2px solid ${tab === t.id ? T.sage : "transparent"}`,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* ACCOUNT TAB */}
          {tab === "account" && (
            <div>
              {/* Profile card */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "20px", borderRadius: 14,
                background: T.sageLight, border: `1.5px solid ${T.border}`,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${T.sage}, ${T.sageMid})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700, fontSize: 22, color: "#fff",
                  boxShadow: `0 4px 12px ${T.sage}40`,
                }}>
                  {avatarInitial}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{user?.Username || "Admin"}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>ID: #{user?.UserID || "—"}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                  background: T.sage, color: "#fff",
                  padding: "4px 10px", borderRadius: 20,
                }}>{user?.Role || "Admin"}</span>
              </div>

              {/* Info rows */}
              {[
                { label: "Username", value: user?.Username || "—" },
                { label: "Role",     value: user?.Role || "Admin" },
                { label: "User ID",  value: `#${user?.UserID || "—"}` },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.muted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* SECURITY TAB */}
          {tab === "security" && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.muted, marginBottom: 16 }}>
                Change Password
              </div>

              {[
                { label: "Current password", value: oldPw, set: setOldPw },
                { label: "New password",      value: newPw, set: setNewPw },
                { label: "Confirm password",  value: confirmPw, set: setConfirmPw },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: T.muted, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input
                    className={`lex-input${status === "error" ? " error" : ""}`}
                    type="password" placeholder="••••••••"
                    value={f.value}
                    onChange={e => { f.set(e.target.value); setStatus("idle"); setMessage(""); }}
                  />
                </div>
              ))}

              {message && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 12.5, marginBottom: 14,
                  background: status === "success" ? "#EDFBF1" : "#FBE9E4",
                  border: `1.5px solid ${status === "success" ? "#7EC89C" : "#E8A89A"}`,
                  color: status === "success" ? "#2A7A48" : T.coral,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  {status === "success" ? "✓" : "!"} {message}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={status === "loading"}
                style={{
                  width: "100%", padding: "11px",
                  background: status === "loading" ? T.sageMid : T.sage,
                  border: "none", borderRadius: 10,
                  color: "#fff", fontWeight: 700, fontSize: 13.5,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.2s",
                  boxShadow: status === "loading" ? "none" : `0 4px 14px ${T.sage}50`,
                }}
              >
                {status === "loading" ? "Updating…" : "Update Password"}
              </button>
            </div>
          )}

          {/* SESSION TAB */}
          {tab === "session" && (
            <div>
              <div style={{
                background: T.coralLight, border: `1.5px solid #E8A89A`,
                borderRadius: 14, padding: "20px",
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: T.coral, marginBottom: 8 }}>
                  Sign Out
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 18, lineHeight: 1.6 }}>
                  You will be signed out of the admin panel. You'll need to log in again to continue.
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    width: "100%", padding: "11px",
                    background: T.coral, border: "none", borderRadius: 10,
                    color: "#fff", fontWeight: 700, fontSize: 13.5,
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: `0 4px 14px ${T.coral}40`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.9)"}
                  onMouseLeave={e => e.currentTarget.style.filter = ""}
                >⏏ Sign Out</button>
              </div>

              {/* Session info */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.muted, marginBottom: 14 }}>
                  Current Session
                </div>
                {[
                  { label: "Signed in as", value: user?.Username || "—" },
                  { label: "Role",          value: user?.Role || "Admin" },
                  { label: "Session",       value: "Active" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 13, color: T.muted }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: row.label === "Session" ? "#2A7A48" : T.ink }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1.5px solid ${T.border}` }}>
          <button onClick={onClose} style={{
            width: "100%", padding: "10px",
            background: T.bg, border: `1.5px solid ${T.border}`,
            borderRadius: 10, color: T.muted, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 500,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.sage; e.currentTarget.style.color = T.sage; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >Close</button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   BREADCRUMB
══════════════════════════════════════════════ */
const ROUTE_LABELS = {
  "/admin":            { label: "Dashboard",         icon: "⬡" },
  "/admin/users":      { label: "Users",             icon: "◎" },
  "/admin/vocabulary": { label: "Vocabulary",        icon: "◈" },
  "/admin/categories": { label: "Categories",        icon: "⊡" },
  "/admin/lessons":    { label: "Lessons",           icon: "▣" },
  "/admin/quiz":       { label: "Quiz Questions",    icon: "◇" },
  "/admin/progress":   { label: "Learning Progress", icon: "⊛" },
  "/admin/favorites":  { label: "Favorites",         icon: "♡" },
};

function Breadcrumb({ pathname }) {
  const current = ROUTE_LABELS[pathname] || { label: "Page", icon: "·" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.muted }}>
      <span style={{ color: T.faint }}>LexiAdmin</span>
      <span style={{ color: T.faint }}>/</span>
      <span style={{ color: T.sage, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 14 }}>{current.icon}</span>
        {current.label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NOTIFICATION DOT
══════════════════════════════════════════════ */
function NotifBtn() {
  const [count] = useState(3);
  return (
    <div style={{ position: "relative" }}>
      <button className="lex-topbar-btn" title="Notifications">🔔</button>
      {count > 0 && (
        <span className="badge-pop" style={{
          position: "absolute", top: -4, right: -4,
          width: 18, height: 18, borderRadius: "50%",
          background: T.coral, color: "#fff",
          fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${T.surface}`,
        }}>{count}</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   WORD OF THE DAY widget in sidebar
══════════════════════════════════════════════ */
const WORDS = [
  { word: "persevere", ipa: "/ˌpɜːrsɪˈvɪr/", meaning: "to continue despite difficulty" },
  { word: "eloquent",  ipa: "/ˈeləkwənt/",    meaning: "well-expressed and persuasive" },
  { word: "tenacious", ipa: "/təˈneɪʃəs/",    meaning: "refusing to give up; determined" },
];

function WordOfDay() {
  const w = WORDS[Math.floor(Date.now() / 86400000) % WORDS.length];
  return (
    <div style={{
      margin: "12px",
      padding: "14px 16px",
      background: `linear-gradient(135deg, ${T.sidebarSurface} 60%, rgba(74,124,89,0.2))`,
      borderRadius: 12,
      border: `1px solid ${T.sage}30`,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.sage, marginBottom: 8 }}>
        Word of the Day
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#fff", fontStyle: "italic", marginBottom: 3 }}>
        {w.word}
      </div>
      <div style={{ fontSize: 11, color: T.sageMid, marginBottom: 5 }}>{w.ipa}</div>
      <div style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.5 }}>{w.meaning}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LAYOUT
══════════════════════════════════════════════ */
export default function AdminLayout() {
  const location      = useLocation();
  const navigate      = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [searchVal,    setSearchVal]    = useState("");
  const searchRef     = useRef(null);

  /* Auth guard */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.Role !== "Admin") navigate("/login", { replace: true });
  }, [navigate]);

  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.Username || "Admin";
  const avatarChar  = displayName.charAt(0).toUpperCase();
  const isActive    = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* Keyboard shortcut: Cmd/Ctrl+K → focus search */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const current = ROUTE_LABELS[location.pathname] || { label: "Page", icon: "·" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside style={{
        width: T.sidebarW, background: T.sidebar,
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
        display: "flex", flexDirection: "column",
        overflowY: "auto",
        boxShadow: "2px 0 24px rgba(0,0,0,0.12)",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Wordmark />
          <div style={{ fontSize: 10, color: T.faint, marginTop: 5, letterSpacing: "2px", textTransform: "uppercase" }}>
            Admin Panel
          </div>
        </div>

        {/* Word of the day */}
        <WordOfDay />

        {/* Nav */}
        <nav style={{ flex: 1, paddingBottom: 12 }}>
          {NAV.map(group => (
            <div key={group.section}>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "2px", color: "rgba(255,255,255,0.22)",
                padding: "18px 20px 6px",
              }}>
                {group.section}
              </div>
              {group.items.map(item => (
                <NavItem key={item.to} {...item} active={isActive(item.to)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Stats widget */}
        <VocabStats />

        {/* User footer */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.sage}, ${T.sageMid})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 16, color: "#fff",
          }}>
            {avatarChar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              {user?.Role || "Admin"}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 16, padding: 4, borderRadius: 6, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = T.faint}
            title="Settings"
          >⚙</button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ marginLeft: T.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Topbar ── */}
        <header style={{
          height: 64,
          background: T.surface,
          borderBottom: `1.5px solid ${T.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: 16,
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 8px rgba(28,25,23,0.05)",
        }}>
          {/* Breadcrumb */}
          <Breadcrumb pathname={location.pathname} />

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: T.border, marginLeft: 4 }} />

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.faint }}>
              ⌕
            </span>
            <input
              ref={searchRef}
              className="lex-search"
              type="text"
              placeholder="Search… (⌘K)"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
            {searchVal && (
              <button
                onClick={() => setSearchVal("")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 12 }}
              >✕</button>
            )}
          </div>

          {/* Right actions */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <NotifBtn />

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: T.border }} />

            {/* Settings */}
            <button
              className={`lex-topbar-btn${showSettings ? " active" : ""}`}
              onClick={() => setShowSettings(v => !v)}
              title="Settings"
            >⚙</button>

            {/* Avatar button */}
            <div
              onClick={() => setShowSettings(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${T.sage}, ${T.sageMid})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: 15, color: "#fff",
                cursor: "pointer",
                border: `2px solid ${showSettings ? T.sage : "transparent"}`,
                boxShadow: showSettings ? `0 0 0 3px ${T.sageLight}` : "none",
                transition: "all 0.15s",
              }}
              title={displayName}
            >
              {avatarChar}
            </div>
          </div>
        </header>

        {/* ── Page Header Banner ── */}
        <div style={{
          background: T.surface,
          borderBottom: `1.5px solid ${T.border}`,
          padding: "18px 28px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26, fontWeight: 700,
              color: T.ink, lineHeight: 1.15,
            }}>
              {current.icon}&nbsp;
              <em style={{ fontStyle: "italic" }}>{current.label}</em>
            </h1>
          </div>

          {/* Date + decorative element */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: T.muted }}>Today</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            {/* Decorative serif ornament */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: T.sageLight,
              border: `1.5px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, color: T.sage,
            }}>
              {current.icon}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <main className="page-animate" style={{ flex: 1, padding: "28px", minHeight: 0 }}>
          <Outlet />
        </main>

        {/* ── Footer ── */}
        <footer style={{
          padding: "14px 28px",
          borderTop: `1.5px solid ${T.border}`,
          background: T.surface,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 12, color: T.muted,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: T.sage }}>✦</span>
            <span>© 2026 LexiAdmin — EnglishVocabularyDB</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              background: T.sageLight, color: T.sage,
              border: `1px solid ${T.sage}40`,
              padding: "3px 9px", borderRadius: 20,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
            }}>v2.4.1</span>
            <span>Updated: 23 Mar 2026</span>
          </div>
        </footer>
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