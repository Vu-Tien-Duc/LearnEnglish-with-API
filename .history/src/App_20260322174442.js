import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import VocabularyManager from "./pages/admin/VocabularyManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />   {/* 👈 thêm dòng này */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<VocabularyManager />} />
      </Routes>
    </Router>
  );
}

export default App;