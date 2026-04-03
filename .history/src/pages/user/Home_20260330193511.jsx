import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

// ── helper: lấy user từ localStorage ────────────────────────────────────────
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ username, onLogout }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : "U";

  return (
    <nav style={nav.bar}>
      <span style={nav.brand}>📚 VocabApp</span>
      <div style={nav.right}>
        <div style={nav.avatar}>{initials}</div>
        <span style={nav.name}>{username}</span>
        <button onClick={onLogout} style={nav.logoutBtn}>
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ ...stat.card }}>
      <div style={{ ...stat.value, color }}>{value}</div>
      <div style={stat.label}>{label}</div>
    </div>
  );
}

// ── MenuCard ─────────────────────────────────────────────────────────────────
function MenuCard({ icon, title, desc, bg, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...menu.card,
        background: hovered ? "#f0f4ff" : "#fff",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered
          ? "0 4px 16px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ ...menu.icon, background: bg }}>{icon}</div>
      <div>
        <div style={menu.title}>{title}</div>
        <div style={menu.desc}>{desc}</div>
      </div>
      <span style={menu.arrow}>›</span>
    </div>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // redirect nếu chưa login
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/home/stats", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStats(res.data);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={page.root}>
      <Navbar username={user.Username} onLogout={handleLogout} />

      <main style={page.main}>
        {/* Greeting */}
        <div style={page.greeting}>
          <h1 style={page.hello}>
            Xin chào,{" "}
            <span style={{ color: "#4f46e5" }}>{user.Username}</span> 👋
          </h1>
          <p style={page.sub}>Hôm nay bạn muốn học gì?</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div style={page.loading}>Đang tải...</div>
        ) : error ? (
          <div style={page.error}>{error}</div>
        ) : (
          <div style={stat.row}>
            <StatCard
              label="Tiến độ"
              value={`${stats.progress}%`}
              color="#059669"
            />
            <StatCard
              label="Điểm quiz TB"
              value={stats.avg_score || "—"}
              color="#4f46e5"
            />
            <StatCard
              label="Yêu thích"
              value={stats.favorite_count}
              color="#db2777"
            />
          </div>
        )}

        {/* Menu cards */}
        <div style={menu.grid}>
          <MenuCard
            icon="📖"
            title="Học từ vựng"
            desc="Lật thẻ · New / Learning / Master"
            bg="#d1fae5"
            onClick={() => navigate("/vocabulary")}
          />
          <MenuCard
            icon="🧠"
            title="Làm Quiz"
            desc="Trắc nghiệm · 4 đáp án · tính điểm"
            bg="#dbeafe"
            onClick={() => navigate("/quiz")}
          />
          <MenuCard
            icon="❤️"
            title="Từ yêu thích"
            desc="Xem lại những từ đã lưu"
            bg="#fce7f3"
            onClick={() => navigate("/favorites")}
          />
          <MenuCard
            icon="🕘"
            title="Lịch sử"
            desc="Kết quả quiz và tiến độ từ vựng"
            bg="#fef3c7"
            onClick={() => navigate("/history")}
          />
        </div>
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const nav = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: "60px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4f46e5",
    letterSpacing: "-0.3px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#e0e7ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
  },
  name: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  logoutBtn: {
    padding: "6px 14px",
    fontSize: "13px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
  },
};

const page = {
  root: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  main: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  greeting: {
    marginBottom: "28px",
  },
  hello: {
    fontSize: "26px",
    fontWeight: "700",
    margin: "0 0 6px",
    color: "#111827",
  },
  sub: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    color: "#9ca3af",
    fontSize: "14px",
  },
  error: {
    textAlign: "center",
    padding: "16px",
    color: "#dc2626",
    background: "#fef2f2",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "24px",
  },
};

const stat = {
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "32px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px 16px",
    textAlign: "center",
  },
  value: {
    fontSize: "26px",
    fontWeight: "700",
    lineHeight: 1,
    marginBottom: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#9ca3af",
  },
};

const menu = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px 16px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.18s ease",
    background: "#fff",
  },
  icon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "3px",
  },
  desc: {
    fontSize: "12px",
    color: "#9ca3af",
    lineHeight: 1.4,
  },
  arrow: {
    marginLeft: "auto",
    fontSize: "20px",
    color: "#d1d5db",
    flexShrink: 0,
  },
};