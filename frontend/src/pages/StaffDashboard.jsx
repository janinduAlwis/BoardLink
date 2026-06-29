import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, visitorsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/staff/my-tasks'),
        axios.get('http://localhost:5000/api/staff/visitors/today')
      ]);
      setTasks(tasksRes.data);
      setVisitors(visitorsRes.data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      alert('Failed to load dashboard data. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTaskStatus = async (taskId, action) => {
    if (!window.confirm(`Are you sure you want to mark this task as ${action}?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/staff/my-tasks/${taskId}/status`, { action });
      fetchData();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your portal data...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4 border">
        <div className="card-body bg-light">
          <h1 className="h3 mb-2 text-info fw-bold">Staff Portal</h1>
          <p className="text-muted mb-0">Welcome back, {user?.full_name}!</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <h4 className="mb-3 text-secondary">Assigned Maintenance Tasks</h4>
          <div className="card border shadow-sm mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4 text-muted">No active maintenance tasks assigned to you.</td></tr>
                  ) : tasks.map(task => (
                    <tr key={task.request_id}>
                      <td>
                        <strong>{task.room_number}</strong><br/>
                        <small className="text-muted">{task.tenant_name}</small>
                      </td>
                      <td>
                        <strong>{task.title}</strong><br/>
                        <small className="text-muted">{task.description}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${task.priority === 'high' || task.priority === 'urgent' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'primary' : 'secondary'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        {task.status !== 'Completed' && (
                          <div className="btn-group btn-group-sm">
                            {task.status !== 'In Progress' && (
                              <button className="btn btn-outline-primary" onClick={() => handleUpdateTaskStatus(task.request_id, 'InProgress')}>Start</button>
                            )}
                            <button className="btn btn-outline-success" onClick={() => handleUpdateTaskStatus(task.request_id, 'Completed')}>Done</button>
                            <button className="btn btn-outline-danger" onClick={() => handleUpdateTaskStatus(task.request_id, 'Reject')}>Reject</button>
                          </div>
                        )}
                        {task.status === 'Completed' && <span className="text-muted small">Finished</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <h4 className="mb-3 text-secondary">Today's Visitors</h4>
          <div className="card border shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Visitor Name</th>
                    <th>Visiting Tenant</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4 text-muted">No visitors recorded for today.</td></tr>
                  ) : visitors.map(v => (
                    <tr key={v.visitor_id}>
                      <td className="fw-semibold">{v.visitor_name}</td>
                      <td>
                        {v.tenant_name} <br/>
                        <small className="text-muted">Room: {v.room_number || 'N/A'}</small>
                      </td>
                      <td>{v.arrival_time || 'N/A'}</td>
                      <td>{v.departure_time || 'N/A'}</td>
                      <td>{v.purpose || 'N/A'}</td>
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

export default StaffDashboard;
