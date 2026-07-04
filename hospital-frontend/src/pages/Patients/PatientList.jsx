import { useState, useEffect } from 'react';
import { getAllPatientsAPI } from '../../services/api';
import { Search } from 'lucide-react';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = (p=1) => {
    setLoading(true);
    getAllPatientsAPI({ page: p, limit: 10 }).then(r => { setPatients(r.data.users || r.data.patients || []); setTotalPages(r.data.totalPages || 1); setPage(p); }).catch(()=>{}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = patients.filter(p => (p.name || p.user?.name || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="filter-bar">
        <div className="topbar-search"><Search size={16} color="#94a3b8"/><input placeholder="Search patients..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>
      <div className="card">
        <table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead><tbody>
          {filtered.map(p => (
            <tr key={p._id}><td style={{fontWeight:500}}>{p.name || p.user?.name}</td><td>{p.email || p.user?.email}</td><td>{p.phone || '—'}</td><td><span className="role-badge role-patient">patient</span></td><td><span className={`badge ${p.isActive!==false?'badge-green':'badge-red'}`}>{p.isActive!==false?'Active':'Inactive'}</span></td></tr>
          ))}
        </tbody></table>
        {!filtered.length && <div className="empty-state"><div className="empty-icon">🧑‍🤝‍🧑</div><h3>No patients found</h3></div>}
      </div>
      {totalPages > 1 && <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}>
        {Array.from({length:totalPages},(_,i)=>i+1).map(p => <button key={p} className={`btn btn-sm ${p===page?'btn-primary':'btn-outline'}`} style={{width:'auto',minWidth:36}} onClick={()=>load(p)}>{p}</button>)}
      </div>}
    </div>
  );
}
