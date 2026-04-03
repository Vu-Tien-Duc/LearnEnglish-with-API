import { Link, Outlet } from "react-router-dom";
import { useEffect } from "react";


function AdminLayout() {
    useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.Role !== "Admin") {
      window.location.href = "/login";
    }
  }, []);
  return (
    <div style={{ display: "flex" }}>
      
      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#2c3e50",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px"
      }}>
        <h2>Admin</h2>

        <nav>
          <p><Link to="/admin" style={{color:"#fff"}}>Dashboard</Link></p>
          <p><Link to="/admin/vocabulary" style={{color:"#fff"}}>Vocabulary</Link></p>
          <p><Link to="/admin/categories" style={{color:"#fff"}}>Category</Link></p>
          <p><Link to="/admin/quiz" style={{color:"#fff"}}>Quiz</Link></p>
        </nav>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>

    </div>
  );
}

export default AdminLayout;