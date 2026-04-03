import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar, { Footer } from '../../components/Navbar';

/* ─── helpers ─── */
function getUser() {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
}

/* ─── Global styles injected once ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink:      #0d0f14;
    --ink2:     #1c2030;
    --slate:    #3d4561;
    --muted:    #7a849e;
    --fog:      #b8bfce;
    --paper:    #f5f4f0;
    --cream:    #faf9f6;
    --gold:     #c9a84c;
    --gold2:    #e8c96b;
    --emerald:  #1e8c6e;
    --sapphire: #2563d4;
    --rose:     #c2435a;
    --amber:    #d97706;
    --violet:   #6d28d9;
    --glow-g:   rgba(201,168,76,0.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: var(--cream); }

  .hvoc-page {
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
  }

  /* ── noise overlay ── */
  .hvoc-page::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  /* ── hero banner ── */
  .hvoc-hero {
    position: relative;
    background: var(--ink);
    overflow: hidden;
    padding: 56px 40px 48px;
  }
  .hvoc-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.18) 0%, transparent 65%),
                radial-gradient(ellipse at 10% 80%, rgba(37,99,212,0.12) 0%, transparent 55%);
  }
  .hvoc-hero-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .hvoc-hero-inner {
    position: relative; z-index: 1;
    max-width: 820px; margin: 0 auto;
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 24px; flex-wrap: wrap;
  }
  .hvoc-tagline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 900;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
  .hvoc-tagline em {
    font-style: normal;
    color: var(--gold2);
    position: relative;
  }
  .hvoc-tagline em::after {
    content: '';
    position: absolute; bottom: -3px; left: 0; right: 0; height: 2px;
    background: var(--gold2); opacity: 0.5; border-radius: 2px;
  }
  .hvoc-sub {
    font-size: 14px; color: rgba(255,255,255,0.5);
    font-weight: 300; margin-top: 10px; letter-spacing: 0.3px;
  }

  /* ── streak badge ── */
  .hvoc-streak {
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    border-radius: 20px;
    padding: 16px 24px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 0 40px rgba(201,168,76,0.4);
    white-space: nowrap;
  }
  .hvoc-streak-num {
    font-family: 'Playfair Display', serif;
    font-size: 38px; font-weight: 900; color: var(--ink); line-height: 1;
  }
  .hvoc-streak-label { font-size: 11px; font-weight: 600; color: var(--ink2); text-transform: uppercase; letter-spacing: 1px; }

  /* ── main content ── */
  .hvoc-main {
    position: relative; z-index: 1;
    max-width: 820px; margin: 0 auto;
    padding: 40px 20px 80px;
  }

  /* ── section header ── */
  .hvoc-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--muted);
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
  }
  .hvoc-section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--fog); opacity: 0.5;
  }

  /* ── progress card ── */
  .hvoc-progress-card {
    background: var(--ink2);
    border-radius: 24px;
    padding: 32px;
    display: flex; align-items: center; gap: 32px;
    margin-bottom: 14px;
    position: relative; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
    flex-wrap: wrap;
  }
  .hvoc-progress-card::before {
    content: '';
    position: absolute; top: -60px; right: -40px;
    width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hvoc-progress-title {
    font-size: 10px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
    margin-bottom: 10px;
  }
  .hvoc-progress-pct {
    font-family: 'Playfair Display', serif;
    font-size: 72px; font-weight: 900; color: #fff;
    line-height: 0.9; margin-bottom: 10px;
  }
  .hvoc-progress-pct span { font-size: 28px; color: var(--gold2); }
  .hvoc-progress-detail {
    font-size: 13px; color: rgba(255,255,255,0.45);
    margin-bottom: 18px; font-weight: 300;
  }
  .hvoc-bar-track {
    height: 4px; background: rgba(255,255,255,0.1);
    border-radius: 99px; overflow: hidden; width: 240px; max-width: 100%;
  }
  .hvoc-bar-fill {
    height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2));
    border-radius: 99px;
    transition: width 1.4s cubic-bezier(.4,0,.2,1);
  }
  .hvoc-ring-wrap {
    position: relative; flex-shrink: 0;
  }
  .hvoc-ring-inner {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
  }
  .hvoc-ring-inner-pct {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900; color: #fff;
  }

  /* ── stat chips ── */
  .hvoc-stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px; margin-bottom: 40px;
  }
  .hvoc-stat-chip {
    background: #fff;
    border-radius: 18px;
    padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
    opacity: 0;
    animation: fadeUp 0.5s forwards;
  }
  .hvoc-stat-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }
  .hvoc-stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .hvoc-stat-label {
    font-size: 11px; color: var(--muted); font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;
  }
  .hvoc-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: var(--ink); line-height: 1;
  }

  /* ── history ── */
  .hvoc-history-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.06);
    padding: 24px;
    margin-bottom: 40px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .hvoc-history-title {
    font-size: 13px; font-weight: 600; color: var(--ink2);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .hvoc-history-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px; border-radius: 12px;
    margin-bottom: 8px;
    transition: background 0.15s;
  }
  .hvoc-history-row:hover { background: var(--paper); }
  .hvoc-history-row:last-child { margin-bottom: 0; }
  .hvoc-history-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--ink2);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold2); font-family: 'Playfair Display', serif;
    font-size: 14px; font-weight: 700; flex-shrink: 0;
  }
  .hvoc-history-word { font-size: 14px; font-weight: 600; color: var(--ink); }
  .hvoc-history-meaning { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .hvoc-score-pill {
    font-size: 12px; font-weight: 700; border-radius: 8px;
    padding: 4px 10px; flex-shrink: 0;
  }

  /* ── menu grid ── */
  .hvoc-menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 14px;
  }
  .hvoc-menu-card {
    background: #fff;
    border-radius: 20px;
    padding: 24px 22px;
    cursor: pointer;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    transition: all 0.22s cubic-bezier(.4,0,.2,1);
    opacity: 0;
    animation: fadeUp 0.5s forwards;
    position: relative; overflow: hidden;
  }
  .hvoc-menu-card::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 20px 20px 0 0;
    opacity: 0;
    transition: opacity 0.22s;
  }
  .hvoc-menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    border-color: rgba(0,0,0,0.0);
  }
  .hvoc-menu-card:hover::after { opacity: 1; }
  .hvoc-menu-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    transition: transform 0.22s;
  }
  .hvoc-menu-card:hover .hvoc-menu-icon { transform: scale(1.08); }
  .hvoc-menu-name {
    font-size: 15px; font-weight: 600; color: var(--ink);
    margin-bottom: 5px;
  }
  .hvoc-menu-desc {
    font-size: 12px; color: var(--muted); line-height: 1.6; font-weight: 300;
  }
  .hvoc-menu-arrow {
    position: absolute; bottom: 20px; right: 20px;
    opacity: 0; transform: translateX(-4px);
    transition: all 0.22s;
    color: var(--muted);
  }
  .hvoc-menu-card:hover .hvoc-menu-arrow {
    opacity: 1; transform: translateX(0);
  }

  /* ── loading ── */
  .hvoc-loading {
    text-align: center; padding: 60px 0;
  }
  .hvoc-spinner {
    width: 36px; height: 36px;
    border: 2px solid var(--fog);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 12px;
  }

  /* ── guest ── */
  .hvoc-guest {
    min-height: 100vh;
    background: var(--ink);
    font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column;
  }
  .hvoc-guest-topbar {
    padding: 24px 36px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .hvoc-guest-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900; color: #fff;
    display: flex; align-items: center; gap: 10px;
  }
  .hvoc-guest-logo-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--gold2);
  }
  .hvoc-guest-body {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 24px; text-align: center;
    position: relative;
  }
  .hvoc-guest-body::before {
    content: '';
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hvoc-guest-eyebrow {
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--gold2); font-weight: 600; margin-bottom: 20px;
  }
  .hvoc-guest-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 6vw, 60px); font-weight: 900;
    color: #fff; line-height: 1.1; margin-bottom: 20px;
  }
  .hvoc-guest-title span {
    color: var(--gold2);
    text-decoration: underline;
    text-decoration-color: rgba(232,201,107,0.3);
    text-underline-offset: 6px;
  }
  .hvoc-guest-para {
    font-size: 16px; color: rgba(255,255,255,0.45);
    max-width: 420px; line-height: 1.8;
    font-weight: 300; margin-bottom: 40px;
  }
  .hvoc-guest-features {
    display: flex; flex-wrap: wrap; gap: 10px;
    justify-content: center; margin-bottom: 44px;
  }
  .hvoc-guest-pill {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 40px; padding: 9px 18px;
    font-size: 13px; color: rgba(255,255,255,0.7);
    font-weight: 400; display: flex; align-items: center; gap: 8px;
    backdrop-filter: blur(4px);
  }
  .hvoc-cta-btn {
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: var(--ink); border: none; border-radius: 14px;
    padding: 16px 40px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 8px 32px rgba(201,168,76,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .hvoc-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(201,168,76,0.5);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/* ─── inject style once ─── */
function useGlobalStyle() {
  useEffect(() => {
    const id = "hvoc-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = GLOBAL_STYLE;
      document.head.appendChild(s);
    }
  }, []);
}

/* ─── SVG Icons ─── */
const Icons = {
  book:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  brain:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.7-3.68 2.5 2.5 0 0 1 .68-4.82A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.7-3.68 2.5 2.5 0 0 0-.68-4.82A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  heart:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  clock:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  game:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>,
  bot:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>,
  fire:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 6-6 6-6 12a6 6 0 0 0 12 0c0-6-6-6-6-12z"/><path d="M12 12c0 3-2 3-2 5a2 2 0 0 0 4 0c0-2-2-2-2-5z"/></svg>,
  check:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  total:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

/* ─── Progress Ring ─── */
function ProgressRing({ pct }) {
  const r = 52, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="65" cy="65" r={r} fill="none"
        stroke="url(#ringGold)" strokeWidth="8"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
      <defs>
        <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#e8c96b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Guest Landing ─── */
function GuestLanding({ navigate }) {
  useGlobalStyle();
  const features = [
    { emoji: "📖", text: "Flashcard thông minh" },
    { emoji: "🧠", text: "Quiz 4 đáp án" },
    { emoji: "🎮", text: "Mini game vui nhộn" },
    { emoji: "🤖", text: "AI Teacher 24/7" },
  ];
  return (
    <div className="hvoc-guest">
      <div className="hvoc-guest-topbar">
        <div className="hvoc-guest-logo">
          <div className="hvoc-guest-logo-dot" />
          VocabMaster
        </div>
        <button className="hvoc-cta-btn" style={{ padding: "10px 22px", fontSize: 13 }}
          onClick={() => navigate("/login")}>
          Đăng nhập
        </button>
      </div>
      <div className="hvoc-guest-body">
        <div className="hvoc-guest-eyebrow">Từ vựng tiếng Anh</div>
        <h1 className="hvoc-guest-title">
          Học sâu. Nhớ lâu.<br />
          <span>Thành thạo.</span>
        </h1>
        <p className="hvoc-guest-para">
          Lộ trình cá nhân hóa, quiz thú vị và AI Teacher giúp bạn nắm vững từ vựng tiếng Anh một cách tự nhiên.
        </p>
        <div className="hvoc-guest-features">
          {features.map((f, i) => (
            <div key={i} className="hvoc-guest-pill">
              <span>{f.emoji}</span> {f.text}
            </div>
          ))}
        </div>
        <button className="hvoc-cta-btn" onClick={() => navigate("/login")}>
          Bắt đầu miễn phí →
        </button>
      </div>
    </div>
  );
}

/* ─── Main Home ─── */
export default function Home() {
  useGlobalStyle();
  const navigate = useNavigate();
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const userId = user.UserID || user.id || user.userId;
    API.get("/user/dashboard-summary", { params: { user_id: userId } })
      .then(res => setStats(res.data))
      .catch(err => console.error("Lỗi lấy thống kê:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <GuestLanding navigate={navigate} />;

  const pct = stats?.completionPercentage || 0;

  const menus = [
    { icon: Icons.book,  title: "Học từ vựng",  desc: "Lật thẻ · New / Learning / Mastered", accent: "#1e8c6e", bg: "#e6f7f2", topbar: "#1e8c6e", path: "/flashcard" },
    { icon: Icons.brain, title: "Làm Quiz",      desc: "Trắc nghiệm · 4 đáp án · tính điểm",  accent: "#2563d4", bg: "#eff6ff", topbar: "#2563d4", path: "/quiz" },
    { icon: Icons.heart, title: "Yêu thích",     desc: "Xem lại những từ đã lưu",              accent: "#c2435a", bg: "#fdf2f4", topbar: "#c2435a", path: "/favorites" },
    { icon: Icons.clock, title: "Lịch sử",       desc: "Kết quả quiz và tiến độ học",          accent: "#d97706", bg: "#fffbeb", topbar: "#d97706", path: "/history" },
    { icon: Icons.game,  title: "Mini Game",     desc: "Đảo chữ · Lật thẻ nhớ vui",           accent: "#6d28d9", bg: "#f5f3ff", topbar: "#6d28d9", path: "/mini-game" },
    { icon: Icons.bot,   title: "Chat AI",       desc: "Luyện giao tiếp với AI Teacher",       accent: "#0d0f14", bg: "#f0f1f4", topbar: "#0d0f14", path: "/ai-chat" },
  ];

  const statChips = [
    { icon: Icons.total, label: "Tổng số từ",  value: stats?.TotalWords    || 0, iconBg: "#f5f4f0", iconColor: "#3d4561" },
    { icon: Icons.check, label: "Đã thuộc",    value: stats?.MasteredWords || 0, iconBg: "#e6f7f2", iconColor: "#1e8c6e" },
    { icon: Icons.clock, label: "Đang học",    value: stats?.LearningWords || 0, iconBg: "#fffbeb", iconColor: "#d97706" },
    { icon: Icons.heart, label: "Yêu thích",   value: stats?.TotalFavorites|| 0, iconBg: "#fdf2f4", iconColor: "#c2435a" },
  ];

  return (
    <div className="hvoc-page">
      <Navbar />

      {/* ── Hero ── */}
      <div className="hvoc-hero">
        <div className="hvoc-hero-grid" />
        <div className="hvoc-hero-inner">
          <div>
            <h1 className="hvoc-tagline">
              Mở rộng<br />
              <em>từ vựng</em> của bạn.
            </h1>
            <p className="hvoc-sub">Tiếp tục hành trình · Kiên trì mỗi ngày</p>
          </div>
          <div className="hvoc-streak">
            <div style={{ fontSize: 28 }}>🔥</div>
            <div>
              <div className="hvoc-streak-num">{stats?.streak ?? "—"}</div>
              <div className="hvoc-streak-label">Ngày liên tiếp</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="hvoc-main">

        {loading ? (
          <div className="hvoc-loading">
            <div className="hvoc-spinner" />
            <div style={{ fontSize: 13, color: "var(--muted)", letterSpacing: "0.5px" }}>Đang tải dữ liệu…</div>
          </div>
        ) : (
          <>
            {/* ── Progress ── */}
            <div className="hvoc-section-label">Tiến độ học</div>
            <div className="hvoc-progress-card" style={{ marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div className="hvoc-progress-title">Tỉ lệ hoàn thành</div>
                <div className="hvoc-progress-pct">{pct}<span>%</span></div>
                <div className="hvoc-progress-detail">
                  {stats?.MasteredWords || 0} / {stats?.TotalWords || 0} từ đã thuộc
                </div>
                <div className="hvoc-bar-track">
                  <div className="hvoc-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="hvoc-ring-wrap">
                <ProgressRing pct={pct} />
                <div className="hvoc-ring-inner">
                  <div className="hvoc-ring-inner-pct">{pct}%</div>
                </div>
              </div>
            </div>

            {/* ── Stat chips ── */}
            <div className="hvoc-stats-row" style={{ marginBottom: 40 }}>
              {statChips.map((s, i) => (
                <div key={i} className="hvoc-stat-chip" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="hvoc-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="hvoc-stat-label">{s.label}</div>
                    <div className="hvoc-stat-value">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Recent History ── */}
            {stats?.RecentHistory?.length > 0 && (
              <>
                <div className="hvoc-section-label">Lịch sử gần đây</div>
                <div className="hvoc-history-card" style={{ marginBottom: 40 }}>
                  {stats.RecentHistory.map((h, i) => (
                    <div key={i} className="hvoc-history-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="hvoc-history-avatar">{h.word?.charAt(0)}</div>
                        <div>
                          <div className="hvoc-history-word">{h.word}</div>
                          <div className="hvoc-history-meaning">{h.meaning}</div>
                        </div>
                      </div>
                      <div className="hvoc-score-pill" style={{
                        background: h.score >= 70 ? "#e6f7f2" : h.score >= 40 ? "#fffbeb" : "#fdf2f4",
                        color:      h.score >= 70 ? "#1e8c6e" : h.score >= 40 ? "#d97706" : "#c2435a",
                      }}>
                        {h.score} điểm
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Menu ── */}
        <div className="hvoc-section-label">Tính năng</div>
        <div className="hvoc-menu-grid">
          {menus.map((m, i) => (
            <div
              key={i}
              className="hvoc-menu-card"
              style={{ animationDelay: `${i * 70}ms` }}
              onClick={() => navigate(m.path)}
            >
              {/* colored top bar on hover via pseudo, but also bake accent color as CSS var */}
              <style>{`.hvoc-menu-card:nth-child(${i+1})::after { background: ${m.topbar}; }`}</style>
              <div className="hvoc-menu-icon" style={{ background: m.bg, color: m.accent }}>
                {m.icon}
              </div>
              <div className="hvoc-menu-name">{m.title}</div>
              <div className="hvoc-menu-desc">{m.desc}</div>
              <div className="hvoc-menu-arrow">{Icons.arrow}</div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}