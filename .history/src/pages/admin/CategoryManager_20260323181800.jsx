import { useEffect, useState } from "react";
import API from "../../services/api";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ CategoryName: "", Description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const res = await API.get("/admin/category/");
      setCategories(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= Auto-hide message =================
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await API.put(`/admin/category/${editingId}`, form);
        setMessage("✅ Cập nhật thành công!");
        setEditingId(null);
      } else {
        await API.post("/admin/category/", form);
        setMessage("➕ Thêm thành công!");
      }
      setForm({ CategoryName: "", Description: "" });
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Lỗi thao tác!");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá category?")) return;
    try {
      await API.delete(`/admin/category/${id}`);
      setMessage("🗑 Xóa thành công!");
      fetchCategories();
    } catch (err) {
      alert("❌ Không xoá được (đang dùng)");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditingId(item.CategoryID);
    setForm({ CategoryName: item.CategoryName, Description: item.Description || "" });
    setShowForm(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📂 Category Manager</h2>

      {/* ================= Message ================= */}
      {message && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#28a745",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          {message}
        </div>
      )}

      {/* Nút thêm mới */}
      <button
        onClick={() => {
          setForm({ CategoryName: "", Description: "" });
          setEditingId(null);
          setShowForm(true);
        }}
        style={{ marginBottom: "15px" }}
      >
        ➕ Add New Category
      </button>

      {/* ================= Modal Form ================= */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
              width: "400px",
              position: "relative"
            }}
          >
            <h3>{editingId ? "Edit Category" : "Add New Category"}</h3>
            <button
              onClick={() => setShowForm(false)}
              style={{ position: "absolute", top: "10px", right: "10px" }}
            >
              ❌
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <input
                placeholder="Category Name"
                value={form.CategoryName}
                onChange={(e) => setForm({ ...form, CategoryName: e.target.value })}
              />
              <input
                placeholder="Description"
                value={form.Description}
                onChange={(e) => setForm({ ...form, Description: e.target.value })}
              />
              <button onClick={handleSubmit}>
                {editingId ? "✅ Update" : "➕ Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Table ================= */}
      <table border="1" cellPadding="5" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.CategoryID}>
              <td>{item.CategoryID}</td>
              <td>{item.CategoryName}</td>
              <td>{item.Description}</td>
              <td>
                <button onClick={() => handleEdit(item)}>✏️</button>
                <button onClick={() => handleDelete(item.CategoryID)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryManager;