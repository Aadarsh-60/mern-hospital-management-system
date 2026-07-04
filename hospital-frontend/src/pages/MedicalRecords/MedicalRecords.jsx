import { useState, useEffect } from 'react';
import { getPatientMedicalRecordsAPI, createMedicalRecordAPI, getRecordsByPatientAPI, updateMedicalRecordAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getAllPatientsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function MedicalRecords() {
  const { user } = useAuth();
  if (user?.role === 'patient') return <PatientRecordsView />;
  return <DoctorRecordsView />;
}

function PatientRecordsView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printRecord, setPrintRecord] = useState(null);

  useEffect(() => { getPatientMedicalRecordsAPI().then(r=>setRecords(r.data.records||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  
  const handlePrint = (r) => {
    setPrintRecord(r);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintRecord(null), 500);
    }, 100);
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="card">
        <div className="card-header"><h3>📋 My Medical Records</h3></div>
        <div className="card-body">
          {records.map(r => (
            <div key={r._id} style={{padding:16,borderBottom:'1px solid #e2e8f0',marginBottom:8}}>
              <div className="flex-between">
                <h4 style={{fontSize:'.95rem'}}>{r.diagnosis}</h4>
                <div>
                  <span style={{fontSize:'.75rem',color:'#64748b', marginRight: '12px'}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => handlePrint(r)}>Print</button>
                </div>
              </div>
              <p style={{fontSize:'.8rem',color:'#64748b',marginTop:4}}>Dr. {r.doctor?.name}</p>
              {r.symptoms?.length>0 && <p style={{fontSize:'.8rem',marginTop:6}}>Symptoms: {r.symptoms.join(', ')}</p>}
              {r.prescription?.length>0 && <div style={{marginTop:8}}><p style={{fontSize:'.8rem',fontWeight:600}}>Prescription:</p>{r.prescription.map((p,i)=><p key={i} style={{fontSize:'.8rem',color:'#64748b'}}>• {p.medicine} — {p.dosage} for {p.duration}</p>)}</div>}
              {r.notes && <p style={{fontSize:'.8rem',color:'#64748b',marginTop:6}}>Notes: {r.notes}</p>}
            </div>
          ))}
          {!records.length && <div className="empty-state"><div className="empty-icon">📋</div><h3>No medical records</h3></div>}
        </div>
      </div>

      {/* Printable E-Prescription Layout */}
      {printRecord && (
        <div className="print-only prescription-layout">
          <div className="prescription-header">
            <h2>Hospital Management System</h2>
            <p>123 Health Avenue, Medical District</p>
            <p>Phone: +1 234 567 8900 | Email: care@hospital.com</p>
          </div>
          <hr />
          <div className="prescription-meta">
            <div>
              <p><strong>Patient:</strong> {printRecord.patient?.name}</p>
              <p><strong>Patient ID:</strong> {printRecord.patient?._id}</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p><strong>Date:</strong> {new Date(printRecord.createdAt).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {printRecord.doctor?.name}</p>
            </div>
          </div>
          <hr />
          <div className="prescription-body">
            <h3>Diagnosis</h3>
            <p>{printRecord.diagnosis}</p>
            
            <h3>Symptoms</h3>
            <p>{printRecord.symptoms?.join(', ') || 'None recorded'}</p>
            
            <h3 className="rx-symbol">Rx</h3>
            {printRecord.prescription?.length > 0 ? (
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {printRecord.prescription.map((p, i) => (
                    <tr key={i}>
                      <td>{p.medicine}</td>
                      <td>{p.dosage}</td>
                      <td>{p.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No medicines prescribed.</p>}

            <h3>Notes / Instructions</h3>
            <p>{printRecord.notes || 'No special instructions.'}</p>
          </div>
          <div className="prescription-footer">
            <p>Doctor's Signature</p>
            <div className="signature-line"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorRecordsView() {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(null);
  const [printRecord, setPrintRecord] = useState(null);
  const [form, setForm] = useState({ patient:'', diagnosis:'', symptoms:'', notes:'', medicineName:'', dosage:'', duration:'' });
  const [updateForm, setUpdateForm] = useState({ diagnosis:'', symptoms:'', notes:'', medicineName:'', dosage:'', duration:'' });
  
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setU = (k,v) => setUpdateForm(f=>({...f,[k]:v}));

  useEffect(() => {
    getAllPatientsAPI().then(r => setPatients(r.data.patients || [])).catch(() => {});
  }, []);

  const handlePrint = (r) => {
    setPrintRecord(r);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const searchRecords = () => {
    if (!patientId) return;
    getRecordsByPatientAPI(patientId).then(r=>setRecords(r.data.records||[])).catch(()=>toast.error('Failed to load'));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createMedicalRecordAPI({ patientId: form.patient, diagnosis: form.diagnosis, symptoms: form.symptoms.split(',').map(s=>s.trim()), prescription: form.medicineName ? [{ medicine: form.medicineName, dosage: form.dosage, duration: form.duration }] : [], notes: form.notes });
      toast.success('Record created!');
      setShowCreate(false);
      if (patientId === form.patient) searchRecords();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const openUpdate = (r) => {
    setShowUpdate(r);
    const p = r.prescription?.[0] || {};
    setUpdateForm({
      diagnosis: r.diagnosis || '',
      symptoms: (r.symptoms || []).join(', '),
      notes: r.notes || '',
      medicineName: p.medicine || '',
      dosage: p.dosage || '',
      duration: p.duration || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateMedicalRecordAPI(showUpdate._id, {
        diagnosis: updateForm.diagnosis,
        symptoms: updateForm.symptoms.split(',').map(s=>s.trim()),
        prescription: updateForm.medicineName ? [{ medicine: updateForm.medicineName, dosage: updateForm.dosage, duration: updateForm.duration }] : [],
        notes: updateForm.notes
      });
      toast.success('Record updated!');
      setShowUpdate(null);
      searchRecords();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  return (
    <div>
      <div className="filter-bar">
        <select value={patientId} onChange={e=>setPatientId(e.target.value)} style={{padding:'8px 14px',border:'1.5px solid #e2e8f0',borderRadius:8, minWidth: '250px'}}>
          <option value="">-- Select Patient --</option>
          {patients.map(p => (
            <option key={p._id} value={p.user?._id || p._id}>{p.user?.name || p.name} ({p.user?.email || p.email})</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={searchRecords}>Search</button>
        {user.role==='doctor' && <button className="btn btn-sm btn-success" style={{width:'auto',marginLeft:'auto'}} onClick={()=>setShowCreate(true)}>+ Create Record</button>}
      </div>
      <div className="card"><div className="card-body">
        {records.map(r => (
          <div key={r._id} style={{padding:16,borderBottom:'1px solid #e2e8f0'}}>
            <div className="flex-between">
               <h4 style={{fontSize:'.95rem',margin:0}}>{r.diagnosis}</h4>
               <div>
                 <span style={{fontSize:'.75rem',color:'#64748b',marginRight:15}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                 <button className="btn btn-primary btn-sm" style={{padding:'4px 10px', marginRight: 8}} onClick={() => handlePrint(r)}>Print</button>
                 {user.role === 'doctor' && <button className="btn btn-outline btn-sm" style={{padding:'4px 10px'}} onClick={() => openUpdate(r)}>Edit</button>}
               </div>
            </div>
            <p style={{fontSize:'.8rem',color:'#64748b',marginTop:4,marginBottom:0}}>Patient: {r.patient?.name}</p>
            {r.symptoms?.length>0 && <p style={{fontSize:'.8rem',marginTop:4}}>Symptoms: {r.symptoms.join(', ')}</p>}
          </div>
        ))}
        {!records.length && <div className="empty-state"><div className="empty-icon">📋</div><h3>Search by Patient to view records</h3></div>}
      </div></div>
      {showCreate && (
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Create Medical Record</h3><button className="modal-close" onClick={()=>setShowCreate(false)}>✕</button></div>
            <form onSubmit={handleCreate}><div className="modal-body">
              <div className="form-group">
                <label>Select Patient</label>
                <select value={form.patient} onChange={e=>set('patient',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required>
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p.user?._id || p._id}>{p.user?.name || p.name} ({p.user?.email || p.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Diagnosis</label><input value={form.diagnosis} onChange={e=>set('diagnosis',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
              <div className="form-group"><label>Symptoms (comma separated)</label><input value={form.symptoms} onChange={e=>set('symptoms',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
              <div className="form-group"><label>Medicine</label><input value={form.medicineName} onChange={e=>set('medicineName',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
              <div className="grid-2"><div className="form-group"><label>Dosage</label><input value={form.dosage} onChange={e=>set('dosage',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div><div className="form-group"><label>Duration</label><input value={form.duration} onChange={e=>set('duration',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div></div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:60}}/></div>
            </div><div className="modal-footer"><button type="button" className="btn btn-outline btn-sm" onClick={()=>setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary btn-sm">Create</button></div></form>
          </div>
        </div>
      )}
      
      {showUpdate && (
        <div className="modal-overlay" onClick={()=>setShowUpdate(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Update Medical Record</h3><button className="modal-close" onClick={()=>setShowUpdate(null)}>✕</button></div>
            <form onSubmit={handleUpdate}><div className="modal-body">
              <div className="form-group"><label>Diagnosis</label><input value={updateForm.diagnosis} onChange={e=>setU('diagnosis',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
              <div className="form-group"><label>Symptoms (comma separated)</label><input value={updateForm.symptoms} onChange={e=>setU('symptoms',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
              <div className="form-group"><label>Medicine</label><input value={updateForm.medicineName} onChange={e=>setU('medicineName',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
              <div className="grid-2"><div className="form-group"><label>Dosage</label><input value={updateForm.dosage} onChange={e=>setU('dosage',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div><div className="form-group"><label>Duration</label><input value={updateForm.duration} onChange={e=>setU('duration',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div></div>
              <div className="form-group"><label>Notes</label><textarea value={updateForm.notes} onChange={e=>setU('notes',e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:60}}/></div>
            </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Save Changes</button></div></form>
          </div>
        </div>
      )}

      {/* Printable E-Prescription Layout */}
      {printRecord && (
        <div className="print-only prescription-layout">
          <div className="prescription-header">
            <h2>Hospital Management System</h2>
            <p>123 Health Avenue, Medical District</p>
            <p>Phone: +1 234 567 8900 | Email: care@hospital.com</p>
          </div>
          <hr />
          <div className="prescription-meta">
            <div>
              <p><strong>Patient:</strong> {printRecord.patient?.name}</p>
              <p><strong>Patient ID:</strong> {printRecord.patient?._id}</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p><strong>Date:</strong> {new Date(printRecord.createdAt).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {printRecord.doctor?.name || user.name}</p>
            </div>
          </div>
          <hr />
          <div className="prescription-body">
            <h3>Diagnosis</h3>
            <p>{printRecord.diagnosis}</p>
            
            <h3>Symptoms</h3>
            <p>{printRecord.symptoms?.join(', ') || 'None recorded'}</p>
            
            <h3 className="rx-symbol">Rx</h3>
            {printRecord.prescription?.length > 0 ? (
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {printRecord.prescription.map((p, i) => (
                    <tr key={i}>
                      <td>{p.medicine}</td>
                      <td>{p.dosage}</td>
                      <td>{p.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No medicines prescribed.</p>}

            <h3>Notes / Instructions</h3>
            <p>{printRecord.notes || 'No special instructions.'}</p>
          </div>
          <div className="prescription-footer">
            <p>Doctor's Signature</p>
            <div className="signature-line"></div>
          </div>
        </div>
      )}
    </div>
  );
}
