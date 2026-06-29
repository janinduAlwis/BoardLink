import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role_name: 'Tenant', // Default role
    nic_number: '',
    emergency_contact: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLoading(true);

    try {
      const payload = { ...formData };
      
      // Remove Tenant-specific fields if not registering as a Tenant
      if (formData.role_name !== 'Tenant') {
        delete payload.nic_number;
        delete payload.emergency_contact;
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', payload);
      setSuccess(response.data.message || 'Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--ios-blue)' }}>Create Account</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="0771234567"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Choose a password"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                name="role_name"
                className="form-select"
                value={formData.role_name}
                onChange={handleChange}
              >
                <option value="Tenant">Tenant</option>
                <option value="Staff">Staff / Caretaker</option>
                <option value="Admin">Admin / Owner</option>
              </select>
            </div>

            {/* Render Tenant fields only if Role is Tenant */}
            {formData.role_name === 'Tenant' && (
              <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--ios-bg)' }}>
                <h5 className="small fw-bold mb-2" style={{ color: 'var(--ios-text-muted)' }}>Tenant Details</h5>
                <div className="mb-2">
                  <label className="form-label small">NIC or Passport Number</label>
                  <input
                    type="text"
                    name="nic_number"
                    className="form-control form-control-sm"
                    value={formData.nic_number}
                    onChange={handleChange}
                    required={formData.role_name === 'Tenant'}
                    placeholder="991234567V"
                  />
                </div>
                <div>
                  <label className="form-label small">Emergency Contact Number</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    className="form-control form-control-sm"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    required={formData.role_name === 'Tenant'}
                    placeholder="0777654321"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mt-2"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          
          <div className="text-center mt-3 small">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
          <div className="text-center mt-2 small">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
