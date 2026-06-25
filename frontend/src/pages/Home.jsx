import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container py-5">
      <div className="p-5 mb-4 card text-center border-0 shadow-sm">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold" style={{ color: 'var(--ios-blue)' }}>Smart Boarding House</h1>
          <p className="col-md-8 mx-auto fs-5 mt-3 text-muted" style={{ color: 'var(--ios-text-muted)' }}>
            Welcome to the Smart Boarding House Management System. Easily manage rooms, rent payments, utility bills, maintenance requests, and announcements in one place.
          </p>
          <div className="d-grid gap-3 d-sm-flex justify-content-sm-center mt-4">
            <Link to="/login" className="btn btn-primary btn-lg px-5 rounded-pill">
              Login to Portal
            </Link>
            <Link to="/register" className="btn btn-outline-secondary btn-lg px-5 rounded-pill">
              Register as Tenant
            </Link>
          </div>
        </div>
      </div>

      <div className="row align-items-stretch g-4 py-5">
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm text-center">
            <h2 className="h4 fw-bold" style={{ color: 'var(--ios-blue)' }}>For Tenants</h2>
            <p className="text-muted mt-2">View your rooms, check monthly utilities, pay rent, upload receipts, and submit maintenance tickets directly from your dashboard.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm text-center">
            <h2 className="h4 fw-bold" style={{ color: 'var(--ios-green)' }}>For Caretakers</h2>
            <p className="text-muted mt-2">Track maintenance requests assigned to you, update work progress, and manage visitor entries easily.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm text-center">
            <h2 className="h4 fw-bold" style={{ color: 'var(--ios-red)' }}>For Admins</h2>
            <p className="text-muted mt-2">Manage rooms, allocate tenants, generate rent and utility bills, approve payments, and view comprehensive financial and occupancy reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
