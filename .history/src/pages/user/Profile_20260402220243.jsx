import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Lock, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar, { Footer } from '../../components/Navbar';

/* ─── Helpers ─── */
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

/* ─── Scoped Styles (Light Theme) ─── */
const PROFILE_STYLE = `
  .prf-root {
    --ink:      #0f172a;
    --ink2:     #334155;
    --slate:    #64748b;
    --fog:      #e2e8f0;
    --paper:    #ffffff;
    --cream:    #f8fafc;
    --sapphire: #2563eb;
    --danger:   #ef4444;
    --success:  #10b981;
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .prf-container {
    flex: 1;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding: 48px 24px;
  }

  .prf-header {
    margin-bottom: 32px;
    text-align: center;
  }
  .prf-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 900;
    color: var(--ink);
    margin-bottom: 8px;
  }
  .prf-subtitle {
    color: var(--slate);
    font-size: 15px;
  }

  .prf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  @media (max-width: 768px) {
    .prf-grid { grid-template-columns: 1fr; }
  }

  .prf-card {
    background: var(--paper);
    border: 1px solid var(--fog);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03);
  }

  .prf-card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--fog);
    padding-bottom: 16px;
  }

  /* Info Section */
  .prf-avatar-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }
  .prf-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #bfdbfe, #93c5fd);
    color: var(--sapphire);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 800;
    font-family: 'Playfair Display', serif;
  }
  .prf-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px dashed var(--fog);
  }
  .prf-info-row:last-child { border-bottom: none; }
  .prf-info-icon { color: var(--slate); }
  .prf-info-content { flex: 1; }
  .prf-info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--slate); font-weight: 600; margin-bottom: 2px; }
  .prf-info-value { font-size: 15px; color: var(--ink); font-weight: 500; }

  /* Form Section */
  .prf-form-group {
    margin-bottom: 20px;
  }
  .prf-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink2);
    margin-bottom: 8px;
  }
  .prf-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .prf-input-icon {
    position: absolute;
    left: 14px;
    color: var(--slate);
  }
  .prf-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border: 1px solid var(--fog);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--ink);
    background: var(--cream);
    transition: all 0.2s;
    outline: none;
  }
  .prf-input:focus {
    border-color: var(--sapphire);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .prf-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: var(--sapphire);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .prf-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #1d4ed8;
    box-shadow: 0 6px 16px rgba(37,99,235,0.35);
  }
  .prf-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .prf-alert {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    animation: slideDown 0.3s ease;
  }
  .prf-alert.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .prf-alert.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function Profile() {
  const navigate = useNavigate();
  const user = getUser();

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // States cho form đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Inject CSS
  useEffect(() => {
    const id = "prf-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = PROFILE_STYLE;
      document.head.appendChild(s);
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp nhau.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setLoading(true);
    try {
      // Đảm bảo URL khớp với cổng Backend Flask của bạn
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID, // Lấy ID từ localStorage
          OldPassword: oldPassword,
          NewPassword: newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi hệ thống.');
      }

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="prf-root">
      <Navbar />

      <div className="prf-container">
        <div className="prf-header">
          <h1 className="prf-title">Hồ Sơ Của Bạn</h1>
          <p className="prf-subtitle">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
        </div>

        <div className="prf-grid">
          
          {/* Card 1: Thông tin cá nhân */}
          <div className="prf-card">
            <h2 className="prf-card-title"><User size={20} className="prf-info-icon" /> Thông tin tài khoản</h2>
            
            <div className="prf-avatar-wrap">
              <div className="prf-avatar">
                {user.Username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{user.Username}</h3>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sapphire)', background: 'var(--sapphire-light)', padding: '4px 10px', borderRadius: 20, marginTop: 4, display: 'inline-block' }}>
                  {user.Role === 'Admin' ? 'Quản trị viên' : 'Học viên'}
                </span>
              </div>
            </div>

            <div>
              <div className="prf-info-row">
                <User size={18} className="prf-info-icon" />
                <div className="prf-info-content">
                  <div className="prf-info-label">Tên người dùng</div>
                  <div className="prf-info-value">{user.Username}</div>
                </div>
              </div>
              <div className="prf-info-row">
                <Mail size={18} className="prf-info-icon" />
                <div className="prf-info-content">
                  <div className="prf-info-label">Địa chỉ Email</div>
                  <div className="prf-info-value">{user.Email || "Chưa cập nhật email"}</div>
                </div>
              </div>
              <div className="prf-info-row">
                <Shield size={18} className="prf-info-icon" />
                <div className="prf-info-content">
                  <div className="prf-info-label">ID Hệ thống</div>
                  <div className="prf-info-value">#{user.UserID}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Đổi mật khẩu */}
          <div className="prf-card">
            <h2 className="prf-card-title"><Lock size={20} className="prf-info-icon" /> Đổi mật khẩu</h2>
            
            {message.text && (
              <div className={`prf-alert ${message.type}`}>
                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="prf-form-group">
                <label className="prf-label">Mật khẩu hiện tại</label>
                <div className="prf-input-wrap">
                  <Key size={16} className="prf-input-icon" />
                  <input 
                    type="password" 
                    className="prf-input" 
                    placeholder="Nhập mật khẩu cũ..."
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="prf-form-group">
                <label className="prf-label">Mật khẩu mới</label>
                <div className="prf-input-wrap">
                  <Lock size={16} className="prf-input-icon" />
                  <input 
                    type="password" 
                    className="prf-input" 
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="prf-form-group" style={{ marginBottom: 32 }}>
                <label className="prf-label">Xác nhận mật khẩu mới</label>
                <div className="prf-input-wrap">
                  <CheckCircle2 size={16} className="prf-input-icon" />
                  <input 
                    type="password" 
                    className="prf-input" 
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="prf-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}