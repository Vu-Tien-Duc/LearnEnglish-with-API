import { useEffect, useState } from "react";
import API from "../../services/api";

function VocabularyManager() {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    Word: "",
    Meaning: "",
    CategoryID: 1,
    DifficultyLevel: 1,
    IPA: "",
    AudioURL: "",
    Accent: "",
    ExampleSentence: "",
    Translation: ""
  });

  // =========================
  // FIX AUDIO URL
  // =========================
  const getFullAudioURL = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `http://127.0.0.1:5000${url}`;
    return `http://127.0.0.1:5000/${url}`;
  };

  // =========================
  // FETCH DATA (FIX FULL)
  // =========================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/");

      console.log("FULL RESPONSE:", res);
      console.log("DATA RAW:", res.data);
      console.log("TYPE:", typeof res.data);

      let data = res.data;

      // 🔥 FIX: nếu backend trả string JSON
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (err) {
          console.error("Parse JSON lỗi:", err);
          data = [];
        }
      }

      // 🔥 đảm bảo là array
      if (!Array.isArray(data)) {
        console.warn("Data không phải array:", data);
        data = [];
      }

      console.log("FINAL DATA:", data);

      setVocabList(data);
    } catch (error) {
      console.error("Lỗi fetch vocabulary:", error);
      setVocabList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // ADD
  // =========================
  const handleAdd = async () => {
    try {
      await API.post("/", form);
      fetchData();

      setForm({
        Word: "",
        Meaning: "",
        CategoryID: 1,
        DifficultyLevel: 1,
        IPA: "",
        AudioURL: "",
        Accent: "",
        ExampleSentence: "",
        Translation: ""
      });
    } catch (error) {
      console.error("Lỗi thêm từ:", error);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/${id}`);
      fetchData();
    } catch (error) {
      console.error("Lỗi xóa từ:", error);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Admin - Vocabulary Manager</h2>

      {/* DEBUG */}
      <p><b>Total:</b> {vocabList.length}</p>
      {loading && <p>Loading...</p>}

      {/* ================= FORM ================= */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px"
        }}
      >
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

        <input
          type="number"
          placeholder="CategoryID"
          value={form.CategoryID}
          onChange={(e) =>
            setForm({ ...form, CategoryID: parseInt(e.target.value) || 1 })
          }
        />

        <select
          value={form.DifficultyLevel}
          onChange={(e) =>
            setForm({
              ...form,
              DifficultyLevel: parseInt(e.target.value)
            })
          }
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

        <input
          placeholder="Accent"
          value={form.Accent}
          onChange={(e) => setForm({ ...form, Accent: e.target.value })}
        />

        <input
          placeholder="Example"
          value={form.ExampleSentence}
          onChange={(e) =>
            setForm({ ...form, ExampleSentence: e.target.value })
          }
        />

        <input
          placeholder="Translation"
          value={form.Translation}
          onChange={(e) =>
            setForm({ ...form, Translation: e.target.value })
          }
        />

        <button onClick={handleAdd}>➕ Add</button>
      </div>

      {/* ================= TABLE ================= */}
      <table
        border="1"
        cellPadding="5"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
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
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {vocabList.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: "center" }}>
                ❌ No vocabulary found
              </td>
            </tr>
          ) : (
            vocabList.map((item, index) => (
              <tr key={item?.WordID || index}>
                <td>{item?.Word ?? "N/A"}</td>
                <td>{item?.Meaning ?? "N/A"}</td>
                <td>{item?.CategoryID ?? "N/A"}</td>
                <td>{item?.DifficultyLevel ?? "N/A"}</td>
                <td>{item?.IPA ?? "N/A"}</td>

                <td>
                  {item?.AudioURL ? (
                    <audio controls>
                      <source
                        src={getFullAudioURL(item.AudioURL)}
                        type="audio/mpeg"
                      />
                    </audio>
                  ) : (
                    "N/A"
                  )}
                </td>

                <td>{item?.Accent ?? "N/A"}</td>
                <td>{item?.ExampleSentence ?? "N/A"}</td>
                <td>{item?.Translation ?? "N/A"}</td>

                <td>
                  <button onClick={() => handleDelete(item.WordID)}>
                    🗑 Delete
                  </button>
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