const db = require('../config/db');

// Fetch maintenance tasks assigned to the current staff member
const getMyMaintenanceTasks = async (req, res) => {
  const staff_id = req.user.user_id;

  try {
    const query = `
      SELECT mr.request_id, mr.title, mr.description, mr.priority, mr.status, mr.created_at,
             r.room_number, u.full_name AS tenant_name, t.nic_number
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.room_id
      JOIN tenants t ON mr.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      WHERE mr.assigned_staff_id = ?
      ORDER BY mr.created_at DESC
    `;
    const [rows] = await db.query(query, [staff_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Update the status of a maintenance task (including Reject)
const updateTaskStatus = async (req, res) => {
  const staff_id = req.user.user_id;
  const { request_id } = req.params;
  const { action } = req.body; // 'InProgress', 'Completed', 'Reject'

  if (!action) {
    return res.status(400).json({ message: 'Action is required.' });
  }

  try {
    // Verify task belongs to this staff
    const [taskRows] = await db.query(
      'SELECT status FROM maintenance_requests WHERE request_id = ? AND assigned_staff_id = ?',
      [request_id, staff_id]
    );

    if (taskRows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    if (action === 'Reject') {
      await db.query(
        'UPDATE maintenance_requests SET status = ?, assigned_staff_id = NULL WHERE request_id = ?',
        ['Submitted', request_id]
      );
      return res.status(200).json({ message: 'Task rejected and returned to pool.' });
    }

    let newStatus = '';
    if (action === 'InProgress') newStatus = 'In Progress';
    if (action === 'Completed') newStatus = 'Completed';

    if (!newStatus) {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    await db.query(
      'UPDATE maintenance_requests SET status = ? WHERE request_id = ?',
      [newStatus, request_id]
    );

    res.status(200).json({ message: `Task marked as ${newStatus}.` });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Fetch today's visitors for staff to monitor
const getTodayVisitors = async (req, res) => {
  try {
    const query = `
      SELECT v.visitor_id, v.visitor_name, v.visit_date, v.arrival_time, v.departure_time, v.purpose, v.approval_status,
             u.full_name AS tenant_name, r.room_number
      FROM visitors v
      JOIN tenants t ON v.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN room_allocations ra ON t.tenant_id = ra.tenant_id AND ra.allocation_status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      WHERE v.visit_date = CURRENT_DATE
      ORDER BY v.arrival_time ASC, v.visitor_id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching today visitors:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getMyMaintenanceTasks, updateTaskStatus, getTodayVisitors };
