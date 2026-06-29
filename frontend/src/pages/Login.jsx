import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      login(token, user);
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      if (user.role_name === 'Admin') {
        navigate('/admin');
      } else if (user.role_name === 'Tenant') {
        navigate('/tenant');
      } else if (user.role_name === 'Staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--ios-blue)' }}>Sign In</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="text-center mt-3 small">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
          <div className="text-center mt-2 small">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
