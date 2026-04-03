import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    LogOut, UserCircle, BookOpen, Home, 
    Zap, Sparkles, Gamepad, LogIn, ShieldAlert 
} from 'lucide-react';
import Home from '../pages/user/Home';

// ==========================================
// COMPONENT: NAVBAR
// ==========================================
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/'); 
    };

    const NavLink = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {})
                }}
            >
                <Icon size={18} color={isActive ? "#2563eb" : "#6b7280"} />
                {children}
            </Link>
        );
    };

    return (
        <nav style={styles.navbar}>
            {/* --- Cột trái: Logo --- */}
            <Link to="/" style={styles.brand}>
                <BookOpen size={28} color="#2563eb" />
                <span>EngMaster</span>
            </Link>

            {/* --- Cột giữa: Menu (Ai cũng thấy) --- */}
            <div style={styles.menuCenter}>
                <NavLink to="/home" icon={Home}>Tổng quan</NavLink>
                <NavLink to="/flashcard" icon={BookOpen}>Phòng học</NavLink>
                <NavLink to="/quiz" icon={Zap}>Trắc nghiệm</NavLink>
                <NavLink to="/ai-chat" icon={Sparkles}>Trợ lý AI</NavLink>
                <NavLink to="/mini-game" icon={Gamepad}>Mini Game</NavLink>
            </div>

            {/* --- Cột phải: Tài khoản --- */}
            <div style={styles.rightSection}>
                {user ? (
                    <>
                        <div style={styles.userInfo}>
                            <UserCircle size={24} color="#6b7280" />
                            <span>Chào, <strong style={{color: "#2563eb"}}>{user.username || user.Username}</strong>!</span>
                        </div>
                        
                        {(user.role === 'Admin' || user.Role === 'Admin') && (
                            <Link to="/admin" style={styles.adminBtn}>
                                <ShieldAlert size={18} /> Quản trị
                            </Link>
                        )}
                        
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            <LogOut size={18} /> Đăng xuất
                        </button>
                    </>
                ) : (
                    <div style={styles.authGroup}>
                        <Link to="/login" style={styles.loginBtn}>
                            <LogIn size={18} /> Đăng nhập
                        </Link>
                        <Link to="/register" style={styles.registerBtn}>
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

// ==========================================
// COMPONENT: FOOTER
// ==========================================
export const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.footerContent}>
                <div style={styles.footerBrand}>
                    <BookOpen size={24} color="#6b7280" />
                    <span>EngMaster</span>
                </div>
                <p style={styles.footerText}>© 2026 VocabApp · Học tiếng Anh mỗi ngày 🌏</p>
            </div>
        </footer>
    );
};

// ==========================================
// STYLES
// ==========================================
const styles = {
    // Styles của Navbar
    navbar: { 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "16px 32px", backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", 
        position: "sticky", top: 0, zIndex: 100, fontFamily: "'Inter', sans-serif"
    },
    brand: { 
        display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", 
        color: "#2563eb", fontSize: "22px", fontWeight: "900" 
    },
    menuCenter: { 
        display: "flex", alignItems: "center", gap: "10px" 
    },
    navLink: { 
        display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", 
        color: "#4b5563", padding: "8px 12px", borderRadius: "8px", 
        fontWeight: 600, fontSize: "15px", transition: "0.2s" 
    },
    navLinkActive: { 
        backgroundColor: "#eff6ff", color: "#1d4ed8" 
    },
    rightSection: { 
        display: "flex", alignItems: "center", gap: "16px" 
    },
    userInfo: { 
        display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9fafb", 
        padding: "8px 16px", borderRadius: "999px", border: "1px solid #e5e7eb", 
        fontSize: "14px", color: "#374151" 
    },
    adminBtn: { 
        display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", 
        backgroundColor: "#f3e8ff", color: "#7e22ce", padding: "8px 16px", 
        borderRadius: "10px", fontWeight: "bold", fontSize: "14px" 
    },
    logoutBtn: { 
        display: "flex", alignItems: "center", gap: "6px", border: "none", 
        backgroundColor: "#fef2f2", color: "#dc2626", padding: "8px 16px", 
        borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" 
    },
    authGroup: { 
        display: "flex", alignItems: "center", gap: "16px" 
    },
    loginBtn: { 
        display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", 
        color: "#2563eb", fontWeight: 600, padding: "8px 16px", borderRadius: "8px" 
    },
    registerBtn: { 
        textDecoration: "none", backgroundColor: "#2563eb", color: "#fff", 
        padding: "10px 24px", borderRadius: "10px", fontWeight: 600, boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" 
    },

    // Styles của Footer
    footer: {
        textAlign: "center", 
        padding: "24px 0", 
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #f1f5f9",
        marginTop: "auto", // Đẩy footer xuống đáy trang nếu dùng flexbox cho layout chính
        fontFamily: "'Inter', sans-serif"
    },
    footerContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px"
    },
    footerBrand: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#6b7280",
        fontWeight: "bold",
        fontSize: "16px"
    },
    footerText: {
        fontSize: "13px", 
        color: "#94a3b8",
        margin: 0
    }
};

export default Navbar;