const db = require('../config/db');

// Get All Rooms
const getAllRooms = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get Rooms Error:', error);
    res.status(500).json({ message: 'Server error retrieving rooms.', error: error.message });
  }
};

// Get Single Room
const getRoomById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE room_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get Room Error:', error);
    res.status(500).json({ message: 'Server error retrieving room.', error: error.message });
  }
};

// Create Room (Admin only)
const createRoom = async (req, res) => {
  const { room_number, room_type, monthly_rent, maximum_capacity, room_status } = req.body;

  if (!room_number || !monthly_rent || !maximum_capacity) {
    return res.status(400).json({ message: 'Room number, monthly rent, and maximum capacity are required.' });
  }

  try {
    // Check if room number is unique
    const [existingRoom] = await db.query('SELECT room_id FROM rooms WHERE room_number = ?', [room_number]);
    if (existingRoom.length > 0) {
      return res.status(400).json({ message: 'Room number already exists.' });
    }

    const status = room_status || 'Available';

    const [result] = await db.query(
      'INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, room_status) VALUES (?, ?, ?, ?, ?)',
      [room_number, room_type, monthly_rent, maximum_capacity, status]
    );

    res.status(201).json({
      message: 'Room created successfully!',
      room: {
        room_id: result.insertId,
        room_number,
        room_type,
        monthly_rent,
        maximum_capacity,
        room_status: status,
        current_occupancy: 0
      }
    });
  } catch (error) {
    console.error('Create Room Error:', error);
    res.status(500).json({ message: 'Server error creating room.', error: error.message });
  }
};

// Update Room (Admin only)
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_number, room_type, monthly_rent, maximum_capacity, room_status, current_occupancy } = req.body;

  try {
    // Check if room exists
    const [roomRows] = await db.query('SELECT * FROM rooms WHERE room_id = ?', [id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Check if new room number is already taken by another room
    if (room_number && room_number !== roomRows[0].room_number) {
      const [existingNumber] = await db.query('SELECT room_id FROM rooms WHERE room_number = ? AND room_id != ?', [room_number, id]);
      if (existingNumber.length > 0) {
        return res.status(400).json({ message: 'Room number already exists.' });
      }
    }

    const updatedRoomNumber = room_number !== undefined ? room_number : roomRows[0].room_number;
    const updatedRoomType = room_type !== undefined ? room_type : roomRows[0].room_type;
    const updatedRent = monthly_rent !== undefined ? monthly_rent : roomRows[0].monthly_rent;
    const updatedMaxCap = maximum_capacity !== undefined ? maximum_capacity : roomRows[0].maximum_capacity;
    const updatedStatus = room_status !== undefined ? room_status : roomRows[0].room_status;
    const updatedOccupancy = current_occupancy !== undefined ? current_occupancy : roomRows[0].current_occupancy;

    await db.query(
      `UPDATE rooms 
       SET room_number = ?, room_type = ?, monthly_rent = ?, maximum_capacity = ?, room_status = ?, current_occupancy = ? 
       WHERE room_id = ?`,
      [updatedRoomNumber, updatedRoomType, updatedRent, updatedMaxCap, updatedStatus, updatedOccupancy, id]
    );

    res.status(200).json({
      message: 'Room updated successfully!',
      room: {
        room_id: parseInt(id),
        room_number: updatedRoomNumber,
        room_type: updatedRoomType,
        monthly_rent: updatedRent,
        maximum_capacity: updatedMaxCap,
        room_status: updatedStatus,
        current_occupancy: updatedOccupancy
      }
    });
  } catch (error) {
    console.error('Update Room Error:', error);
    res.status(500).json({ message: 'Server error updating room.', error: error.message });
  }
};

// Delete Room (Admin only)
const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if room has current occupants
    const [roomRows] = await db.query('SELECT current_occupancy FROM rooms WHERE room_id = ?', [id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    if (roomRows[0].current_occupancy > 0) {
      return res.status(400).json({ message: 'Cannot delete room. Room currently has tenants allocated.' });
    }

    await db.query('DELETE FROM rooms WHERE room_id = ?', [id]);
    res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('Delete Room Error:', error);
    res.status(500).json({ message: 'Server error deleting room.', error: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
