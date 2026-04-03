import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── inject global CSS (shared with Login) ─── */
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
    --success:  #4ecdc4;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--ink); color: var(--text); }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes growBar  { from { width:0; } }

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
  .auth-input.success {
    border-color: rgba(78,205,196,0.5);
    box-shadow: 0 0 0 3px rgba(78,205,196,0.08);
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
  .auth-btn:hover { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,201,111,0.35); }
  .auth-btn:active { transform: translateY(0); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .panel-word {
    font-family: 'Playfair Display', serif;
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(78,205,196,0.5);
    text-transform: uppercase;
    border: 1px solid rgba(78,205,196,0.15);
    border-radius: 8px;
    padding: 5px 12px;
    display: inline-block;
    margin: 4px;
    transition: all 0.3s;
    cursor: default;
    user-select: none;
  }
  .panel-word:hover {
    color: var(--teal);
    border-color: rgba(78,205,196,0.4);
    background: rgba(78,205,196,0.06);
  }

  .check-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    transition: color 0.2s;
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
const IcoUser  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoMail  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoLock  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoEye   = ({ off }) => off
  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoCheck = ({ on }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={on ? "#4ecdc4" : "#7b8197"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

/* ─── Password strength ─── */
function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABEL = ["", "Yếu", "Trung bình", "Khá tốt", "Mạnh"];
const STRENGTH_COLOR = ["", "#ff6b6b", "#f59e0b", "#4ecdc4", "#e8c96f"];

/* ─── Brand Panel (teal variant) ─── */
const VOCAB_WORDS = [
  "Articulate","Diligent","Persevere","Ambitious","Confident",
  "Innovative","Eloquent","Steadfast","Creative","Curious",
  "Passionate","Inspired","Devoted","Mindful","Brave",
];

function BrandPanel() {
  return (
    <div style={{
      flex:"0 0 42%",
      background:"var(--surface)",
      borderRight:"1px solid var(--border)",
      display:"flex", flexDirection:"column",
      justifyContent:"space-between",
      padding:"48px 44px",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-60, left:-60, width:250, height:250, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(232,201,111,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
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

      {/* quote */}
      <div style={{ animation:"fadeLeft 0.7s 0.15s ease both" }}>
        <div style={{
          width:36, height:2, background:"var(--teal)", marginBottom:20, borderRadius:99,
        }} />
        <blockquote style={{
          fontFamily:"Playfair Display", fontStyle:"italic",
          fontSize:"clamp(22px,2.5vw,30px)", fontWeight:700,
          color:"var(--text)", lineHeight:1.4, marginBottom:16,
        }}>
          "Học một ngôn ngữ mới là<br />
          <span style={{ color:"var(--teal)" }}>có thêm một tâm hồn."</span>
        </blockquote>
        <p style={{ fontSize:13, color:"var(--muted)" }}>— Charlemagne</p>
      </div>

      {/* vocab tags */}
      <div style={{ animation:"fadeLeft 0.7s 0.3s ease both" }}>
        <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>
          Từ truyền cảm hứng
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {VOCAB_WORDS.map(w => <span key={w} className="panel-word">{w}</span>)}
        </div>
      </div>

      {/* steps */}
      <div style={{ animation:"fadeLeft 0.7s 0.45s ease both" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { n:"01", t:"Tạo tài khoản miễn phí" },
            { n:"02", t:"Chọn chủ đề từ vựng" },
            { n:"03", t:"Học và kiểm tra mỗi ngày" },
          ].map(({ n, t }) => (
            <div key={n} style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                background:"rgba(78,205,196,0.12)", border:"1px solid rgba(78,205,196,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"Playfair Display", fontSize:11, fontWeight:700, color:"var(--teal)",
              }}>{n}</div>
              <span style={{ fontSize:13.5, color:"var(--muted)" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Field ─── */
function Field({ icon, label, error, hint, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)",
        letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <div style={{
          position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          color: error ? "var(--danger)" : "var(--muted)", pointerEvents:"none",
          display:"flex", alignItems:"center",
        }}>{icon}</div>
        {children}
      </div>
      {error && <div style={{ fontSize:12, color:"var(--danger)", marginTop:6, paddingLeft:2 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize:12, color:"var(--muted)", marginTop:6, paddingLeft:2 }}>{hint}</div>}
    </div>
  );
}

/* ─── Register ─── */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ Username:"", Email:"", Password:"" });
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [success,   setSuccess]   = useState(false);

  useEffect(() => { injectCSS(); }, []);

  const pw        = form.Password;
  const strength  = pw ? pwStrength(pw) : 0;
  const pwChecks  = [
    { label:"Ít nhất 8 ký tự",           ok: pw.length >= 8 },
    { label:"Có chữ hoa",                 ok: /[A-Z]/.test(pw) },
    { label:"Có số",                      ok: /[0-9]/.test(pw) },
    { label:"Có ký tự đặc biệt (!@#…)",  ok: /[^A-Za-z0-9]/.test(pw) },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(p => ({ ...p, [e.target.name.toLowerCase()]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.Username.trim()) e.username = "Vui lòng nhập tên đăng nhập";
    else if (form.Username.length < 3) e.username = "Tên đăng nhập tối thiểu 3 ký tự";
    if (!form.Email.trim())    e.email    = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.Email)) e.email = "Email không hợp lệ";
    if (!form.Password)        e.password = "Vui lòng nhập mật khẩu";
    else if (form.Password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (confirmPw !== form.Password) e.confirm = "Mật khẩu không khớp";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ global: data.error || "Đã có lỗi xảy ra" }); return; }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setErrors({ global:"Không thể kết nối server" });
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--ink)" }}>
      {/* left panel */}
      <div style={{ display:"flex", flex:"0 0 42%" }} className="brand-panel">
        <BrandPanel />
      </div>

      {/* right: form */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 24px", overflowY:"auto",
      }}>
        <div style={{ width:"100%", maxWidth:400, animation:"fadeUp 0.65s ease both" }}>

          {/* success state */}
          {success ? (
            <div style={{ textAlign:"center", animation:"fadeUp 0.5s ease both" }}>
              <div style={{ fontSize:56, marginBottom:20 }}>🎉</div>
              <h2 style={{ fontFamily:"Playfair Display", fontSize:28, fontWeight:900, color:"var(--text)", marginBottom:12 }}>
                Đăng ký thành công!
              </h2>
              <p style={{ color:"var(--muted)", fontSize:14, lineHeight:1.8 }}>
                Tài khoản của bạn đã được tạo.<br />Đang chuyển hướng đến trang đăng nhập…
              </p>
              <div style={{
                width:48, height:48, borderRadius:"50%",
                border:"3px solid var(--teal)", borderTopColor:"transparent",
                animation:"spin 0.8s linear infinite", margin:"28px auto 0",
              }} />
            </div>
          ) : (
            <>
              {/* header */}
              <div style={{ marginBottom:32 }}>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.25)",
                  borderRadius:40, padding:"6px 16px", marginBottom:20,
                }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--teal)", display:"inline-block" }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"var(--teal)", letterSpacing:2 }}>TẠO TÀI KHOẢN</span>
                </div>
                <h1 style={{
                  fontFamily:"Playfair Display", fontSize:32, fontWeight:900,
                  color:"var(--text)", lineHeight:1.2, marginBottom:8,
                }}>
                  Bắt đầu hành trình
                </h1>
                <p style={{ fontSize:14, color:"var(--muted)" }}>
                  Miễn phí · Không cần thẻ tín dụng
                </p>
              </div>

              {errors.global && (
                <div style={{
                  background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)",
                  borderRadius:10, padding:"12px 16px", marginBottom:20,
                  fontSize:13.5, color:"var(--danger)", display:"flex", alignItems:"center", gap:10,
                }}>
                  <span>⚠️</span> {errors.global}
                </div>
              )}

              {/* Username */}
              <Field icon={<IcoUser />} label="Tên đăng nhập" error={errors.username}
                hint="Tối thiểu 3 ký tự, không dấu">
                <input className={`auth-input${errors.username ? " error" : ""}`}
                  name="Username" placeholder="Nhập username"
                  value={form.Username} onChange={handleChange} onKeyDown={onKey}
                  autoComplete="username" />
              </Field>

              {/* Email */}
              <Field icon={<IcoMail />} label="Email" error={errors.email}>
                <input className={`auth-input${errors.email ? " error" : ""}`}
                  name="Email" type="email" placeholder="example@gmail.com"
                  value={form.Email} onChange={handleChange} onKeyDown={onKey}
                  autoComplete="email" />
              </Field>

              {/* Password */}
              <Field icon={<IcoLock />} label="Mật khẩu" error={errors.password}>
                <input className={`auth-input${errors.password ? " error" : ""}`}
                  name="Password" type={showPw ? "text" : "password"} placeholder="Tạo mật khẩu"
                  value={form.Password} onChange={handleChange} onKeyDown={onKey}
                  autoComplete="new-password" style={{ paddingRight:44 }} />
                <button onClick={() => setShowPw(p => !p)} style={{
                  position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  color:"var(--muted)", display:"flex", alignItems:"center", transition:"color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color="var(--gold)"}
                  onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                ><IcoEye off={showPw} /></button>
              </Field>

              {/* Strength bar + checks */}
              {pw && (
                <div style={{ marginTop:-10, marginBottom:20 }}>
                  {/* bar */}
                  <div style={{ display:"flex", gap:4, marginBottom:10 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex:1, height:3, borderRadius:99,
                        background: i <= strength ? STRENGTH_COLOR[strength] : "var(--border)",
                        transition:"background 0.3s",
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize:12, color: STRENGTH_COLOR[strength], fontWeight:600, marginBottom:10 }}>
                    {STRENGTH_LABEL[strength]}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {pwChecks.map(({ label, ok }) => (
                      <div key={label} className="check-item" style={{ color: ok ? "var(--teal)" : "var(--muted)" }}>
                        <IcoCheck on={ok} />
                        <span style={{ fontSize:12 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm */}
              <Field icon={<IcoLock />} label="Xác nhận mật khẩu" error={errors.confirm}>
                <input
                  className={`auth-input${errors.confirm ? " error" : confirmPw && confirmPw === form.Password ? " success" : ""}`}
                  type="password" placeholder="Nhập lại mật khẩu"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setErrors(p => ({...p, confirm:""})); }}
                  onKeyDown={onKey}
                  autoComplete="new-password"
                />
              </Field>

              {/* submit */}
              <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop:8 }}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{
                      width:16, height:16, border:"2px solid rgba(0,0,0,0.2)",
                      borderTopColor:"var(--ink)", borderRadius:"50%",
                      display:"inline-block", animation:"spin 0.7s linear infinite",
                    }} />
                    Đang tạo tài khoản...
                  </span>
                ) : "Tạo tài khoản →"}
              </button>

              {/* login link */}
              <p style={{ textAlign:"center", fontSize:14, color:"var(--muted)", marginTop:24 }}>
                Đã có tài khoản?{" "}
                <span onClick={() => navigate("/login")} style={{
                  color:"var(--gold)", fontWeight:600, cursor:"pointer",
                  borderBottom:"1px solid rgba(232,201,111,0.3)",
                  paddingBottom:1, transition:"border-color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="var(--gold)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="rgba(232,201,111,0.3)"}
                >Đăng nhập ngay</span>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .brand-panel { display: none !important; } }
      `}</style>
    </div>
  );
}