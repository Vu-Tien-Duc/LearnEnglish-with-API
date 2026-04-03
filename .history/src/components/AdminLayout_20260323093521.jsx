import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

function AdminLayout() {
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.Role !== "Admin") {
      window.location.href = "/login";
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", background: "#0d0f14", color: "#e2e8f0" }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: "240px",
        background: "#13161e",
        borderRight: "1px solid #252a38",
        minHeight: "100vh",
        padding: "20px 0"
      }}>
        <div style={{ padding: "0 20px 20px" }}>
          <h2 style={{ color: "#6ee7b7", fontFamily: "serif" }}>✦ LexiAdmin</h2>
          <p style={{ fontSize: "10px", color: "#64748b" }}>Quản trị hệ thống</p>
        </div>

        <nav>
          <NavItem to="/admin" label="⬡ Dashboard" active={isActive("/admin")} />
          <NavItem to="/admin/users" label="◎ Users" active={isActive("/admin/users")} />
          <NavItem to="/admin/vocabulary" label="◈ Vocabulary" active={isActive("/admin/vocabulary")} />
          <NavItem to="/admin/categories" label="⊡ Categories" active={isActive("/admin/categories")} />
          <NavItem to="/admin/quiz" label="◇ Quiz" active={isActive("/admin/quiz")} />
          <NavItem to="/admin/progress" label="⊛ Progress" active={isActive("/admin/progress")} />
          <NavItem to="/admin/favorites" label="♡ Favorites" active={isActive("/admin/favorites")} />
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOPBAR */}
        <header style={{
          height: "60px",
          background: "#13161e",
          borderBottom: "1px solid #252a38",
          display: "flex",
          alignItems: "center",
          padding: "0 20px"
        }}>
          <h3 style={{ fontFamily: "serif" }}>
            Lexi<span style={{ color: "#6ee7b7" }}>Admin</span>
          </h3>

          <input
            placeholder="🔍 Tìm kiếm..."
            style={{
              marginLeft: "20px",
              padding: "6px 12px",
              background: "#181c26",
              border: "1px solid #252a38",
              borderRadius: "6px",
              color: "#fff"
            }}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <button style={btn}>🔔</button>
            <button style={btn}>⚙</button>
            <button style={{ ...btn, color: "#f87171" }}>⏏</button>
          </div>
        </header>

        {/* CONTENT */}
        <div style={{ padding: "20px" }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}

/* COMPONENT NAV ITEM */
function NavItem({ to, label, active }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "10px 20px",
        color: active ? "#6ee7b7" : "#64748b",
        background: active ? "rgba(110,231,183,0.08)" : "transparent",
        textDecoration: "none"
      }}
    >
      {label}
    </Link>
  );
}

/* BUTTON STYLE */
const btn = {
  background: "#181c26",
  border: "1px solid #252a38",
  color: "#64748b",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
};

export default AdminLayout;