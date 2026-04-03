// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import api from '../../../../english-app-frontend/src/services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // [SỬA LỖI]: Phân luồng chuyển hướng dựa vào Role
            if (response.data.user.role === 'Admin') {
                navigate('/admin'); // Admin thì vào Quản trị
            } else {
                navigate('/dashboard'); // User thì vào Học tập
            }
            
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Đăng Nhập</h2>
                    <p className="text-gray-500 mt-2">Bắt đầu hành trình học từ vựng của bạn</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text" required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Tên đăng nhập"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password" required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Mật khẩu"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold transition disabled:bg-blue-300"
                    >
                        {isLoading ? 'Đang xử lý...' : <><LogIn size={20} /> Đăng nhập</>}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6 text-sm">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-600 font-bold hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;