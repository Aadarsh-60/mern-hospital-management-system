import { useState, useEffect } from 'react';
import { getAllUsersAPI, toggleUserStatusAPI, deleteUserAPI } from '../../services/api';
import { Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const load = (p=1) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (roleFilter) params.role = roleFilter;
    getAllUsersAPI(params).then(r => { setUsers(r.data.users||[]); setTotalPages(r.data.totalPages||1); setPage(p); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, [roleFilter]);

  const handleToggle = async (id) => { try { await toggleUserStatusAPI(id); toast.success('Status toggled'); load(page); } catch(e) { toast.error(e.response?.data?.message||'Failed'); } };
  const handleDelete = async (id) => { if(!window.confirm('Delete this user?')) return; try { await deleteUserAPI(id); toast.success('User deleted'); load(page); } catch(e) { toast.error(e.response?.data?.message||'Failed'); } };

  const filtered = users.filter(u => (u.name||'').toLowerCase().includes(search.toLowerCase()) || (u.email||'').toLowerCase().includes(search.toLowerCase()));
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {['admin','doctor','patient','receptionist','nurse'].map(role => (
          <div key={role} className="stat-card" style={{cursor:'pointer',border:roleFilter===role?'2px solid #3b82f6':undefined}} onClick={()=>setRoleFilter(roleFilter===role?'':role)}>
            <div className={`stat-icon ${role==='admin'?'blue':role==='doctor'?'green':role==='patient'?'purple':role==='receptionist'?'amber':'teal'}`}><Shield size={20}/></div>
            <div className="stat-info"><h3>{users.filter?filtered.filter(u=>u.role===role).length:'—'}</h3><p style={{textTransform:'capitalize'}}>{role}s</p></div>
          </div>
        ))}
      </div>
      <div className="filter-bar">
        <div className="topbar-search"><Search size={16} color="#94a3b8"/><input placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="patient">Patient</option><option value="receptionist">Receptionist</option><option value="nurse">Nurse</option></select>
      </div>
      <div className="card"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
        {filtered.map(u=>(
          <tr key={u._id}><td style={{fontWeight:500}}>{u.name}</td><td>{u.email}</td><td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
          <td><span className={`badge ${u.isActive?'badge-green':'badge-red'}`}>{u.isActive?'Active':'Inactive'}</span></td>
          <td style={{fontSize:'.8rem',color:'#64748b'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
          <td><div className="actions">
            <button className="action-btn edit" onClick={()=>handleToggle(u._id)}>{u.isActive?'Deactivate':'Activate'}</button>
            <button className="action-btn delete" onClick={()=>handleDelete(u._id)}>Delete</button>
          </div></td></tr>
        ))}
      </tbody></table>
      {!filtered.length && <div className="empty-state"><div className="empty-icon">👥</div><h3>No users found</h3></div>}
      </div>
      {totalPages > 1 && <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}>
        {Array.from({length:totalPages},(_,i)=>i+1).map(p => <button key={p} className={`btn btn-sm ${p===page?'btn-primary':'btn-outline'}`} style={{width:'auto',minWidth:36}} onClick={()=>load(p)}>{p}</button>)}
      </div>}
    </div>
  );
}
