import { useState, useEffect } from 'react';
import { getPatientProfileAPI, updatePatientProfileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientProfileAPI().then(r => { const p = r.data.patient; setProfile(p); setForm({ age: p?.age||'', gender: p?.gender||'', bloodGroup: p?.bloodGroup||'', allergies: p?.allergies?.join(', ')||'', street: p?.address?.street||'', city: p?.address?.city||'', state: p?.address?.state||'', pincode: p?.address?.pincode||'', ecName: p?.emergencyContact?.name||'', ecPhone: p?.emergencyContact?.phone||'', ecRelation: p?.emergencyContact?.relation||'' }); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await updatePatientProfileAPI({ age: form.age, gender: form.gender, bloodGroup: form.bloodGroup, allergies: form.allergies.split(',').map(s=>s.trim()).filter(Boolean), address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode }, emergencyContact: { name: form.ecName, phone: form.ecPhone, relation: form.ecRelation } });
      toast.success('Profile updated!');
      setEditing(false);
    } catch(err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">{user?.name?.charAt(0)}</div>
        <div className="profile-info"><h2>{user?.name}</h2><p>{user?.email} • {user?.phone}</p></div>
      </div>
      <div className="card">
        <div className="card-header"><h3>👤 Personal Information</h3><button className="btn btn-sm btn-outline" style={{width:'auto'}} onClick={()=>editing?handleSave():setEditing(true)}>{editing?'Save':'Edit'}</button></div>
        <div className="card-body">
          <div className="detail-grid">
            {[['Age','age','number'],['Gender','gender','select'],['Blood Group','bloodGroup','select'],['Allergies','allergies','text']].map(([label,key,type])=>(
              <div className="detail-item" key={key}><label>{label}</label>{editing ? (
                type==='select' ? <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:'100%',padding:8,border:'1px solid #e2e8f0',borderRadius:6}}>
                  {key==='gender' ? ['','Male','Female','Other'].map(o=><option key={o} value={o}>{o||'Select'}</option>) : ['','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(o=><option key={o} value={o}>{o||'Select'}</option>)}
                </select> : <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:'100%',padding:8,border:'1px solid #e2e8f0',borderRadius:6}}/>
              ) : <span>{form[key] || '—'}</span>}</div>
            ))}
          </div>
          <h4 style={{marginTop:20,marginBottom:12,fontSize:'.9rem'}}>📍 Address</h4>
          <div className="detail-grid">
            {[['Street','street'],['City','city'],['State','state'],['Pincode','pincode']].map(([label,key])=>(
              <div className="detail-item" key={key}><label>{label}</label>{editing?<input value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:'100%',padding:8,border:'1px solid #e2e8f0',borderRadius:6}}/>:<span>{form[key]||'—'}</span>}</div>
            ))}
          </div>
          <h4 style={{marginTop:20,marginBottom:12,fontSize:'.9rem'}}>🆘 Emergency Contact</h4>
          <div className="detail-grid">
            {[['Name','ecName'],['Phone','ecPhone'],['Relation','ecRelation']].map(([label,key])=>(
              <div className="detail-item" key={key}><label>{label}</label>{editing?<input value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:'100%',padding:8,border:'1px solid #e2e8f0',borderRadius:6}}/>:<span>{form[key]||'—'}</span>}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
