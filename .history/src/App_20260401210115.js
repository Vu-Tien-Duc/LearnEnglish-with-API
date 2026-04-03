import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
import Home             from './pages/user/home'; 
import UserDashboard    from './pages/user/Dashboard'; 
import StudyRoom        from './pages/user/Flashcard'; 
import Quiz             from './pages/user/Quiz';
import AiChat           from './pages/user/Aichat'; 
import { MiniGames, MemoryGame, WordScrambleGame } from './pages/user/Games';

// 🔥 TẠO TRẠM KIỂM SOÁT (PROTECTED ROUTE)
const ProtectedRoute = ({ children }) => {
  // Sửa "token" thành "user" để khớp với dữ liệu bên Login.jsx
  const isAuth = localStorage.getItem("user"); 

  if (!isAuth) {
    // Nếu chưa đăng nhập, đá về trang login
    return <Navigate to="/login" replace />;
  }
  
  // Nếu đã đăng nhập, cho phép đi tiếp
  return children;
};
  


function App() {
  return (
    <Router>
      <Routes>

        {/* --- NHỮNG TRANG CÔNG KHAI (Ai cũng vào được) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- USER ROUTES (Phải Login mới được vào) --- */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} /> 
        <Route path="/flashcard"     element={<ProtectedRoute><Flashcard /></ProtectedRoute>} />
        <Route path="/quiz"      element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/ai-chat"   element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
       {/* Phân chia rõ ràng 3 Route cho 3 Game đã được lấy ra từ file Games.jsx */}
        <Route path="/mini-game"               element={<ProtectedRoute><MiniGames /></ProtectedRoute>} />
        <Route path="/mini-game/memory-game"   element={<ProtectedRoute><MemoryGame /></ProtectedRoute>} />
        <Route path="/mini-game/word-scramble" element={<ProtectedRoute><WordScrambleGame /></ProtectedRoute>} />

        {/* --- ADMIN ROUTES (Phải Login mới được vào) --- */}
        {/* Tạm thời mình cũng bọc AdminLayout lại để bảo vệ */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} /> 
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