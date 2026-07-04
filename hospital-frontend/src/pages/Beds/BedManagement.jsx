import { useState, useEffect } from 'react';
import { getAllBedsAPI, getBedSummaryAPI, getAllWardsAPI, admitPatientAPI, dischargePatientAPI, createWardAPI, addBedAPI, getAllPatientsAPI, getDoctorsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BedDouble, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BedManagement() {
  const { user } = useAuth();
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [wardFilter, setWardFilter] = useState('');
  const [selectedBed, setSelectedBed] = useState(null);
  const [showAddWard, setShowAddWard] = useState(false);
  const [wardForm, setWardForm] = useState({ name:'', type:'general', floor:1, totalBeds:10 });
  const [admitForm, setAdmitForm] = useState({ patientId:'', doctorId:'' });

  const load = () => {
    Promise.all([
      getAllBedsAPI(), 
      getAllWardsAPI(), 
      getBedSummaryAPI().catch(()=>({data:{}})),
      getAllPatientsAPI().catch(()=>({data:{patients:[]}})),
      user.role === 'admin' ? getDoctorsAPI().catch(()=>({data:{doctors:[]}})) : Promise.resolve({data:{doctors:[]}})
    ])
      .then(([b,w,s,p,d]) => { 
        setBeds(b.data.beds||[]); 
        setWards(w.data.wards||[]); 
        setSummary(s.data.summary||s.data||null); 
        setPatientsList(p.data.patients||[]);
        setDoctorsList(d.data.doctors||[]);
      })
      .finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleDischarge = async (bedId) => {
    try { await dischargePatientAPI(bedId); toast.success('Patient discharged'); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };
  const handleAdmit = async (e) => {
    e.preventDefault();
    try { 
      const dId = user.role === 'doctor' ? user._id : admitForm.doctorId;
      if (!dId) return toast.error('Doctor ID is required');
      await admitPatientAPI(selectedBed._id, { patientId: admitForm.patientId, doctorId: dId }); 
      toast.success('Patient admitted'); 
      setSelectedBed(null); 
      load(); 
    } catch(e) { 
      toast.error(e.response?.data?.message||'Failed'); 
    }
  };
  const handleAddWard = async (e) => {
    e.preventDefault();
    try { await createWardAPI(wardForm); toast.success('Ward created!'); setShowAddWard(false); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const filtered = beds.filter(b => !wardFilter || b.ward?._id === wardFilter || b.ward === wardFilter);
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[['available','🟢','Available',filtered.filter(b=>b.status==='available').length],['occupied','🟣','Occupied',filtered.filter(b=>b.status==='occupied').length],['reserved','🟡','Reserved',filtered.filter(b=>b.status==='reserved').length],['maintenance','🔴','Maintenance',filtered.filter(b=>b.status==='maintenance').length]].map(([s,icon,label,val])=>(
          <div className="stat-card" key={s}><div style={{fontSize:'1.5rem'}}>{icon}</div><div className="stat-info"><h3>{val}</h3><p>{label}</p></div></div>
        ))}
      </div>
      <div className="filter-bar">
        <select value={wardFilter} onChange={e=>setWardFilter(e.target.value)}><option value="">All Wards</option>{wards.map(w=><option key={w._id} value={w._id}>{w.name}</option>)}</select>
        {user.role==='admin' && <button className="btn btn-primary btn-sm" style={{width:'auto',marginLeft:'auto'}} onClick={()=>setShowAddWard(true)}><Plus size={16}/> Add Ward</button>}
      </div>
      <div className="bed-grid">
        {filtered.map(bed => (
          <div key={bed._id} className={`bed-card ${bed.status}`} onClick={()=>setSelectedBed(bed)}>
            <BedDouble size={24} style={{marginBottom:6}}/>
            <div className="bed-num">{bed.bedNumber}</div>
            <div className="bed-type">{bed.type}</div>
            <span className={`badge badge-${bed.status}`} style={{marginTop:6}}>{bed.status}</span>
          </div>
        ))}
      </div>
      {!filtered.length && <div className="empty-state"><div className="empty-icon">🛏️</div><h3>No beds found</h3></div>}

      {selectedBed && (
        <div className="modal-overlay" onClick={()=>setSelectedBed(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Bed {selectedBed.bedNumber}</h3><button className="modal-close" onClick={()=>setSelectedBed(null)}>✕</button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Type</label><span style={{textTransform:'capitalize'}}>{selectedBed.type}</span></div>
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selectedBed.status}`}>{selectedBed.status}</span></div>
                <div className="detail-item"><label>Ward</label><span>{selectedBed.ward?.name||'—'}</span></div>
                <div className="detail-item"><label>Price/Day</label><span>₹{selectedBed.pricePerDay}</span></div>
                <div className="detail-item"><label>Floor</label><span>{selectedBed.floor}</span></div>
                {selectedBed.currentPatient && <div className="detail-item"><label>Patient</label><span>{selectedBed.currentPatient?.name||selectedBed.currentPatient}</span></div>}
              </div>
              {(user.role==='admin'||user.role==='doctor') && selectedBed.status==='occupied' && <button className="btn btn-danger mt-16" onClick={()=>{handleDischarge(selectedBed._id);setSelectedBed(null);}}>Discharge Patient</button>}
              {(user.role==='admin'||user.role==='doctor') && selectedBed.status==='available' && (
                <form onSubmit={handleAdmit} style={{marginTop:16}}>
                  <div className="form-group">
                    <label>Patient</label>
                    <select value={admitForm.patientId} onChange={e=>setAdmitForm(f=>({...f,patientId:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required>
                      <option value="">Select Patient</option>
                      {patientsList.map(p => <option key={p._id} value={p.user?._id || p._id}>{p.user?.name || p.name} ({p.user?.email || p.email})</option>)}
                    </select>
                  </div>
                  {user.role === 'admin' && (
                    <div className="form-group">
                      <label>Assigned Doctor</label>
                      <select value={admitForm.doctorId} onChange={e=>setAdmitForm(f=>({...f,doctorId:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required>
                        <option value="">Select Doctor</option>
                        {doctorsList.map(d => <option key={d._id} value={d.user?._id || d._id}>Dr. {d.user?.name || d.name} - {d.specialization}</option>)}
                      </select>
                    </div>
                  )}
                  <button type="submit" className="btn btn-success">Admit Patient</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {showAddWard && (
        <div className="modal-overlay" onClick={()=>setShowAddWard(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Add Ward</h3><button className="modal-close" onClick={()=>setShowAddWard(false)}>✕</button></div>
            <form onSubmit={handleAddWard}><div className="modal-body">
              <div className="form-group"><label>Name</label><input value={wardForm.name} onChange={e=>setWardForm(f=>({...f,name:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
              <div className="form-group"><label>Type</label><select value={wardForm.type} onChange={e=>setWardForm(f=>({...f,type:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}>{['general','icu','emergency','maternity','pediatric','orthopedic','cardiac','surgical'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div className="grid-2"><div className="form-group"><label>Floor</label><input type="number" value={wardForm.floor} onChange={e=>setWardForm(f=>({...f,floor:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div><div className="form-group"><label>Total Beds</label><input type="number" value={wardForm.totalBeds} onChange={e=>setWardForm(f=>({...f,totalBeds:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div></div>
            </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Create Ward</button></div></form>
          </div>
        </div>
      )}
    </div>
  );
}
