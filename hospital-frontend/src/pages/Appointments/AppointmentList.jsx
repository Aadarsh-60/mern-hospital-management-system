import { useState, useEffect } from 'react';
import { getAllAppointmentsAPI, updateAppointmentStatusAPI, cancelAppointmentAPI, getDoctorAppointmentsAPI, getPatientAppointmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AppointmentList() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState(null);
  const [notes, setNotes] = useState('');

  const load = () => {
    setLoading(true);
    const api = user.role === 'admin' ? getAllAppointmentsAPI() : user.role === 'doctor' ? getDoctorAppointmentsAPI() : getPatientAppointmentsAPI();
    api.then(r => setAppts(r.data.appointments || [])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleStatus = async (id, status) => {
    try { await updateAppointmentStatusAPI(id, { status, notes }); toast.success(`Appointment ${status}`); setActionModal(null); setNotes(''); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };
  const handleCancel = async (id) => {
    try { await cancelAppointmentAPI(id); toast.success('Appointment cancelled'); load(); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const filtered = appts.filter(a => !statusFilter || a.status === statusFilter);
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  return (
    <div>
      <div className="filter-bar">
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
        {user.role==='patient' && <Link to="/doctors" className="btn btn-primary btn-sm" style={{width:'auto'}}>+ Book New</Link>}
      </div>
      <div className="card">
        <table className="data-table"><thead><tr>
          {user.role!=='patient' && <th>Patient</th>}
          {user.role!=='doctor' && <th>Doctor</th>}
          <th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
        </tr></thead><tbody>
          {filtered.map(a => (
            <tr key={a._id}>
              {user.role!=='patient' && <td>{a.patient?.name||'—'}</td>}
              {user.role!=='doctor' && <td>{a.doctor?.name||'—'}</td>}
              <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
              <td>{a.timeSlot}</td><td style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.reason}</td>
              <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
              <td>
                <div className="actions">
                  {(user.role==='doctor'||user.role==='admin') && a.status==='pending' && <button className="action-btn edit" onClick={()=>setActionModal(a)}>Update</button>}
                  {(user.role==='patient'||user.role==='admin') && a.status!=='cancelled' && a.status!=='completed' && <button className="action-btn delete" onClick={()=>handleCancel(a._id)}>Cancel</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody></table>
        {!filtered.length && <div className="empty-state"><div className="empty-icon">📅</div><h3>No appointments</h3></div>}
      </div>
      {actionModal && (
        <div className="modal-overlay" onClick={()=>setActionModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Update Appointment</h3><button className="modal-close" onClick={()=>setActionModal(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{marginBottom:12}}><strong>{actionModal.patient?.name}</strong> — {actionModal.reason}</p>
              <div className="form-group"><label>Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:60}}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm btn-success" style={{width:'auto'}} onClick={()=>handleStatus(actionModal._id,'confirmed')}>Confirm</button>
              <button className="btn btn-sm btn-primary" style={{width:'auto'}} onClick={()=>handleStatus(actionModal._id,'completed')}>Complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
