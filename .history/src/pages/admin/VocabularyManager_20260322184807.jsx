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
    Accent: "US",
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
      const res = await API.get("/admin/vocabulary");
      let data = res.data;
      if (typeof data === "string") data = JSON.parse(data);
      if (!Array.isArray(data)) data = [];
      setVocabList(data);
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
      const res = await API.get("/admin/vocabulary/categories");;
      setCategories(res.data);
      if (res.data.length > 0) {
        setForm((prev) => ({ ...prev, CategoryID: res.data[0].CategoryID }));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, []);

  // ================= Add =================
  const handleSubmit = async () => {
  try {
    if (editingWordID) {
      // ================== UPDATE ==================
      await API.put(`/admin/vocabulary/${editingWordID}`, form);
      setEditingWordID(null); // reset edit mode
    } else {
      // ================== ADD ==================
      await API.post("/admin/vocabulary/", form);
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
      await API.delete(`/admin/vocabulary/${id}`);
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
    CategoryID: item.CategoryID || categories[0]?.CategoryID,
    DifficultyLevel: item.DifficultyLevel,
    IPA: item.IPA || "",
    AudioURL: item.AudioURL || "",
    Accent: item.Accent || "",
    ExampleSentence: item.ExampleSentence || "",
    Translation: item.Translation || "",
    ImageURL: item.ImageURL || ""   
  });
};
  // ================= Helper Audio =================
  const getFullAudioURL = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `http://127.0.0.1:5000${url}`;
    return `http://127.0.0.1:5000/${url}`;
  };
  const getFullImageURL = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:5000${url}`;
  };
  // ================= Render =================
  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Admin - Vocabulary Manager</h2>
      {loading && <p>Loading...</p>}
      <p><b>Total:</b> {vocabList.length}</p>

      {/* ================= Form ================= */}
      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
        <input
          placeholder="Word"
          value={form.Word}
          onChange={(e) => setForm({ ...form, Word: e.target.value })}
        />

        <input
          placeholder="Meaning"
          value={form.Meaning}
          onChange={(e) => setForm({ ...form, Meaning: e.target.value })}
        />

        {/* Select CategoryName */}
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

        {/* Difficulty Level */}
        <select
          value={form.DifficultyLevel}
          onChange={(e) => setForm({ ...form, DifficultyLevel: parseInt(e.target.value) })}
        >
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
        </select>

        <input
          placeholder="IPA"
          value={form.IPA}
          onChange={(e) => setForm({ ...form, IPA: e.target.value })}
        />

        <input
          placeholder="AudioURL"
          value={form.AudioURL}
          onChange={(e) => setForm({ ...form, AudioURL: e.target.value })}
        />

       <select
          value={form.Accent}
          onChange={(e) => setForm({ ...form, Accent: e.target.value })}
        >
          <option value="">-- Select Accent --</option>
          <option value="US">US</option>
          <option value="UK">UK</option>
        </select>

        <input
          placeholder="Example"
          value={form.ExampleSentence}
          onChange={(e) => setForm({ ...form, ExampleSentence: e.target.value })}
        />
        <input
          placeholder="Translation"
          value={form.Translation}
          onChange={(e) => setForm({ ...form, Translation: e.target.value })}
        />
       <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
              const res = await API.post("/admin/vocabulary/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
              });
              // Lấy url trả về để lưu vào form.ImageURL
              setForm((prev) => ({ ...prev, ImageURL: res.data.url }));
            } catch (err) {
              console.error("Upload lỗi:", err);
            }
          }}
        />

       <button onClick={handleSubmit}>
        {editingWordID ? "✅ Update" : "➕ Add"}
       </button>
      </div>

      {/* ================= Table ================= */}
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Word</th>
            <th>Meaning</th>
            <th>Category</th>
            <th>Level</th>
            <th>IPA</th>
            <th>Audio</th>
            <th>Accent</th>
            <th>Example</th>
            <th>Translation</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vocabList.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: "center" }}>❌ No vocabulary found</td>
            </tr>
          ) : (
            vocabList.map((item) => (
              <tr key={item.WordID}>
                <td>{item.Word}</td>
                <td>{item.Meaning}</td>
                <td>{item.CategoryName}</td>
                <td>{item.DifficultyLevel}</td>
                <td>{item.IPA}</td>
                <td>
                  {item.AudioURL ? (
                    <audio controls>
                      <source src={getFullAudioURL(item.AudioURL)} type="audio/mpeg" />
                    </audio>
                  ) : "N/A"}
                </td>
                <td>{item.Accent}</td>
                <td>{item.ExampleSentence}</td>
                <td>{item.Translation}</td>
               <td>
                {item.ImageURL ? (
                  <img
                    src={getFullImageURL(item.ImageURL)}  
                    alt={item.Word}
                    width="50"
                  />
                ) : "N/A"}
              </td>
               <td>
                 <button onClick={() => handleEdit(item)}>✏️ Edit</button>
                 <button onClick={() => handleDelete(item.WordID)}>🗑 Delete</button>
               </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VocabularyManager;