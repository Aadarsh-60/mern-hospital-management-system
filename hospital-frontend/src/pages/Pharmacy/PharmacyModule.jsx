import { useState, useEffect } from 'react';
import { getAllMedicinesAPI, addMedicineAPI, updateStockAPI, getLowStockAlertsAPI, dispenseMedicinesAPI, getDispensingHistoryAPI, getAllPatientsAPI } from '../../services/api';
import { Pill, AlertTriangle, Plus, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PharmacyModule() {
  const [tab, setTab] = useState('inventory');
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDispense, setShowDispense] = useState(false);
  const [showStock, setShowStock] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [addForm, setAddForm] = useState({ name:'', genericName:'', category:'tablet', manufacturer:'', stock:0, pricePerUnit:0, reorderLevel:10, requiresPrescription:true });
  const [dispenseForm, setDispenseForm] = useState({ patientId: '', notes: '', items: [{ medicineId: '', quantity: 1 }] });

  const load = () => {
    setLoading(true);
    Promise.all([
      getAllMedicinesAPI(), 
      getLowStockAlertsAPI().catch(()=>({data:{alerts:[]}})), 
      getDispensingHistoryAPI().catch(()=>({data:{records:[]}})),
      getAllPatientsAPI().catch(()=>({data:{patients:[]}}))
    ])
      .then(([m,a,h,p]) => { 
        setMedicines(m.data.medicines||[]); 
        setAlerts(a.data.alerts||a.data.medicines||[]); 
        setHistory(h.data.records||h.data.history||h.data.dispensings||[]); 
        setPatients(p.data.patients||[]);
      })
      .finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      if (!dispenseForm.patientId) return toast.error('Select a patient');
      if (dispenseForm.items.some(i => !i.medicineId || i.quantity < 1)) return toast.error('Invalid medicines');
      await dispenseMedicinesAPI({
        patientId: dispenseForm.patientId,
        notes: dispenseForm.notes,
        medicines: dispenseForm.items
      });
      toast.success('Medicines dispensed successfully!');
      setShowDispense(false);
      setDispenseForm({ patientId: '', notes: '', items: [{ medicineId: '', quantity: 1 }] });
      load();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to dispense');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await addMedicineAPI(addForm); toast.success('Medicine added!'); setShowAdd(false); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };
  const handleStock = async () => {
    try { await updateStockAPI(showStock._id, { quantity: Number(stockQty) }); toast.success('Stock updated!'); setShowStock(null); setStockQty(''); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="stat-card"><div className="stat-icon blue"><Pill size={22}/></div><div className="stat-info"><h3>{medicines.length}</h3><p>Total Medicines</p></div></div>
        <div className="stat-card"><div className="stat-icon red"><AlertTriangle size={22}/></div><div className="stat-info"><h3>{alerts.length}</h3><p>Low Stock Alerts</p></div></div>
        <div className="stat-card"><div className="stat-icon green"><Package size={22}/></div><div className="stat-info"><h3>{medicines.reduce((s,m)=>s+m.stock,0)}</h3><p>Total Stock</p></div></div>
        <div className="stat-card"><div className="stat-icon purple"><Package size={22}/></div><div className="stat-info"><h3>{history.length}</h3><p>Dispensed</p></div></div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==='inventory'?'active':''}`} onClick={()=>setTab('inventory')}>💊 Inventory</button>
        <button className={`tab ${tab==='alerts'?'active':''}`} onClick={()=>setTab('alerts')}>⚠️ Low Stock ({alerts.length})</button>
        <button className={`tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>📜 Dispensing History</button>
      </div>
      {tab==='inventory' && (<>
        <div className="filter-bar">
          <div style={{marginLeft:'auto',display:'flex',gap:10}}>
            <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={()=>setShowDispense(true)}>💊 Dispense Medicine</button>
            <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={()=>setShowAdd(true)}><Plus size={16}/> Add Medicine</button>
          </div>
        </div>
        <div className="card"><table className="data-table"><thead><tr><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>Rx</th><th>Actions</th></tr></thead><tbody>
          {medicines.map(m=>(
            <tr key={m._id}><td><div><span style={{fontWeight:600}}>{m.name}</span><br/><span style={{fontSize:'.75rem',color:'#64748b'}}>{m.genericName}</span></div></td>
            <td><span className="badge badge-blue" style={{textTransform:'capitalize'}}>{m.category}</span></td>
            <td><span style={{fontWeight:600,color:m.stock<=m.reorderLevel?'#ef4444':'#10b981'}}>{m.stock}</span></td>
            <td>₹{m.pricePerUnit}</td>
            <td>{m.requiresPrescription?<span className="badge badge-amber">Rx</span>:<span className="badge badge-green">OTC</span>}</td>
            <td><button className="action-btn edit" onClick={()=>{setShowStock(m);setStockQty('');}}>Update Stock</button></td></tr>
          ))}
        </tbody></table></div>
      </>)}
      {tab==='alerts' && (<div className="card"><div className="card-body">
        {alerts.length ? alerts.map(m=>(
          <div key={m._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #e2e8f0'}}>
            <div><span style={{fontWeight:600,color:'#ef4444'}}>⚠️ {m.name}</span><br/><span style={{fontSize:'.8rem',color:'#64748b'}}>Stock: {m.stock} | Reorder Level: {m.reorderLevel}</span></div>
            <button className="action-btn edit" onClick={()=>{setShowStock(m);setStockQty('');}}>Restock</button>
          </div>
        )) : <div className="empty-state"><div className="empty-icon">✅</div><h3>All stock levels are healthy</h3></div>}
      </div></div>)}
      {tab==='history' && (<div className="card"><table className="data-table"><thead><tr><th>Patient</th><th>Date</th><th>Medicines</th><th>Total</th><th>Status</th></tr></thead><tbody>
        {(Array.isArray(history)?history:[]).map(h=>(
          <tr key={h._id}><td>{h.patient?.name||'—'}</td><td>{new Date(h.createdAt).toLocaleDateString()}</td><td>{h.medicines?.length||0} items</td><td>₹{h.totalAmount||0}</td><td><span className={`badge badge-${h.status}`}>{h.status}</span></td></tr>
        ))}
      </tbody></table>
      {!(Array.isArray(history)&&history.length) && <div className="empty-state"><div className="empty-icon">📜</div><h3>No dispensing history</h3></div>}
      </div>)}
      {showStock && <div className="modal-overlay" onClick={()=>setShowStock(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Update Stock — {showStock.name}</h3><button className="modal-close" onClick={()=>setShowStock(null)}>✕</button></div>
        <div className="modal-body"><p style={{marginBottom:12}}>Current stock: <strong>{showStock.stock}</strong></p>
          <div className="form-group"><label>Add Quantity</label><input type="number" value={stockQty} onChange={e=>setStockQty(e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
        </div><div className="modal-footer"><button className="btn btn-primary btn-sm" onClick={handleStock}>Update</button></div>
      </div></div>}
      {showAdd && <div className="modal-overlay" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Medicine</h3><button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button></div>
        <form onSubmit={handleAdd}><div className="modal-body">
          <div className="form-group"><label>Name</label><input value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label>Generic Name</label><input value={addForm.genericName} onChange={e=>setAddForm(f=>({...f,genericName:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          <div className="grid-2">
            <div className="form-group"><label>Category</label><select value={addForm.category} onChange={e=>setAddForm(f=>({...f,category:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}>{['tablet','capsule','syrup','injection','ointment','drops','inhaler','other'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>Manufacturer</label><input value={addForm.manufacturer} onChange={e=>setAddForm(f=>({...f,manufacturer:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Stock</label><input type="number" value={addForm.stock} onChange={e=>setAddForm(f=>({...f,stock:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
            <div className="form-group"><label>Price/Unit (₹)</label><input type="number" value={addForm.pricePerUnit} onChange={e=>setAddForm(f=>({...f,pricePerUnit:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}/></div>
          </div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Add Medicine</button></div></form>
      </div></div>}
      {showDispense && <div className="modal-overlay" onClick={()=>setShowDispense(false)}><div className="modal" style={{width: 600, maxWidth: '90vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Dispense Medicine</h3><button className="modal-close" onClick={()=>setShowDispense(false)}>✕</button></div>
        <form onSubmit={handleDispense}><div className="modal-body">
          <div className="form-group">
            <label>Patient</label>
            <select value={dispenseForm.patientId} onChange={e=>setDispenseForm(f=>({...f,patientId:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required>
              <option value="">Select Patient</option>
              {patients.map(p=><option key={p._id} value={p.user?._id || p._id}>{p.user?.name || p.name} ({p.user?.email || p.email || 'No email'})</option>)}
            </select>
          </div>
          
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:20,marginBottom:10}}>
             <h4>Medicines</h4>
             <button type="button" className="btn btn-sm" style={{background:'#f1f5f9',color:'#1e293b',width:'auto',padding:'6px 12px'}} onClick={() => setDispenseForm(f=>({...f, items: [...f.items, {medicineId:'', quantity:1}]}))}>+ Add Item</button>
          </div>
          
          {dispenseForm.items.map((item, idx) => (
             <div key={idx} style={{display:'flex', gap:10, marginBottom:10}}>
                <select style={{flex:1,padding:8,borderRadius:6,border:'1px solid #cbd5e1'}} value={item.medicineId} onChange={e=>{
                   const newItems = [...dispenseForm.items];
                   newItems[idx].medicineId = e.target.value;
                   setDispenseForm({...dispenseForm, items: newItems});
                }} required>
                   <option value="">Select Medicine</option>
                   {medicines.filter(m=>m.stock>0).map(m=><option key={m._id} value={m._id}>{m.name} (Stock: {m.stock}) - ₹{m.pricePerUnit}</option>)}
                </select>
                <input type="number" min="1" style={{width:80,padding:8,borderRadius:6,border:'1px solid #cbd5e1'}} value={item.quantity} onChange={e=>{
                   const newItems = [...dispenseForm.items];
                   newItems[idx].quantity = Number(e.target.value);
                   setDispenseForm({...dispenseForm, items: newItems});
                }} required/>
                {dispenseForm.items.length > 1 && (
                   <button type="button" onClick={() => {
                      const newItems = dispenseForm.items.filter((_, i) => i !== idx);
                      setDispenseForm({...dispenseForm, items: newItems});
                   }} style={{background:'#ef4444',color:'white',border:'none',borderRadius:6,padding:'0 15px',cursor:'pointer'}}>✕</button>
                )}
             </div>
          ))}

          <div className="form-group" style={{marginTop:20}}>
             <label>Notes</label>
             <input value={dispenseForm.notes} onChange={e=>setDispenseForm(f=>({...f,notes:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} placeholder="Dosage instructions (e.g. 1 pill after lunch)..." />
          </div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Dispense</button></div></form>
      </div></div>}
    </div>
  );
}
