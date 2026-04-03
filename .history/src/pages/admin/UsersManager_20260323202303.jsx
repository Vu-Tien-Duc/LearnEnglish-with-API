import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api/admin/users";
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6ee7b7,#38bdf8)",
  "linear-gradient(135deg,#f472b6,#fb923c)",
  "linear-gradient(135deg,#fbbf24,#6ee7b7)",
  "linear-gradient(135deg,#a78bfa,#38bdf8)",
  "linear-gradient(135deg,#38bdf8,#f472b6)",
  "linear-gradient(135deg,#fb923c,#fbbf24)",
];

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}limit=10&q=${search}`);
      const data = await res.json();
      setUsers(data.data ?? []);

    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const avatarGrad = (name) =>
    AVATAR_GRADIENTS[name?.charCodeAt(0) % AVATAR_GRADIENTS.length];

  return (
    <section id="users" style={{ padding: "32px", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>Quản lý <em>Users</em></h2>
          <p style={{ color: "#555" }}>Xem, chỉnh sửa và quản lý tài khoản người dùng.</p>
        </div>
        <button style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>＋ Tạo user</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          placeholder="🔍 Tìm user…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "6px 12px", fontSize: 14, flex: 1 }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "8px" }}>Người dùng</th>
              <th>Role</th>
              <th>Ngày tạo</th>
              <th>Tiến độ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 12 }}>Đang tải…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 12 }}>Không có dữ liệu</td></tr>
            ) : users.map(u => (
              <tr key={u.UserID} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", background: avatarGrad(u.Username),
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600
                    }}>
                      {u.Username[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{u.Username}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{u.Email ?? "-"}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ padding: "4px 8px", borderRadius: 4, background: u.Role === "Admin" ? "#f472b6" : "#38bdf8", color: "#fff", fontSize: 12 }}>{u.Role}</span></td>
                <td style={{ color: "#555" }}>{u.CreatedDate}</td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:80, height:6, background:"#eee", borderRadius:3 }}>
                      <div style={{ width:`${u.Progress}%`, height:6, background:"#38bdf8", borderRadius:3 }} />
                    </div>
                    <span style={{ fontSize:11, color:"#555" }}>{u.Progress ?? 0}%</span>
                  </div>
                </td>
                <td style={{ display:"flex", gap:8 }}>
                  <button title="Xem">👁</button>
                  <button title="Sửa">✏️</button>
                  <button title="Xóa">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}