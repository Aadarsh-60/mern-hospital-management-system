import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorsAPI, getSpecializationsAPI } from '../../services/api';
import { Search, Star, Clock, IndianRupee } from 'lucide-react';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDoctorsAPI(), getSpecializationsAPI().catch(()=>({data:{specializations:[]}}))])
      .then(([d,s]) => { setDoctors(d.data.doctors||[]); setSpecs(s.data.specializations||[]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const name = (d.user?.name || '').toLowerCase();
    const spec = (d.specialization || '').toLowerCase();
    return name.includes(search.toLowerCase()) && (!specFilter || spec === specFilter.toLowerCase());
  });

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="filter-bar">
        <div className="topbar-search"><Search size={16} color="#94a3b8"/><input placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
          <option value="">All Specializations</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
        {filtered.map(doc => (
          <Link to={`/doctors/${doc._id}`} key={doc._id} className="card" style={{textDecoration:'none',transition:'all .3s'}}>
            <div className="card-body" style={{display:'flex',gap:16,alignItems:'center'}}>
              <div style={{width:56,height:56,borderRadius:14,background:'linear-gradient(135deg,#dbeafe,#ede9fe)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',fontWeight:700,color:'#3b82f6',flexShrink:0}}>
                {(doc.user?.name || 'D').charAt(0)}
              </div>
              <div style={{flex:1}}>
                <h4 style={{fontSize:'.95rem',fontWeight:600,marginBottom:2}}>{doc.user?.name}</h4>
                <p style={{fontSize:'.8rem',color:'#3b82f6',fontWeight:500,marginBottom:6}}>{doc.specialization}</p>
                <div style={{display:'flex',gap:12,fontSize:'.75rem',color:'#64748b'}}>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><Star size={12} color="#f59e0b"/> {doc.rating?.toFixed(1) || '0.0'}</span>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><Clock size={12}/> {doc.experience || 0} yrs</span>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><IndianRupee size={12}/> ₹{doc.consultationFee}</span>
                </div>
              </div>
              <span className={`badge ${doc.isAvailable ? 'badge-green' : 'badge-red'}`}>{doc.isAvailable ? 'Available' : 'Busy'}</span>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && <div className="empty-state"><div className="empty-icon">👨‍⚕️</div><h3>No doctors found</h3></div>}
    </div>
  );
}
