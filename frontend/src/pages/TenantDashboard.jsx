import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TenantDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [allocation, setAllocation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [utilityBills, setUtilityBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, payRes, utilRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tenants/my-allocation'),
        axios.get('http://localhost:5000/api/payments/my-payments'),
        axios.get('http://localhost:5000/api/utilities/my-bills')
      ]);
      setAllocation(allocRes.data);
      setPayments(payRes.data);
      setUtilityBills(utilRes.data);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      alert('Failed to load portal data. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayRent = async (paymentId) => {
    if (!window.confirm('Simulate paying this rent invoice?')) return;
    try {
      await axios.put(`http://localhost:5000/api/payments/my-payments/${paymentId}/pay`);
      alert('Rent paid successfully!');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to pay rent.');
    }
  };

  const handlePayUtility = async (billId) => {
    if (!window.confirm('Simulate paying this utility bill?')) return;
    try {
      await axios.put(`http://localhost:5000/api/utilities/my-bills/${billId}/pay`);
      alert('Utility bill paid successfully!');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to pay utility bill.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your portal data...</p>
      </div>
    );
  }

  // Calculate outstanding
  const unpaidRent = payments.filter(p => p.payment_status === 'unpaid').reduce((sum, p) => sum + parseFloat(p.rent_amount), 0);
  const unpaidUtilities = utilityBills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
  const totalOutstanding = unpaidRent + unpaidUtilities;

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4 border">
        <div className="card-body bg-light">
          <h1 className="h3 mb-2 text-success fw-bold">Tenant Portal</h1>
          <p className="text-muted">Welcome to your boarding house dashboard, {user?.full_name}!</p>
        </div>
      </div>
      
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card border h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-success mb-3">My Room Allocation</h5>
              {allocation ? (
                <div>
                  <p className="mb-1"><strong>Room Number:</strong> {allocation.room_number}</p>
                  <p className="mb-1"><strong>Monthly Rent:</strong> Rs. {allocation.monthly_rent}</p>
                  <p className="mb-1"><strong>Allocated On:</strong> {new Date(allocation.allocated_date).toLocaleDateString()}</p>
                  <span className="badge bg-success mt-2">Active</span>
                </div>
              ) : (
                <p className="text-muted small">No room currently allocated. Please contact the Admin.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card border h-100 shadow-sm">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title text-success mb-3">Total Outstanding Balance</h5>
              <p className={`fs-3 fw-bold ${totalOutstanding > 0 ? 'text-danger' : 'text-success'}`}>
                Rs. {totalOutstanding.toFixed(2)}
              </p>
              <div>
                {totalOutstanding === 0 ? (
                  <span className="badge bg-success">All Clear!</span>
                ) : (
                  <span className="badge bg-warning text-dark">Payment Required</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h4 className="mb-3 text-secondary">Rent Invoices</h4>
      <div className="card border shadow-sm mb-5">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Billing Month</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No rent invoices found.</td></tr>
              ) : payments.map(pay => (
                <tr key={pay.payment_id}>
                  <td>{pay.billing_month}</td>
                  <td className="fw-semibold">Rs. {pay.rent_amount}</td>
                  <td>{new Date(pay.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${pay.payment_status === 'paid' ? 'success' : 'danger'}`}>
                      {pay.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {pay.payment_status === 'unpaid' ? (
                      <button className="btn btn-sm btn-primary px-3 rounded-pill" onClick={() => handlePayRent(pay.payment_id)}>
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-muted small">Paid on {pay.payment_date ? new Date(pay.payment_date).toLocaleDateString() : 'N/A'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h4 className="mb-3 text-secondary">Utility Bills</h4>
      <div className="card border shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Billing Month</th>
                <th>Elec / Water / Int / Other</th>
                <th>Total Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {utilityBills.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No utility bills found.</td></tr>
              ) : utilityBills.map(bill => (
                <tr key={bill.utility_bill_id}>
                  <td>{bill.billing_month}</td>
                  <td className="small text-muted">
                    {bill.electricity_charge} / {bill.water_charge} / {bill.internet_charge} / {bill.other_charge}
                  </td>
                  <td className="fw-semibold">Rs. {bill.total_amount}</td>
                  <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${bill.status === 'paid' ? 'success' : 'danger'}`}>
                      {bill.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {bill.status === 'unpaid' ? (
                      <button className="btn btn-sm btn-primary px-3 rounded-pill" onClick={() => handlePayUtility(bill.utility_bill_id)}>
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-muted small">Paid on {bill.payment_date ? new Date(bill.payment_date).toLocaleDateString() : 'N/A'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TenantDashboard;
