import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const TenantDashboard = () => {
  const { user } = useContext(AuthContext);

  const [allocation, setAllocation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [maintenanceForm, setMaintenanceForm] = useState({ title: '', description: '', priority: 'low' });
  const [visitorForm, setVisitorForm] = useState({ visitor_name: '', visit_date: '', purpose: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, payRes, utilRes, annRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tenants/my-allocation').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/payments/my-payments').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/utilities/my-bills').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/announcements').catch(() => ({ data: [] }))
      ]);

      setAllocation(allocRes.data?.room_number ? allocRes.data : null);
      setPayments(payRes.data);
      setUtilities(utilRes.data);
      setAnnouncements(annRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayRent = async (paymentId) => {
    const result = await Swal.fire({
      title: 'Pay Rent',
      text: 'Simulate paying this rent invoice?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Pay'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.put(`http://localhost:5000/api/payments/my-payments/${paymentId}/pay`);
      toast.success('Rent payment successful!');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to pay rent.');
    }
  };

  const handlePayUtility = async (billId) => {
    const result = await Swal.fire({
      title: 'Pay Utility Bill',
      text: 'Simulate paying this utility bill?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Pay'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.put(`http://localhost:5000/api/utilities/my-bills/${billId}/pay`);
      toast.success('Utility bill payment successful!');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to pay utility bill.');
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/maintenance', maintenanceForm);
      toast.success('Maintenance request submitted successfully!');
      setMaintenanceForm({ title: '', description: '', priority: 'low' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit maintenance request.');
    }
  };

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/visitors', visitorForm);
      toast.success('Visitor registered successfully! Pending admin approval.');
      setVisitorForm({ visitor_name: '', visit_date: '', purpose: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register visitor.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const totalOutstanding = 
    payments.filter(p => p.payment_status !== 'paid').reduce((sum, p) => sum + Number(p.rent_amount || 0), 0) +
    utilities.filter(u => u.status !== 'paid').reduce((sum, u) => sum + Number(u.total_amount || 0), 0);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="card shadow-sm mb-4 border">
        <div className="card-body bg-light d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-2 text-primary fw-bold">Tenant Portal</h1>
            <p className="text-muted mb-0">Welcome back, {user?.full_name}</p>
          </div>
          <div className="text-end">
            <h5 className="text-muted mb-1">Total Outstanding</h5>
            <h3 className={`fw-bold mb-0 ${totalOutstanding > 0 ? 'text-danger' : 'text-success'}`}>
              Rs. {totalOutstanding.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="alert alert-warning mb-4 shadow-sm border-warning">
          <h5 className="alert-heading"><i className="bi bi-megaphone-fill me-2"></i>Announcements</h5>
          <hr />
          {announcements.map(ann => (
            <div key={ann.announcement_id} className="mb-2">
              <strong>{ann.title}</strong>
              <p className="mb-0 small">{ann.content}</p>
              <small className="text-muted">By {ann.author_name}</small>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Left Column: Room & Forms */}
        <div className="col-lg-5">
          {/* Room Allocation Info */}
          <div className="card border shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">My Room</h5>
              {allocation ? (
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span className="text-muted">Room Number</span>
                    <span className="fw-semibold">{allocation.room_number}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span className="text-muted">Room Type</span>
                    <span className="fw-semibold">{allocation.room_type || 'N/A'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span className="text-muted">Move-in Date</span>
                    <span className="fw-semibold">{new Date(allocation.allocated_date).toLocaleDateString()}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-muted mb-0">You currently do not have a room allocated to you.</p>
              )}
            </div>
          </div>

          {/* Maintenance Request Form */}
          <div className="card border shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">Request Maintenance</h5>
              <form onSubmit={handleMaintenanceSubmit}>
                <div className="mb-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Issue Title (e.g., Broken Fan)" required value={maintenanceForm.title} onChange={e => setMaintenanceForm({...maintenanceForm, title: e.target.value})} />
                </div>
                <div className="mb-2">
                  <textarea className="form-control form-control-sm" rows="2" placeholder="Description of the issue..." required value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})}></textarea>
                </div>
                <div className="mb-2">
                  <select className="form-select form-select-sm" value={maintenanceForm.priority} onChange={e => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100">Submit Request</button>
              </form>
            </div>
          </div>

          {/* Visitor Registration Form */}
          <div className="card border shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">Register Visitor</h5>
              <form onSubmit={handleVisitorSubmit}>
                <div className="mb-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Visitor Name" required value={visitorForm.visitor_name} onChange={e => setVisitorForm({...visitorForm, visitor_name: e.target.value})} />
                </div>
                <div className="mb-2">
                  <input type="date" className="form-control form-control-sm" required value={visitorForm.visit_date} onChange={e => setVisitorForm({...visitorForm, visit_date: e.target.value})} />
                </div>
                <div className="mb-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Purpose of Visit" required value={visitorForm.purpose} onChange={e => setVisitorForm({...visitorForm, purpose: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100">Register Visitor</button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Payments & Utilities */}
        <div className="col-lg-7">
          <h5 className="mb-3 text-secondary">Rent Invoices</h5>
          <div className="card border shadow-sm mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Month/Year</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-3 text-muted">No rent invoices found.</td></tr>
                  ) : payments.map(p => (
                    <tr key={p.payment_id}>
                      <td>{p.billing_month}</td>
                      <td>Rs. {Number(p.rent_amount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${p.payment_status === 'paid' ? 'success' : 'danger'}`}>
                          {p.payment_status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {p.payment_status !== 'paid' && (
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handlePayRent(p.payment_id)}>Pay Now</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h5 className="mb-3 text-secondary">Utility Bills</h5>
          <div className="card border shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {utilities.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-3 text-muted">No utility bills found.</td></tr>
                  ) : utilities.map(u => (
                    <tr key={u.utility_bill_id}>
                      <td><span className="fw-semibold text-capitalize">Consolidated Bill</span></td>
                      <td>{u.billing_month}</td>
                      <td>Rs. {Number(u.total_amount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${u.status === 'paid' ? 'success' : 'warning'}`}>
                          {u.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {u.status !== 'paid' && (
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handlePayUtility(u.utility_bill_id)}>Pay Now</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TenantDashboard;
