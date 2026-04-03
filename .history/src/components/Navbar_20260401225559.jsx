import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    LogOut, UserCircle, BookOpen, Home, 
    Zap, Sparkles, Gamepad, LogIn, ShieldAlert,
    ChevronDown, User, History, Heart
} from 'lucide-react';

// ==========================================
// COMPONENT: NAVBAR
// ==========================================
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State quản lý Dropdown menu của User
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/'); 
    };

    // Xử lý sự kiện click ra ngoài để đóng menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                <NavLink to="/" icon={Home}>Tổng quan</NavLink>
                <NavLink to="/flashcard" icon={BookOpen}>Phòng học</NavLink>
                <NavLink to="/quiz" icon={Zap}>Trắc nghiệm</NavLink>
                <NavLink to="/ai-chat" icon={Sparkles}>Trợ lý AI</NavLink>
                <NavLink to="/mini-game" icon={Gamepad}>Mini Game</NavLink>
            </div>

            {/* --- Cột phải: Tài khoản --- */}
            <div style={styles.rightSection}>
                {user ? (
                    <>
                        {/* Wrapper cho User Info và Dropdown */}
                        <div style={styles.userMenuWrapper} ref={dropdownRef}>
                            <div 
                                style={styles.userInfo} 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <UserCircle size={24} color="#6b7280" />
                                <span>Chào, <strong style={{color: "#2563eb"}}>{user.username || user.Username}</strong>!</span>
                                <ChevronDown 
                                    size={16} 
                                    color="#6b7280" 
                                    style={{ 
                                        transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                                        transition: 'transform 0.3s ease' 
                                    }} 
                                />
                            </div>

                            {/* Menu thả xuống */}
                            {isDropdownOpen && (
                                <div style={styles.dropdownMenu}>
                                    <Link to="/profile" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                        <User size={18} color="#4b5563" />
                                        <span>Thông tin cá nhân</span>
                                    </Link>
                                    <Link to="/history" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                        <History size={18} color="#4b5563" />
                                        <span>Lịch sử học</span>
                                    </Link>
                                    <Link to="/favorites" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                        <Heart size={18} color="#4b5563" />
                                        <span>Từ vựng yêu thích</span>
                                    </Link>
                                </div>
                            )}
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
    
    // --- Styles cho phần Dropdown Menu ---
    userMenuWrapper: {
        position: "relative",
    },
    userInfo: { 
        display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9fafb", 
        padding: "8px 16px", borderRadius: "999px", border: "1px solid #e5e7eb", 
        fontSize: "14px", color: "#374151", cursor: "pointer", userSelect: "none"
    },
    dropdownMenu: {
        position: "absolute",
        top: "120%",
        right: 0,
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        minWidth: "220px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000
    },
    dropdownItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        textDecoration: "none",
        color: "#374151",
        fontSize: "14px",
        fontWeight: 500,
        borderBottom: "1px solid #f3f4f6",
        transition: "background-color 0.2s ease"
    },
    // ------------------------------------

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

    footer: {
        textAlign: "center", 
        padding: "24px 0", 
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #f1f5f9",
        marginTop: "auto",
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