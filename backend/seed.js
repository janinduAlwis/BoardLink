const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const seedDatabase = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'boardlink'
    });

    console.log('Connected to database. Starting seed...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Cleaning up old seed data...');
    await connection.execute(`DELETE FROM users WHERE email IN ('admin2@test.com', 'staff2@test.com', 'kasun@test.com', 'amal@test.com')`);
    await connection.execute(`DELETE FROM rooms WHERE room_number IN ('A-101', 'B-201', 'C-301', 'A-102', 'B-202', 'C-302', 'D-401', 'D-402', 'E-501', 'E-502')`);

    // 1. Insert Users
    console.log('Inserting users...');
    const [adminResult] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)`,
      ['Admin Perera', 'admin2@test.com', '0771111111', passwordHash, 1]
    );
    const adminId = adminResult.insertId;

    const [staffResult] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)`,
      ['Sunil Caretaker', 'staff2@test.com', '0772222222', passwordHash, 3]
    );
    const staffId = staffResult.insertId;

    const [user1Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)`,
      ['Kasun Silva', 'kasun@test.com', '0773333333', passwordHash, 2]
    );
    const [tenant1Result] = await connection.execute(
      `INSERT INTO tenants (user_id, nic_number, emergency_contact) VALUES (?, ?, ?)`,
      [user1Result.insertId, '199812345678', '0770000001']
    );
    const tenant1Id = tenant1Result.insertId;

    const [user2Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)`,
      ['Amal Fernando', 'amal@test.com', '0774444444', passwordHash, 2]
    );
    const [tenant2Result] = await connection.execute(
      `INSERT INTO tenants (user_id, nic_number, emergency_contact) VALUES (?, ?, ?)`,
      [user2Result.insertId, '199987654321', '0770000002']
    );
    const tenant2Id = tenant2Result.insertId;

    // 2. Insert Rooms
    console.log('Inserting rooms...');
    const [room1Result] = await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['A-101', 'Single AC', 25000.00, 1, 1, 'Occupied']
    );
    const room1Id = room1Result.insertId;

    const [room2Result] = await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['B-201', 'Double Non-AC', 15000.00, 2, 1, 'Occupied']
    );
    const room2Id = room2Result.insertId;

    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['C-301', 'Single Non-AC', 12000.00, 1, 0, 'Available']
    );

    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['A-102', 'Single AC', 25000.00, 1, 0, 'Available']
    );
    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['B-202', 'Double Non-AC', 15000.00, 2, 0, 'Available']
    );
    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['C-302', 'Single Non-AC', 12000.00, 1, 0, 'Available']
    );
    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['D-401', 'Double AC', 20000.00, 2, 0, 'Available']
    );
    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['D-402', 'Double AC', 20000.00, 2, 0, 'Available']
    );
    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['E-501', 'Triple Non-AC', 10000.00, 3, 0, 'Available']
    );
    await connection.execute(
      `INSERT INTO rooms (room_number, room_type, monthly_rent, maximum_capacity, current_occupancy, room_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['E-502', 'Triple Non-AC', 10000.00, 3, 0, 'Available']
    );

    // 3. Insert Room Allocations
    console.log('Inserting allocations...');
    await connection.execute(
      `INSERT INTO room_allocations (tenant_id, room_id, allocated_date, allocation_status) VALUES (?, ?, '2025-01-01', 'active')`,
      [tenant1Id, room1Id]
    );

    await connection.execute(
      `INSERT INTO room_allocations (tenant_id, room_id, allocated_date, allocation_status) VALUES (?, ?, '2025-02-01', 'active')`,
      [tenant2Id, room2Id]
    );

    // 4. Insert Payments
    console.log('Inserting payments...');
    await connection.execute(
      `INSERT INTO rent_payments (tenant_id, billing_month, rent_amount, due_date, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [tenant1Id, '2026-06-01', 25000.00, '2026-06-05', 'paid', '2026-06-02']
    );
    await connection.execute(
      `INSERT INTO rent_payments (tenant_id, billing_month, rent_amount, due_date, payment_status) VALUES (?, ?, ?, ?, ?)`,
      [tenant1Id, '2026-07-01', 25000.00, '2026-07-05', 'pending_approval']
    );
    await connection.execute(
      `INSERT INTO rent_payments (tenant_id, billing_month, rent_amount, due_date, payment_status) VALUES (?, ?, ?, ?, ?)`,
      [tenant2Id, '2026-06-01', 15000.00, '2026-06-05', 'late']
    );

    // 5. Insert Utilities
    console.log('Inserting utilities...');
    await connection.execute(
      `INSERT INTO utility_bills (tenant_id, billing_month, electricity_charge, water_charge, internet_charge, total_amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenant1Id, '2026-06-01', 1500.00, 500.00, 1000.00, 3000.00, '2026-06-10', 'unpaid']
    );
    await connection.execute(
      `INSERT INTO utility_bills (tenant_id, billing_month, electricity_charge, water_charge, internet_charge, total_amount, due_date, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenant2Id, '2026-05-01', 1200.00, 400.00, 1000.00, 2600.00, '2026-05-10', 'paid', '2026-05-09']
    );

    // 6. Insert Maintenance Requests
    console.log('Inserting maintenance requests...');
    await connection.execute(
      `INSERT INTO maintenance_requests (tenant_id, room_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [tenant1Id, room1Id, 'Leaking Tap', 'The bathroom tap is leaking continuously.', 'medium', 'Submitted']
    );
    await connection.execute(
      `INSERT INTO maintenance_requests (tenant_id, room_id, title, description, priority, status, assigned_staff_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenant2Id, room2Id, 'AC not cooling', 'The AC in my room is blowing warm air.', 'high', 'In Progress', staffId]
    );

    // 7. Insert Visitors
    console.log('Inserting visitors...');
    await connection.execute(
      `INSERT INTO visitors (tenant_id, visitor_name, visit_date, purpose, approval_status) VALUES (?, ?, ?, ?, ?)`,
      [tenant1Id, 'Nimal Perera', '2026-06-30', 'Family Visit', 'pending']
    );
    await connection.execute(
      `INSERT INTO visitors (tenant_id, visitor_name, visit_date, purpose, approval_status) VALUES (?, ?, ?, ?, ?)`,
      [tenant2Id, 'Saman Kumara', '2026-06-25', 'Group Project', 'approved']
    );

    // 8. Insert Announcements
    console.log('Inserting announcements...');
    await connection.execute(
      `INSERT INTO announcements (created_by, title, message) VALUES (?, ?, ?)`,
      [adminId, 'Water Interruption', 'There will be a water cut tomorrow from 10 AM to 2 PM due to main line repairs.']
    );
    await connection.execute(
      `INSERT INTO announcements (created_by, title, message) VALUES (?, ?, ?)`,
      [adminId, 'New Wi-Fi Password', 'The Wi-Fi password for the common area has been changed to BoardLink2026.']
    );

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (connection) await connection.end();
  }
};

seedDatabase();
