import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LogOut, BookOpen, Home,
  Zap, Sparkles, Gamepad, LogIn, ShieldAlert,
  ChevronDown, User, History, Heart, Menu, X, Send, AlertCircle
} from 'lucide-react';

/* ─────────────────────────────────────────
   GLOBAL STYLES — Refined White Editorial
───────────────────────────────────────── */
const NAV_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .nv-root {
    --white:      #ffffff;
    --bg:         #f7f7f5;
    --bg2:        #f0efec;
    --ink:        #111111;
    --ink2:       #333333;
    --muted:      #888888;
    --border:     #e4e4e0;
    --border2:    #d0d0cc;
    --gold:       #c9a84c;
    --gold-bg:    #fdf8ee;
    --green:      #1a7f4b;
    --green-bg:   #edf7f1;
    --red:        #c0392b;
    --red-bg:     #fdf0ef;
    --shadow-sm:  0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
    --shadow-md:  0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg:  0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Navbar shell ── */
  .nv-bar {
    position: sticky; top: 0; z-index: 200;
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
    padding: 0 36px;
    display: flex; align-items: center; justify-content: space-between;
    height: 62px;
    gap: 16px;
  }

  /* ── Logo ── */
  .nv-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; flex-shrink: 0; }
  .nv-logo-mark {
    width: 34px; height: 34px; border-radius: 10px;
    background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 900; color: var(--white);
    flex-shrink: 0;
    letter-spacing: -0.5px;
  }
  .nv-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 900;
    color: var(--ink); letter-spacing: -0.3px;
  }
  .nv-logo-name span { color: var(--gold); }

  /* ── Center nav links ── */
  .nv-center { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }

  .nv-link {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; color: var(--muted);
    font-size: 13.5px; font-weight: 500;
    padding: 7px 13px; border-radius: 9px;
    transition: all 0.18s; white-space: nowrap;
    position: relative;
  }
  .nv-link:hover { color: var(--ink); background: var(--bg); }
  .nv-link.active {
    color: var(--ink); font-weight: 700;
    background: var(--bg2);
  }
  .nv-link.active::after {
    content: '';
    position: absolute; bottom: -1px; left: 50%; right: 50%;
    height: 2px; background: var(--ink); border-radius: 99px;
    animation: linkUnderline 0.22s ease forwards;
  }
  @keyframes linkUnderline {
    to { left: 20%; right: 20%; }
  }

  /* ── Right area ── */
  .nv-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  /* ── User pill ── */
  .nv-user-wrap { position: relative; }
  .nv-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 40px; padding: 5px 12px 5px 6px;
    cursor: pointer; user-select: none;
    transition: all 0.18s; color: var(--ink2);
    font-size: 13px; font-weight: 600;
  }
  .nv-user-pill:hover { background: var(--bg2); border-color: var(--border2); }

  .nv-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 12px; font-weight: 700; color: var(--white); flex-shrink: 0;
  }
  .nv-username { max-width: 88px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nv-chevron { transition: transform 0.22s; color: var(--muted); }
  .nv-chevron.open { transform: rotate(180deg); }

  /* ── Dropdown ── */
  .nv-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--white); border: 1px solid var(--border);
    border-radius: 18px; min-width: 216px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: dropIn 0.18s cubic-bezier(.4,0,.2,1);
    z-index: 500;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .nv-dropdown-header {
    padding: 16px 18px 14px; background: var(--bg);
    border-bottom: 1px solid var(--border);
  }
  .nv-dropdown-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700; color: var(--ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .nv-dropdown-role {
    font-size: 10px; color: var(--muted); margin-top: 4px;
    text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;
  }
  .nv-dd-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 18px; text-decoration: none;
    color: var(--ink2); font-size: 13.5px; font-weight: 500;
    transition: all 0.15s; cursor: pointer;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .nv-dd-item:hover { background: var(--bg); color: var(--ink); }
  .nv-dd-item:not(:last-child) { border-bottom: 1px solid var(--border); }
  .nv-dd-item.danger { color: var(--red); }
  .nv-dd-item.danger:hover { background: var(--red-bg); }
  .nv-dd-divider { height: 1px; background: var(--border); }

  /* ── Admin btn ── */
  .nv-admin-btn {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none;
    background: var(--bg); color: var(--ink2);
    border: 1px solid var(--border);
    padding: 6px 13px; border-radius: 9px;
    font-size: 12.5px; font-weight: 600; transition: all 0.18s;
    white-space: nowrap;
  }
  .nv-admin-btn:hover { background: var(--bg2); border-color: var(--border2); color: var(--ink); }

  /* ── Auth buttons ── */
  .nv-login-btn {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; color: var(--muted);
    font-size: 13.5px; font-weight: 600;
    padding: 7px 13px; border-radius: 9px; transition: all 0.18s;
  }
  .nv-login-btn:hover { color: var(--ink); background: var(--bg); }

  .nv-register-btn {
    text-decoration: none; background: var(--ink); color: var(--white);
    padding: 8px 18px; border-radius: 9px;
    font-size: 13.5px; font-weight: 600; transition: all 0.18s;
    white-space: nowrap;
    border: 1px solid var(--ink);
  }
  .nv-register-btn:hover { background: var(--ink2); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.18); }

  /* ── Hamburger ── */
  .nv-hamburger {
    display: none; border: 1px solid var(--border);
    background: var(--bg); cursor: pointer;
    color: var(--ink2); padding: 7px; border-radius: 9px;
    transition: background 0.18s; align-items: center;
  }
  .nv-hamburger:hover { background: var(--bg2); }

  /* ── Mobile drawer ── */
  .nv-mobile-drawer { position: fixed; inset: 0; z-index: 300; }
  .nv-mobile-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.3); backdrop-filter: blur(3px);
  }
  .nv-mobile-panel {
    position: absolute; top: 0; left: 0; bottom: 0;
    width: min(300px, 85vw); background: var(--white);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow-y: auto;
    animation: slideIn 0.22s cubic-bezier(.4,0,.2,1);
    box-shadow: var(--shadow-lg);
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }
  .nv-mobile-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px; border-bottom: 1px solid var(--border); background: var(--bg);
  }
  .nv-mobile-close {
    border: 1px solid var(--border); background: var(--white);
    border-radius: 8px; padding: 6px; cursor: pointer;
    color: var(--ink2); display: flex; transition: background 0.18s;
  }
  .nv-mobile-close:hover { background: var(--bg2); }
  .nv-mobile-links { padding: 10px 0; flex: 1; }
  .nv-mobile-link {
    display: flex; align-items: center; gap: 12px;
    text-decoration: none; color: var(--ink2);
    font-size: 14.5px; font-weight: 500;
    padding: 13px 22px; transition: all 0.15s;
  }
  .nv-mobile-link:hover { background: var(--bg); color: var(--ink); }
  .nv-mobile-link.active { color: var(--ink); background: var(--bg2); font-weight: 700; }
  .nv-mobile-footer {
    padding: 18px 20px; border-top: 1px solid var(--border);
    background: var(--bg); display: flex; flex-direction: column; gap: 10px;
  }
  .nv-mobile-logout {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border: 1px solid #f0ccc9; background: var(--red-bg); color: var(--red);
    padding: 12px 16px; border-radius: 10px; cursor: pointer;
    font-size: 13.5px; font-weight: 600; width: 100%;
    font-family: 'DM Sans', sans-serif; transition: background 0.18s;
  }

  /* ── Mini chat ── */
  .nv-mascot-wrapper {
    position: fixed; bottom: 28px; right: 28px;
    z-index: 999; display: flex; flex-direction: column;
    align-items: flex-end; gap: 12px;
  }

  .nv-mini-chat {
    width: 340px; height: 470px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: var(--shadow-lg);
    display: flex; flex-direction: column; overflow: hidden;
    transform-origin: bottom right;
    animation: popUpChat 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popUpChat {
    from { opacity: 0; transform: scale(0.82) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .nv-mc-header {
    background: var(--ink); padding: 14px 18px;
    display: flex; justify-content: space-between; align-items: center;
    color: var(--white);
  }
  .nv-mc-title {
    font-family: 'Playfair Display', serif;
    font-weight: 700; font-size: 15px;
    display: flex; align-items: center; gap: 8px;
  }
  .nv-mc-close {
    background: rgba(255,255,255,0.1); border: none;
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.18s;
  }
  .nv-mc-close:hover { background: rgba(255,255,255,0.2); color: var(--white); }

  .nv-mc-body {
    flex: 1; background: var(--bg); overflow-y: auto;
    padding: 16px; display: flex; flex-direction: column; gap: 12px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .nv-mc-row { display: flex; gap: 8px; max-width: 92%; }
  .nv-mc-row.user { align-self: flex-end; justify-content: flex-end; }
  .nv-mc-row.ai   { align-self: flex-start; }

  .nv-mc-ava {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; font-weight: 700;
  }
  .nv-mc-ava.ai   { background: var(--bg2); border: 1px solid var(--border); }
  .nv-mc-ava.user {
    background: var(--ink); color: var(--white);
    font-family: 'Playfair Display', serif; font-size: 12px;
  }

  .nv-mc-bubble {
    padding: 10px 14px; border-radius: 14px;
    font-size: 13.5px; font-weight: 500; line-height: 1.5;
  }
  .nv-mc-row.user .nv-mc-bubble {
    background: var(--ink); color: var(--white);
    border-top-right-radius: 4px;
  }
  .nv-mc-row.ai .nv-mc-bubble {
    background: var(--white); color: var(--ink2);
    border: 1px solid var(--border);
    border-top-left-radius: 4px;
  }

  .nv-mc-corr {
    background: var(--gold-bg); border: 1px solid #e8d9b0;
    border-radius: 10px; padding: 10px 12px; margin-top: 6px; font-size: 12px;
  }
  .nv-mc-corr-title {
    color: var(--gold); font-weight: 700;
    display: flex; align-items: center; gap: 4px; margin-bottom: 5px;
    font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
  }
  .nv-mc-corr-text { color: var(--ink2); font-weight: 500; line-height: 1.5; }
  .nv-mc-better {
    background: var(--green-bg); border: 1px solid #b3dcc4;
    border-radius: 8px; padding: 7px 10px; margin-top: 8px;
    color: var(--green); font-weight: 600; font-style: italic; font-size: 12px;
  }

  .nv-mc-input {
    display: flex; padding: 12px 14px;
    background: var(--white); border-top: 1px solid var(--border); gap: 8px; align-items: center;
  }
  .nv-mc-textfield {
    flex: 1; background: var(--bg);
    border: 1px solid var(--border); border-radius: 10px;
    padding: 9px 13px; font-size: 13.5px; font-weight: 500;
    outline: none; transition: border 0.2s; font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }
  .nv-mc-textfield::placeholder { color: var(--muted); }
  .nv-mc-textfield:focus { border-color: var(--border2); background: var(--white); }

  .nv-mc-send {
    background: var(--ink); color: var(--white); border: none;
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.18s; flex-shrink: 0;
  }
  .nv-mc-send:hover:not(:disabled) { background: var(--ink2); transform: scale(1.04); }
  .nv-mc-send:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Mascot button ── */
  .nv-mascot-btn {
    width: 52px; height: 52px; border-radius: 16px;
    background: var(--ink); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: all 0.22s; position: relative;
  }
  .nv-mascot-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .nv-mascot-btn:active { transform: translateY(0); }

  .nv-mascot-badge {
    position: absolute; top: -5px; right: -5px;
    background: var(--red); color: var(--white);
    font-size: 9px; font-weight: 900;
    padding: 2px 5px; border-radius: 10px;
    border: 2px solid var(--white);
    font-family: 'DM Sans', sans-serif;
  }

  .mascot-dot {
    display: inline-block; width: 5px; height: 5px;
    border-radius: 50%; background: var(--muted);
    animation: mascotDot 1.4s infinite; margin: 0 2px;
  }
  .mascot-dot:nth-child(2) { animation-delay: 0.2s; }
  .mascot-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes mascotDot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%            { transform: scale(1);   opacity: 1; }
  }

  /* ── Footer ── */
  .nv-footer {
    background: var(--bg); border-top: 1px solid var(--border);
    padding: 56px 36px 32px;
    font-family: 'DM Sans', sans-serif;
  }
  .nv-footer-inner { max-width: 820px; margin: 0 auto; }
  .nv-footer-top {
    display: flex; justify-content: space-between;
    gap: 48px; flex-wrap: wrap; margin-bottom: 44px;
  }
  .nv-footer-brand { max-width: 272px; }
  .nv-footer-brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .nv-footer-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 900; color: var(--ink);
  }
  .nv-footer-brand-name span { color: var(--gold); }
  .nv-footer-tagline { font-size: 13.5px; color: var(--muted); line-height: 1.8; font-weight: 400; }

  .nv-footer-col-title {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--ink2); margin-bottom: 18px;
  }
  .nv-footer-links { display: flex; flex-direction: column; gap: 11px; }
  .nv-footer-link {
    text-decoration: none; color: var(--muted); font-size: 13.5px;
    font-weight: 500; transition: color 0.18s;
    display: flex; align-items: center; gap: 9px;
  }
  .nv-footer-link:hover { color: var(--ink); }

  .nv-footer-divider { height: 1px; background: var(--border); margin-bottom: 22px; }
  .nv-footer-bottom {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 14px;
  }
  .nv-footer-copy { font-size: 12.5px; color: var(--muted); font-weight: 500; }
  .nv-footer-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .nv-footer-badge {
    font-size: 11px; color: var(--muted);
    border: 1px solid var(--border); background: var(--white);
    border-radius: 6px; padding: 3px 9px; font-weight: 600; letter-spacing: 0.3px;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .nv-center { display: none; }
    .nv-user-pill .nv-username { display: none; }
    .nv-user-pill .nv-chevron { display: none; }
    .nv-hamburger { display: flex; }
    .nv-bar { padding: 0 18px; }
    .nv-admin-btn span { display: none; }
    .nv-mascot-wrapper { bottom: 18px; right: 18px; }
    .nv-mascot-btn { width: 46px; height: 46px; font-size: 20px; border-radius: 13px; }
    .nv-mini-chat { width: calc(100vw - 36px); height: 400px; }
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

  // Mini chat state
  const [miniChatOpen, setMiniChatOpen] = useState(false);
  const [miniInput, setMiniInput] = useState('');
  const [miniMessages, setMiniMessages] = useState([
    { sender: 'ai', text: "Hi! Mình là EngBot. Bạn cần tra ngữ pháp hay hỏi gì cứ gõ vào đây nhé! 🦜" }
  ]);
  const [miniLoading, setMiniLoading] = useState(false);
  const miniChatEndRef = useRef(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || user?.Username || "Y";
  const isAdmin = user?.role === 'Admin' || user?.Role === 'Admin';

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (miniChatOpen) {
      miniChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [miniMessages, miniLoading, miniChatOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    setMobileOpen(false);
    setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleMiniSend = async (e) => {
    e.preventDefault();
    if (!miniInput.trim()) return;
    const msg = miniInput.trim();
    setMiniMessages(p => [...p, { sender: 'user', text: msg }]);
    setMiniInput('');
    setMiniLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/chat', { message: msg });
      setMiniMessages(p => [...p, {
        sender: 'ai',
        text: data.reply,
        correction: data.correction,
        better_version: data.better_version
      }]);
    } catch {
      setMiniMessages(p => [...p, { sender: 'ai', text: "Kết nối gặp sự cố. Bạn thử lại sau nhé!" }]);
    } finally {
      setMiniLoading(false);
    }
  };

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
          <span className="nv-logo-name">T-Đ-T <span>English</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="nv-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`nv-link${isActive(to) ? " active" : ""}`}>
              <Icon size={15} strokeWidth={isActive(to) ? 2.2 : 1.8} />
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
                  <ShieldAlert size={14} strokeWidth={2} />
                  <span>Quản trị</span>
                </Link>
              )}

              {/* User pill + dropdown */}
              <div className="nv-user-wrap" ref={dropRef}>
                <div className="nv-user-pill" onClick={() => setDropOpen(o => !o)}>
                  <div className="nv-avatar">{username.charAt(0).toUpperCase()}</div>
                  <span className="nv-username">{username}</span>
                  <ChevronDown size={13} className={`nv-chevron${dropOpen ? " open" : ""}`} />
                </div>

                {dropOpen && (
                  <div className="nv-dropdown">
                    <div className="nv-dropdown-header">
                      <div className="nv-dropdown-name">{username}</div>
                      <div className="nv-dropdown-role">{isAdmin ? "Quản trị viên" : "Học viên"}</div>
                    </div>
                    <Link to="/profile" className="nv-dd-item" onClick={() => setDropOpen(false)}>
                      <User size={14} strokeWidth={1.8} /> Thông tin cá nhân
                    </Link>
                    <Link to="/history" className="nv-dd-item" onClick={() => setDropOpen(false)}>
                      <History size={14} strokeWidth={1.8} /> Lịch sử học
                    </Link>
                    <Link to="/favorites" className="nv-dd-item" onClick={() => setDropOpen(false)}>
                      <Heart size={14} strokeWidth={1.8} /> Từ vựng yêu thích
                    </Link>
                    <div className="nv-dd-divider" />
                    <button className="nv-dd-item danger" onClick={handleLogout}>
                      <LogOut size={14} strokeWidth={1.8} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="nv-login-btn"><LogIn size={15} strokeWidth={2} /> Đăng nhập</Link>
              <Link to="/register" className="nv-register-btn">Đăng ký</Link>
            </>
          )}

          <button className="nv-hamburger" onClick={() => setMobileOpen(true)}>
            <Menu size={19} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nv-mobile-drawer">
          <div className="nv-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="nv-mobile-panel">
            <div className="nv-mobile-top">
              <Link to="/" className="nv-logo">
                <div className="nv-logo-mark">V</div>
                <span className="nv-logo-name">T-Đ-T <span>English</span></span>
              </Link>
              <button className="nv-mobile-close" onClick={() => setMobileOpen(false)}>
                <X size={17} />
              </button>
            </div>

            {user && (
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="nv-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{username}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, marginTop: 2 }}>
                      {isAdmin ? "Quản trị viên" : "Học viên"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="nv-mobile-links">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className={`nv-mobile-link${isActive(to) ? " active" : ""}`}>
                  <Icon size={17} strokeWidth={1.8} /> {label}
                </Link>
              ))}
              {user && (
                <>
                  <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                  <Link to="/profile"   className="nv-mobile-link"><User    size={17} strokeWidth={1.8} /> Thông tin cá nhân</Link>
                  <Link to="/history"   className="nv-mobile-link"><History size={17} strokeWidth={1.8} /> Lịch sử học</Link>
                  <Link to="/favorites" className="nv-mobile-link"><Heart   size={17} strokeWidth={1.8} /> Từ vựng yêu thích</Link>
                  {isAdmin && (
                    <Link to="/admin" className="nv-mobile-link"><ShieldAlert size={17} strokeWidth={1.8} /> Quản trị</Link>
                  )}
                </>
              )}
            </div>

            <div className="nv-mobile-footer">
              {user ? (
                <button className="nv-mobile-logout" onClick={handleLogout}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              ) : (
                <>
                  <Link to="/login" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    textDecoration: "none", color: "var(--ink2)",
                    border: "1px solid var(--border)", borderRadius: 10,
                    background: "var(--white)", padding: "12px",
                    fontSize: 13.5, fontWeight: 600,
                  }}>
                    <LogIn size={16} /> Đăng nhập
                  </Link>
                  <Link to="/register" className="nv-register-btn" style={{ textAlign: "center", padding: "12px", display: "block" }}>
                    Đăng ký miễn phí
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini Chat */}
      {!isActive('/ai-chat') && (
        <div className="nv-mascot-wrapper">

          {miniChatOpen && (
            <div className="nv-mini-chat">
              <div className="nv-mc-header">
                <div className="nv-mc-title">
                  <span style={{ fontSize: 18 }}>🦜</span>
                  EngBot
                </div>
                <button className="nv-mc-close" onClick={() => setMiniChatOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="nv-mc-body">
                {miniMessages.map((msg, idx) => (
                  <div key={idx} className={`nv-mc-row ${msg.sender}`}>
                    {msg.sender === 'ai' && <div className="nv-mc-ava ai">🦜</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: msg.sender === 'ai' ? '100%' : 'auto' }}>
                      <div className="nv-mc-bubble">{msg.text}</div>
                      {msg.sender === 'ai' && msg.correction && (
                        <div className="nv-mc-corr">
                          <div className="nv-mc-corr-title">
                            <AlertCircle size={11} /> Nhận xét
                          </div>
                          <div className="nv-mc-corr-text">{msg.correction}</div>
                          {msg.better_version && (
                            <div className="nv-mc-better">"{msg.better_version}"</div>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="nv-mc-ava user">{username.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                ))}

                {miniLoading && (
                  <div className="nv-mc-row ai">
                    <div className="nv-mc-ava ai">🦜</div>
                    <div className="nv-mc-bubble" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span className="mascot-dot" /><span className="mascot-dot" /><span className="mascot-dot" />
                    </div>
                  </div>
                )}
                <div ref={miniChatEndRef} />
              </div>

              <form onSubmit={handleMiniSend} className="nv-mc-input">
                <input
                  type="text"
                  value={miniInput}
                  onChange={e => setMiniInput(e.target.value)}
                  placeholder="Tra ngữ pháp, hỏi bài..."
                  className="nv-mc-textfield"
                  disabled={miniLoading}
                />
                <button type="submit" disabled={miniLoading || !miniInput.trim()} className="nv-mc-send">
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          <button className="nv-mascot-btn" onClick={() => setMiniChatOpen(!miniChatOpen)}>
            {miniChatOpen
              ? <X size={22} color="white" />
              : <span style={{ fontSize: 22 }}>🦜</span>
            }
            {!miniChatOpen && <span className="nv-mascot-badge">1</span>}
          </button>
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

          <div className="nv-footer-brand">
            <div className="nv-footer-brand-row">
              <div className="nv-logo-mark" style={{ width: 30, height: 30, fontSize: 13 }}>V</div>
              <span className="nv-footer-brand-name">T-Đ-T <span>English</span></span>
            </div>
            <p className="nv-footer-tagline">
              Nền tảng học từ vựng tiếng Anh thông minh.<br />
              Học nhanh, nhớ lâu, thành thạo mỗi ngày.
            </p>
            {/* subtle accent dots */}
            <div style={{ display: "flex", gap: 5, marginTop: 18 }}>
              {["var(--ink)", "var(--gold)", "var(--green)", "var(--muted)"].map((c, i) => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.5 }} />
              ))}
            </div>
          </div>

          <div>
            <div className="nv-footer-col-title">Học tập</div>
            <div className="nv-footer-links">
              {learnLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="nv-footer-link">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border2)", flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="nv-footer-col-title">Tài khoản</div>
            <div className="nv-footer-links">
              {accountLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="nv-footer-link">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border2)", flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="nv-footer-divider" />

        <div className="nv-footer-bottom">
          <span className="nv-footer-copy">© 2026 T-Đ-T LearningEnglish · Nền tảng học tiếng Anh trực tuyến</span>
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