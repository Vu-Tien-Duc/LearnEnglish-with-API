import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./components/AdminLayout";
import CategoryManager from "./pages/admin/CategoryManager";
// Đã đổi tên thành AdminDashboard để tránh trùng lặp
import AdminDashboard from "./pages/admin/Dashboard"; 
import VocabularyManager from "./pages/admin/VocabularyManager";
import QuizManager from "./pages/admin/QuizManager";
import UsersManager from "./pages/admin/UsersManager";
import ProgressManager from "./pages/admin/ProgressManager";
import LessonManager from "./pages/admin/LessonManager";
import FavoriteWordManager from "./pages/admin/FavoritewordManager";

// User (Đã xóa import Home bị trùng)
import Home             from './pages/user/Home';
// Đã đổi tên thành UserDashboard để tránh trùng lặp
import UserDashboard    from './pages/user/Dashboard'; 
import StudyRoom        from './pages/user/StudyRoom';
import Quiz             from './pages/user/Quiz';
import AiChat           from './pages/user/AiChat';
import MiniGames        from './pages/user/MiniGames';
import MemoryGame       from './pages/user/MemoryGame';
import WordScrambleGame from './pages/user/WordScrambleGame';

function App() {
  return (
    <Router>
      <Routes>

        {/* TRANG CHỦ — Login (Đã gom 1 Route path="/" duy nhất) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Cập nhật thẻ render thành AdminDashboard */}
          <Route index element={<AdminDashboard />} /> 
          <Route path="vocabulary" element={<VocabularyManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="quiz" element={<QuizManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="progress" element={<ProgressManager />} />
          <Route path="favorites" element={<FavoriteWordManager />} />
          <Route path="lessons" element={<LessonManager />} />
        </Route>

        {/* User */}
        {/* Cập nhật thẻ render thành UserDashboard */}
        <Route path="/dashboard"                 element={<UserDashboard />} /> 
        <Route path="/study"                     element={<StudyRoom />} />
        <Route path="/quiz"                      element={<Quiz />} />
        <Route path="/ai-chat"                   element={<AiChat />} />
        <Route path="/mini-game"                 element={<MiniGames />} />
        <Route path="/mini-game/memory-game"     element={<MemoryGame />} />
        <Route path="/mini-game/word-scramble"   element={<WordScrambleGame />} />

      </Routes>
    </Router>
  );
}

export default App;