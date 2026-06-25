const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const utilityRoutes = require('./routes/utilityRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/utilities', utilityRoutes);

app.get('/', (req, res) => {
  res.send('Smart Boarding House Management System API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Test DB connection
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('Successfully connected to the MySQL Database!');
  } catch (error) {
    console.error('Failed to connect to the Database:', error.message);
  }
});
