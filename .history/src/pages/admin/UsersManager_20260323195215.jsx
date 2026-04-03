import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:5000/api/admin/users";

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const searchTimer = useRef(null);

  const [stats, setStats] = useState(null);

  const [modal, setModal] = useState(null); // "create"|"edit"|"view"
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ Username: "", Email: "", Role: "User", PasswordHash: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async (opts={})=>{
    setLoading(true);
    const p = opts.page ?? page;
    const q = opts.search ?? search;
    const r = opts.role ?? roleFilter;
    const s = opts.sort ?? sort;
    const params = new URLSearchParams({page:p, limit:10, sort:s});
    if(q) params.set("q", q);
    if(r) params.set("role", r);
    try {
      const res = await fetch(`${API}/?${params}`);
      const data = await res.json();
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, sort]);

  useEffect(()=>{ fetchUsers(); }, [page, roleFilter, sort]);

  const handleSearch = v=>{
    setSearch(v); setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(()=>fetchUsers({search:v,page:1}),400);
  };

  useEffect(()=>{
    fetch(`${API}/stats`).then(r=>r.json()).then(setStats).catch(()=>{});
  }, []);

  const openView = async u=>{
    setModal("view"); setDetail(null);
    try{
      const res = await fetch(`${API}/${u.UserID}`);
      const data = await res.json();
      setDetail(data);
    }catch{ setDetail(u); }
  };

  const openCreate = ()=>{
    setForm({ Username:"", Email:"", Role:"User", PasswordHash:"" });
    setFormErr(""); setDetail(null); setModal("create");
  };

  const openEdit = u=>{
    setForm({ Username:u.Username, Email:u.Email??"", Role:u.Role, PasswordHash:"" });
    setFormErr(""); setDetail(u); setModal("edit");
  };

  const closeModal = ()=>{ setModal(null); setDetail(null); setFormErr(""); };

  const handleSave = async ()=>{
    setFormErr("");
    if(!form.Username.trim()){ setFormErr("Username không được để trống"); return; }
    if(modal==="create" && !form.PasswordHash.trim()){ setFormErr("Mật khẩu không được để trống"); return; }

    setSaving(true);
    try{
      const isCreate = modal==="create";
      const url = isCreate ? `${API}/` : `${API}/${detail.UserID}`;
      const method = isCreate ? "POST" : "PUT";
      const body = {...form}; if(!body.PasswordHash) delete body.PasswordHash;

      const res = await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const json = await res.json();
      if(!res.ok){ setFormErr(json.error ?? "Có lỗi xảy ra"); return; }

      closeModal(); fetchUsers();
      fetch(`${API}/stats`).then(r=>r.json()).then(setStats).catch(()=>{});
    }catch{ setFormErr("Không thể kết nối server"); }
    finally{ setSaving(false); }
  };

  const handleDelete = async u=>{
    if(!window.confirm(`Xóa "${u.Username}"? Toàn bộ dữ liệu học sẽ bị xóa vĩnh viễn.`)) return;
    setDeleting(u.UserID);
    try{
      const res = await fetch(`${API}/${u.UserID}`,{method:"DELETE"});
      const json = await res.json();
      if(!res.ok){ alert(json.error); return; }
      fetchUsers(); fetch(`${API}/stats`).then(r=>r.json()).then(setStats).catch(()=>{});
    }catch{ alert("Xóa thất bại"); }
    finally{ setDeleting(null); }
  };

  return (
    <div style={{padding:32}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:28}}>
        <h2>Quản lý Users</h2>
        <button className="btn btn-primary" onClick={openCreate}>＋ Tạo user mới</button>
      </div>

      {stats && (
        <div style={{display:"flex", gap:14, marginBottom:24}}>
          <StatCard label="Tổng users" value={stats.TotalUsers} emoji="👤" color="blue"/>
          <StatCard label="Admin" value={stats.TotalAdmins} emoji="🔑" color="gold"/>
          <StatCard label="Mới hôm nay" value={stats.NewToday} emoji="🆕" color="green"/>
          <StatCard label="Tuần này" value={stats.NewThisWeek} emoji="📅" color="purple"/>
        </div>
      )}

      <div style={{display:"flex", gap:8, marginBottom:16, alignItems:"center"}}>
        <input placeholder="🔍 Tìm username, email…" value={search} onChange={e=>handleSearch(e.target.value)} style={{width:240}}/>
        <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value); setPage(1); fetchUsers({role:e.target.value,page:1});}}>
          <option value="">Tất cả role</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        <span style={{marginLeft:"auto"}}>{loading?"Đang tải…":`${total} users`}</span>
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              {["Người dùng","Role","Từ vựng","Tiến độ","Quiz TB","Yêu thích","Ngày tạo","Actions"].map(h=><th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8}>Đang tải…</td></tr> :
              users.length===0 ? <tr><td colSpan={8}>Không tìm thấy user nào</td></tr> :
              users.map(u=>(
                <tr key={u.UserID}>
                  <td>{u.Username}<br/>{u.Email??"—"}</td>
                  <td>{u.Role}</td>
                  <td>{u.TotalWords ??0} words<br/>{u.MasteredWords??0} mastered</td>
                  <td>{u.ProgressPct??0}%</td>
                  <td>{u.AvgScore??0}%</td>
                  <td>{u.FavoriteCount??0}</td>
                  <td>{new Date(u.CreatedDate).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={()=>openView(u)}>👁</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(u)}>✏️</button>
                    <button className="btn btn-danger btn-sm" disabled={deleting===u.UserID} onClick={()=>handleDelete(u)}>🗑️</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* ================== MODAL VIEW / EDIT / CREATE ================== */}
      {modal==="create"||modal==="edit" ? <UserFormModal
        modal={modal} form={form} setForm={setForm} formErr={formErr} saving={saving} handleSave={handleSave} closeModal={closeModal}/>
        : null}

      {modal==="view" ? <UserViewModal detail={detail} closeModal={closeModal} openEdit={openEdit}/> : null}
    </div>
  )
}

// ── SUB-COMPONENTS ──
function StatCard({label,value,emoji,color}){ return <div style={{padding:12,borderRadius:12,background:"#fff",border:"1px solid #eee",textAlign:"center"}}><div style={{fontSize:22}}>{emoji}</div><div style={{fontSize:14,color:"#666"}}>{label}</div><div style={{fontWeight:600,fontSize:18,color}}>{value}</div></div> }

function UserFormModal({modal, form, setForm, formErr, saving, handleSave, closeModal}){
  return (
    <ModalOverlay onClose={closeModal}>
      <div style={{width:400}}>
        <ModalHead title={modal==="create"?"＋ Tạo user mới":"✏️ Chỉnh sửa user"} onClose={closeModal}/>
        <div style={{padding:16, display:"flex", flexDirection:"column", gap:12}}>
          <FormGroup label="Username *"><input value={form.Username} onChange={e=>setForm(f=>({...f, Username:e.target.value}))}/></FormGroup>
          <FormGroup label="Email"><input value={form.Email} onChange={e=>setForm(f=>({...f, Email:e.target.value}))}/></FormGroup>
          <FormGroup label="Role">
            <select value={form.Role} onChange={e=>setForm(f=>({...f, Role:e.target.value}))}><option>User</option><option>Admin</option></select>
          </FormGroup>
          <FormGroup label={modal==="edit"?"Mật khẩu mới (tuỳ chọn)":"Mật khẩu *"}>
            <input type="password" placeholder={modal==="edit"?"Để trống = giữ nguyên":"Nhập mật khẩu"} value={form.PasswordHash} onChange={e=>setForm(f=>({...f, PasswordHash:e.target.value}))}/>
          </FormGroup>
          {formErr && <div style={{color:"red",fontSize:13}}>{formErr}</div>}
        </div>
        <div style={{padding:14, borderTop:"1px solid #eee", display:"flex", justifyContent:"flex-end", gap:8}}>
          <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?"Đang lưu…":modal==="create"?"＋ Tạo user":"💾 Lưu thay đổi"}</button>
        </div>
      </div>
    </ModalOverlay>
  )
}

function UserViewModal({detail, closeModal, openEdit}){
  if(!detail) return <ModalOverlay onClose={closeModal}><div style={{padding:48,textAlign:"center"}}>Đang tải…</div></ModalOverlay>
  return (
    <ModalOverlay onClose={closeModal}>
      <div style={{width:620}}>
        <ModalHead title={`👁 Chi tiết ${detail.Username}`} onClose={closeModal}/>
        <div style={{padding:24}}>
          <div style={{marginBottom:16}}>
            <b>Email:</b> {detail.Email??"—"}<br/>
            <b>Role:</b> {detail.Role}<br/>
            <b>Ngày tạo:</b> {new Date(detail.CreatedDate).toLocaleDateString()}<br/>
            <b>Progress:</b> {detail.progress?.ProgressPct??0}% ({detail.progress?.MasteredWords}/{detail.progress?.TotalWords})<br/>
            <b>Quiz TB:</b> {detail.quizStat?.AvgScore??0}% ({detail.quizStat?.TotalQuiz} quiz)<br/>
            <b>Favorites:</b> {detail.favorites?.length??0}
          </div>
          {detail.categoryProgress?.length>0 && <div style={{marginBottom:12}}>
            <b>Tiến độ theo chủ đề:</b>
            {detail.categoryProgress.map(c=><div key={c.CategoryName}>{c.CategoryName}: {c.Mastered}/{c.Total} ({c.Pct}%)</div>)}
          </div>}
          {detail.quizHistory?.length>0 && <div>
            <b>Quiz gần nhất:</b>
            <ul>{detail.quizHistory.map((q,i)=><li key={i}>{q.Word}: {q.Score}% ({q.LearnDate})</li>)}</ul>
          </div>}
          {detail.favorites?.length>0 && <div>
            <b>Favorites:</b> {detail.favorites.map(f=><span key={f.Word}>{f.Word} </span>)}
          </div>}
        </div>
        <div style={{padding:14, borderTop:"1px solid #eee", display:"flex", justifyContent:"space-between"}}>
          <button className="btn btn-ghost" onClick={()=>{closeModal(); openEdit(detail);}}>✏️ Chỉnh sửa user</button>
          <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── COMMON MODAL ──
function ModalOverlay({children,onClose}){
  return (
    <div onClick={e=>{if(e.target===e.currentTarget) onClose()}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
      <div style={{background:"#fff",borderRadius:16,overflow:"hidden",maxWidth:"95vw",maxHeight:"95vh"}}>{children}</div>
    </div>
  )
}
function ModalHead({title,onClose}){
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid #eee"}}>
      <h3 style={{fontSize:16,fontWeight:600}}>{title}</h3>
      <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>✕</button>
    </div>
  )
}
function FormGroup({label,children}){
  return <div style={{display:"flex",flexDirection:"column",gap:6}}><label style={{fontSize:12,color:"#666"}}>{label}</label>{children}</div>
}