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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/?page=${page}&limit=10&q=${search}`);
      const data = await res.json();
      setUsers(data.data ?? []);
      setTotalPages(data.total_pages ?? 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const avatarGrad = (name) => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

  return (
    <section id="users">
      <div className="section-header">
        <h2>Quản lý <em>Users</em></h2>
        <input placeholder="🔍 Tìm user…" onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Role</th>
              <th>Ngày tạo</th>
              <th>Tiến độ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6}>Đang tải…</td></tr> :
            users.length === 0 ? <tr><td colSpan={6}>Không có dữ liệu</td></tr> :
            users.map(u => (
              <tr key={u.UserID}>
                <td>
                  <div className="user-cell">
                    <div className="u-avatar" style={{ background: avatarGrad(u.Username) }}>{u.Username[0]}</div>
                    <div>
                      <div className="u-name">{u.Username}</div>
                      <div className="u-email">{u.Email ?? "-"}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`badge badge-${u.Role.toLowerCase()}`}>{u.Role}</span></td>
                <td>{u.CreatedDate}</td>
                <td>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div className="progress-track" style={{ width:80, height:6, background:"#eee" }}>
                      <div className="progress-fill" style={{ width:`${u.Progress}%`, height:6, background:"#38bdf8" }}></div>
                    </div>
                    <span style={{ fontSize:11, color:"#555" }}>{u.Progress ?? "-"}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-dot ${u.Status.toLowerCase()}`}></span>
                  <span style={{ fontSize:12 }}>{u.Status}</span>
                </td>
                <td>
                  <button>👁</button>
                  <button>✏️</button>
                  <button>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}