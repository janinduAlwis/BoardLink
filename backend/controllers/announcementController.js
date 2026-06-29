const db = require('../config/db');

// All authenticated users: Get announcements
const getAnnouncements = async (req, res) => {
  try {
    const query = `
      SELECT a.announcement_id, a.title, a.message, a.created_at, u.full_name AS author_name
      FROM announcements a
      JOIN users u ON a.created_by = u.user_id
      ORDER BY a.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Create an announcement
const createAnnouncement = async (req, res) => {
  const admin_id = req.user.user_id;
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    await db.query(
      'INSERT INTO announcements (title, message, created_by) VALUES (?, ?, ?)',
      [title, message, admin_id]
    );
    res.status(201).json({ message: 'Announcement created successfully.' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Delete an announcement
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM announcements WHERE announcement_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }
    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
