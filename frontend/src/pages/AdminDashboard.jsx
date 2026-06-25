import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Rooms State
  const [rooms, setRooms] = useState([]);
  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    room_type: '',
    monthly_rent: '',
    maximum_capacity: '',
    room_status: 'Available'
  });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [roomSuccess, setRoomSuccess] = useState('');

  // Tenants State
  const [tenants, setTenants] = useState([]);
  const [tenantError, setTenantError] = useState('');
  const [tenantSuccess, setTenantSuccess] = useState('');
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Payments State
  const [payments, setPayments] = useState([]);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    tenant_id: '',
    billing_month: '',
    rent_amount: '',
    due_date: ''
  });

  // Utilities State
  const [utilities, setUtilities] = useState([]);
  const [utilityError, setUtilityError] = useState('');
  const [utilitySuccess, setUtilitySuccess] = useState('');
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [utilityFormData, setUtilityFormData] = useState({
    tenant_id: '',
    billing_month: '',
    electricity_charge: '',
    water_charge: '',
    internet_charge: '',
    other_charge: '',
    due_date: ''
  });

  // Fetch Rooms, Tenants, and Payments
  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tenants');
      setTenants(res.data);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchUtilities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/utilities');
      setUtilities(res.data);
    } catch (err) {
      console.error('Error fetching utilities:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchTenants();
    fetchPayments();
    fetchUtilities();
  }, []);

  // Handle Room Form Inputs
  const handleRoomChange = (e) => {
    setRoomFormData({
      ...roomFormData,
      [e.target.name]: e.target.value
    });
  };

  // Submit Room (Create / Update)
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setRoomError('');
    setRoomSuccess('');

    try {
      if (editingRoomId) {
        // Update Room
        const res = await axios.put(`http://localhost:5000/api/rooms/${editingRoomId}`, roomFormData);
        setRoomSuccess(res.data.message);
        setEditingRoomId(null);
      } else {
        // Create Room
        const res = await axios.post('http://localhost:5000/api/rooms', roomFormData);
        setRoomSuccess(res.data.message);
      }

      // Reset form
      setRoomFormData({
        room_number: '',
        room_type: '',
        monthly_rent: '',
        maximum_capacity: '',
        room_status: 'Available'
      });
      setShowRoomForm(false);
      fetchRooms();
    } catch (err) {
      console.error(err);
      setRoomError(err.response?.data?.message || 'Failed to save room details.');
    }
  };

  // Edit Room Trigger
  const handleEditRoom = (room) => {
    setRoomFormData({
      room_number: room.room_number,
      room_type: room.room_type || '',
      monthly_rent: room.monthly_rent,
      maximum_capacity: room.maximum_capacity,
      room_status: room.room_status
    });
    setEditingRoomId(room.room_id);
    setShowRoomForm(true);
  };

  // Delete Room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    setRoomError('');
    setRoomSuccess('');

    try {
      const res = await axios.delete(`http://localhost:5000/api/rooms/${roomId}`);
      setRoomSuccess(res.data.message);
      fetchRooms();
    } catch (err) {
      console.error(err);
      setRoomError(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  // Handle Room Allocation
  const handleAllocateRoom = async (e) => {
    e.preventDefault();
    setTenantError('');
    setTenantSuccess('');

    if (!selectedTenantId || !selectedRoomId) {
      setTenantError('Please select both a tenant and a room.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/tenants/allocate', {
        tenant_id: selectedTenantId,
        room_id: selectedRoomId
      });
      setTenantSuccess(res.data.message);
      setShowAllocateModal(false);
      setSelectedTenantId(null);
      setSelectedRoomId('');
      fetchTenants();
      fetchRooms();
    } catch (err) {
      console.error(err);
      setTenantError(err.response?.data?.message || 'Failed to allocate room.');
    }
  };

  // Handle Room Deallocation
  const handleDeallocate = async (allocationId) => {
    if (!window.confirm('Are you sure you want to remove this tenant from the room?')) return;
    setTenantError('');
    setTenantSuccess('');

    try {
      const res = await axios.post(`http://localhost:5000/api/tenants/deallocate/${allocationId}`);
      setTenantSuccess(res.data.message);
      fetchTenants();
      fetchRooms();
    } catch (err) {
      console.error(err);
      setTenantError(err.response?.data?.message || 'Failed to deallocate tenant.');
    }
  };

  // Handle Generate Invoice
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const res = await axios.post('http://localhost:5000/api/payments', invoiceFormData);
      setPaymentSuccess(res.data.message);
      setShowInvoiceModal(false);
      setInvoiceFormData({ tenant_id: '', billing_month: '', rent_amount: '', due_date: '' });
      fetchPayments();
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || 'Failed to generate invoice.');
    }
  };

  // Handle Mark as Paid
  const handleMarkAsPaid = async (paymentId) => {
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const res = await axios.put(`http://localhost:5000/api/payments/${paymentId}/status`, { payment_status: 'paid' });
      setPaymentSuccess(res.data.message);
      fetchPayments();
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  // Handle Generate Utility Bill
  const handleGenerateUtility = async (e) => {
    e.preventDefault();
    setUtilityError('');
    setUtilitySuccess('');

    try {
      const res = await axios.post('http://localhost:5000/api/utilities', utilityFormData);
      setUtilitySuccess(res.data.message);
      setShowUtilityModal(false);
      setUtilityFormData({
        tenant_id: '', billing_month: '', electricity_charge: '', water_charge: '', internet_charge: '', other_charge: '', due_date: ''
      });
      fetchUtilities();
    } catch (err) {
      console.error(err);
      setUtilityError(err.response?.data?.message || 'Failed to generate utility bill.');
    }
  };

  // Handle Mark Utility as Paid
  const handleMarkUtilityPaid = async (billId) => {
    setUtilityError('');
    setUtilitySuccess('');

    try {
      const res = await axios.put(`http://localhost:5000/api/utilities/${billId}/status`, { status: 'paid' });
      setUtilitySuccess(res.data.message);
      fetchUtilities();
    } catch (err) {
      console.error(err);
      setUtilityError(err.response?.data?.message || 'Failed to update utility status.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-2 d-none d-md-block bg-white sidebar border-end min-vh-100 py-4">
          <div className="position-sticky ps-3">
            <h5 className="text-secondary small fw-bold text-uppercase mb-3">Admin Controls</h5>
            <ul className="nav flex-column gap-2">
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'overview' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'rooms' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('rooms')}
                >
                  Room Management
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'tenants' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('tenants')}
                >
                  Tenant Management
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'payments' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('payments')}
                >
                  Rent Payments
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'utilities' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('utilities')}
                >
                  Utility Bills
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('maintenance')}
                >
                  Maintenance
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'visitors' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('visitors')}
                >
                  Visitor Records
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn w-100 text-start ${activeTab === 'announcements' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setActiveTab('announcements')}
                >
                  Announcements
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="col-md-10 ms-sm-auto px-md-4 py-4">
          {/* Header */}
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2 text-dark fw-bold">Admin Dashboard</h1>
            <div className="text-secondary">Logged in as: <strong>{user?.full_name}</strong></div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="card text-center p-3 border-0">
                    <h6 className="card-title text-uppercase mb-2 small text-muted">Total Rooms</h6>
                    <p className="card-text fs-2 fw-bold mb-0" style={{ color: 'var(--ios-blue)' }}>{rooms.length}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center p-3 border-0">
                    <h6 className="card-title text-uppercase mb-2 small text-muted">Available Rooms</h6>
                    <p className="card-text fs-2 fw-bold mb-0" style={{ color: 'var(--ios-green)' }}>
                      {rooms.filter(r => r.room_status === 'Available').length}
                    </p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center p-3 border-0">
                    <h6 className="card-title text-uppercase mb-2 small text-muted">Occupied Rooms</h6>
                    <p className="card-text fs-2 fw-bold mb-0" style={{ color: 'var(--ios-blue)' }}>
                      {rooms.filter(r => r.room_status === 'Occupied').length}
                    </p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center p-3 border-0">
                    <h6 className="card-title text-uppercase mb-2 small text-muted">Under Maintenance</h6>
                    <p className="card-text fs-2 fw-bold mb-0" style={{ color: 'var(--ios-red)' }}>
                      {rooms.filter(r => r.room_status === 'Under maintenance').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-5 mb-4 border-0">
                <h3 className="fw-bold" style={{ color: 'var(--ios-text)' }}>Welcome to the Management System</h3>
                <p className="text-muted">Use the sidebar links to navigate and manage different aspects of the boarding house.</p>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM MANAGEMENT */}
          {activeTab === 'rooms' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h4 text-secondary mb-0">Manage Boarding Rooms</h3>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setEditingRoomId(null);
                    setRoomFormData({
                      room_number: '',
                      room_type: '',
                      monthly_rent: '',
                      maximum_capacity: '',
                      room_status: 'Available'
                    });
                    setShowRoomForm(!showRoomForm);
                  }}
                >
                  {showRoomForm ? 'Cancel' : 'Add New Room'}
                </button>
              </div>

              {roomError && <div className="alert alert-danger p-2 small">{roomError}</div>}
              {roomSuccess && <div className="alert alert-success p-2 small">{roomSuccess}</div>}

              {/* Add/Edit Form */}
              {showRoomForm && (
                <div className="card p-4 mb-4 border-0">
                  <h4 className="h5 fw-bold mb-3" style={{ color: 'var(--ios-blue)' }}>{editingRoomId ? 'Edit Room' : 'Add New Room'}</h4>
                  <form onSubmit={handleRoomSubmit}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label small">Room Number</label>
                        <input
                          type="text"
                          name="room_number"
                          className="form-control form-control-sm"
                          value={roomFormData.room_number}
                          onChange={handleRoomChange}
                          required
                          placeholder="e.g. A-101"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Room Type</label>
                        <input
                          type="text"
                          name="room_type"
                          className="form-control form-control-sm"
                          value={roomFormData.room_type}
                          onChange={handleRoomChange}
                          placeholder="e.g. Single, Double AC"
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Monthly Rent (Rs.)</label>
                        <input
                          type="number"
                          name="monthly_rent"
                          className="form-control form-control-sm"
                          value={roomFormData.monthly_rent}
                          onChange={handleRoomChange}
                          required
                          placeholder="15000"
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Max Capacity</label>
                        <input
                          type="number"
                          name="maximum_capacity"
                          className="form-control form-control-sm"
                          value={roomFormData.maximum_capacity}
                          onChange={handleRoomChange}
                          required
                          placeholder="2"
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Status</label>
                        <select
                          name="room_status"
                          className="form-select form-select-sm"
                          value={roomFormData.room_status}
                          onChange={handleRoomChange}
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Under maintenance">Under Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-sm btn-primary mt-3">
                      {editingRoomId ? 'Update Room' : 'Save Room'}
                    </button>
                  </form>
                </div>
              )}

              {/* Rooms List Table */}
              <div className="card border-0">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Room Number</th>
                        <th>Type</th>
                        <th>Monthly Rent</th>
                        <th>Occupancy / Capacity</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No rooms added yet. Click "Add New Room" to start.
                          </td>
                        </tr>
                      ) : (
                        rooms.map((room) => (
                          <tr key={room.room_id}>
                            <td className="fw-bold">{room.room_number}</td>
                            <td>{room.room_type || 'N/A'}</td>
                            <td>Rs. {parseFloat(room.monthly_rent).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${room.current_occupancy >= room.maximum_capacity ? 'bg-danger' : 'bg-secondary'}`}>
                                {room.current_occupancy} / {room.maximum_capacity}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                room.room_status === 'Available' ? 'bg-success' :
                                room.room_status === 'Occupied' ? 'bg-warning text-dark' :
                                room.room_status === 'Reserved' ? 'bg-info text-dark' : 'bg-danger'
                              }`}>
                                {room.room_status}
                              </span>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-secondary me-2"
                                onClick={() => handleEditRoom(room)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteRoom(room.room_id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TENANT MANAGEMENT */}
          {activeTab === 'tenants' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h4 text-secondary mb-0">Manage Tenants</h3>
              </div>

              {tenantError && <div className="alert alert-danger p-2 small">{tenantError}</div>}
              {tenantSuccess && <div className="alert alert-success p-2 small">{tenantSuccess}</div>}

              {/* Allocate Room Modal / Inline Form */}
              {showAllocateModal && (
                <div className="card p-4 mb-4 border-0">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="h5 fw-bold" style={{ color: 'var(--ios-blue)' }}>Allocate Room</h4>
                    <button className="btn-close" onClick={() => {
                      setShowAllocateModal(false);
                      setSelectedTenantId(null);
                      setSelectedRoomId('');
                    }}></button>
                  </div>
                  <form onSubmit={handleAllocateRoom}>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-5">
                        <label className="form-label small">Select Room</label>
                        <select 
                          className="form-select form-select-sm"
                          value={selectedRoomId}
                          onChange={(e) => setSelectedRoomId(e.target.value)}
                          required
                        >
                          <option value="">-- Select Available Room --</option>
                          {rooms.filter(r => r.room_status === 'Available').map(room => (
                            <option key={room.room_id} value={room.room_id}>
                              {room.room_number} ({room.room_type}) - Rs. {parseFloat(room.monthly_rent).toFixed(2)} - {room.current_occupancy}/{room.maximum_capacity}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <button type="submit" className="btn btn-sm btn-primary w-100 rounded-pill">
                          Confirm Allocation
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Tenants List Table */}
              <div className="card border-0">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tenant Name</th>
                        <th>Contact</th>
                        <th>NIC Number</th>
                        <th>Current Room</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            No tenants found. Registered tenants will appear here.
                          </td>
                        </tr>
                      ) : (
                        tenants.map((tenant, idx) => (
                          <tr key={`${tenant.tenant_id}-${idx}`}>
                            <td>
                              <div className="fw-bold text-dark">{tenant.full_name}</div>
                              <div className="small text-muted">{tenant.email}</div>
                            </td>
                            <td>
                              <div className="small">{tenant.phone}</div>
                              <div className="small text-muted">Emg: {tenant.emergency_contact}</div>
                            </td>
                            <td>{tenant.nic_number}</td>
                            <td>
                              {tenant.room_number ? (
                                <span className="badge px-3 py-2" style={{ backgroundColor: 'var(--ios-blue)', color: 'white' }}>
                                  {tenant.room_number}
                                </span>
                              ) : (
                                <span className="badge bg-secondary px-3 py-2 rounded-pill">
                                  Unallocated
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              {tenant.room_number ? (
                                <button
                                  className="btn btn-sm btn-danger rounded-pill px-3"
                                  onClick={() => handleDeallocate(tenant.allocation_id)}
                                >
                                  Evict
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-primary rounded-pill px-3"
                                  onClick={() => {
                                    setSelectedTenantId(tenant.tenant_id);
                                    setShowAllocateModal(true);
                                  }}
                                >
                                  Allocate Room
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RENT PAYMENTS */}
          {activeTab === 'payments' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h4 text-secondary mb-0">Rent Payments</h3>
                <button
                  className="btn btn-sm btn-primary rounded-pill px-4"
                  onClick={() => setShowInvoiceModal(!showInvoiceModal)}
                >
                  {showInvoiceModal ? 'Cancel' : 'Generate Invoice'}
                </button>
              </div>

              {paymentError && <div className="alert alert-danger p-2 small">{paymentError}</div>}
              {paymentSuccess && <div className="alert alert-success p-2 small">{paymentSuccess}</div>}

              {/* Generate Invoice Form */}
              {showInvoiceModal && (
                <div className="card p-4 mb-4 border-0 shadow-sm">
                  <h4 className="h5 fw-bold mb-3" style={{ color: 'var(--ios-blue)' }}>Create New Rent Invoice</h4>
                  <form onSubmit={handleGenerateInvoice}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label small">Select Tenant</label>
                        <select
                          className="form-select form-select-sm"
                          value={invoiceFormData.tenant_id}
                          onChange={(e) => {
                            const tid = e.target.value;
                            const selectedTenant = tenants.find(t => String(t.tenant_id) === String(tid));
                            setInvoiceFormData({
                              ...invoiceFormData,
                              tenant_id: tid,
                              rent_amount: selectedTenant && selectedTenant.monthly_rent ? selectedTenant.monthly_rent : ''
                            });
                          }}
                          required
                        >
                          <option value="">-- Choose Tenant --</option>
                          {tenants.map(t => (
                            <option key={t.tenant_id} value={t.tenant_id}>
                              {t.full_name} {t.room_number ? `(${t.room_number})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Billing Month</label>
                        <input
                          type="month"
                          className="form-control form-control-sm"
                          value={invoiceFormData.billing_month}
                          onChange={(e) => setInvoiceFormData({...invoiceFormData, billing_month: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Rent Amount (Rs.)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={invoiceFormData.rent_amount}
                          onChange={(e) => setInvoiceFormData({...invoiceFormData, rent_amount: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Due Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={invoiceFormData.due_date}
                          onChange={(e) => setInvoiceFormData({...invoiceFormData, due_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-sm btn-primary mt-3 rounded-pill px-4">
                      Create Invoice
                    </button>
                  </form>
                </div>
              )}

              {/* Invoices List Table */}
              <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tenant</th>
                        <th>Month</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No invoices generated yet.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.payment_id}>
                            <td>
                              <div className="fw-bold">{payment.full_name}</div>
                              <div className="small text-muted">{payment.nic_number}</div>
                            </td>
                            <td>{payment.billing_month}</td>
                            <td className="fw-bold">Rs. {parseFloat(payment.rent_amount).toFixed(2)}</td>
                            <td>{new Date(payment.due_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge px-3 py-1 rounded-pill ${
                                payment.payment_status === 'paid' ? 'bg-success' :
                                payment.payment_status === 'pending_approval' ? 'bg-warning text-dark' :
                                payment.payment_status === 'late' ? 'bg-danger' :
                                'bg-secondary'
                              }`}>
                                {payment.payment_status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="text-end">
                              {payment.payment_status !== 'paid' && (
                                <button
                                  className="btn btn-sm btn-success rounded-pill px-3"
                                  onClick={() => handleMarkAsPaid(payment.payment_id)}
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UTILITY BILLS */}
          {activeTab === 'utilities' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h4 text-secondary mb-0">Utility Bills</h3>
                <button
                  className="btn btn-sm btn-primary rounded-pill px-4"
                  onClick={() => setShowUtilityModal(!showUtilityModal)}
                >
                  {showUtilityModal ? 'Cancel' : 'Record New Utility Bill'}
                </button>
              </div>

              {utilityError && <div className="alert alert-danger p-2 small">{utilityError}</div>}
              {utilitySuccess && <div className="alert alert-success p-2 small">{utilitySuccess}</div>}

              {/* Generate Utility Bill Form */}
              {showUtilityModal && (
                <div className="card p-4 mb-4 border-0 shadow-sm">
                  <h4 className="h5 fw-bold mb-3" style={{ color: 'var(--ios-blue)' }}>Record New Utility Bill</h4>
                  <form onSubmit={handleGenerateUtility}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label small">Select Tenant</label>
                        <select
                          className="form-select form-select-sm"
                          value={utilityFormData.tenant_id}
                          onChange={(e) => setUtilityFormData({...utilityFormData, tenant_id: e.target.value})}
                          required
                        >
                          <option value="">-- Choose Tenant --</option>
                          {tenants.map(t => (
                            <option key={t.tenant_id} value={t.tenant_id}>
                              {t.full_name} {t.room_number ? `(${t.room_number})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Billing Month</label>
                        <input
                          type="month"
                          className="form-control form-control-sm"
                          value={utilityFormData.billing_month}
                          onChange={(e) => setUtilityFormData({...utilityFormData, billing_month: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Due Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={utilityFormData.due_date}
                          onChange={(e) => setUtilityFormData({...utilityFormData, due_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="row g-3 mt-1">
                      <div className="col-md-3">
                        <label className="form-label small">Electricity (Rs.)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={utilityFormData.electricity_charge}
                          onChange={(e) => setUtilityFormData({...utilityFormData, electricity_charge: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Water (Rs.)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={utilityFormData.water_charge}
                          onChange={(e) => setUtilityFormData({...utilityFormData, water_charge: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Internet (Rs.)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={utilityFormData.internet_charge}
                          onChange={(e) => setUtilityFormData({...utilityFormData, internet_charge: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Other (Rs.)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={utilityFormData.other_charge}
                          onChange={(e) => setUtilityFormData({...utilityFormData, other_charge: e.target.value})}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-sm btn-primary mt-4 rounded-pill px-4">
                      Record Utility Bill
                    </button>
                  </form>
                </div>
              )}

              {/* Utility Bills List Table */}
              <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tenant</th>
                        <th>Month</th>
                        <th>Total Amount</th>
                        <th>Breakdown</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilities.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-muted">
                            No utility bills recorded yet.
                          </td>
                        </tr>
                      ) : (
                        utilities.map((bill) => (
                          <tr key={bill.utility_bill_id}>
                            <td>
                              <div className="fw-bold">{bill.full_name}</div>
                              <div className="small text-muted">{bill.nic_number}</div>
                            </td>
                            <td>{bill.billing_month}</td>
                            <td className="fw-bold">Rs. {parseFloat(bill.total_amount).toFixed(2)}</td>
                            <td>
                              <div className="small text-muted">
                                E: {parseFloat(bill.electricity_charge).toFixed(0)} | 
                                W: {parseFloat(bill.water_charge).toFixed(0)} | 
                                I: {parseFloat(bill.internet_charge).toFixed(0)}
                              </div>
                            </td>
                            <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge px-3 py-1 rounded-pill ${
                                bill.status === 'paid' ? 'bg-success' :
                                bill.status === 'late' ? 'bg-danger' :
                                'bg-secondary'
                              }`}>
                                {bill.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="text-end">
                              {bill.status !== 'paid' && (
                                <button
                                  className="btn btn-sm btn-success rounded-pill px-3"
                                  onClick={() => handleMarkUtilityPaid(bill.utility_bill_id)}
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PLACEHOLDERS FOR OTHER TABS */}
          {['maintenance', 'visitors', 'announcements'].includes(activeTab) && (
            <div className="card p-5 border-0">
              <h3 className="text-capitalize text-muted fw-bold">{activeTab} Management</h3>
              <p className="text-muted">This module is under development and will be implemented in the next steps.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
