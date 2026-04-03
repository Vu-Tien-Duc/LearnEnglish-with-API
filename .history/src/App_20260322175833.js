import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/admin/Dashboard";
import VocabularyManager from "./pages/admin/VocabularyManager";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>

          <Route index element={<Dashboard />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
          <Route path="categories" element={<div>Category Page</div>} />
          <Route path="quiz" element={<div>Quiz Page</div>} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;