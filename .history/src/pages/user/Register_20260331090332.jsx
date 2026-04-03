// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../../english-app-frontend/src/services/api'; 

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp!');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            alert(response.data.message); 
            navigate('/login'); 
            
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi kết nối đến server!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Đăng Ký</h2>
                <p className="text-center text-gray-500 mb-6">Tạo tài khoản EngMaster mới</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <input 
                        type="text" name="username" placeholder="Tên đăng nhập" required
                        value={formData.username} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <input 
                        type="email" name="email" placeholder="Email của bạn" required
                        value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <input 
                        type="password" name="password" placeholder="Mật khẩu" required
                        value={formData.password} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <input 
                        type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" required
                        value={formData.confirmPassword} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    
                    <button 
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:bg-blue-300 shadow-sm"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6 text-sm">
                    Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;