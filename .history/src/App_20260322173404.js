import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VocabularyManager from "./pages/admin/VocabularyManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<VocabularyManager />} />
      </Routes>
    </Router>
  );
}

export default App;