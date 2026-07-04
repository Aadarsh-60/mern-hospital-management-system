import { useState, useEffect } from 'react';
import { getAllLabTestsAPI, getLabReportsAPI, orderLabTestsAPI, updateLabResultsAPI, updateReportStatusAPI, addLabTestAPI, getLabReportByIdAPI, getAllPatientsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FlaskConical, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LabModule() {
  const { user } = useAuth();
  const [tab, setTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({ patient:'', tests:[], notes:'' });
  const [selectedTests, setSelectedTests] = useState([]);

  const [showAddTest, setShowAddTest] = useState(false);
  const [testForm, setTestForm] = useState({ name:'', category:'blood', price:0, turnaroundTime:'24 hours', normalRange:'' });
  
  const [showResultForm, setShowResultForm] = useState(null);
  const [resultForm, setResultForm] = useState({ remarks: '', tests: [] });

  const [showViewReport, setShowViewReport] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getAllLabTestsAPI(), getLabReportsAPI().catch(()=>({data:{reports:[]}})), getAllPatientsAPI().catch(()=>({data:{patients:[]}}))])
      .then(([t,r,p]) => { setTests(t.data.tests||[]); setReports(r.data.reports||[]); setPatients(p.data.patients||[]); })
      .finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const toggleTest = (id) => setSelectedTests(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      await orderLabTestsAPI({ patient: orderForm.patient, tests: selectedTests.map(id=>({test:id})), remarks: orderForm.notes });
      toast.success('Lab tests ordered!'); setShowOrder(false); setSelectedTests([]); load();
    } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try { await updateReportStatusAPI(id, {status}); toast.success('Status updated'); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try { await addLabTestAPI(testForm); toast.success('Test added to catalog!'); setShowAddTest(false); load(); } 
    catch(e) { toast.error(e.response?.data?.message||'Failed to add test'); }
  };

  const openResultForm = async (r) => {
    try {
      const res = await getLabReportByIdAPI(r._id);
      const fullReport = res.data.report;
      setShowResultForm(fullReport);
      setResultForm({
         remarks: fullReport.remarks || '',
         tests: fullReport.tests.map(t => ({
            testId: t.test._id,
            name: t.test.name,
            result: t.result || '',
            unit: t.unit || t.test.unit || '',
            normalRange: t.normalRange || t.test.normalRange || '',
            isAbnormal: t.isAbnormal || false,
            notes: t.notes || ''
         }))
      });
    } catch(e) { toast.error('Failed to load report'); }
  };

  const handleUpdateResults = async (e) => {
    e.preventDefault();
    try { 
       await updateLabResultsAPI(showResultForm._id, { tests: resultForm.tests, remarks: resultForm.remarks });
       toast.success('Results updated successfully!');
       setShowResultForm(null);
       load();
    } catch(e) { toast.error(e.response?.data?.message||'Failed to update results'); }
  };

  const fetchAndShowReport = async (r) => {
    try {
      const res = await getLabReportByIdAPI(r._id);
      setShowViewReport(res.data.report);
    } catch(e) { toast.error('Failed to fetch details'); }
  };
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card"><div className="stat-icon purple"><FlaskConical size={22}/></div><div className="stat-info"><h3>{tests.length}</h3><p>Test Catalog</p></div></div>
        <div className="stat-card"><div className="stat-icon blue"><FlaskConical size={22}/></div><div className="stat-info"><h3>{reports.length}</h3><p>Total Reports</p></div></div>
        <div className="stat-card"><div className="stat-icon amber"><FlaskConical size={22}/></div><div className="stat-info"><h3>{reports.filter(r=>r.status==='ordered'||r.status==='processing').length}</h3><p>Pending</p></div></div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==='tests'?'active':''}`} onClick={()=>setTab('tests')}>🧪 Test Catalog</button>
        <button className={`tab ${tab==='reports'?'active':''}`} onClick={()=>setTab('reports')}>📋 Reports</button>
      </div>
      {tab==='tests' && (<>
        <div className="filter-bar" style={{justifyContent:'flex-end',display:'flex',gap:10}}>
           {user.role==='doctor' && <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={()=>setShowOrder(true)}><Plus size={16}/> Order Tests</button>}
           {(user.role==='admin'||user.role==='lab-technician') && <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={()=>setShowAddTest(true)}><Plus size={16}/> Add Test Catalog</button>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {tests.map(t => (
            <div key={t._id} className="card"><div className="card-body">
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><h4 style={{fontSize:'.9rem',fontWeight:600}}>{t.name}</h4><span className="badge badge-purple" style={{textTransform:'capitalize'}}>{t.category}</span></div>
              <div style={{fontSize:'.8rem',color:'#64748b'}}>
                <p>Code: <strong>{t.code}</strong></p>
                <p>Price: <strong>₹{t.price}</strong> • TAT: {t.turnaroundTime}</p>
                {t.normalRange && <p>Normal: {t.normalRange}</p>}
              </div>
            </div></div>
          ))}
        </div>
      </>)}
      {tab==='reports' && (<div className="card"><table className="data-table"><thead><tr><th>Patient</th><th>Doctor</th><th>Tests</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {reports.map(r=>(
          <tr key={r._id}><td>{r.patient?.name||'—'}</td><td>{r.doctor?.name||'—'}</td><td>{r.tests?.length||0} tests</td><td>₹{r.totalAmount||0}</td>
          <td><span className={`badge badge-${r.status==='completed'?'completed':r.status==='cancelled'?'cancelled':'pending'}`}>{r.status}</span></td>
          {user.role==='admin'||user.role==='lab-technician' ? (<td><div className="actions">
            {r.status==='ordered'&&<button className="action-btn edit" onClick={()=>updateStatus(r._id,'sample_collected')}>Collect Sample</button>}
            {r.status==='sample_collected'&&<button className="action-btn edit" onClick={()=>updateStatus(r._id,'processing')}>Process</button>}
            {r.status==='processing'&&<button className="action-btn view" onClick={()=>openResultForm(r)}>Add Results</button>}
            <button className="action-btn edit" style={{background:'#f1f5f9',color:'#475569'}} onClick={()=>fetchAndShowReport(r)}>View</button>
          </div></td>) : (<td><button className="action-btn view" onClick={()=>fetchAndShowReport(r)}>View</button></td>)}
          </tr>
        ))}
      </tbody></table>
      {!reports.length && <div className="empty-state"><div className="empty-icon">📋</div><h3>No lab reports</h3></div>}
      </div>)}
      {showOrder && <div className="modal-overlay" onClick={()=>setShowOrder(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Order Lab Tests</h3><button className="modal-close" onClick={()=>setShowOrder(false)}>✕</button></div>
        <form onSubmit={handleOrder}><div className="modal-body">
          <div className="form-group">
            <label>Select Patient</label>
            <select value={orderForm.patient} onChange={e=>setOrderForm(f=>({...f,patient:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required>
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p.user?._id || p._id}>{p.user?.name || p.name} ({p.user?.email || p.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group"><label>Select Tests</label>
            <div style={{maxHeight:200,overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:8,padding:8}}>
              {tests.map(t=>(
                <label key={t._id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',cursor:'pointer',fontSize:'.85rem'}}>
                  <input type="checkbox" checked={selectedTests.includes(t._id)} onChange={()=>toggleTest(t._id)}/>
                  {t.name} — ₹{t.price}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group"><label>Notes</label><textarea value={orderForm.notes} onChange={e=>setOrderForm(f=>({...f,notes:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:60}}/></div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Order ({selectedTests.length} tests)</button></div></form>
      </div></div>}

      {showAddTest && <div className="modal-overlay" onClick={()=>setShowAddTest(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Test to Catalog</h3><button className="modal-close" onClick={()=>setShowAddTest(false)}>✕</button></div>
        <form onSubmit={handleAddTest}><div className="modal-body">
          <div className="form-group"><label>Test Name</label><input value={testForm.name} onChange={e=>setTestForm(f=>({...f,name:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="grid-2">
            <div className="form-group"><label>Category</label><select value={testForm.category} onChange={e=>setTestForm(f=>({...f,category:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}>{['blood','urine','imaging','pathology','cardiology','neurology','other'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>Price (₹)</label><input type="number" value={testForm.price} onChange={e=>setTestForm(f=>({...f,price:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Turnaround Time</label><input value={testForm.turnaroundTime} onChange={e=>setTestForm(f=>({...f,turnaroundTime:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} placeholder="e.g. 24 hours"/></div>
            <div className="form-group"><label>Normal Range</label><input value={testForm.normalRange} onChange={e=>setTestForm(f=>({...f,normalRange:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Add Test</button></div></form>
      </div></div>}

      {showResultForm && <div className="modal-overlay" onClick={()=>setShowResultForm(null)}><div className="modal" style={{width: 700, maxWidth: '90vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Test Results</h3><button className="modal-close" onClick={()=>setShowResultForm(null)}>✕</button></div>
        <form onSubmit={handleUpdateResults}><div className="modal-body">
          {resultForm.tests.map((item, idx) => (
             <div key={idx} style={{background:'#f8fafc',padding:15,borderRadius:8,marginBottom:15}}>
                <h4 style={{marginTop:0,marginBottom:10}}>{item.name}</h4>
                <div className="grid-2" style={{gap:10}}>
                   <div className="form-group" style={{margin:0}}><label style={{fontSize:'.8rem'}}>Result Value</label><input value={item.result} onChange={e=>{const t=[...resultForm.tests]; t[idx].result=e.target.value; setResultForm({...resultForm,tests:t});}} style={{width:'100%',padding:8,border:'1.5px solid #cbd5e1',borderRadius:6}} required/></div>
                   <div className="form-group" style={{margin:0}}><label style={{fontSize:'.8rem'}}>Unit</label><input value={item.unit} onChange={e=>{const t=[...resultForm.tests]; t[idx].unit=e.target.value; setResultForm({...resultForm,tests:t});}} style={{width:'100%',padding:8,border:'1.5px solid #cbd5e1',borderRadius:6}}/></div>
                   <div className="form-group" style={{margin:0}}><label style={{fontSize:'.8rem'}}>Normal Range</label><input value={item.normalRange} onChange={e=>{const t=[...resultForm.tests]; t[idx].normalRange=e.target.value; setResultForm({...resultForm,tests:t});}} style={{width:'100%',padding:8,border:'1.5px solid #cbd5e1',borderRadius:6}}/></div>
                   <div className="form-group" style={{margin:0}}><label style={{fontSize:'.8rem'}}>Abnormal?</label><select value={item.isAbnormal} onChange={e=>{const t=[...resultForm.tests]; t[idx].isAbnormal=(e.target.value==='true'); setResultForm({...resultForm,tests:t});}} style={{width:'100%',padding:8,border:'1.5px solid #cbd5e1',borderRadius:6}}><option value="false">Normal</option><option value="true">Abnormal</option></select></div>
                </div>
             </div>
          ))}
          <div className="form-group"><label>Final Remarks</label><textarea value={resultForm.remarks} onChange={e=>setResultForm(f=>({...f,remarks:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:60}} placeholder="Overall notes..."/></div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Submit Results & Complete</button></div></form>
      </div></div>}

      {showViewReport && <div className="modal-overlay" onClick={()=>setShowViewReport(null)}><div className="modal" style={{width: 700, maxWidth: '90vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
           <div><h3 style={{margin:0}}>Lab Report</h3><span style={{fontSize:'.85rem',color:'#64748b'}}>ID: {showViewReport._id}</span></div>
           <button className="modal-close" onClick={()=>setShowViewReport(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2" style={{gap:15,marginBottom:20}}>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Patient:</strong><br/>{showViewReport.patient?.name||'N/A'}</div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Doctor:</strong><br/>{showViewReport.doctor?.name||'N/A'}</div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Status:</strong><br/><span className={`badge badge-${showViewReport.status==='completed'?'completed':'pending'}`}>{showViewReport.status}</span></div>
             <div style={{background:'#f8fafc',padding:15,borderRadius:8}}><strong>Technician:</strong><br/>{showViewReport.technician?.name||'N/A'}</div>
          </div>
          <h4>Test Results</h4>
          <table className="data-table" style={{marginTop:10}}>
             <thead><tr><th>Test</th><th>Result</th><th>Normal Range</th><th>Flag</th></tr></thead>
             <tbody>
                {showViewReport.tests.map(t=>(
                   <tr key={t._id}>
                      <td>{t.test?.name}</td>
                      <td style={{fontWeight:500,color:t.isAbnormal?'#ef4444':'#10b981'}}>{t.result||'—'} {t.unit}</td>
                      <td>{t.normalRange||'—'}</td>
                      <td>{t.isAbnormal?<span className="badge badge-red">Abnormal</span>:<span className="badge badge-green">Normal</span>}</td>
                   </tr>
                ))}
             </tbody>
          </table>
          {showViewReport.remarks && <div style={{marginTop:20,padding:15,background:'#f1f5f9',borderRadius:8,fontSize:'.9rem'}}><strong>Remarks:</strong><br/>{showViewReport.remarks}</div>}
        </div>
      </div></div>}
    </div>
  );
}
