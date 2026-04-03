import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VocabularyManager from "./pages/admin/VocabularyManager";

function VocabularyManager() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.Role !== "Admin") {
      alert("🚫 Không có quyền");
      window.location.href = "/login";
    }
  }, []);

  return (
    <div>
      <h2>Vocabulary Manager</h2>
    </div>
  );
}

export default VocabularyManager;

