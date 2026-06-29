const db = require('../config/db');

// Get all tenants with their active allocations
const getAllTenants = async (req, res) => {
  try {
    const query = `
      SELECT t.tenant_id, t.nic_number, t.emergency_contact, 
             u.full_name, u.email, u.phone,
             ra.allocation_id, ra.room_id, r.room_number, r.monthly_rent
      FROM tenants t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN room_allocations ra ON t.tenant_id = ra.tenant_id AND ra.allocation_status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      ORDER BY u.full_name ASC
    `;
    
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'Server error while fetching tenants.', error: error.message });
  }
};

// Allocate a tenant to a room
const allocateRoom = async (req, res) => {
  const { tenant_id, room_id } = req.body;

  if (!tenant_id || !room_id) {
    return res.status(400).json({ message: 'tenant_id and room_id are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify room exists and has capacity
    const [roomRows] = await connection.query(
      'SELECT current_occupancy, maximum_capacity, room_status FROM rooms WHERE room_id = ? FOR UPDATE',
      [room_id]
    );

    if (roomRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Room not found.' });
    }

    const room = roomRows[0];
    if (room.room_status === 'Under maintenance') {
      await connection.rollback();
      return res.status(400).json({ message: 'Cannot allocate: Room is under maintenance.' });
    }

    if (room.current_occupancy >= room.maximum_capacity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cannot allocate: Room is at full capacity.' });
    }

    // Insert allocation record
    await connection.query(
      `INSERT INTO room_allocations (tenant_id, room_id, allocated_date, allocation_status) 
       VALUES (?, ?, CURRENT_DATE, 'active')`,
      [tenant_id, room_id]
    );

    // Update room occupancy
    const newOccupancy = room.current_occupancy + 1;
    let newStatus = room.room_status;

    if (newOccupancy >= room.maximum_capacity) {
      newStatus = 'Occupied';
    } else {
      newStatus = 'Available'; // Ensure it's marked available if previously reserved but not full
    }

    await connection.query(
      'UPDATE rooms SET current_occupancy = ?, room_status = ? WHERE room_id = ?',
      [newOccupancy, newStatus, room_id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Tenant successfully allocated to the room.' });
  } catch (error) {
    await connection.rollback();
    console.error('Allocation Error:', error);
    res.status(500).json({ message: 'Server error during allocation.', error: error.message });
  } finally {
    connection.release();
  }
};

// Deallocate a tenant from a room
const deallocateRoom = async (req, res) => {
  const { allocation_id } = req.params;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get allocation details
    const [allocRows] = await connection.query(
      'SELECT room_id, allocation_status FROM room_allocations WHERE allocation_id = ? FOR UPDATE',
      [allocation_id]
    );

    if (allocRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Allocation record not found.' });
    }

    if (allocRows[0].allocation_status !== 'active') {
      await connection.rollback();
      return res.status(400).json({ message: 'This allocation is already past or cancelled.' });
    }

    const room_id = allocRows[0].room_id;

    // Mark allocation as past
    await connection.query(
      `UPDATE room_allocations 
       SET allocation_status = 'past', end_date = CURRENT_DATE 
       WHERE allocation_id = ?`,
      [allocation_id]
    );

    // Update room occupancy
    const [roomRows] = await connection.query(
      'SELECT current_occupancy, maximum_capacity, room_status FROM rooms WHERE room_id = ? FOR UPDATE',
      [room_id]
    );

    if (roomRows.length > 0) {
      const room = roomRows[0];
      const newOccupancy = Math.max(0, room.current_occupancy - 1);
      let newStatus = room.room_status;

      // If it drops below max capacity and isn't under maintenance, make it available
      if (newOccupancy < room.maximum_capacity && room.room_status !== 'Under maintenance') {
        newStatus = 'Available';
      }

      await connection.query(
        'UPDATE rooms SET current_occupancy = ?, room_status = ? WHERE room_id = ?',
        [newOccupancy, newStatus, room_id]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Tenant successfully deallocated from the room.' });
  } catch (error) {
    await connection.rollback();
    console.error('Deallocation Error:', error);
    res.status(500).json({ message: 'Server error during deallocation.', error: error.message });
  } finally {
    connection.release();
  }
};

// Get current allocation for the logged in tenant
const getMyAllocation = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const query = `
      SELECT r.room_number, r.monthly_rent, ra.allocated_date, ra.allocation_status 
      FROM room_allocations ra
      JOIN tenants t ON ra.tenant_id = t.tenant_id
      JOIN rooms r ON ra.room_id = r.room_id
      WHERE t.user_id = ? AND ra.allocation_status = 'active'
    `;
    const [rows] = await db.query(query, [user_id]);
    res.status(200).json(rows.length > 0 ? rows[0] : null);
  } catch (error) {
    console.error('Error fetching my allocation:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getAllTenants, allocateRoom, deallocateRoom, getMyAllocation };
