import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

/* ─── helpers ─── */
function getUser() {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
}

/* ─── tiny icon set (SVG inline) ─── */
const Icons = {
  book:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  brain:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.7-3.68 2.5 2.5 0 0 1 .68-4.82A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.7-3.68 2.5 2.5 0 0 0-.68-4.82A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  heart:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  clock:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  game:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>,
  bot:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>,
  star:   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  fire:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 6-6 6-6 12a6 6 0 0 0 12 0c0-6-6-6-6-12z"/><path d="M12 12c0 3-2 3-2 5a2 2 0 0 0 4 0c0-2-2-2-2-5z"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, accent, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: `1.5px solid ${accent}22`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 14,
        background: `${accent}18`, color: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

/* ─── Menu Card ─── */
function MenuCard({ icon, title, desc, accent, bg, onClick, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? bg : "#fff",
        borderRadius: 20,
        padding: "20px 22px",
        cursor: "pointer",
        border: `1.5px solid ${hov ? accent + "55" : "#f1f5f9"}`,
        boxShadow: hov ? `0 8px 24px ${accent}28` : "0 2px 8px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        opacity: visible ? 1 : 0,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 13,
        background: hov ? `${accent}22` : `${accent}12`,
        color: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.22s",
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── Progress Ring ─── */
function ProgressRing({ pct }) {
  const r = 52, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle cx="65" cy="65" r={r} fill="none" stroke="#4f46e5" strokeWidth="10"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

/* ─── Guest Landing ─── */
function GuestLanding({ navigate }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const features = [
    { emoji: "📖", text: "Học từ vựng bằng thẻ ghi nhớ thông minh" },
    { emoji: "🧠", text: "Quiz trắc nghiệm tính điểm ngay lập tức" },
    { emoji: "🎮", text: "Mini game đảo chữ, lật thẻ vui nhộn" },
    { emoji: "🤖", text: "Luyện giao tiếp với AI Teacher 24/7" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf8ff 100%)",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* top bar */}
      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>📚</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>VocabApp</span>
        </div>
        <button onClick={() => navigate("/login")} style={{
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          color: "#fff", border: "none", borderRadius: 12,
          padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
        }}>Đăng nhập</button>
      </div>

      {/* hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", textAlign: "center",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.7s ease",
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
        <h1 style={{
          fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, color: "#1e293b",
          margin: "0 0 16px", lineHeight: 1.2,
        }}>
          Trở thành bậc thầy<br />
          <span style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            từ vựng tiếng Anh
          </span>
        </h1>
        <p style={{ fontSize: 17, color: "#64748b", margin: "0 0 36px", maxWidth: 440, lineHeight: 1.7 }}>
          Học nhanh, nhớ lâu với lộ trình cá nhân hóa, bài quiz thú vị và AI Teacher tận tình.
        </p>

        {/* feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 40 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "#fff", border: "1.5px solid #e2e8f0",
              borderRadius: 40, padding: "9px 18px",
              fontSize: 13.5, fontWeight: 600, color: "#475569",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <span>{f.emoji}</span> {f.text}
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/login")} style={{
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          color: "#fff", border: "none", borderRadius: 16,
          padding: "16px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 6px 24px rgba(79,70,229,0.4)",
          letterSpacing: "0.3px",
        }}>
          🚀 Bắt đầu học ngay — Miễn phí!
        </button>
      </div>
    </div>
  );
}

/* ─── Main Home ─── */
export default function Home() {
  const navigate = useNavigate();
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 60);
    if (!user) { setLoading(false); return; }
    API.get("/user/dashboard-summary", { params: { user_id: user.UserID } })
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (!user) return <GuestLanding navigate={navigate} />;

  const pct = stats?.completionPercentage || 0;
  const menus = [
    { icon: Icons.book,  title: "Học từ vựng",  desc: "Lật thẻ · New / Learning / Mastered", accent: "#10b981", bg: "#f0fdf4", path: "/study" },
    { icon: Icons.brain, title: "Làm Quiz",      desc: "Trắc nghiệm · 4 đáp án · tính điểm",  accent: "#3b82f6", bg: "#eff6ff", path: "/quiz" },
    { icon: Icons.heart, title: "Yêu thích",     desc: "Xem lại những từ đã lưu",              accent: "#ec4899", bg: "#fdf2f8", path: "/favorites" },
    { icon: Icons.clock, title: "Lịch sử",       desc: "Kết quả quiz và tiến độ học",          accent: "#f59e0b", bg: "#fffbeb", path: "/history" },
    { icon: Icons.game,  title: "Mini Game",     desc: "Đảo chữ · Lật thẻ nhớ vui",           accent: "#8b5cf6", bg: "#f5f3ff", path: "/mini-game" },
    { icon: Icons.bot,   title: "Chat AI",       desc: "Luyện giao tiếp với AI Teacher",       accent: "#4f46e5", bg: "#eef2ff", path: "/ai-chat" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f8faff 0%, #f3f4ff 40%, #fafbff 100%)",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    }}>

      {/* ── Navbar ─────────────────────────────── */}
      <nav style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #e8eaf0",
        padding: "0 32px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>📚</div>
          <span style={{ fontSize: 19, fontWeight: 800, color: "#1e293b" }}>VocabApp</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: 40, padding: "6px 14px",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#fff", fontWeight: 800,
            }}>
              {user.Username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>{user.Username}</span>
          </div>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "#64748b", background: "none", border: "1.5px solid #e2e8f0",
            borderRadius: 10, padding: "7px 13px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            {Icons.logout} Đăng xuất
          </button>
        </div>
      </nav>

      {/* ── Main ───────────────────────────────── */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "36px 20px 60px" }}>

        {/* Greeting */}
        <div style={{
          marginBottom: 32,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.55s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#1e293b" }}>
              Xin chào, <span style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{user.Username}</span> 👋
            </h1>
          </div>
          <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
            Hôm nay bạn muốn học từ vựng gì? Tiếp tục thôi nào! 💪
          </p>
        </div>

        {/* ── Progress + Stats ─── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* Progress card */}
            <div style={{
              background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
              borderRadius: 24, padding: "28px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
              boxShadow: "0 8px 30px rgba(79,70,229,0.3)",
              flexWrap: "wrap", gap: 20,
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 8 }}>
                  TIẾN ĐỘ TỔNG THỂ
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
                  {pct}%
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 16 }}>
                  {stats?.MasteredWords || 0} / {stats?.TotalWords || 0} từ đã thuộc
                </div>
                {/* bar */}
                <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", background: "#fff", borderRadius: 99,
                    width: `${pct}%`, transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                  }} />
                </div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ProgressRing pct={pct} />
                <div style={{
                  position: "absolute", textAlign: "center",
                  transform: "rotate(90deg)",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{pct}%</div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 14, marginBottom: 32,
            }}>
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                label="Tổng số từ" value={stats?.TotalWords || 0} accent="#64748b" delay={0} />
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>}
                label="Đã thuộc" value={stats?.MasteredWords || 0} accent="#10b981" delay={80} />
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                label="Đang học" value={stats?.LearningWords || 0} accent="#f59e0b" delay={160} />
              <StatCard icon={Icons.heart}
                label="Yêu thích" value={stats?.TotalFavorites || 0} accent="#ec4899" delay={240} />
            </div>

            {/* Recent history */}
            {stats?.RecentHistory?.length > 0 && (
              <div style={{
                background: "#fff", borderRadius: 20, padding: "20px 24px",
                marginBottom: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1.5px solid #f1f5f9",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  {Icons.clock} Lịch sử học gần đây
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stats.RecentHistory.map((h, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 12,
                      background: i === 0 ? "#f0fdf4" : "#f8fafc",
                      border: `1px solid ${i === 0 ? "#bbf7d0" : "#f1f5f9"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 13, fontWeight: 800,
                        }}>{h.word?.charAt(0)}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{h.word}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{h.meaning}</div>
                        </div>
                      </div>
                      <div style={{
                        background: h.score >= 70 ? "#dcfce7" : h.score >= 40 ? "#fef3c7" : "#fee2e2",
                        color: h.score >= 70 ? "#15803d" : h.score >= 40 ? "#b45309" : "#dc2626",
                        borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700,
                      }}>{h.score} điểm</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Menu Grid ─── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px", marginBottom: 16 }}>
            TÍNH NĂNG
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 14,
          }}>
            {menus.map((m, i) => (
              <MenuCard
                key={i}
                icon={m.icon}
                title={m.title}
                desc={m.desc}
                accent={m.accent}
                bg={m.bg}
                onClick={() => navigate(m.path)}
                delay={i * 60}
              />
            ))}
          </div>
        </div>

      </main>

      {/* ── Footer ─── */}
      <footer style={{
        textAlign: "center", padding: "20px 0 30px",
        fontSize: 13, color: "#cbd5e1",
        borderTop: "1px solid #f1f5f9",
      }}>
        © 2026 VocabApp · Học tiếng Anh mỗi ngày 🌏
      </footer>
    </div>
  );
}