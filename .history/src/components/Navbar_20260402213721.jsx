import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LogOut, UserCircle, BookOpen, Home,
  Zap, Sparkles, Gamepad, LogIn, ShieldAlert,
  ChevronDown, User, History, Heart, Menu, X
} from 'lucide-react';

/* ─────────────────────────────────────────
   GLOBAL STYLES  (injected once)
───────────────────────────────────────── */
const NAV_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .nv-root {
    --ink:      #0d0f14;
    --ink2:     #1c2030;
    --slate:    #3d4561;
    --muted:    #7a849e;
    --fog:      #c4cad6;
    --paper:    #f5f4f0;
    --cream:    #faf9f6;
    --gold:     #c9a84c;
    --gold2:    #e8c96b;
    --emerald:  #1e8c6e;
    --sapphire: #2563d4;
    --rose:     #c2435a;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Navbar shell ── */
  .nv-bar {
    position: sticky; top: 0; z-index: 200;
    background: rgba(13,15,20,0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
    gap: 16px;
  }

  /* ── Logo ── */
  .nv-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; flex-shrink: 0;
  }
  .nv-logo-mark {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 900; color: var(--ink);
    flex-shrink: 0;
    box-shadow: 0 0 14px rgba(201,168,76,0.35);
  }
  .nv-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 900; color: #fff;
    letter-spacing: -0.3px;
  }
  .nv-logo-name span { color: var(--gold2); }

  /* ── Center nav links ── */
  .nv-center {
    display: flex; align-items: center; gap: 2px;
    flex: 1; justify-content: center;
  }
  .nv-link {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none;
    color: rgba(255,255,255,0.5);
    font-size: 13.5px; font-weight: 500;
    padding: 7px 13px; border-radius: 9px;
    transition: all 0.18s ease;
    white-space: nowrap;
    position: relative;
  }
  .nv-link:hover {
    color: rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.06);
  }
  .nv-link.active {
    color: var(--gold2);
    background: rgba(201,168,76,0.1);
    font-weight: 600;
  }
  .nv-link.active::after {
    content: '';
    position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
    width: 20px; height: 2px; border-radius: 2px;
    background: var(--gold2);
  }

  /* ── Right section ── */
  .nv-right {
    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }

  /* ── User pill ── */
  .nv-user-wrap { position: relative; }
  .nv-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 40px;
    padding: 6px 14px 6px 8px;
    cursor: pointer; user-select: none;
    transition: all 0.18s;
    color: rgba(255,255,255,0.8);
    font-size: 13.5px; font-weight: 500;
  }
  .nv-user-pill:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.18);
  }
  .nv-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 13px; font-weight: 700; color: var(--ink);
    flex-shrink: 0;
  }
  .nv-username { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nv-chevron { transition: transform 0.25s ease; opacity: 0.5; }
  .nv-chevron.open { transform: rotate(180deg); }

  /* ── Dropdown ── */
  .nv-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--ink2);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    min-width: 210px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    overflow: hidden;
    animation: dropIn 0.18s cubic-bezier(.4,0,.2,1);
    z-index: 500;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .nv-dropdown-header {
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .nv-dropdown-name {
    font-size: 13px; font-weight: 600; color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .nv-dropdown-role {
    font-size: 11px; color: var(--muted); margin-top: 2px;
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .nv-dd-item {
    display: flex; align-items: center; gap: 11px;
    padding: 12px 16px; text-decoration: none;
    color: rgba(255,255,255,0.65); font-size: 13.5px; font-weight: 400;
    transition: all 0.15s;
    cursor: pointer; border: none; background: none; width: 100%; text-align: left;
  }
  .nv-dd-item:hover {
    background: rgba(255,255,255,0.05); color: #fff;
  }
  .nv-dd-item:not(:last-child) {
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .nv-dd-item.danger { color: #f87171; }
  .nv-dd-item.danger:hover { background: rgba(248,113,113,0.08); color: #fca5a5; }
  .nv-dd-divider {
    height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0;
  }

  /* ── Admin btn ── */
  .nv-admin-btn {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none;
    background: rgba(124,58,237,0.15);
    color: #c4b5fd;
    border: 1px solid rgba(124,58,237,0.25);
    padding: 6px 14px; border-radius: 9px;
    font-size: 13px; font-weight: 600;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .nv-admin-btn:hover {
    background: rgba(124,58,237,0.25); border-color: rgba(124,58,237,0.4);
  }

  /* ── Auth buttons ── */
  .nv-login-btn {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; color: rgba(255,255,255,0.6);
    font-size: 13.5px; font-weight: 500;
    padding: 7px 14px; border-radius: 9px;
    transition: all 0.18s;
  }
  .nv-login-btn:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .nv-register-btn {
    text-decoration: none;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: var(--ink);
    padding: 8px 18px; border-radius: 9px;
    font-size: 13.5px; font-weight: 700;
    box-shadow: 0 4px 14px rgba(201,168,76,0.35);
    transition: all 0.18s;
    white-space: nowrap;
  }
  .nv-register-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(201,168,76,0.45);
  }

  /* ── Mobile hamburger ── */
  .nv-hamburger {
    display: none; border: none; background: none; cursor: pointer;
    color: rgba(255,255,255,0.7); padding: 6px;
    border-radius: 8px;
    transition: background 0.18s;
  }
  .nv-hamburger:hover { background: rgba(255,255,255,0.08); }

  /* ── Mobile drawer ── */
  .nv-mobile-drawer {
    position: fixed; inset: 0; z-index: 300;
  }
  .nv-mobile-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  }
  .nv-mobile-panel {
    position: absolute; top: 0; left: 0; bottom: 0;
    width: min(300px, 85vw);
    background: var(--ink2);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column;
    overflow-y: auto;
    animation: slideIn 0.22s cubic-bezier(.4,0,.2,1);
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }
  .nv-mobile-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .nv-mobile-close {
    border: none; background: rgba(255,255,255,0.06);
    border-radius: 8px; padding: 6px; cursor: pointer;
    color: rgba(255,255,255,0.6); display: flex;
    transition: background 0.18s;
  }
  .nv-mobile-close:hover { background: rgba(255,255,255,0.1); }
  .nv-mobile-links { padding: 12px 0; flex: 1; }
  .nv-mobile-link {
    display: flex; align-items: center; gap: 12px;
    text-decoration: none;
    color: rgba(255,255,255,0.6); font-size: 15px; font-weight: 500;
    padding: 13px 20px;
    transition: all 0.15s;
  }
  .nv-mobile-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .nv-mobile-link.active { color: var(--gold2); background: rgba(201,168,76,0.08); }
  .nv-mobile-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column; gap: 10px;
  }
  .nv-mobile-logout {
    display: flex; align-items: center; gap: 10px;
    border: none; background: rgba(248,113,113,0.1);
    color: #f87171; padding: 12px 16px; border-radius: 10px;
    cursor: pointer; font-size: 14px; font-weight: 600;
    width: 100%; font-family: 'DM Sans', sans-serif;
    transition: background 0.18s;
  }
  .nv-mobile-logout:hover { background: rgba(248,113,113,0.18); }

  /* ── Footer ── */
  .nv-footer {
    background: var(--ink);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 48px 32px 32px;
    font-family: 'DM Sans', sans-serif;
  }
  .nv-footer-inner {
    max-width: 820px; margin: 0 auto;
  }
  .nv-footer-top {
    display: flex; justify-content: space-between;
    gap: 40px; flex-wrap: wrap; margin-bottom: 40px;
  }
  .nv-footer-brand { max-width: 260px; }
  .nv-footer-brand-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
  }
  .nv-footer-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 900; color: #fff;
  }
  .nv-footer-brand-name span { color: var(--gold2); }
  .nv-footer-tagline {
    font-size: 13px; color: rgba(255,255,255,0.35);
    line-height: 1.7; font-weight: 300;
  }
  .nv-footer-col-title {
    font-size: 10px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 14px;
  }
  .nv-footer-links { display: flex; flex-direction: column; gap: 9px; }
  .nv-footer-link {
    text-decoration: none; color: rgba(255,255,255,0.4);
    font-size: 13.5px; font-weight: 400;
    transition: color 0.18s;
    display: flex; align-items: center; gap: 7px;
  }
  .nv-footer-link:hover { color: rgba(255,255,255,0.8); }
  .nv-footer-divider {
    height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 24px;
  }
  .nv-footer-bottom {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .nv-footer-copy {
    font-size: 12px; color: rgba(255,255,255,0.2);
    font-weight: 300; letter-spacing: 0.3px;
  }
  .nv-footer-badges {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .nv-footer-badge {
    font-size: 11px; color: rgba(255,255,255,0.3);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px; padding: 3px 9px;
    font-weight: 500; letter-spacing: 0.3px;
  }

  @media (max-width: 768px) {
    .nv-center { display: none; }
    .nv-user-pill .nv-username { display: none; }
    .nv-user-pill .nv-chevron { display: none; }
    .nv-hamburger { display: flex; }
    .nv-bar { padding: 0 20px; }
    .nv-admin-btn span { display: none; }
  }
`;

function useNavStyle() {
  useEffect(() => {
    const id = "nv-global";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = NAV_STYLE;
      document.head.appendChild(s);
    }
  }, []);
}

/* ─── Navbar ─── */
const Navbar = () => {
  useNavStyle();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || user?.Username || "";
  const isAdmin = user?.role === 'Admin' || user?.Role === 'Admin';

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    setMobileOpen(false);
    setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: "/",          icon: Home,     label: "Tổng quan"   },
    { to: "/flashcard", icon: BookOpen, label: "Phòng học"   },
    { to: "/quiz",      icon: Zap,      label: "Trắc nghiệm" },
    { to: "/ai-chat",   icon: Sparkles, label: "Trợ lý AI"   },
    { to: "/mini-game", icon: Gamepad,  label: "Mini Game"   },
  ];

  return (
    <div className="nv-root">
      <nav className="nv-bar">
        {/* Logo */}
        <Link to="/" className="nv-logo">
          <div className="nv-logo-mark">V</div>
          <span className="nv-logo-name">Vocab<span>Master</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="nv-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`nv-link${isActive(to) ? " active" : ""}`}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="nv-right">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="nv-admin-btn">
                  <ShieldAlert size={15} /><span>Quản trị</span>
                </Link>
              )}

              {/* User pill + dropdown */}
              <div className="nv-user-wrap" ref={dropRef}>
                <div className="nv-user-pill" onClick={() => setDropOpen(o => !o)}>
                  <div className="nv-avatar">{username.charAt(0).toUpperCase()}</div>
                  <span className="nv-username">{username}</span>
                  <ChevronDown size={14} className={`nv-chevron${dropOpen ? " open" : ""}`} />
                </div>

                {dropOpen && (
                  <div className="nv-dropdown">
                    <div className="nv-dropdown-header">
                      <div className="nv-dropdown-name">{username}</div>
                      <div className="nv-dropdown-role">{isAdmin ? "Quản trị viên" : "Học viên"}</div>
                    </div>
                    <Link to="/profile" className="nv-dd-item" onClick={() => setDropOpen(false)}>
                      <User size={15} /> Thông tin cá nhân
                    </Link>
                    <Link to="/history" className="nv-dd-item" onClick={() => setDropOpen(false)}>
                      <History size={15} /> Lịch sử học
                    </Link>
                    <Link to="/favorites" className="nv-dd-item" onClick={() => setDropOpen(false)}>
                      <Heart size={15} /> Từ vựng yêu thích
                    </Link>
                    <div className="nv-dd-divider" />
                    <button className="nv-dd-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nv-login-btn"><LogIn size={15} /> Đăng nhập</Link>
              <Link to="/register" className="nv-register-btn">Đăng ký</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="nv-hamburger" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nv-mobile-drawer">
          <div className="nv-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="nv-mobile-panel">
            <div className="nv-mobile-top">
              <div className="nv-logo">
                <div className="nv-logo-mark">V</div>
                <span className="nv-logo-name">Vocab<span>Master</span></span>
              </div>
              <button className="nv-mobile-close" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {user && (
              <div style={{ padding: "16px 20px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="nv-avatar" style={{ width: 36, height: 36, fontSize: 15 }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{username}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                      {isAdmin ? "Quản trị viên" : "Học viên"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="nv-mobile-links">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className={`nv-mobile-link${isActive(to) ? " active" : ""}`}>
                  <Icon size={17} /> {label}
                </Link>
              ))}
              {user && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
                  <Link to="/profile"   className="nv-mobile-link"><User    size={17} /> Thông tin cá nhân</Link>
                  <Link to="/history"   className="nv-mobile-link"><History size={17} /> Lịch sử học</Link>
                  <Link to="/favorites" className="nv-mobile-link"><Heart   size={17} /> Từ vựng yêu thích</Link>
                  {isAdmin && (
                    <Link to="/admin" className="nv-mobile-link"><ShieldAlert size={17} /> Quản trị</Link>
                  )}
                </>
              )}
            </div>

            <div className="nv-mobile-footer">
              {user ? (
                <button className="nv-mobile-logout" onClick={handleLogout}>
                  <LogOut size={17} /> Đăng xuất
                </button>
              ) : (
                <>
                  <Link to="/login" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    textDecoration: "none", color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                    padding: "12px", fontSize: 14, fontWeight: 500,
                  }}>
                    <LogIn size={16} /> Đăng nhập
                  </Link>
                  <Link to="/register" className="nv-register-btn" style={{ textAlign: "center", padding: "12px" }}>
                    Đăng ký miễn phí
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Footer ─── */
export const Footer = () => {
  useNavStyle();

  const learnLinks = [
    { to: "/flashcard", label: "Phòng học Flashcard" },
    { to: "/quiz",      label: "Luyện trắc nghiệm"  },
    { to: "/mini-game", label: "Mini Game từ vựng"   },
    { to: "/ai-chat",   label: "Trợ lý AI Teacher"   },
  ];
  const accountLinks = [
    { to: "/profile",   label: "Thông tin cá nhân" },
    { to: "/history",   label: "Lịch sử học"        },
    { to: "/favorites", label: "Từ vựng yêu thích"  },
  ];

  return (
    <footer className="nv-footer nv-root">
      <div className="nv-footer-inner">
        <div className="nv-footer-top">
          {/* Brand */}
          <div className="nv-footer-brand">
            <div className="nv-footer-brand-row">
              <div className="nv-logo-mark" style={{ width: 30, height: 30, fontSize: 14 }}>V</div>
              <span className="nv-footer-brand-name">Vocab<span>Master</span></span>
            </div>
            <p className="nv-footer-tagline">
              Nền tảng học từ vựng tiếng Anh thông minh. Học nhanh, nhớ lâu, thành thạo mỗi ngày.
            </p>
            {/* tiny decorative dots */}
            <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
              {["#c9a84c","#1e8c6e","#2563d4","#c2435a"].map((c, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.6 }} />
              ))}
            </div>
          </div>

          {/* Learn */}
          <div>
            <div className="nv-footer-col-title">Học tập</div>
            <div className="nv-footer-links">
              {learnLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="nv-footer-link">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", opacity: 0.5, flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="nv-footer-col-title">Tài khoản</div>
            <div className="nv-footer-links">
              {accountLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="nv-footer-link">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", opacity: 0.5, flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="nv-footer-divider" />

        <div className="nv-footer-bottom">
          <span className="nv-footer-copy">© 2026 VocabMaster · Học tiếng Anh mỗi ngày</span>
          <div className="nv-footer-badges">
            <span className="nv-footer-badge">Flashcard</span>
            <span className="nv-footer-badge">Quiz</span>
            <span className="nv-footer-badge">AI Teacher</span>
            <span className="nv-footer-badge">Mini Game</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Navbar;