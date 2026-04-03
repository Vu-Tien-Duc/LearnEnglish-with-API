import { useEffect, useState } from "react";
import API from "../../services/api";
import FlashcardStudy from "./FlashcardStudy";
import QuizStudy from "./QuizStudy";
import { Favorites, History } from "./FavoritesAndHistory";

function getUserId() {
  return JSON.parse(localStorage.getItem("user") || "{}").UserID;
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

.ud-root {
  --bg:#0d0f14; --surface:#13161e; --card:#181c26; --border:#252a38;
  --accent:#6ee7b7; --accent2:#38bdf8; --accent3:#f472b6;
  --gold:#fbbf24; --text:#e2e8f0; --muted:#64748b;
  --danger:#f87171; --success:#4ade80;
  font-family:'DM Sans',sans-serif; font-size:14px;
  color:var(--text); background:var(--bg);
  height:100vh; display:flex; flex-direction:column; overflow:hidden;
}
.ud-root *, .ud-root *::before, .ud-root *::after { box-sizing:border-box; margin:0; padding:0; }

/* ── nav ── */
.ud-nav {
  flex-shrink:0; background:var(--surface);
  border-bottom:1px solid var(--border);
  display:flex; align-items:center; padding:0 20px; gap:4px;
}
.ud-nav-logo {
  font-family:'DM Serif Display',serif; font-size:18px;
  color:var(--accent); padding-right:16px;
  border-right:1px solid var(--border); margin-right:8px;
}
.ud-nav-logo em { font-style:italic; }
.ud-tab {
  padding:14px 16px; font-size:13px; font-weight:600;
  cursor:pointer; border:none; background:transparent;
  color:var(--muted); border-bottom:2px solid transparent;
  transition:all .15s; display:flex; align-items:center; gap:6px;
}
.ud-tab.active { color:var(--accent); border-bottom-color:var(--accent); }
.ud-tab:hover:not(.active) { color:var(--text); }

/* ── content ── */
.ud-content { flex:1; overflow-y:auto; }

/* ── lesson picker page ── */
.ud-picker { padding:24px 20px; }
.ud-picker h2 {
  font-family:'DM Serif Display',serif; font-size:24px; margin-bottom:4px;
}
.ud-picker h2 em { font-style:italic; color:var(--accent); }
.ud-picker p { font-size:13px; color:var(--muted); margin-bottom:20px; }

.ud-lesson-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));
  gap:14px;
}
.ud-lesson-card {
  background:var(--card); border:1px solid var(--border); border-radius:14px;
  padding:18px; cursor:pointer; transition:all .18s;
}
.ud-lesson-card:hover {
  border-color:var(--accent); transform:translateY(-2px);
  box-shadow:0 6px 20px rgba(0,0,0,.3);
}
.ud-lesson-card-top { display:flex; align-items:flex-start; justify-content:space-between; }
.ud-lesson-icon {
  width:44px; height:44px; border-radius:10px;
  display:flex; align-items:center; justify-content:center; font-size:20px;
  flex-shrink:0;
}
.ud-lesson-icon.flash { background:rgba(110,231,183,.1); border:1px solid rgba(110,231,183,.15); }
.ud-lesson-icon.quiz  { background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.15); }
.ud-lesson-badge {
  font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px;
}
.ud-lesson-badge.fc { background:rgba(110,231,183,.1); color:var(--accent); }
.ud-lesson-badge.qz { background:rgba(167,139,250,.1); color:#a78bfa; }
.ud-lesson-name { font-size:16px; font-weight:600; margin-top:12px; }
.ud-lesson-cat  { font-size:12px; color:var(--muted); margin-top:3px; }
.ud-lesson-meta {
  display:flex; gap:12px; margin-top:10px; font-size:12px; color:var(--muted);
}
.ud-lesson-meta span { display:flex; align-items:center; gap:4px; }
.ud-empty {
  padding:60px 20px; text-align:center; color:var(--muted);
}
.ud-empty .ei { font-size:40px; margin-bottom:12px; opacity:.5; }
`;

const TABS = [
  { id:"flash", label:"📖 Học từ vựng" },
  { id:"quiz",  label:"❓ Quiz" },
  { id:"fav",   label:"❤️ Yêu thích" },
  { id:"hist",  label:"📊 Lịch sử" },
];

export default function UserDashboard() {
  const [tab,         setTab]         = useState("flash");
  const [lessons,     setLessons]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeLesson,setActiveLesson]= useState(null); // { id, name }

  useEffect(() => {
    // auth guard
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) { window.location.href = "/login"; return; }

    (async () => {
      setLoading(true);
      try {
        const res = await API.get("/user/lessons");
        setLessons(res.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  // reset lesson khi đổi tab
  const handleTab = (t) => { setTab(t); setActiveLesson(null); };

  // ── lesson picker ──
  const LessonPicker = ({ mode }) => {
    const isFlash = mode === "flash";
    const color   = isFlash ? "var(--accent)" : "#a78bfa";

    if (loading) return (
      <div className="ud-picker">
        <p style={{color:"var(--muted)"}}>Đang tải danh sách lesson...</p>
      </div>
    );

    const filtered = isFlash
      ? lessons.filter(l => l.WordCount > 0)
      : lessons.filter(l => l.QuizCount > 0);

    return (
      <div className="ud-picker">
        <h2>{isFlash ? <>Học <em>Flashcard</em></> : <>Luyện tập <em>Quiz</em></>}</h2>
        <p>{isFlash
          ? "Chọn bài học để bắt đầu lật thẻ"
          : "Chọn bài học để bắt đầu làm quiz"}</p>

        {filtered.length === 0 ? (
          <div className="ud-empty">
            <div className="ei">📭</div>
            <p>Chưa có lesson nào có {isFlash ? "từ vựng" : "câu hỏi quiz"}.</p>
          </div>
        ) : (
          <div className="ud-lesson-grid">
            {filtered.map(l => (
              <div key={l.LessonID} className="ud-lesson-card"
                onClick={() => setActiveLesson({ id: l.LessonID, name: l.LessonName })}>
                <div className="ud-lesson-card-top">
                  <div className={`ud-lesson-icon ${isFlash?"flash":"quiz"}`}>
                    {isFlash ? "📖" : "❓"}
                  </div>
                  <span className={`ud-lesson-badge ${isFlash?"fc":"qz"}`}>
                    {isFlash ? "Flashcard" : "Quiz"}
                  </span>
                </div>
                <div className="ud-lesson-name">{l.LessonName}</div>
                <div className="ud-lesson-cat">{l.CategoryName}</div>
                <div className="ud-lesson-meta">
                  {isFlash
                    ? <span>📚 {l.WordCount} từ vựng</span>
                    : <span>❓ {l.QuizCount} câu hỏi</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── render content ──
  const renderContent = () => {
    if (tab === "fav")  return <Favorites/>;
    if (tab === "hist") return <History/>;

    if (tab === "flash") {
      if (activeLesson) return (
        <FlashcardStudy
          lessonId={activeLesson.id}
          lessonName={activeLesson.name}
          onBack={() => setActiveLesson(null)}
        />
      );
      return <LessonPicker mode="flash"/>;
    }

    if (tab === "quiz") {
      if (activeLesson) return (
        <QuizStudy
          lessonId={activeLesson.id}
          lessonName={activeLesson.name}
          onBack={() => setActiveLesson(null)}
        />
      );
      return <LessonPicker mode="quiz"/>;
    }
  };

  return (
    <div className="ud-root">
      <style>{S}</style>

      {/* nav */}
      {!activeLesson && (
        <nav className="ud-nav">
          <div className="ud-nav-logo">Vocab<em>App</em></div>
          {TABS.map(t => (
            <button key={t.id}
              className={`ud-tab${tab===t.id?" active":""}`}
              onClick={() => handleTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      )}

      <div className="ud-content">
        {renderContent()}
      </div>
    </div>
  );
}