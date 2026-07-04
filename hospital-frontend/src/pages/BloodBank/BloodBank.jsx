import { useState, useEffect } from 'react';
import { getBloodStockAPI, updateBloodStockAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Droplet, Plus, Minus, AlertCircle } from 'lucide-react';

export default function BloodBank() {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    bloodGroup: 'A+',
    units: 1,
    action: 'add'
  });

  const canEdit = ['admin', 'receptionist', 'nurse'].includes(user?.role);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await getBloodStockAPI();
      setStock(res.data.stock || []);
    } catch (error) {
      toast.error('Failed to load blood stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateBloodStockAPI(form);
      toast.success('Blood stock updated successfully');
      setShowModal(false);
      setForm({ ...form, units: 1 });
      fetchStock();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="page-content page-enter">
      <div className="flex-between mb-24">
        <div>
          <h1 style={{fontSize:'1.8rem', fontWeight:700, display:'flex', alignItems:'center', gap:8}}>
            <Droplet color="#ef4444" size={28} />
            Blood Bank Inventory
          </h1>
          <p style={{color:'#64748b', marginTop:4}}>Monitor and manage hospital blood units</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Update Stock
          </button>
        )}
      </div>

      <div className="grid-3">
        {stock.map((item, index) => {
          const isCritical = item.units < 5;
          const isWarning = item.units >= 5 && item.units <= 15;
          let bgColor = '#f8fafc';
          let borderColor = '#e2e8f0';
          let textColor = '#334155';

          if (isCritical) {
            bgColor = '#fef2f2';
            borderColor = '#fecaca';
            textColor = '#b91c1c';
          } else if (isWarning) {
            bgColor = '#fffbeb';
            borderColor = '#fde68a';
            textColor = '#b45309';
          }

          return (
            <div key={index} className="card" style={{ background: bgColor, borderColor: borderColor, transition: 'transform 0.2s', cursor: 'default' }}>
              <div className="card-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>{item.bloodGroup}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: textColor }}>{item.units}</span>
                  <span style={{ fontSize: '1rem', color: textColor, opacity: 0.8 }}>Units</span>
                </div>
                
                {isCritical && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                    <AlertCircle size={14} /> Critical Low
                  </div>
                )}
                
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 16 }}>
                  Last Updated: {item.lastUpdatedBy ? new Date(item.createdAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Blood Stock</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select 
                    value={form.bloodGroup} 
                    onChange={e => setForm({...form, bloodGroup: e.target.value})}
                    style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Action</label>
                  <div style={{display:'flex', gap:12, marginTop:4}}>
                    <label style={{display:'flex', alignItems:'center', gap:4, cursor:'pointer'}}>
                      <input type="radio" name="action" checked={form.action==='add'} onChange={() => setForm({...form, action:'add'})} />
                      <span style={{color:'#10b981', fontWeight:500}}><Plus size={14}/> Add Units</span>
                    </label>
                    <label style={{display:'flex', alignItems:'center', gap:4, cursor:'pointer'}}>
                      <input type="radio" name="action" checked={form.action==='deduct'} onChange={() => setForm({...form, action:'deduct'})} />
                      <span style={{color:'#ef4444', fontWeight:500}}><Minus size={14}/> Consume Units</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Units</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={form.units} 
                    onChange={e => setForm({...form, units: e.target.value})}
                    style={{width:'100%',padding:10,border:'1.5px solid #e2e8f0',borderRadius:8}}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
