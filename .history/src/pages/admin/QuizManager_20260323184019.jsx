import { useState, useEffect } from "react";
import axios from "axios";

export default function QuizAdmin() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    WordID: "",
    QuestionText: "",
    Options: [
      { OptionText: "", IsCorrect: false },
      { OptionText: "", IsCorrect: false },
      { OptionText: "", IsCorrect: false },
      { OptionText: "", IsCorrect: false },
    ],
  });

  // Lấy danh sách câu hỏi
  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/quiz");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Thêm câu hỏi mới
  const handleAddQuestion = async () => {
    try {
      await axios.post("/quiz", newQuestion);
      fetchQuestions(); // load lại danh sách
      // reset form
      setNewQuestion({
        WordID: "",
        QuestionText: "",
        Options: [
          { OptionText: "", IsCorrect: false },
          { OptionText: "", IsCorrect: false },
          { OptionText: "", IsCorrect: false },
          { OptionText: "", IsCorrect: false },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Xóa câu hỏi
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await axios.delete(`/quiz/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Quiz Management</h1>

      {/* ===== Danh sách câu hỏi ===== */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Danh sách câu hỏi</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Word</th>
              <th className="border px-2 py-1">Question</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.QuestionID}>
                <td className="border px-2 py-1">{q.Word}</td>
                <td className="border px-2 py-1">{q.QuestionText}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(q.QuestionID)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Thêm câu hỏi mới ===== */}
      <div>
        <h2 className="font-semibold mb-2">Thêm câu hỏi mới</h2>
        <div className="mb-2">
          <input
            type="number"
            placeholder="WordID"
            value={newQuestion.WordID}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, WordID: e.target.value })
            }
            className="border px-2 py-1 mr-2"
          />
          <input
            type="text"
            placeholder="Question text"
            value={newQuestion.QuestionText}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, QuestionText: e.target.value })
            }
            className="border px-2 py-1 w-1/2"
          />
        </div>

        {/* Options */}
        {newQuestion.Options.map((opt, idx) => (
          <div key={idx} className="mb-1 flex items-center">
            <input
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt.OptionText}
              onChange={(e) => {
                const updatedOptions = [...newQuestion.Options];
                updatedOptions[idx].OptionText = e.target.value;
                setNewQuestion({ ...newQuestion, Options: updatedOptions });
              }}
              className="border px-2 py-1 mr-2 flex-1"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={opt.IsCorrect}
                onChange={(e) => {
                  const updatedOptions = [...newQuestion.Options];
                  updatedOptions[idx].IsCorrect = e.target.checked;
                  setNewQuestion({ ...newQuestion, Options: updatedOptions });
                }}
                className="mr-1"
              />
              Đúng
            </label>
          </div>
        ))}

        <button
          className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
          onClick={handleAddQuestion}
        >
          Thêm câu hỏi
        </button>
      </div>
    </div>
  );
}