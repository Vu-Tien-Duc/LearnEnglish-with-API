import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import API from '../../services/api';
import Navbar, { Footer } from '../../components/Navbar';

const BACKEND_URL = 'http://127.0.0.1:5000'; 

function getUser() {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
}

const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    return path.startsWith('/') ? `${BACKEND_URL}${path}` : `${BACKEND_URL}/${path}`;
};

const History = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchHistory();
    }, [navigate, user?.UserID || user?.id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const currentUserId = user?.UserID || user?.id || user?.userId;
            const response = await API.get('/user/history', { params: { user_id: currentUserId } });
            setHistoryList(response.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    // Khi User click vào 1 dòng lịch sử -> Chuyển sang trang SingleWord
    const handleRowClick = (wordId) => {
        navigate(`/single-word?id=${wordId}`);
    };

    const formatDate = (isoString) => {
        if (!isoString) return "Chưa rõ";
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'Mastered': return <span style={{...styles.badge, ...styles.badgeMastered}}>Đã thuộc</span>;
            case 'Learning': return <span style={{...styles.badge, ...styles.badgeLearning}}>Đang học</span>;
            default: return <span style={{...styles.badge, ...styles.badgeNew}}>Mới</span>;
        }
    };

    return (
        <div style={styles.root}>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.iconBox}><Clock size={32} color="#2563eb" /></div>
                    <div>
                        <h1 style={styles.title}>Lịch sử học Flashcard</h1>
                        <p style={styles.subtitle}>Xem lại các từ vựng bạn đã lật thẻ gần đây.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loading}>Đang tải lịch sử...</div>
                ) : historyList.length === 0 ? (
                    <div style={styles.empty}>Bạn chưa có lịch sử lật thẻ nào.</div>
                ) : (
                    <div style={styles.listContainer}>
                        {historyList.map((item, index) => (
                            <div key={item.WordID || index} style={styles.listItem} onClick={() => handleRowClick(item.WordID)}>
                                
                                <div style={styles.itemLeft}>
                                    <div style={styles.wordAvatar}>
                                        {item.ImageURL ? (
                                            <img src={getFullUrl(item.ImageURL)} alt="" style={styles.avatarImg} />
                                        ) : (
                                            <span>{item.Word.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={styles.wordTitle}>{item.Word}</h3>
                                        <p style={styles.wordMeaning}>{item.Meaning}</p>
                                    </div>
                                </div>

                                <div style={styles.itemRight}>
                                    
                                    <div style={styles.infoCol}>
                                        <span style={styles.infoLabel}>Lần học cuối</span>
                                        <span style={styles.dateText}>{formatDate(item.LearnDate)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

const styles = {
    root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
    container: { flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px 20px' },
    header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' },
    iconBox: { backgroundColor: '#dbeafe', padding: '16px', borderRadius: '20px' },
    title: { fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 8px' },
    subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
    loading: { textAlign: 'center', color: '#2563eb', fontWeight: 'bold', marginTop: '40px' },
    empty: { textAlign: 'center', color: '#6b7280', marginTop: '40px', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s', flexWrap: 'wrap', gap: '16px' },
    itemLeft: { display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' },
    wordAvatar: { width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    wordTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px' },
    wordMeaning: { fontSize: '14px', color: '#6b7280', margin: 0 },
    itemRight: { display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' },
    infoCol: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' },
    dateText: { fontSize: '13px', color: '#4b5563', fontWeight: 500 },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', textAlign: 'center' },
    badgeMastered: { backgroundColor: '#dcfce7', color: '#166534' },
    badgeLearning: { backgroundColor: '#fef3c7', color: '#d97706' },
    badgeNew: { backgroundColor: '#f3f4f6', color: '#4b5563' }
};

export default History;