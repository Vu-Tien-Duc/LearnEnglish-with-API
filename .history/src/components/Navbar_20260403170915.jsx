import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios'; // Bắt buộc import axios để gọi API trong Mini Chat
import {
  LogOut, BookOpen, Home,
  Zap, Sparkles, Gamepad, LogIn, ShieldAlert,
  ChevronDown, User, History, Heart, Menu, X, Send, AlertCircle
} from 'lucide-react';

/* ─────────────────────────────────────────
   GLOBAL STYLES  (Light Theme + Mini Chat)
───────────────────────────────────────── */
const NAV_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .nv-root {
    --ink:      #0f172a; 
    --ink2:     #334155; 
    --slate:    #64748b; 
    --muted:    #94a3b8; 
    --fog:      #e2e8f0; 
    --paper:    #ffffff; 
    --cream:    #f8fafc; 
    --gold:     #eab308;
    --gold2:    #ca8a04;
    --sapphire: #2563eb; 
    --sapphire-light: #eff6ff; 
    --danger:   #ef4444; 
    --danger-light: #fef2f2;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Navbar shell ── */
  .nv-bar {
    position: sticky; top: 0; z-index: 200;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--fog);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
    gap: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  }

  .nv-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
  .nv-logo-mark { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
  .nv-logo-name { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 900; color: var(--ink); letter-spacing: -0.3px; }
  .nv-logo-name span { color: var(--sapphire); }

  .nv-center { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; }
  .nv-link { display: flex; align-items: center; gap: 6px; text-decoration: none; color: var(--slate); font-size: 14px; font-weight: 500; padding: 7px 14px; border-radius: 9px; transition: all 0.18s ease; white-space: nowrap; position: relative; }
  .nv-link:hover { color: var(--ink); background: rgba(0, 0, 0, 0.04); }
  .nv-link.active { color: var(--sapphire); background: var(--sapphire-light); font-weight: 600; }

  .nv-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

  .nv-user-wrap { position: relative; }
  .nv-user-pill { display: flex; align-items: center; gap: 8px; background: rgba(0, 0, 0, 0.03); border: 1px solid var(--fog); border-radius: 40px; padding: 6px 14px 6px 8px; cursor: pointer; user-select: none; transition: all 0.18s; color: var(--ink2); font-size: 13.5px; font-weight: 600; }
  .nv-user-pill:hover { background: rgba(0, 0, 0, 0.06); border-color: #cbd5e1; }
  .nv-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #bfdbfe, #93c5fd); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: var(--sapphire); flex-shrink: 0; }
  .nv-username { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nv-chevron { transition: transform 0.25s ease; color: var(--slate); }
  .nv-chevron.open { transform: rotate(180deg); }

  .nv-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: var(--paper); border: 1px solid var(--fog); border-radius: 16px; min-width: 220px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15); overflow: hidden; animation: dropIn 0.18s cubic-bezier(.4,0,.2,1); z-index: 500; }
  @keyframes dropIn { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .nv-dropdown-header { padding: 16px 16px 12px; background: var(--cream); border-bottom: 1px solid var(--fog); }
  .nv-dropdown-name { font-size: 14px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .nv-dropdown-role { font-size: 11px; color: var(--slate); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
  .nv-dd-item { display: flex; align-items: center; gap: 11px; padding: 12px 16px; text-decoration: none; color: var(--ink2); font-size: 13.5px; font-weight: 500; transition: all 0.15s; cursor: pointer; border: none; background: none; width: 100%; text-align: left; }
  .nv-dd-item:hover { background: var(--cream); color: var(--sapphire); }
  .nv-dd-item:not(:last-child) { border-bottom: 1px solid var(--fog); }
  .nv-dd-item.danger { color: var(--danger); }
  .nv-dd-item.danger:hover { background: var(--danger-light); color: #dc2626; }
  .nv-dd-divider { height: 1px; background: var(--fog); margin: 0; }

  .nv-admin-btn { display: flex; align-items: center; gap: 6px; text-decoration: none; background: #f3e8ff; color: #6d28d9; border: 1px solid #e9d5ff; padding: 6px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; transition: all 0.18s; white-space: nowrap; }
  .nv-admin-btn:hover { background: #e9d5ff; border-color: #d8b4fe; }

  .nv-login-btn { display: flex; align-items: center; gap: 6px; text-decoration: none; color: var(--ink2); font-size: 14px; font-weight: 600; padding: 7px 14px; border-radius: 9px; transition: all 0.18s; }
  .nv-login-btn:hover { color: var(--sapphire); background: var(--sapphire-light); }
  .nv-register-btn { text-decoration: none; background: var(--sapphire); color: #fff; padding: 8px 20px; border-radius: 9px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25); transition: all 0.18s; white-space: nowrap; }
  .nv-register-btn:hover { transform: translateY(-1px); background: #1d4ed8; box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35); }

  .nv-hamburger { display: none; border: 1px solid var(--fog); background: var(--cream); cursor: pointer; color: var(--ink2); padding: 6px; border-radius: 8px; transition: background 0.18s; }
  .nv-hamburger:hover { background: var(--fog); }

  /* ── Mobile drawer ── */
  .nv-mobile-drawer { position: fixed; inset: 0; z-index: 300; }
  .nv-mobile-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); }
  .nv-mobile-panel { position: absolute; top: 0; left: 0; bottom: 0; width: min(300px, 85vw); background: var(--paper); border-right: 1px solid var(--fog); display: flex; flex-direction: column; overflow-y: auto; animation: slideIn 0.22s cubic-bezier(.4,0,.2,1); box-shadow: 10px 0 30px rgba(0,0,0,0.1); }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  .nv-mobile-top { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--fog); background: var(--cream); }
  .nv-mobile-close { border: 1px solid var(--fog); background: #fff; border-radius: 8px; padding: 6px; cursor: pointer; color: var(--ink2); display: flex; transition: background 0.18s; }
  .nv-mobile-close:hover { background: var(--fog); }
  .nv-mobile-links { padding: 12px 0; flex: 1; }
  .nv-mobile-link { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink2); font-size: 15px; font-weight: 500; padding: 13px 20px; transition: all 0.15s; }
  .nv-mobile-link:hover { background: var(--cream); color: var(--sapphire); }
  .nv-mobile-link.active { color: var(--sapphire); background: var(--sapphire-light); font-weight: 600; }
  .nv-mobile-footer { padding: 20px; border-top: 1px solid var(--fog); background: var(--cream); display: flex; flex-direction: column; gap: 12px; }
  .nv-mobile-logout { display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #fca5a5; background: var(--danger-light); color: var(--danger); padding: 12px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; width: 100%; font-family: 'DM Sans', sans-serif; transition: background 0.18s; }

  /* ── Footer ── */
  .nv-footer { background: var(--cream); border-top: 1px solid var(--fog); padding: 60px 32px 32px; font-family: 'DM Sans', sans-serif; }
  .nv-footer-inner { max-width: 820px; margin: 0 auto; }
  .nv-footer-top { display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; margin-bottom: 48px; }
  .nv-footer-brand { max-width: 280px; }
  .nv-footer-brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .nv-footer-brand-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: var(--ink); }
  .nv-footer-brand-name span { color: var(--sapphire); }
  .nv-footer-tagline { font-size: 14px; color: var(--slate); line-height: 1.7; font-weight: 400; }
  .nv-footer-col-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink2); margin-bottom: 16px; }
  .nv-footer-links { display: flex; flex-direction: column; gap: 10px; }
  .nv-footer-link { text-decoration: none; color: var(--slate); font-size: 14px; font-weight: 500; transition: color 0.18s; display: flex; align-items: center; gap: 8px; }
  .nv-footer-link:hover { color: var(--sapphire); }
  .nv-footer-divider { height: 1px; background: var(--fog); margin-bottom: 24px; }
  .nv-footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .nv-footer-copy { font-size: 13px; color: var(--muted); font-weight: 500; letter-spacing: 0.3px; }
  .nv-footer-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .nv-footer-badge { font-size: 12px; color: var(--slate); border: 1px solid var(--fog); background: #fff; border-radius: 6px; padding: 4px 10px; font-weight: 600; letter-spacing: 0.3px; }

  /* ── Floating AI Mascot & MINI CHAT ── */
  .nv-mascot-wrapper { position: fixed; bottom: 30px; right: 30px; z-index: 999; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
  
  .nv-mini-chat {
    width: 340px; height: 480px; background: #fff;
    border: 2px solid #e5e7eb; border-bottom: 4px solid #d1d5db;
    border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    display: flex; flex-direction: column; overflow: hidden;
    transform-origin: bottom right;
    animation: popUpChat 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popUpChat {
    from { opacity: 0; transform: scale(0.8) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .nv-mc-header { background: linear-gradient(135deg, #58cc02, #46a302); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; color: white; }
  .nv-mc-title { font-weight: 900; font-size: 16px; display: flex; align-items: center; gap: 8px; }
  .nv-mc-close { background: rgba(255,255,255,0.2); border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; transition: background 0.2s; }
  .nv-mc-close:hover { background: rgba(255,255,255,0.4); }

  .nv-mc-body { flex: 1; background: #f8fafc; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .nv-mc-row { display: flex; gap: 8px; max-width: 90%; }
  .nv-mc-row.user { align-self: flex-end; justify-content: flex-end; }
  .nv-mc-row.ai { align-self: flex-start; }
  .nv-mc-ava { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; font-weight: bold; }
  .nv-mc-ava.ai { background: #dcfce7; border: 2px solid #bbf7d0; }
  .nv-mc-ava.user { background: #1cb0f6; border-bottom: 2px solid #1899d6; color: white; }
  .nv-mc-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; font-weight: 600; line-height: 1.4; }
  .nv-mc-row.user .nv-mc-bubble { background: #1cb0f6; color: white; border-bottom: 2px solid #1899d6; border-top-right-radius: 4px; }
  .nv-mc-row.ai .nv-mc-bubble { background: #fff; color: #334155; border: 1px solid #e2e8f0; border-bottom: 2px solid #cbd5e1; border-top-left-radius: 4px; }
  
  .nv-mc-corr { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 10px; margin-top: 6px; font-size: 12px; }
  .nv-mc-corr-title { color: #b45309; font-weight: 800; display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
  .nv-mc-corr-text { color: #78350f; font-weight: 600; }
  .nv-mc-better { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px; margin-top: 8px; color: #166534; font-weight: 600; font-style: italic;}

  .nv-mc-input { display: flex; padding: 12px; background: #fff; border-top: 1px solid #e2e8f0; gap: 8px; align-items: center;}
  .nv-mc-textfield { flex: 1; background: #f1f5f9; border: 2px solid transparent; border-radius: 12px; padding: 10px 14px; font-size: 14px; font-weight: 600; outline: none; transition: border 0.2s; font-family: inherit;}
  .nv-mc-textfield:focus { border-color: #58cc02; background: #fff;}
  .nv-mc-send { background: #58cc02; color: white; border: none; border-bottom: 3px solid #46a302; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0;}
  .nv-mc-send:disabled { opacity: 0.5; cursor: not-allowed; }
  .nv-mc-send:active:not(:disabled) { transform: translateY(2px); border-bottom-width: 1px; }

  /* Nút cục cưng Mascot */
  .nv-mascot-btn {
    width: 60px; height: 60px; border-radius: 20px;
    background: linear-gradient(135deg, #58cc02, #46a302);
    border: none; border-bottom: 4px solid #3a8c00;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; cursor: pointer;
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
    animation: bounceMascot 3s infinite ease-in-out;
    transition: all 0.2s; position: relative;
  }
  .nv-mascot-btn:hover { transform: scale(1.05); border-bottom-width: 2px; margin-top: 2px; box-shadow: 0 4px 12px rgba(88, 204, 2, 0.4); }
  @keyframes bounceMascot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  
  .nv-mascot-badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 10px; border: 2px solid white; animation: pulseBadge 2s infinite; }
  @keyframes pulseBadge { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

  .mascot-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: mascotDot 1.4s infinite; margin: 0 2px; }
  .mascot-dot:nth-child(2) { animation-delay: 0.2s; }
  .mascot-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes mascotDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

  @media (max-width: 768px) {
    .nv-center { display: none; }
    .nv-user-pill .nv-username { display: none; }
    .nv-user-pill .nv-chevron { display: none; }
    .nv-hamburger { display: flex; }
    .nv-bar { padding: 0 20px; }
    .nv-admin-btn span { display: none; }
    .nv-mascot-wrapper { bottom: 20px; right: 20px; }
    .nv-mascot-btn { width: 50px; height: 50px; font-size: 24px; border-radius: 16px; }
    .nv-mini-chat { width: calc(100vw - 40px); height: 400px; }
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

  // --- MINI CHAT STATE ---
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

  // Đóng drop/mobile khi chuyển trang, nhưng giữ nguyên Mini Chat
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  // Scroll bottom Mini Chat
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

  // Xử lý gửi tin nhắn Mini Chat
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
    } catch (err) {
      setMiniMessages(p => [...p, { sender: 'ai', text: "Kết nối gặp sự cố. Bạn thử lại sau nhé! 😥" }]);
    } finally {
      setMiniLoading(false);
    }
  };

  const navItems = [
    { to: "/",        icon: Home,     label: "Tổng quan"   },
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
          <span className="nv-logo-name">T-Đ-T    <span>LearningEnglish</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="nv-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`nv-link${isActive(to) ? " active" : ""}`}>
              <Icon size={16} />
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
              <Link to="/login" className="nv-login-btn"><LogIn size={16} /> Đăng nhập</Link>
              <Link to="/register" className="nv-register-btn">Đăng ký</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="nv-hamburger" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer (Giữ nguyên) */}
      {mobileOpen && (
        <div className="nv-mobile-drawer">
          <div className="nv-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="nv-mobile-panel">
            <div className="nv-mobile-top">
              <div className="nv-logo">
                <div className="nv-logo-mark">V</div>
                <span className="nv-logo-name">T-Đ-T    <span>LearningEnglish</span></span>
              </div>
              <button className="nv-mobile-close" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {user && (
              <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--fog)", background: "var(--cream)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="nv-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{username}</div>
                    <div style={{ fontSize: 12, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                      {isAdmin ? "Quản trị viên" : "Học viên"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="nv-mobile-links">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className={`nv-mobile-link${isActive(to) ? " active" : ""}`}>
                  <Icon size={18} /> {label}
                </Link>
              ))}
              {user && (
                <>
                  <div style={{ height: 1, background: "var(--fog)", margin: "8px 0" }} />
                  <Link to="/profile"   className="nv-mobile-link"><User    size={18} /> Thông tin cá nhân</Link>
                  <Link to="/history"   className="nv-mobile-link"><History size={18} /> Lịch sử học</Link>
                  <Link to="/favorites" className="nv-mobile-link"><Heart   size={18} /> Từ vựng yêu thích</Link>
                  {isAdmin && (
                    <Link to="/admin" className="nv-mobile-link"><ShieldAlert size={18} /> Quản trị</Link>
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
                    textDecoration: "none", color: "var(--ink2)",
                    border: "1px solid var(--fog)", borderRadius: 10, background: "#fff",
                    padding: "12px", fontSize: 14, fontWeight: 600,
                  }}>
                    <LogIn size={18} /> Đăng nhập
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

      {/* 🔥 LINH THÚ AI GÓC DƯỚI PHẢI & BẢNG MINI CHAT 🔥 */}
      {!isActive('/ai-chat') && (
        <div className="nv-mascot-wrapper">
          
          {/* Bảng Chat Nhỏ */}
          {miniChatOpen && (
            <div className="nv-mini-chat">
              {/* Header */}
              <div className="nv-mc-header">
                <div className="nv-mc-title">
                  <div className="nv-mc-ava ai" style={{width:24, height:24, fontSize: 12, border: 'none'}}>🦜</div>
                  EngBot Mini
                </div>
                <button className="nv-mc-close" onClick={() => setMiniChatOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="nv-mc-body">
                {miniMessages.map((msg, idx) => (
                  <div key={idx} className={`nv-mc-row ${msg.sender}`}>
                    {msg.sender === 'ai' && <div className="nv-mc-ava ai">🦜</div>}
                    
                    <div style={{display:'flex', flexDirection:'column', gap: 4, maxWidth: msg.sender==='ai' ? '100%' : 'auto'}}>
                      <div className="nv-mc-bubble">{msg.text}</div>
                      
                      {msg.sender === 'ai' && msg.correction && (
                        <div className="nv-mc-corr">
                          <div className="nv-mc-corr-title"><AlertCircle size={14}/> Lỗi:</div>
                          <div className="nv-mc-corr-text">{msg.correction}</div>
                          {msg.better_version && (
                            <div className="nv-mc-better">"{msg.better_version}"</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {msg.sender === 'user' && <div className="nv-mc-ava user">{username.charAt(0).toUpperCase()}</div>}
                  </div>
                ))}

                {miniLoading && (
                  <div className="nv-mc-row ai">
                    <div className="nv-mc-ava ai">🦜</div>
                    <div className="nv-mc-bubble" style={{display:'flex', alignItems:'center'}}>
                      <span className="mascot-dot" /><span className="mascot-dot" /><span className="mascot-dot" />
                    </div>
                  </div>
                )}
                <div ref={miniChatEndRef} />
              </div>

              {/* Input */}
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
                  <Send size={18} style={{marginLeft: 2}}/>
                </button>
              </form>
            </div>
          )}

          {/* Nút bấm con chim */}
          <button className="nv-mascot-btn" onClick={() => setMiniChatOpen(!miniChatOpen)}>
            {miniChatOpen ? <X size={28} color="white" /> : '🦜'}
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
              <div className="nv-logo-mark" style={{ width: 30, height: 30, fontSize: 14 }}>V</div>
              <span className="nv-footer-brand-name">T-Đ-T   <span>LearningEnglish</span></span>
            </div>
            <p className="nv-footer-tagline">Nền tảng học từ vựng tiếng Anh thông minh. Học nhanh, nhớ lâu, thành thạo mỗi ngày.</p>
            <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
              {["#3b82f6","#10b981","#f59e0b","#ef4444"].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
            </div>
          </div>
          <div>
            <div className="nv-footer-col-title">Học tập</div>
            <div className="nv-footer-links">
              {learnLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="nv-footer-link">
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--sapphire)", opacity: 0.7, flexShrink: 0 }} />
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
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--sapphire)", opacity: 0.7, flexShrink: 0 }} />
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