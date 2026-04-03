import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

/* ─── inject global CSS once ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:      #0d0f14;
    --ink2:     #181c25;
    --surface:  #1a1e2b;
    --border:   rgba(255,255,255,0.08);
    --gold:     #e8c96f;
    --gold2:    #f5dfa0;
    --teal:     #4ecdc4;
    --muted:    #7b8197;
    --text:     #e8eaf2;
    --danger:   #ff6b6b;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--ink); color: var(--text); }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes shimmer  { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px 14px 46px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .auth-input::placeholder { color: var(--muted); }
  .auth-input:focus {
    border-color: rgba(232,201,111,0.5);
    background: rgba(232,201,111,0.04);
    box-shadow: 0 0 0 3px rgba(232,201,111,0.1);
  }
  .auth-input.error {
    border-color: rgba(255,107,107,0.5);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.1);
  }

  .auth-btn {
    width: 100%;
    padding: 15px;
    background: var(--gold);
    color: var(--ink);
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: all 0.22s;
    position: relative;
    overflow: hidden;
  }
  .auth-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s;
  }
  .auth-btn:hover { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,201,111,0.35); }
  .auth-btn:hover::after { transform: translateX(100%); }
  .auth-btn:active { transform: translateY(0); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .word-float {
    animation: float 3s ease-in-out infinite;
    display: inline-block;
  }

  .panel-word {
    font-family: 'Playfair Display', serif;
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(232,201,111,0.5);
    text-transform: uppercase;
    border: 1px solid rgba(232,201,111,0.15);
    border-radius: 8px;
    padding: 5px 12px;
    display: inline-block;
    margin: 4px;
    transition: all 0.3s;
    cursor: default;
    user-select: none;
  }
  .panel-word:hover {
    color: var(--gold);
    border-color: rgba(232,201,111,0.4);
    background: rgba(232,201,111,0.06);
  }
`;

function injectCSS() {
  if (!document.getElementById("auth-css")) {
    const s = document.createElement("style");
    s.id = "auth-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

/* ─── Icons ─── */
const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IcoEye = ({ off }) => off ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

/* ─── Left branding panel ─── */
const VOCAB_WORDS = [
  "Serendipity","Ephemeral","Luminous","Eloquent","Resilience",
  "Ambiguous","Profound","Catalyst","Eloquence","Melancholy",
  "Tenacious","Vivacious","Whimsical","Zenith","Ardent",
];

function BrandPanel() {
  return (
    <div style={{
      flex: "0 0 42%",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "48px 44px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ambient blobs */}
      <div style={{ position:"absolute", top:-80, left:-80, width:320, height:320, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(232,201,111,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-60, right:-60, width:260, height:260, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
      {/* grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }} />

      {/* logo */}
      <div style={{ animation:"fadeLeft 0.7s ease both" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{
            width:42, height:42, borderRadius:12,
            background:"linear-gradient(135deg,#e8c96f,#f5dfa0)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
          }}></div>
          <span style={{ fontFamily:"Playfair Display", fontSize:22, fontWeight:900, color:"var(--text)" }}>T-Đ-T   LearningEnglish</span>
        </div>
        <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:2.5, textTransform:"uppercase", paddingLeft:54 }}>
          English Mastery Platform
        </div>
      </div>

      {/* headline */}
      <div style={{ animation:"fadeLeft 0.7s 0.15s ease both" }}>
        <h2 style={{
          fontFamily:"Playfair Display", fontStyle:"italic",
          fontSize:"clamp(26px,3vw,36px)", fontWeight:700,
          color:"var(--text)", lineHeight:1.3, marginBottom:16,
        }}>
          Mỗi từ mới là<br />
          <span style={{ color:"var(--gold)" }}>một chân trời mới.</span>
        </h2>
        <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8, maxWidth:300 }}>
          Hơn 5.000 từ vựng đang chờ bạn. Học mỗi ngày, tiến bộ mỗi ngày.
        </p>
      </div>

      {/* floating vocab tags */}
      <div style={{ animation:"fadeLeft 0.7s 0.3s ease both" }}>
        <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>
          Từ vựng hôm nay
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {VOCAB_WORDS.map((w, i) => (
            <span key={w} className="panel-word" style={{ animationDelay:`${i*0.15}s` }}>{w}</span>
          ))}
        </div>
      </div>

      {/* bottom stat row */}
      <div style={{
        display:"flex", gap:28,
        animation:"fadeLeft 0.7s 0.45s ease both",
      }}>
        {[
          { n:"5,000+", l:"Từ vựng" },
          { n:"10K+",   l:"Học viên" },
          { n:"98%",    l:"Hài lòng" },
        ].map(({ n, l }) => (
          <div key={l}>
            <div style={{ fontFamily:"Playfair Display", fontSize:22, fontWeight:900, color:"var(--gold)" }}>{n}</div>
            <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Input Field ─── */
function Field({ icon, label, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)",
        letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <div style={{
          position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          color: error ? "var(--danger)" : "var(--muted)", pointerEvents:"none",
          display:"flex", alignItems:"center",
        }}>{icon}</div>
        {children}
      </div>
      {error && (
        <div style={{ fontSize:12, color:"var(--danger)", marginTop:6, paddingLeft:2 }}>
          {error}
        </div>
      )}
    </div>
  );
}

/* ─── Login ─── */
export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [shake,    setShake]    = useState(false);

  useEffect(() => { injectCSS(); }, []);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Vui lòng nhập tên đăng nhập";
    if (!password)        e.password = "Vui lòng nhập mật khẩu";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { Username: username, Password: password });
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate(res.data.Role === "Admin" ? "/admin" : "/");
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setErrors({ global: "Sai tài khoản hoặc mật khẩu" });
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--ink)" }}>
      {/* left panel — hidden on small screens */}
      <div style={{ display:"flex", flex:"0 0 42%" }} className="brand-panel">
        <BrandPanel />
      </div>

      {/* right: form */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 24px",
      }}>
        <div style={{
          width:"100%", maxWidth:400,
          animation:"fadeUp 0.65s ease both",
          ...(shake ? { animation:"shake 0.5s ease" } : {}),
        }}>
          {/* header */}
          <div style={{ marginBottom:36 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(232,201,111,0.1)", border:"1px solid rgba(232,201,111,0.25)",
              borderRadius:40, padding:"6px 16px", marginBottom:20,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)", display:"inline-block" }} />
              <span style={{ fontSize:11, fontWeight:600, color:"var(--gold)", letterSpacing:2 }}>ĐĂNG NHẬP</span>
            </div>
            <h1 style={{
              fontFamily:"Playfair Display", fontSize:32, fontWeight:900,
              color:"var(--text)", lineHeight:1.2, marginBottom:8,
            }}>
              Chào mừng trở lại
            </h1>
            <p style={{ fontSize:14, color:"var(--muted)" }}>
              Tiếp tục hành trình học tiếng Anh của bạn
            </p>
          </div>

          {/* global error */}
          {errors.global && (
            <div style={{
              background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)",
              borderRadius:10, padding:"12px 16px", marginBottom:20,
              fontSize:13.5, color:"var(--danger)",
              display:"flex", alignItems:"center", gap:10,
            }}>
              <span>⚠️</span> {errors.global}
            </div>
          )}

          {/* username */}
          <Field icon={<IcoUser />} label="Tên đăng nhập" error={errors.username}>
            <input
              className={`auth-input${errors.username ? " error" : ""}`}
              placeholder="Nhập username của bạn"
              value={username}
              onChange={e => { setUsername(e.target.value); setErrors(p => ({...p, username:""})); }}
              onKeyDown={onKey}
              autoComplete="username"
            />
          </Field>

          {/* password */}
          <Field icon={<IcoLock />} label="Mật khẩu" error={errors.password}>
            <input
              className={`auth-input${errors.password ? " error" : ""}`}
              type={showPw ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:""})); }}
              onKeyDown={onKey}
              autoComplete="current-password"
              style={{ paddingRight:44 }}
            />
            <button
              onClick={() => setShowPw(p => !p)}
              style={{
                position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:"var(--muted)", display:"flex", alignItems:"center",
                transition:"color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color="var(--gold)"}
              onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
            >
              <IcoEye off={showPw} />
            </button>
          </Field>

          {/* submit */}
          <button
            className="auth-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop:8 }}
          >
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                <span style={{
                  width:16, height:16, border:"2px solid rgba(0,0,0,0.2)",
                  borderTopColor:"var(--ink)", borderRadius:"50%",
                  display:"inline-block", animation:"spin 0.7s linear infinite",
                }} />
                Đang đăng nhập...
              </span>
            ) : "Đăng nhập →"}
          </button>

          {/* divider */}
          <div style={{
            display:"flex", alignItems:"center", gap:14, margin:"28px 0",
          }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
            <span style={{ fontSize:12, color:"var(--muted)" }}>hoặc</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
          </div>

          {/* register CTA */}
          <button
            onClick={() => navigate("/register")}
            style={{
              width:"100%", padding:"14px",
              background:"transparent",
              border:"1px solid var(--border)",
              borderRadius:12,
              color:"var(--text)", fontSize:14, fontWeight:600,
              fontFamily:"DM Sans, sans-serif",
              cursor:"pointer",
              transition:"all 0.22s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(232,201,111,0.4)";
              e.currentTarget.style.background = "rgba(232,201,111,0.05)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            Tạo tài khoản mới
          </button>

          <p style={{ textAlign:"center", fontSize:12, color:"var(--muted)", marginTop:28, lineHeight:1.6 }}>
            Bằng cách đăng nhập, bạn đồng ý với<br />
            <span style={{ color:"var(--gold)", cursor:"pointer" }}>Điều khoản sử dụng</span>
            {" "}của VocabApp.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .brand-panel { display: none !important; } }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60%  { transform:translateX(-8px); }
          40%,80%  { transform:translateX(8px); }
        }
      `}</style>
    </div>
  );
}