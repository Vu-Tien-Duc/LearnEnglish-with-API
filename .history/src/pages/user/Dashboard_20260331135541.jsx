import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Award, BrainCircuit, Heart, BarChart3, ChevronRight, Clock, Star } from 'lucide-react';
import API from '../../services/api';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

const Dashboard = () => {
  const [stats, setStats]       = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const uid = user.UserID;
    Promise.all([
      API.get('/user/dashboard-summary', { params: { user_id: uid } }),
      API.get('/user/favorites',         { params: { user_id: uid } }),
      API.get('/user/history',           { params: { user_id: uid } }),
    ])
      .then(([statsRes, favRes, histRes]) => {
        setStats(statsRes.data);
        setFavorites(favRes.data);
        setHistory(histRes.data);
      })
      .catch(err => console.error("Lỗi tải Dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Đang tổng hợp dữ liệu...</div>;
  if (!stats)  return <div className="text-center mt-20">Không thể tải dữ liệu. Vui lòng đăng nhập lại!</div>;

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
      <div className={`p-4 rounded-full ${color.bg} ${color.text}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-gray-950 mt-1">{value}</p>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 space-y-10 p-8 pt-6 bg-slate-50 min-h-screen">

      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">Bảng điều khiển</h2>
          <p className="text-gray-500 mt-2 text-lg">
            Chào mừng quay trở lại,{' '}
            <span className="font-semibold text-blue-600">{user.Username}</span>!
          </p>
        </div>
        <button
          onClick={() => navigate('/study')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <BookOpen size={20} /> Tiếp tục học <ChevronRight size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Tiến độ tổng thể (Mastered)</h3>
          </div>
          <span className="text-4xl font-black text-blue-600">{stats.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden border border-gray-200 p-0.5 shadow-inner">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow flex items-center justify-center"
            style={{ width: `${stats.completionPercentage}%` }}
          >
            {stats.completionPercentage > 10 && (
              <span className="text-xs font-bold text-white leading-none">
                {stats.MasteredWords} / {stats.TotalWords} từ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Target}      title="Tổng số từ"    value={stats.TotalWords}     color={{ bg: 'bg-gray-100',   text: 'text-gray-600'   }} />
        <StatCard icon={Award}       title="Từ đã thuộc"   value={stats.MasteredWords}  color={{ bg: 'bg-green-100',  text: 'text-green-700'  }} />
        <StatCard icon={BrainCircuit} title="Từ đang học"  value={stats.LearningWords}  color={{ bg: 'bg-orange-100', text: 'text-orange-700' }} />
        <StatCard icon={Heart}       title="Từ yêu thích"  value={stats.TotalFavorites} color={{ bg: 'bg-red-100',    text: 'text-red-700'    }} />
      </div>

      {/* Lịch sử & Yêu thích */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 sticky top-0 bg-white">
            <Clock className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h3>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-6 italic">Chưa có lịch sử học tập nào.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.LearningID} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{item.Word}</span>
                    <span className="text-sm text-gray-500">
                      {item.LessonName && `${item.LessonName} · `}{formatDate(item.LearnDate)}
                    </span>
                  </div>
                  {item.Score !== null && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold">
                      +{item.Score}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 sticky top-0 bg-white">
            <Star className="text-yellow-500" fill="currentColor" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Từ vựng yêu thích</h3>
          </div>
          {favorites.length === 0 ? (
            <p className="text-gray-500 text-center py-6 italic">Bạn chưa thả tim từ vựng nào.</p>
          ) : (
            <ul className="space-y-4">
              {favorites.map((fav) => (
                <li key={fav.WordID} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg">{fav.Word}</span>
                    <span className="text-sm text-gray-600">{fav.Meaning}</span>
                  </div>
                  <Heart className="text-red-500" fill="currentColor" size={20} />
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;