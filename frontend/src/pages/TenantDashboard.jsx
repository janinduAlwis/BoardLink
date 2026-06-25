import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const TenantDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4 border">
        <div className="card-body bg-light">
          <h1 className="h3 mb-2 text-success fw-bold">Tenant Portal</h1>
          <p className="text-muted">Welcome to your boarding house dashboard, {user?.full_name}!</p>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-success">My Room Allocation</h5>
              <p className="text-muted small">No room currently allocated. Please contact the Admin.</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-success">Monthly Balance</h5>
              <p className="fs-4 fw-bold">Rs. 0.00</p>
              <span className="badge bg-secondary">No Pending Bills</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
