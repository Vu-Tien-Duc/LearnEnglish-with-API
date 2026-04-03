import { useEffect, useState } from "react";
import API from "../../services/api";

function VocabularyManager() {
  const [vocabList, setVocabList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingWordID, setEditingWordID] = useState(null);

  const [form, setForm] = useState({
    Word: "",
    Meaning: "",
    CategoryID: 1,
    DifficultyLevel: 1,
    IPA: "",
    AudioURL: "",
    Accent: "",
    ExampleSentence: "",
    Translation: "",
    ImageURL: ""
  });

  // 🔒 Check quyền admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.Role !== "Admin") {
      alert("🚫 Bạn không có quyền!");
      window.location.href = "/login";
    }
  }, []);

  // ================= Fetch Data =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/");
      setVocabList(res.data || []);
    } catch (err) {
      console.error(err);
      setVocabList([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= Fetch Categories =================
  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  // ================= Add / Update =================
  const handleSubmit = async () => {
    try {
      if (editingWordID) {
        await API.put(`/${editingWordID}`, form);
        setEditingWordID(null);
      } else {
        await API.post("/", form);
      }

      fetchData();

      setForm({
        Word: "",
        Meaning: "",
        CategoryID: categories[0]?.CategoryID || 1,
        DifficultyLevel: 1,
        IPA: "",
        AudioURL: "",
        Accent: "",
        ExampleSentence: "",
        Translation: "",
        ImageURL: ""
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ================= Delete =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= Edit =================
  const handleEdit = (item) => {
    setEditingWordID(item.WordID);
    setForm({
      Word: item.Word,
      Meaning: item.Meaning,
      CategoryID: item.CategoryID,
      DifficultyLevel: item.DifficultyLevel,
      IPA: item.IPA || "",
      AudioURL: item.AudioURL || "",
      Accent: item.Accent || "",
      ExampleSentence: item.ExampleSentence || "",
      Translation: item.Translation || "",
      ImageURL: item.ImageURL || ""
    });
  };

  // ================= URL helpers =================
  const getFullAudioURL = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:5000${url}`;
  };

  const getFullImageURL = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:5000${url}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Admin - Vocabulary Manager</h2>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      >
        🚪 Logout
      </button>

      {loading && <p>Loading...</p>}
      <p><b>Total:</b> {vocabList.length}</p>

      {/* ================= Form ================= */}
      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
        <input placeholder="Word"
          value={form.Word}
          onChange={(e) => setForm({ ...form, Word: e.target.value })}
        />

        <input placeholder="Meaning"
          value={form.Meaning}
          onChange={(e) => setForm({ ...form, Meaning: e.target.value })}
        />

        <select
          value={form.CategoryID}
          onChange={(e) => setForm({ ...form, CategoryID: parseInt(e.target.value) })}
        >
          {categories.map((cat) => (
            <option key={cat.CategoryID} value={cat.CategoryID}>
              {cat.CategoryName}
            </option>
          ))}
        </select>

        <select
          value={form.DifficultyLevel}
          onChange={(e) => setForm({ ...form, DifficultyLevel: parseInt(e.target.value) })}
        >
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
        </select>

        <input placeholder="IPA"
          value={form.IPA}
          onChange={(e) => setForm({ ...form, IPA: e.target.value })}
        />

        <input placeholder="AudioURL"
          value={form.AudioURL}
          onChange={(e) => setForm({ ...form, AudioURL: e.target.value })}
        />

        <input placeholder="Example"
          value={form.ExampleSentence}
          onChange={(e) => setForm({ ...form, ExampleSentence: e.target.value })}
        />

        {/* Upload Image */}
        <input
          type="file"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            const res = await API.post("/upload-image", formData);
            setForm((prev) => ({ ...prev, ImageURL: res.data.url }));
          }}
        />

        <button onClick={handleSubmit}>
          {editingWordID ? "✅ Update" : "➕ Add"}
        </button>
      </div>

      {/* ================= Table ================= */}
      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Word</th>
            <th>Meaning</th>
            <th>Category</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {vocabList.map((item) => (
            <tr key={item.WordID}>
              <td>{item.Word}</td>
              <td>{item.Meaning}</td>
              <td>{item.CategoryName}</td>

              <td>
                {item.ImageURL && (
                  <img
                    src={getFullImageURL(item.ImageURL)}
                    alt={item.Word}
                    width="50"
                  />
                )}
              </td>

              <td>
                <button onClick={() => handleEdit(item)}>✏️</button>
                <button onClick={() => handleDelete(item.WordID)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VocabularyManager;