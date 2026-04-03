import { useEffect, useState } from "react";
import API from "../../services/api";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    CategoryName: "",
    Description: ""
  });
  const [editingId, setEditingId] = useState(null);

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const res = await API.get("/admin/category");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await API.put(`/admin/category/${editingId}`, form);
        setEditingId(null);
      } else {
        await API.post("/admin/category", form);
      }

      setForm({ CategoryName: "", Description: "" });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá category?")) return;

    try {
      await API.delete(`/admin/category/${id}`);
      fetchCategories();
    } catch (err) {
      alert("❌ Không xoá được (đang dùng)");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditingId(item.CategoryID);
    setForm({
      CategoryName: item.CategoryName,
      Description: item.Description || ""
    });
  };

  // ================= UI =================
  return (
    <div style={{ padding: "20px" }}>
      <h2>📂 Category Manager</h2>

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Category Name"
          value={form.CategoryName}
          onChange={(e) =>
            setForm({ ...form, CategoryName: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={form.Description}
          onChange={(e) =>
            setForm({ ...form, Description: e.target.value })
          }
        />

        <button onClick={handleSubmit}>
          {editingId ? "✅ Update" : "➕ Add"}
        </button>
      </div>

      {/* TABLE */}
      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
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