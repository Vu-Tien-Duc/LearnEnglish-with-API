import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./components/AdminLayout";
import CategoryManager from "./pages/admin/CategoryManager";
import Dashboard from "./pages/admin/Dashboard";
import VocabularyManager from "./pages/admin/VocabularyManager";
import QuizManager from "./pages/admin/QuizManager";
import UsersManager from "./pages/admin/UsersManager";
import ProgressManager from "./pages/admin/ProgressManager";
import LessonManager from "./pages/admin/LessonManager";
import FavoriteWordManager from "./pages/admin/FavoritewordManager";

import UserDashboard from "./pages/user/Userdashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* TRANG CHỦ — Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/learn" element={<UserDashboard />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="quiz" element={<QuizManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="progress" element={<ProgressManager />} />
          <Route path="favorites" element={<FavoriteWordManager />} />
          <Route path="lessons" element={<LessonManager />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;