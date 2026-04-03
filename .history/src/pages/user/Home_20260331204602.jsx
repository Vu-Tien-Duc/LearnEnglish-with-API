import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Award, Heart, BookOpen, BrainCircuit, Star, Clock, ChevronRight } from "lucide-react";
import API from "../../services/api";

// 🔥 IMPORT NAVBAR DÙNG CHUNG TỪ COMPONENTS
import Navbar from "../../components/Navbar";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ Icon, title, value, color }) {
  return (
    <div style={stat.card}>
      <div style={{ ...stat.iconWrap, background: color.bg }}>
        <Icon size={24} color={color.text} strokeWidth={2.5} />
      </div>
      <div>
        <p style={stat.label}>{title}</p>
        <p style={{ ...stat.value, color: color.text }}>{value}</p>
      </div>
    </div>
  );
}

// ── MenuCard ──────────────────────────────────────────────────────────────────
function MenuCard({ icon, title, desc, bg, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...menu.card,
        background: hov ? "#f5f3ff" : "#fff",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 4px 16px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ ...menu.icon, background: bg }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={menu.title}>{title}</div>
        <div style={menu.desc}>{desc}</div>
      </div>
      <ChevronRight size={18} color="#d1d5db" />
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return; 
    }
    
    API.get("/user/dashboard-summary", { params: { user_id: user.UserID } })
      .then(res => setStats(res.data))
      .catch(() => setError("Không thể tải dữ liệu."))
      .finally(() => setLoading(false));
  }, []);

  // 🔥 GIAO DIỆN DÀNH CHO KHÁCH (CHƯA ĐĂNG NHẬP)
  if (!user) {
      return (
        <div style={page.root}>
          {/* Gọi Navbar dùng chung (Nó tự biết khách chưa có token) */}
          <Navbar />
          
          <main style={{...page.main, textAlign: "center", marginTop: "10vh"}}>
            <h1 style={{...page.hello, fontSize: 36}}>
              Trở thành bậc thầy từ vựng cùng <span style={{ color: "#4f46e5" }}>VocabApp</span> 🚀
            </h1>
            <p style={{...page.sub, fontSize: 18, marginBottom: 30}}>
              Học nhanh, nhớ lâu với lộ trình thông minh và các trò chơi thú vị.
            </p>
            <button 
                onClick={() => navigate("/login")} 
                style={{
                    background: "#4f46e5", color: "white", padding: "14px 28px", 
                    fontSize: 16, fontWeight: "bold", border: "none", 
                    borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)"
                }}
            >
              Bắt đầu học ngay!
            </button>
          </main>
        </div>
      );
  }

  // 🔥 GIAO DIỆN DÀNH CHO USER ĐÃ ĐĂNG NHẬP
  return (
    <div style={page.root}>
      {/* Gọi Navbar dùng chung (Nó tự biết lấy tên và làm hàm đăng xuất) */}
      <Navbar />

      <main style={page.main}>
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={page.hello}>
            Xin chào, <span style={{ color: "#4f46e5" }}>{user.Username}</span> 👋
          </h1>
          <p style={page.sub}>Hôm nay bạn muốn học gì?</p>
        </div>

        {/* Stats */}
        {loading ? (
          <p style={{ color: "#9ca3af", marginBottom: 24 }}>Đang tải...</p>
        ) : error ? (
          <p style={{ color: "#dc2626", marginBottom: 24 }}>{error}</p>
        ) : (
          <>
            {/* Progress bar */}
            <div style={prog.wrap}>
              <div style={prog.row}>
                <span style={prog.label}>Tiến độ tổng thể (Mastered)</span>
                <span style={prog.pct}>{stats?.completionPercentage || 0}%</span>
              </div>
              <div style={prog.track}>
                <div style={{ ...prog.fill, width: `${stats?.completionPercentage || 0}%` }} />
              </div>
              <p style={prog.sub}>{stats?.MasteredWords || 0} / {stats?.TotalWords || 0} từ đã thuộc</p>
            </div>

            {/* Stat cards */}
            <div style={stat.grid}>
              <StatCard Icon={Target}      title="Tổng số từ"   value={stats?.TotalWords || 0}     color={{ bg: "#f3f4f6", text: "#4b5563" }} />
              <StatCard Icon={Award}       title="Đã thuộc"     value={stats?.MasteredWords || 0}  color={{ bg: "#dcfce7", text: "#15803d" }} />
              <StatCard Icon={BrainCircuit} title="Đang học"    value={stats?.LearningWords || 0}  color={{ bg: "#ffedd5", text: "#c2410c" }} />
              <StatCard Icon={Heart}       title="Yêu thích"    value={stats?.TotalFavorites || 0} color={{ bg: "#fce7f3", text: "#be185d" }} />
            </div>
          </>
        )}

        {/* Menu */}
        <div style={menu.grid}>
          <MenuCard icon="📖" title="Học từ vựng"  desc="Lật thẻ · New / Learning / Master" bg="#d1fae5" onClick={() => navigate("/study")} />
          <MenuCard icon="🧠" title="Làm Quiz"     desc="Trắc nghiệm · 4 đáp án · tính điểm" bg="#dbeafe" onClick={() => navigate("/quiz")} />
          <MenuCard icon="❤️" title="Yêu thích"   desc="Xem lại những từ đã lưu"            bg="#fce7f3" onClick={() => navigate("/favorites")} />
          <MenuCard icon="🕘" title="Lịch sử"      desc="Kết quả quiz và tiến độ từ vựng"    bg="#fef3c7" onClick={() => navigate("/history")} />
          <MenuCard icon="🎮" title="Mini Game"    desc="Đảo chữ · Lật thẻ nhớ"             bg="#ede9fe" onClick={() => navigate("/mini-game")} />
          <MenuCard icon="🤖" title="Chat AI"      desc="Luyện giao tiếp với AI Teacher"     bg="#e0e7ff" onClick={() => navigate("/ai-chat")} />
        </div>
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
// (Đã xóa object 'nav' vì không dùng Navbar nội bộ nữa)
const page = {
  root: { minHeight:"100vh", background:"#f9fafb", fontFamily:"'Inter','Segoe UI',sans-serif" },
  main: { maxWidth:720, margin:"0 auto", padding:"40px 20px" },
  hello: { fontSize:26, fontWeight:700, margin:"0 0 6px", color:"#111827" },
  sub: { fontSize:15, color:"#6b7280", margin:0 },
};
const prog = {
  wrap: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:"20px 24px", marginBottom:20 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  label: { fontSize:14, fontWeight:600, color:"#374151" },
  pct: { fontSize:28, fontWeight:800, color:"#4f46e5" },
  track: { width:"100%", background:"#e5e7eb", borderRadius:99, height:10, overflow:"hidden" },
  fill: { height:"100%", background:"#4f46e5", borderRadius:99, transition:"width 0.8s ease" },
  sub: { fontSize:12, color:"#9ca3af", margin:"6px 0 0" },
};
const stat = {
  grid: { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:24 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 },
  iconWrap: { width:44, height:44, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  label: { fontSize:12, color:"#9ca3af", margin:"0 0 2px" },
  value: { fontSize:22, fontWeight:700, margin:0 },
};
const menu = {
  grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  card: { display:"flex", alignItems:"center", gap:14, padding:"16px", borderRadius:14, border:"1px solid #e5e7eb", cursor:"pointer", transition:"all 0.18s ease" },
  icon: { width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 },
  title: { fontSize:14, fontWeight:600, color:"#111827", marginBottom:2 },
  desc: { fontSize:12, color:"#9ca3af", lineHeight:1.4 },
};