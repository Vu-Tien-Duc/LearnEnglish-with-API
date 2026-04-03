// src/components/Navbar.jsx
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    LogOut, UserCircle, BookOpen, LayoutDashboard, 
    Zap, Sparkles, Gamepad, LogIn, ShieldAlert 
} from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/'); // Đã chuẩn: Đăng xuất xong về thẳng Trang chủ
    };

    const NavLink = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                {children}
            </Link>
        );
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-extrabold text-2xl hover:text-blue-700 transition tracking-tight">
                <BookOpen size={28} className="text-blue-600" />
                <span>EngMaster</span>
            </Link>

            {/* 🔥 MỞ KHÓA MENU: Bỏ điều kiện {user && ...} đi để ai cũng thấy */}
            <div className="flex items-center gap-2">
                <NavLink to="/dashboard" icon={LayoutDashboard}>Tổng quan</NavLink>
                <NavLink to="/study" icon={BookOpen}>Phòng học</NavLink>
                <NavLink to="/quiz" icon={Zap}>Trắc nghiệm</NavLink>
                <NavLink to="/ai-chat" icon={Sparkles}>Trợ lý AI</NavLink>
                <NavLink to="/mini-game" icon={Gamepad}>Mini Game</NavLink>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                            <UserCircle size={24} className="text-gray-500" />
                            <span className="font-medium">
                                Chào, <span className="text-blue-600">{user.username || user.Username}</span>!
                            </span>
                        </div>
                        
                        {/* NÚT QUẢN TRỊ VIÊN (Chỉ Admin mới thấy) */}
                        {(user.role === 'Admin' || user.Role === 'Admin') && (
                            <Link 
                                to="/admin"
                                className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold hover:bg-purple-200 transition shadow-sm"
                            >
                                <ShieldAlert size={18} /> <span className="hidden sm:inline">Quản trị</span>
                            </Link>
                        )}
                        
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-100 transition"
                        >
                            <LogOut size={18} /> <span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition">
                            <LogIn size={18} /> <span>Đăng nhập</span>
                        </Link>
                        <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;