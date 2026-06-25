import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4 border">
        <div className="card-body bg-light">
          <h1 className="h3 mb-2 text-info fw-bold">Staff Portal</h1>
          <p className="text-muted">Welcome back, {user?.full_name}!</p>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-info">Assigned Maintenance Tasks</h5>
              <p className="text-muted small">No active maintenance tasks assigned to you.</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-info">Visitor Records</h5>
              <p className="text-muted small">No visitor logs recorded today.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
