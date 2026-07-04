import { useState, useEffect } from 'react';
import { getAllAmbulancesAPI, bookAmbulanceAPI, getAllBookingsAPI, getMyBookingsAPI, updateBookingStatusAPI, addAmbulanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ambulance, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AmbulanceModule() {
  const { user } = useAuth();
  const [tab, setTab] = useState('fleet');
  const [ambulances, setAmbulances] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [bookForm, setBookForm] = useState({ patientName:'', patientPhone:'', pickupAddress:'', destination:'City Hospital', emergency:false });
  const [addForm, setAddForm] = useState({ vehicleNumber:'', type:'basic', driverName:'', driverPhone:'' });

  const load = () => {
    setLoading(true);
    Promise.all([
      getAllAmbulancesAPI().catch(()=>({data:{ambulances:[]}})),
      (user.role==='admin' ? getAllBookingsAPI() : getMyBookingsAPI()).catch(()=>({data:{bookings:[]}}))
    ]).then(([a,b]) => { setAmbulances(a.data.ambulances||a.data||[]); setBookings(b.data.bookings||b.data||[]); }).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleBook = async (e) => {
    e.preventDefault();
    try { await bookAmbulanceAPI(bookForm); toast.success('Ambulance booked!'); setShowBook(false); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    try { await addAmbulanceAPI({ vehicleNumber:addForm.vehicleNumber, type:addForm.type, driver:{name:addForm.driverName,phone:addForm.driverPhone}, equipment:['oxygen','stretcher'] }); toast.success('Ambulance added!'); setShowAdd(false); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };
  const updateStatus = async (id, status) => {
    try { await updateBookingStatusAPI(id, {status}); toast.success('Booking status updated'); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };
  const updateAmbulanceStatus = async (id, status) => {
    try { await updateAmbulanceAPI(id, {status}); toast.success('Ambulance status updated'); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="tabs">
        <button className={`tab ${tab==='fleet'?'active':''}`} onClick={()=>setTab('fleet')}>🚑 Fleet</button>
        <button className={`tab ${tab==='bookings'?'active':''}`} onClick={()=>setTab('bookings')}>📋 Bookings</button>
      </div>
      {tab==='fleet' && (<>
        <div className="filter-bar">{user.role==='admin' && <button className="btn btn-primary btn-sm" style={{width:'auto',marginLeft:'auto'}} onClick={()=>setShowAdd(true)}><Plus size={16}/> Add Ambulance</button>}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {(Array.isArray(ambulances)?ambulances:[]).map(a => (
            <div key={a._id} className="card"><div className="card-body">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h4 style={{fontSize:'1rem',fontWeight:700}}><Ambulance size={18} style={{verticalAlign:'middle',marginRight:6}}/>{a.vehicleNumber}</h4>
                {user.role === 'admin' ? (
                  <select value={a.status} onChange={(e)=>updateAmbulanceStatus(a._id, e.target.value)} style={{padding:'4px 8px',borderRadius:6,border:'1px solid #e2e8f0',fontSize:'0.8rem'}}>
                    <option value="available">Available</option><option value="on-duty">On Duty</option><option value="maintenance">Maintenance</option><option value="offline">Offline</option>
                  </select>
                ) : (
                  <span className={`badge badge-${a.status==='available'?'available':a.status==='on-duty'?'on-duty':'maintenance'}`}>{a.status}</span>
                )}
              </div>
              <div className="detail-grid">
                <div className="detail-item"><label>Type</label><span style={{textTransform:'capitalize'}}>{a.type}</span></div>
                <div className="detail-item"><label>Driver</label><span>{a.driver?.name}</span></div>
              </div>
              {a.equipment?.length>0 && <div style={{marginTop:8,display:'flex',gap:4,flexWrap:'wrap'}}>{a.equipment.map(eq=><span key={eq} className="badge badge-teal">{eq}</span>)}</div>}
            </div></div>
          ))}
        </div>
      </>)}
      {tab==='bookings' && (<>
        <div className="filter-bar"><button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={()=>setShowBook(true)}>🚑 Book Ambulance</button></div>
        <div className="card"><table className="data-table"><thead><tr><th>Patient</th><th>Pickup</th><th>Destination</th><th>Emergency</th><th>Status</th>{user.role==='admin'&&<th>Update Status</th>}</tr></thead><tbody>
          {(Array.isArray(bookings)?bookings:[]).map(b => (
            <tr key={b._id}><td>{b.patientName}</td><td>{b.pickupAddress}</td><td>{b.destination}</td><td>{b.emergency?<span className="badge badge-red">Yes</span>:<span className="badge badge-green">No</span>}</td><td><span className={`badge badge-${b.status==='completed'?'completed':b.status==='cancelled'?'cancelled':'pending'}`}>{b.status}</span></td>
            {user.role==='admin'&&<td>
              <select value={b.status} onChange={(e)=>updateStatus(b._id, e.target.value)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid #e2e8f0',width:'100%'}}>
                <option value="requested">Requested</option><option value="assigned">Assigned</option><option value="dispatched">Dispatched</option><option value="arrived">Arrived</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </td>}</tr>
          ))}
        </tbody></table>
        {!(Array.isArray(bookings)&&bookings.length) && <div className="empty-state"><div className="empty-icon">🚑</div><h3>No bookings</h3></div>}
        </div>
      </>)}
      {showBook && <div className="modal-overlay" onClick={()=>setShowBook(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Book Ambulance</h3><button className="modal-close" onClick={()=>setShowBook(false)}>✕</button></div>
        <form onSubmit={handleBook}><div className="modal-body">
          <div className="form-group"><label>Patient Name</label><input value={bookForm.patientName} onChange={e=>setBookForm(f=>({...f,patientName:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label>Phone</label><input value={bookForm.patientPhone} onChange={e=>setBookForm(f=>({...f,patientPhone:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label>Pickup Address</label><input value={bookForm.pickupAddress} onChange={e=>setBookForm(f=>({...f,pickupAddress:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={bookForm.emergency} onChange={e=>setBookForm(f=>({...f,emergency:e.target.checked}))}/> Emergency</label></div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Book Now</button></div></form>
      </div></div>}
      {showAdd && <div className="modal-overlay" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Ambulance</h3><button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button></div>
        <form onSubmit={handleAdd}><div className="modal-body">
          <div className="form-group"><label>Vehicle Number</label><input value={addForm.vehicleNumber} onChange={e=>setAddForm(f=>({...f,vehicleNumber:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label>Type</label><select value={addForm.type} onChange={e=>setAddForm(f=>({...f,type:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}><option value="basic">Basic</option><option value="advanced">Advanced</option><option value="icu-mobile">ICU Mobile</option><option value="neonatal">Neonatal</option></select></div>
          <div className="form-group"><label>Driver Name</label><input value={addForm.driverName} onChange={e=>setAddForm(f=>({...f,driverName:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
          <div className="form-group"><label>Driver Phone</label><input value={addForm.driverPhone} onChange={e=>setAddForm(f=>({...f,driverPhone:e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} required/></div>
        </div><div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Add</button></div></form>
      </div></div>}
    </div>
  );
}
