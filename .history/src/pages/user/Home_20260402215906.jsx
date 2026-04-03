import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import Navbar, { Footer } from '../../components/Navbar';

/* ─── helpers ─── */
function getUser() {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
}

/* ─── Global styles injected once (Light Theme) ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:      #0f172a; /* Slate 900 - Chữ chính */
    --ink2:     #334155; /* Slate 700 - Chữ phụ */
    --slate:    #64748b; /* Slate 500 - Muted text/icons */
    --muted:    #94a3b8; /* Slate 400 */
    --fog:      #e2e8f0; /* Slate 200 - Viền */
    --paper:    #ffffff; /* Trắng - Nền Card */
    --cream:    #f8fafc; /* Slate 50 - Nền Body */
    
    --gold:     #eab308;
    --gold2:    #ca8a04;
    --emerald:  #10b981;
    --sapphire: #2563eb; /* Primary Blue */
    --rose:     #ef4444;
    --amber:    #f59e0b;
    --violet:   #8b5cf6;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: var(--cream); }

  .hvoc-page {
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
  }

  /* ── hero banner ── */
  .hvoc-hero {
    position: relative;
    background: #ffffff;
    overflow: hidden;
    padding: 64px 40px 56px;
    border-bottom: 1px solid var(--fog);
  }
  .hvoc-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 80% 50%, rgba(234, 179, 8, 0.08) 0%, transparent 65%),
                radial-gradient(ellipse at 10% 80%, rgba(37, 99, 235, 0.06) 0%, transparent 55%);
  }
  .hvoc-hero-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .hvoc-hero-inner {
    position: relative; z-index: 1;
    max-width: 820px; margin: 0 auto;
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 32px; flex-wrap: wrap;
  }
  .hvoc-tagline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 900;
    color: var(--ink);
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
  .hvoc-tagline em {
    font-style: normal;
    color: var(--sapphire);
    position: relative;
  }
  .hvoc-tagline em::after {
    content: '';
    position: absolute; bottom: -2px; left: 0; right: 0; height: 3px;
    background: var(--sapphire); opacity: 0.2; border-radius: 3px;
  }
  .hvoc-sub {
    font-size: 15px; color: var(--slate);
    font-weight: 400; margin-top: 12px; letter-spacing: 0.3px;
  }

  /* ── streak badge ── */
  .hvoc-streak {
    background: #ffffff;
    border: 2px solid #fef08a;
    border-radius: 20px;
    padding: 16px 24px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 10px 25px -5px rgba(234, 179, 8, 0.15);
    white-space: nowrap;
  }
  .hvoc-streak-num {
    font-family: 'Playfair Display', serif;
    font-size: 38px; font-weight: 900; color: var(--gold2); line-height: 1;
  }
  .hvoc-streak-label { font-size: 11px; font-weight: 700; color: var(--ink2); text-transform: uppercase; letter-spacing: 1px; }

  /* ── main content ── */
  .hvoc-main {
    position: relative; z-index: 1;
    max-width: 820px; margin: 0 auto;
    padding: 48px 20px 80px;
  }

  /* ── section header ── */
  .hvoc-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--slate);
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }
  .hvoc-section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--fog); opacity: 0.8;
  }

  /* ── progress card ── */
  .hvoc-progress-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px 40px;
    display: flex; align-items: center; justify-content: space-between; gap: 32px;
    margin-bottom: 16px;
    position: relative; overflow: hidden;
    border: 1px solid var(--fog);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03);
    flex-wrap: wrap;
  }
  .hvoc-progress-card::before {
    content: '';
    position: absolute; top: -60px; right: -40px;
    width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .hvoc-progress-title {
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--slate);
    margin-bottom: 12px;
  }
  .hvoc-progress-pct {
    font-family: 'Playfair Display', serif;
    font-size: 72px; font-weight: 900; color: var(--ink);
    line-height: 0.9; margin-bottom: 12px;
  }
  .hvoc-progress-pct span { font-size: 28px; color: var(--sapphire); }
  .hvoc-progress-detail {
    font-size: 14px; color: var(--ink2);
    margin-bottom: 20px; font-weight: 500;
  }
  .hvoc-bar-track {
    height: 6px; background: var(--fog);
    border-radius: 99px; overflow: hidden; width: 260px; max-width: 100%;
  }
  .hvoc-bar-fill {
    height: 100%; background: linear-gradient(90deg, #60a5fa, #2563eb);
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
    font-size: 24px; font-weight: 900; color: var(--ink);
  }

  /* ── stat chips ── */
  .hvoc-stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px; margin-bottom: 48px;
  }
  .hvoc-stat-chip {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    display: flex; align-items: center; gap: 16px;
    border: 1px solid var(--fog);
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    transition: transform 0.2s, box-shadow 0.2s;
    opacity: 0;
    animation: fadeUp 0.5s forwards;
  }
  .hvoc-stat-chip:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
  }
  .hvoc-stat-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .hvoc-stat-label {
    font-size: 11px; color: var(--slate); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
  }
  .hvoc-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 800; color: var(--ink); line-height: 1;
  }

  /* ── history ── */
  .hvoc-history-card {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid var(--fog);
    padding: 24px;
    margin-bottom: 48px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .hvoc-history-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-radius: 12px;
    margin-bottom: 8px; border: 1px solid transparent;
    transition: all 0.15s;
  }
  .hvoc-history-row:hover { background: var(--cream); border-color: var(--fog); }
  .hvoc-history-row:last-child { margin-bottom: 0; }
  .hvoc-history-avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: var(--cream); border: 1px solid var(--fog);
    display: flex; align-items: center; justify-content: center;
    color: var(--sapphire); font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 800; flex-shrink: 0;
  }
  .hvoc-history-word { font-size: 15px; font-weight: 700; color: var(--ink); }
  .hvoc-history-meaning { font-size: 13px; color: var(--slate); margin-top: 2px; }
  .hvoc-score-pill {
    font-size: 12px; font-weight: 700; border-radius: 8px;
    padding: 5px 12px; flex-shrink: 0; border: 1px solid transparent;
  }

  /* ── menu grid ── */
  .hvoc-menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  .hvoc-menu-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    cursor: pointer;
    border: 1px solid var(--fog);
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    transition: all 0.22s cubic-bezier(.4,0,.2,1);
    opacity: 0;
    animation: fadeUp 0.5s forwards;
    position: relative; overflow: hidden;
  }
  .hvoc-menu-card::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    border-radius: 20px 20px 0 0;
    opacity: 0;
    transition: opacity 0.22s;
  }
  .hvoc-menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px -5px rgba(0,0,0,0.08);
    border-color: transparent;
  }
  .hvoc-menu-card:hover::after { opacity: 1; }
  .hvoc-menu-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; border: 1px solid rgba(0,0,0,0.04);
    transition: transform 0.22s;
  }
  .hvoc-menu-card:hover .hvoc-menu-icon { transform: scale(1.08); }
  .hvoc-menu-name {
    font-size: 16px; font-weight: 700; color: var(--ink);
    margin-bottom: 6px;
  }
  .hvoc-menu-desc {
    font-size: 13px; color: var(--slate); line-height: 1.5; font-weight: 400;
  }
  .hvoc-menu-arrow {
    position: absolute; bottom: 24px; right: 24px;
    opacity: 0; transform: translateX(-4px);
    transition: all 0.22s;
    color: var(--slate);
  }
  .hvoc-menu-card:hover .hvoc-menu-arrow {
    opacity: 1; transform: translateX(0);
  }

  /* ── loading ── */
  .hvoc-loading {
    text-align: center; padding: 80px 0;
  }
  .hvoc-spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--fog);
    border-top-color: var(--sapphire);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 16px;
  }

  /* ── guest ── */
  .hvoc-guest {
    min-height: 100vh;
    background: #ffffff;
    font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column;
  }
  .hvoc-guest-topbar {
    padding: 24px 40px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--fog);
  }
  .hvoc-guest-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900; color: var(--ink);
    display: flex; align-items: center; gap: 10px;
  }
  .hvoc-guest-logo-dot {
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--sapphire);
  }
  .hvoc-guest-body {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 24px; text-align: center;
    position: relative;
  }
  .hvoc-guest-body::before {
    content: '';
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .hvoc-guest-eyebrow {
    font-size: 12px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--sapphire); font-weight: 700; margin-bottom: 24px;
  }
  .hvoc-guest-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 7vw, 68px); font-weight: 900;
    color: var(--ink); line-height: 1.1; margin-bottom: 24px;
  }
  .hvoc-guest-title span {
    color: var(--sapphire);
    position: relative;
    white-space: nowrap;
  }
  .hvoc-guest-title span::after {
    content: ''; position: absolute; bottom: 4px; left: 0; right: 0;
    height: 12px; background: rgba(37, 99, 235, 0.15); z-index: -1;
  }
  .hvoc-guest-para {
    font-size: 18px; color: var(--ink2);
    max-width: 500px; line-height: 1.6;
    font-weight: 400; margin-bottom: 48px;
  }
  .hvoc-guest-features {
    display: flex; flex-wrap: wrap; gap: 12px;
    justify-content: center; margin-bottom: 48px;
  }
  .hvoc-guest-pill {
    background: #ffffff;
    border: 1px solid var(--fog);
    border-radius: 40px; padding: 10px 20px;
    font-size: 14px; color: var(--ink2);
    font-weight: 500; display: flex; align-items: center; gap: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .hvoc-cta-btn {
    background: var(--sapphire);
    color: #fff; border: none; border-radius: 14px;
    padding: 16px 44px; font-size: 16px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .hvoc-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.5);
    background: #1d4ed8;
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
  book:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  brain:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.7-3.68 2.5 2.5 0 0 1 .68-4.82A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.7-3.68 2.5 2.5 0 0 0-.68-4.82A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  heart:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  clock:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  game:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>,
  bot:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>,
  fire:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 6-6 6-6 12a6 6 0 0 0 12 0c0-6-6-6-6-12z"/><path d="M12 12c0 3-2 3-2 5a2 2 0 0 0 4 0c0-2-2-2-2-5z"/></svg>,
  check:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  total:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

/* ─── Progress Ring (Light Theme Colors) ─── */
function ProgressRing({ pct }) {
  const r = 52, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx="65" cy="65" r={r} fill="none"
        stroke="url(#ringBlue)" strokeWidth="8"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
      <defs>
        <linearGradient id="ringBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
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
        <button className="hvoc-cta-btn" style={{ padding: "10px 24px", fontSize: 14 }}
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
              <span style={{fontSize: 16}}>{f.emoji}</span> {f.text}
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
    { icon: Icons.book,  title: "Học từ vựng",  desc: "Lật thẻ · New / Learning / Mastered", accent: "#059669", bg: "#dcfce7", topbar: "#10b981", path: "/flashcard" },
    { icon: Icons.brain, title: "Làm Quiz",      desc: "Trắc nghiệm · 4 đáp án · tính điểm",  accent: "#2563eb", bg: "#dbeafe", topbar: "#3b82f6", path: "/quiz" },
    { icon: Icons.heart, title: "Yêu thích",     desc: "Xem lại những từ đã lưu",             accent: "#e11d48", bg: "#fee2e2", topbar: "#ef4444", path: "/favorites" },
    { icon: Icons.clock, title: "Lịch sử",       desc: "Kết quả quiz và tiến độ học",         accent: "#d97706", bg: "#fef3c7", topbar: "#f59e0b", path: "/history" },
    { icon: Icons.game,  title: "Mini Game",     desc: "Đảo chữ · Lật thẻ nhớ vui",           accent: "#7c3aed", bg: "#f3e8ff", topbar: "#8b5cf6", path: "/mini-game" },
    { icon: Icons.bot,   title: "Chat AI",       desc: "Luyện giao tiếp với AI Teacher",      accent: "#0f172a", bg: "#f1f5f9", topbar: "#334155", path: "/ai-chat" },
  ];

  const statChips = [
    { icon: Icons.total, label: "Tổng số từ",  value: stats?.TotalWords    || 0, iconBg: "#f1f5f9", iconColor: "#475569" },
    { icon: Icons.check, label: "Đã thuộc",    value: stats?.MasteredWords || 0, iconBg: "#dcfce7", iconColor: "#059669" },
    { icon: Icons.clock, label: "Đang học",    value: stats?.LearningWords || 0, iconBg: "#fef3c7", iconColor: "#d97706" },
    { icon: Icons.heart, label: "Yêu thích",   value: stats?.TotalFavorites|| 0, iconBg: "#fee2e2", iconColor: "#e11d48" },
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
            <div style={{ fontSize: 32 }}>🔥</div>
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
            <div style={{ fontSize: 14, color: "var(--slate)", letterSpacing: "0.5px", fontWeight: 500 }}>Đang tải dữ liệu…</div>
          </div>
        ) : (
          <>
            {/* ── Progress ── */}
            <div className="hvoc-section-label">Tiến độ học</div>
            <div className="hvoc-progress-card">
              <div style={{ flex: 1, minWidth: 200 }}>
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
            <div className="hvoc-stats-row">
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
                <div className="hvoc-history-card">
                  {stats.RecentHistory.map((h, i) => (
                    <div key={i} className="hvoc-history-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div className="hvoc-history-avatar">{h.word?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="hvoc-history-word">{h.word}</div>
                          <div className="hvoc-history-meaning">{h.meaning}</div>
                        </div>
                      </div>
                      <div className="hvoc-score-pill" style={{
                        background: h.score >= 70 ? "#dcfce7" : h.score >= 40 ? "#fef3c7" : "#fee2e2",
                        color:      h.score >= 70 ? "#16a34a" : h.score >= 40 ? "#d97706" : "#dc2626",
                        borderColor:h.score >= 70 ? "#bbf7d0" : h.score >= 40 ? "#fde68a" : "#fecaca",
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