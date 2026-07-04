import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorByIdAPI, getAvailableSlotsAPI, bookAppointmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Star, Clock, IndianRupee, GraduationCap, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [bookForm, setBookForm] = useState({ date: '', timeSlot: '', reason: '' });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDoctorByIdAPI(id).then(r => setDoc(r.data.doctor)).catch(() => toast.error('Doctor not found')).finally(() => setLoading(false)); }, [id]);

  const loadSlots = async () => {
    if (!bookForm.date) return;
    try { const r = await getAvailableSlotsAPI(id); setSlots(r.data.availableSlots || r.data.slots || []); } catch { setSlots([]); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await bookAppointmentAPI({ doctorId: doc.user?._id || doc.user || id, appointmentDate: bookForm.date, timeSlot: bookForm.timeSlot, reason: bookForm.reason });
      toast.success('Appointment booked!');
      setShowBook(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  if (!doc) return <div className="empty-state"><h3>Doctor not found</h3></div>;
  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm mb-24" style={{width:'auto'}}><ArrowLeft size={16}/> Back</button>
      <div className="profile-header">
        <div className="profile-avatar">{(doc.user?.name||'D').charAt(0)}</div>
        <div className="profile-info">
          <h2>{doc.user?.name}</h2>
          <p>{doc.specialization} • {doc.qualification}</p>
          <div style={{display:'flex',gap:16,marginTop:8,fontSize:'.85rem',opacity:.9}}>
            <span style={{display:'flex',alignItems:'center',gap:4}}><Star size={14}/> {doc.rating?.toFixed(1)}</span>
            <span style={{display:'flex',alignItems:'center',gap:4}}><Clock size={14}/> {doc.experience} years</span>
            <span style={{display:'flex',alignItems:'center',gap:4}}><IndianRupee size={14}/> ₹{doc.consultationFee}</span>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card"><div className="card-header"><h3>ℹ️ Details</h3></div><div className="card-body">
          <div className="detail-grid">
            <div className="detail-item"><label>Department</label><span>{doc.department || doc.specialization}</span></div>
            <div className="detail-item"><label>Qualification</label><span>{doc.qualification}</span></div>
            <div className="detail-item"><label>Experience</label><span>{doc.experience} years</span></div>
            <div className="detail-item"><label>Fee</label><span>₹{doc.consultationFee}</span></div>
            <div className="detail-item"><label>Status</label><span className={`badge ${doc.isAvailable?'badge-green':'badge-red'}`}>{doc.isAvailable?'Available':'Unavailable'}</span></div>
            <div className="detail-item"><label>Email</label><span>{doc.user?.email}</span></div>
          </div>
        </div></div>
        <div className="card"><div className="card-header"><h3>📅 Available Slots</h3></div><div className="card-body">
          {doc.availableSlots?.length ? doc.availableSlots.map((s,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e2e8f0'}}>
              <span style={{fontWeight:500}}>{s.day}</span><span style={{color:'#64748b',fontSize:'.85rem'}}>{s.startTime} - {s.endTime}</span>
            </div>
          )) : <p style={{color:'#94a3b8'}}>No slots configured</p>}
          {user?.role === 'patient' && <button className="btn btn-primary mt-16" onClick={() => setShowBook(true)}><Calendar size={16}/> Book Appointment</button>}
        </div></div>
      </div>
      {showBook && (
        <div className="modal-overlay" onClick={() => setShowBook(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Book Appointment</h3><button className="modal-close" onClick={() => setShowBook(false)}>✕</button></div>
            <form onSubmit={handleBook}><div className="modal-body">
              <div className="form-group"><label>Date</label><input type="date" style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} value={bookForm.date} onChange={e => { setBookForm(f=>({...f,date:e.target.value})); }} onBlur={loadSlots} required/></div>
              <div className="form-group"><label>Time Slot</label><input placeholder="e.g. 09:00-09:30" style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}} value={bookForm.timeSlot} onChange={e => setBookForm(f=>({...f,timeSlot:e.target.value}))} required/></div>
              <div className="form-group"><label>Reason</label><textarea style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:80}} value={bookForm.reason} onChange={e => setBookForm(f=>({...f,reason:e.target.value}))} required/></div>
            </div><div className="modal-footer"><button type="button" className="btn btn-outline btn-sm" onClick={() => setShowBook(false)}>Cancel</button><button type="submit" className="btn btn-primary btn-sm">Book Now</button></div></form>
          </div>
        </div>
      )}
    </div>
  );
}
