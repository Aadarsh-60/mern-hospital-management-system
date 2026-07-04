import { useState, useEffect } from 'react';
import { getAllStaffAPI, addStaffAPI, updateStaffAPI, toggleDutyStatusAPI, getDutyRosterAPI } from '../../services/api';
import { UserCog, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffModule() {
  const [tab, setTab] = useState('list');
  const [staff, setStaff] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'staff123', designation:'nurse', department:'', shift:'morning', salary:25000 });
  const [editForm, setEditForm] = useState({ designation:'', department:'', shift:'', salary:'' });
  
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setEdit = (k,v) => setEditForm(f=>({...f,[k]:v}));

  const load = () => {
    setLoading(true);
    Promise.all([getAllStaffAPI(), getDutyRosterAPI().catch(()=>({data:{roster:[]}}))])
      .then(([s,r]) => { setStaff(s.data.staff||[]); setRoster(r.data.roster||r.data.staff||[]); })
      .finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await addStaffAPI(form); toast.success('Staff added!'); setShowAdd(false); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { 
      await updateStaffAPI(showEdit._id, editForm); 
      toast.success('Staff updated successfully!'); 
      setShowEdit(null); 
      load(); 
    } catch(e) { 
      toast.error(e.response?.data?.message||'Failed to update staff'); 
    }
  };
  const toggleDuty = async (id) => {
    try { await toggleDutyStatusAPI(id); toast.success('Duty status toggled'); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card"><div className="stat-icon blue"><UserCog size={22}/></div><div className="stat-info"><h3>{staff.length}</h3><p>Total Staff</p></div></div>
        <div className="stat-card"><div className="stat-icon green"><UserCog size={22}/></div><div className="stat-info"><h3>{staff.filter(s=>s.isOnDuty).length}</h3><p>On Duty</p></div></div>
        <div className="stat-card"><div className="stat-icon amber"><UserCog size={22}/></div><div className="stat-info"><h3>{staff.filter(s=>!s.isOnDuty).length}</h3><p>Off Duty</p></div></div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==='list'?'active':''}`} onClick={()=>setTab('list')}>👥 Staff List</button>
        <button className={`tab ${tab==='roster'?'active':''}`} onClick={()=>setTab('roster')}>📋 Duty Roster</button>
      </div>
      {tab==='list' && (<>
        <div className="filter-bar"><button className="btn btn-primary btn-sm" style={{width:'auto',marginLeft:'auto'}} onClick={()=>setShowAdd(true)}><Plus size={16}/> Add Staff</button></div>
        <div className="card"><table className="data-table"><thead><tr><th>Name</th><th>Employee ID</th><th>Designation</th><th>Department</th><th>Shift</th><th>Duty</th><th>Actions</th></tr></thead><tbody>
          {staff.map(s=>(
            <tr key={s._id}><td style={{fontWeight:500}}>{s.user?.name||'—'}</td><td><span className="badge badge-blue">{s.employeeId}</span></td><td style={{textTransform:'capitalize'}}>{s.designation}</td><td>{s.department||'—'}</td><td style={{textTransform:'capitalize'}}>{s.shift}</td>
            <td><span className={`badge ${s.isOnDuty?'badge-green':'badge-red'}`}>{s.isOnDuty?'On Duty':'Off'}</span></td>
            <td>
              <div style={{display:'flex', gap:5}}>
                <button className="action-btn view" onClick={()=>setShowView(s)} style={{background:'#e0f2fe',color:'#0284c7'}}>View</button>
                <button className="action-btn edit" onClick={()=>{
                  setShowEdit(s);
                  setEditForm({ designation: s.designation, department: s.department, shift: s.shift, salary: s.salary });
                }}>Edit</button>
                <button className="action-btn delete" onClick={()=>toggleDuty(s._id)} style={{background:'#fef3c7',color:'#d97706'}}>{s.isOnDuty?'Off-Duty':'On-Duty'}</button>
              </div>
            </td></tr>
          ))}
        </tbody></table>
        {!staff.length && <div className="empty-state"><div className="empty-icon">👥</div><h3>No staff members</h3></div>}
        </div>
      </>)}
      {tab==='roster' && (<>
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 20}}>
          {Object.entries((Array.isArray(roster)?roster:[]).reduce((acc, curr) => {
            acc[curr.designation] = (acc[curr.designation] || 0) + 1;
            return acc;
          }, {})).map(([desig, count]) => (
            <div key={desig} className="stat-card" style={{padding:15}}>
              <div className="stat-info">
                <h3 style={{fontSize:'1.5rem'}}>{count}</h3>
                <p style={{textTransform:'capitalize', fontSize:'0.9rem'}}>{desig}s on Duty</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card"><table className="data-table"><thead><tr><th>Name</th><th>Designation</th><th>Shift</th><th>Timing</th><th>Status</th></tr></thead><tbody>
        {(Array.isArray(roster)?roster:[]).map(s=>(
          <tr key={s._id}><td style={{fontWeight:500}}>{s.user?.name||'—'}</td><td style={{textTransform:'capitalize'}}>{s.designation}</td><td style={{textTransform:'capitalize'}}>{s.shift}</td><td>{s.shiftTiming?.start} - {s.shiftTiming?.end}</td><td><span className={`badge ${s.isOnDuty?'badge-green':'badge-red'}`}>{s.isOnDuty?'On Duty':'Off'}</span></td></tr>
        ))}
      </tbody></table>
        {!(Array.isArray(roster)&&roster.length) && <div className="empty-state"><div className="empty-icon">📋</div><h3>No duty roster data</h3></div>}
        </div>
      </>)}
      {showAdd && <div className="modal-overlay" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Staff Member</h3><button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button></div>
        <form onSubmit={handleAdd}><div className="modal-body">
          <div className="form-group"><label>Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="grid-2">
            <div className="form-group"><label>Designation</label><select value={form.designation} onChange={e=>set('designation',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}>{['nurse','pharmacist','lab-technician','receptionist','ward-boy','cleaner','security','other'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div className="form-group"><label>Department</label><input value={form.department} onChange={e=>set('department',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Shift</label><select value={form.shift} onChange={e=>set('shift',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}><option value="morning">Morning</option><option value="evening">Evening</option><option value="night">Night</option><option value="rotational">Rotational</option></select></div>
            <div className="form-group"><label>Salary (₹)</label><input type="number" value={form.salary} onChange={e=>set('salary',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Add Staff</button></div></form>
      </div></div>}
      
      {showEdit && <div className="modal-overlay" onClick={()=>setShowEdit(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Update Staff</h3><button className="modal-close" onClick={()=>setShowEdit(null)}>✕</button></div>
        <form onSubmit={handleUpdate}><div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label>Designation</label><select value={editForm.designation} onChange={e=>setEdit('designation',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}>{['nurse','pharmacist','lab-technician','receptionist','ward-boy','cleaner','security','other'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div className="form-group"><label>Department</label><input value={editForm.department} onChange={e=>setEdit('department',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Shift</label><select value={editForm.shift} onChange={e=>setEdit('shift',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}><option value="morning">Morning</option><option value="evening">Evening</option><option value="night">Night</option><option value="rotational">Rotational</option></select></div>
            <div className="form-group"><label>Salary (₹)</label><input type="number" value={editForm.salary} onChange={e=>setEdit('salary',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Save Changes</button></div></form>
      </div></div>}

      {showView && <div className="modal-overlay" onClick={()=>setShowView(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Staff Details</h3><button className="modal-close" onClick={()=>setShowView(null)}>✕</button></div>
        <div className="modal-body">
          <div style={{display:'flex',gap:15,alignItems:'center',marginBottom:20}}>
            <div style={{width:60,height:60,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',fontWeight:700,color:'#64748b'}}>
              {showView.user?.name?.charAt(0)||'S'}
            </div>
            <div>
              <h4 style={{fontSize:'1.2rem',margin:0}}>{showView.user?.name||'N/A'}</h4>
              <p style={{margin:0,color:'#64748b'}}>{showView.user?.email}</p>
            </div>
          </div>
          <div className="grid-2" style={{gap:15}}>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Employee ID:</strong><br/>{showView.employeeId}</div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Designation:</strong><br/><span style={{textTransform:'capitalize'}}>{showView.designation}</span></div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Department:</strong><br/>{showView.department||'N/A'}</div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Shift:</strong><br/><span style={{textTransform:'capitalize'}}>{showView.shift}</span></div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Status:</strong><br/><span className={`badge ${showView.isOnDuty?'badge-green':'badge-red'}`}>{showView.isOnDuty?'On Duty':'Off Duty'}</span></div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Salary:</strong><br/>₹{showView.salary}</div>
          </div>
        </div>
      </div></div>}
    </div>
  );
}
