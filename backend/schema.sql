CREATE DATABASE IF NOT EXISTS boarding_house_db;
USE boarding_house_db;

-- 1. roles table
CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 3. rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type VARCHAR(50),
  monthly_rent DECIMAL(10, 2) NOT NULL,
  maximum_capacity INT NOT NULL,
  current_occupancy INT DEFAULT 0,
  room_status ENUM('Available', 'Occupied', 'Reserved', 'Under maintenance') DEFAULT 'Available'
);

-- 4. tenants table
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nic_number VARCHAR(20) NOT NULL UNIQUE,
  emergency_contact VARCHAR(20) NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. room_allocations table
CREATE TABLE IF NOT EXISTS room_allocations (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_id INT NOT NULL,
  allocated_date DATE NOT NULL,
  end_date DATE,
  allocation_status ENUM('active', 'past', 'cancelled') DEFAULT 'active',
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- 6. rent_payments table
CREATE TABLE IF NOT EXISTS rent_payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  billing_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  rent_amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  payment_status ENUM('paid', 'unpaid', 'late', 'pending_approval') DEFAULT 'unpaid',
  payment_proof VARCHAR(255),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- 7. utility_bills table
CREATE TABLE IF NOT EXISTS utility_bills (
  utility_bill_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  billing_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  electricity_charge DECIMAL(10, 2) DEFAULT 0.00,
  water_charge DECIMAL(10, 2) DEFAULT 0.00,
  internet_charge DECIMAL(10, 2) DEFAULT 0.00,
  other_charge DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (electricity_charge + water_charge + internet_charge + other_charge) STORED,
  due_date DATE NOT NULL,
  payment_date DATE,
  status ENUM('paid', 'unpaid', 'late') DEFAULT 'unpaid',
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- 8. maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('Submitted', 'Assigned', 'In Progress', 'Completed') DEFAULT 'Submitted',
  assigned_staff_id INT, -- Refers to user_id of a staff member
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_staff_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 9. visitors table
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  visitor_name VARCHAR(100) NOT NULL,
  visit_date DATE NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  purpose VARCHAR(255),
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- 10. announcements table
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INT AUTO_INCREMENT PRIMARY KEY,
  created_by INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Insert Default Roles
INSERT IGNORE INTO roles (role_id, role_name) VALUES 
(1, 'Admin'), 
(2, 'Tenant'), 
(3, 'Staff');
