import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

// --- ADMIN IMPORTS ---
import AdminLayout from "./components/AdminLayout";
import CategoryManager from "./pages/admin/CategoryManager";
import AdminDashboard from "./pages/admin/Dashboard"; 
import VocabularyManager from "./pages/admin/VocabularyManager";
import QuizManager from "./pages/admin/QuizManager";
import UsersManager from "./pages/admin/UsersManager";
import ProgressManager from "./pages/admin/ProgressManager";
import LessonManager from "./pages/admin/LessonManager";
import FavoriteWordManager from "./pages/admin/FavoritewordManager";

// --- USER IMPORTS ---
// Tên component vẫn viết hoa, nhưng đường dẫn file (sau chữ from) đã sửa khớp y hệt ảnh của bạn
import Home             from './pages/user/home'; 
import UserDashboard    from './pages/user/Dashboard'; 
import StudyRoom        from './pages/user/Studyroom'; 
import Quiz             from './pages/user/Quiz';
import AiChat           from './pages/user/Aichat'; 
import Games            from './pages/user/Games'; 

function App() {
  return (
    <Router>
      <Routes>

        {/* --- TRANG CHỦ & AUTH --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="vocabulary" element={<VocabularyManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="quiz" element={<QuizManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="progress" element={<ProgressManager />} />
          <Route path="favorites" element={<FavoriteWordManager />} />
          <Route path="lessons" element={<LessonManager />} />
        </Route>

        {/* --- USER ROUTES --- */}
        <Route path="/dashboard" element={<UserDashboard />} /> 
        <Route path="/study"     element={<StudyRoom />} />
        <Route path="/quiz"      element={<Quiz />} />
        <Route path="/ai-chat"   element={<AiChat />} />
        
        {/* Route Game tạm thời dùng chung file Games.jsx của bạn */}
        <Route path="/mini-game" element={<Games />} />

      </Routes>
    </Router>
  );
}

export default App;