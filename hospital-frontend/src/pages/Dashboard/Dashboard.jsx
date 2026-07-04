import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStatsAPI, getDoctorAppointmentsAPI, getPatientAppointmentsAPI, getPatientProfileAPI, updateAppointmentStatusAPI, cancelAppointmentAPI } from '../../services/api';
import { Users, Stethoscope, CalendarDays, CalendarCheck, Clock, XCircle, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'receptionist') return <AdminDash />;
  if (user?.role === 'doctor') return <DoctorDash />;
  return <PatientDash />;
}

function AdminDash() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    getDashboardStatsAPI().then(res => {
      setStats(res.data.stats);
      setRecent(res.data.recentAppointments || []);
      setMonthly((res.data.monthlyData || []).map(m => ({ name: months[m._id.month-1], count: m.count })));
    }).catch(() => toast.error('Failed to load dashboard'));
  }, []);
  if (!stats) return <div className="page-loader"><div className="spinner"></div></div>;

  const statusData = [
    { name: 'Pending', value: stats.pendingAppointments || 0 },
    { name: 'Completed', value: stats.completedAppointments || 0 },
    { name: 'Cancelled', value: stats.cancelledAppointments || 0 }
  ];
  const statusColors = ['#f59e0b', '#10b981', '#ef4444'];

  const usersData = [
    { name: 'Doctors', count: stats.totalDoctors || 0 },
    { name: 'Patients', count: stats.totalPatients || 0 }
  ];

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon={<Stethoscope size={22}/>} color="blue" value={stats.totalDoctors} label="Total Doctors"/>
        <StatCard icon={<Users size={22}/>} color="green" value={stats.totalPatients} label="Total Patients"/>
        <StatCard icon={<CalendarDays size={22}/>} color="purple" value={stats.totalAppointments} label="Total Appointments"/>
        <StatCard icon={<Clock size={22}/>} color="amber" value={stats.pendingAppointments} label="Pending"/>
        <StatCard icon={<CalendarCheck size={22}/>} color="teal" value={stats.completedAppointments} label="Completed"/>
        <StatCard icon={<XCircle size={22}/>} color="red" value={stats.cancelledAppointments} label="Cancelled"/>
        <StatCard icon={<Activity size={22}/>} color="blue" value={stats.todayAppointments} label="Today's Appointments"/>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>📈 Monthly Trends</h3></div>
          <div className="chart-container" style={{height:280}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="name" fontSize={12}/><YAxis fontSize={12}/><Tooltip/><Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorGrad)" strokeWidth={2}/><defs><linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs></AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>📊 Appointment Status</h3></div>
          <div className="chart-container" style={{height:280}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid-2" style={{marginTop: '20px'}}>
        <div className="card">
          <div className="card-header"><h3>👥 Hospital Users</h3></div>
          <div className="chart-container" style={{height:280}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="name" fontSize={12}/>
                <YAxis fontSize={12}/>
                <Tooltip cursor={{fill: '#f8fafc'}}/>
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>🕐 Recent Appointments</h3></div>
          <div className="card-body">
            {recent.length ? recent.map((a,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom: i<recent.length-1?'1px solid #e2e8f0':'none'}}>
                <div><div style={{fontWeight:600,fontSize:'.875rem'}}>{a.patient?.name || 'Patient'}</div><div style={{fontSize:'.75rem',color:'#64748b'}}>Dr. {a.doctor?.name || 'Doctor'}</div></div>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </div>
            )) : <p style={{color:'#94a3b8',textAlign:'center',padding:20}}>No recent appointments</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorDash() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });

  useEffect(() => {
    getDoctorAppointmentsAPI().then(r => setAppts(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  
  const today = new Date().toDateString();
  const todayAppts = appts.filter(a => new Date(a.appointmentDate).toDateString() === today);
  const pending = appts.filter(a => a.status === 'pending');
  
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await updateAppointmentStatusAPI(showStatusModal._id, { status: statusForm.status, notes: statusForm.notes });
      toast.success('Appointment updated');
      setShowStatusModal(null);
      getDoctorAppointmentsAPI().then(r => setAppts(r.data.appointments || []));
    } catch(err) {
      toast.error('Failed to update status');
    }
  };

  const statusData = [
    { name: 'Pending', value: pending.length },
    { name: 'Completed', value: appts.filter(a=>a.status==='completed').length },
    { name: 'Cancelled', value: appts.filter(a=>a.status==='cancelled').length }
  ];
  const statusColors = ['#f59e0b', '#10b981', '#ef4444'];

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon={<CalendarDays size={22}/>} color="blue" value={appts.length} label="Total Appointments"/>
        <StatCard icon={<Activity size={22}/>} color="teal" value={todayAppts.length} label="Today"/>
        <StatCard icon={<Clock size={22}/>} color="amber" value={pending.length} label="Pending"/>
        <StatCard icon={<CalendarCheck size={22}/>} color="green" value={appts.filter(a=>a.status==='completed').length} label="Completed"/>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>📋 Your Appointments</h3></div>
          <div className="card-body">
            <table className="data-table"><thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {appts.slice(0,10).map(a => (
                <tr key={a._id}>
                  <td>{a.patient?.name}</td><td>{new Date(a.appointmentDate).toLocaleDateString()}</td><td>{a.timeSlot}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => { setShowStatusModal(a); setStatusForm({ status: a.status, notes: a.notes || '' }); }}>Update</button>
                  </td>
                </tr>
              ))}
            </tbody></table>
            {!appts.length && <div className="empty-state"><div className="empty-icon">📅</div><h3>No appointments yet</h3></div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>📊 Appointment Status</h3></div>
          <div className="chart-container" style={{height:280}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Update Appointment</h3><button className="modal-close" onClick={() => setShowStatusModal(null)}>✕</button></div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Status</label>
                  <select value={statusForm.status} onChange={e => setStatusForm(f => ({...f, status: e.target.value}))} style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Remarks</label>
                  <textarea value={statusForm.notes} onChange={e => setStatusForm(f => ({...f, notes: e.target.value}))} placeholder="Enter appointment notes or instructions..." style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8,minHeight:80}} />
                </div>
              </div>
              <div className="modal-footer"><button type="submit" className="btn btn-primary btn-sm">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientDash() {
  const [appts, setAppts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      getPatientAppointmentsAPI().catch(()=>({data:{appointments:[]}})),
      getPatientProfileAPI().catch(()=>({data:{patient:null}}))
    ])
      .then(([a,p]) => { 
        setAppts(a.data.appointments||[]); 
        setProfile(p.data.patient); 
      }).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const handleCancel = async (id) => {
    if(!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointmentAPI(id);
      toast.success('Appointment cancelled');
      getPatientAppointmentsAPI().then(a => setAppts(a.data.appointments||[]));
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to cancel'); }
  };

  const statusData = [
    { name: 'Pending', value: appts.filter(a=>a.status==='pending').length },
    { name: 'Confirmed', value: appts.filter(a=>a.status==='confirmed').length },
    { name: 'Completed', value: appts.filter(a=>a.status==='completed').length },
    { name: 'Cancelled', value: appts.filter(a=>a.status==='cancelled').length }
  ].filter(d => d.value > 0);
  const statusColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon={<CalendarDays size={22}/>} color="blue" value={appts.length} label="My Appointments"/>
        <StatCard icon={<Clock size={22}/>} color="amber" value={appts.filter(a=>a.status==='pending').length} label="Pending"/>
        <StatCard icon={<CalendarCheck size={22}/>} color="green" value={appts.filter(a=>a.status==='completed').length} label="Completed"/>
        <StatCard icon={<TrendingUp size={22}/>} color="purple" value={profile?.bloodGroup || '—'} label="Blood Group"/>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>📋 My Appointments</h3></div>
          <div className="card-body">
            <table className="data-table"><thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {appts.slice(0,5).map(a => (
                <tr key={a._id}>
                  <td>{a.doctor?.name}</td><td>{new Date(a.appointmentDate).toLocaleDateString()}</td><td>{a.timeSlot}</td><td>{a.reason}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    {(a.status === 'pending' || a.status === 'confirmed') && (
                      <button className="action-btn delete" style={{background:'#fee2e2',color:'#ef4444'}} onClick={() => handleCancel(a._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody></table>
            {!appts.length && <div className="empty-state"><div className="empty-icon">📅</div><h3>No appointments yet</h3><p>Book your first appointment from the Doctors page</p></div>}
          </div>
        </div>
        
        {appts.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>📊 Appointment Status</h3></div>
            <div className="chart-container" style={{height:280}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, color, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info"><h3>{value}</h3><p>{label}</p></div>
    </div>
  );
}
