const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'boarding_house_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Running migration...');
    await pool.query(`DROP TABLE IF EXISTS utility_bills`);
    await pool.query(`
      CREATE TABLE utility_bills (
        utility_bill_id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        billing_month VARCHAR(7) NOT NULL,
        electricity_charge DECIMAL(10, 2) DEFAULT 0.00,
        water_charge DECIMAL(10, 2) DEFAULT 0.00,
        internet_charge DECIMAL(10, 2) DEFAULT 0.00,
        other_charge DECIMAL(10, 2) DEFAULT 0.00,
        total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (electricity_charge + water_charge + internet_charge + other_charge) STORED,
        due_date DATE NOT NULL,
        payment_date DATE,
        status ENUM('paid', 'unpaid', 'late') DEFAULT 'unpaid',
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
      )
    `);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

migrate();
