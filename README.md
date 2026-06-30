# BoardLink - Smart Boarding House Management System

BoardLink is a comprehensive web application designed to streamline the management of boarding houses. It connects property owners, tenants, and maintenance staff into a single, easy-to-use platform, eliminating the need for paper records and manual billing.

## 🌟 Key Features

* **Role-Based Access Control:** Distinct dashboards for Admins, Tenants, and Staff members.
* **Room Management:** Track room availability, types, capacities, and allocate tenants easily.
* **Automated Financial Tracking:** Generate monthly rent and utility invoices. Automatically calculates total outstanding balances for tenants.
* **Maintenance Ticketing:** Tenants can report issues, Admins can assign them to specific staff members, and Staff can update the repair status in real-time.
* **Visitor Logging:** Keep track of who enters the premises for enhanced security.
* **Global Announcements:** Broadcast important notices to all registered tenants instantly.

## 🛠️ Technology Stack

* **Frontend:** React.js, Vite, Bootstrap 5, Axios
* **Backend:** Node.js, Express.js
* **Database:** MySQL (using `mysql2/promise`)
* **Security:** JSON Web Tokens (JWT) for authentication, Bcrypt for password hashing.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

### 1. Database Setup

1. Open your MySQL client (e.g., MySQL Workbench or CLI).
2. Execute the `schema.sql` file located in the `backend/` folder to create the database and required tables.

### 2. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=boarding_house_db
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Run the seed script to populate the database with dummy data (rooms, admin account, tenants, etc.):
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000`.*

### 3. Frontend Setup

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🔐 Default Test Accounts

If you ran the `seed.js` script, you can log in with the following default accounts:

* **Admin:** `admin2@test.com` | Password: `password123`
* **Tenant:** `kasun@test.com` | Password: `password123`
* **Staff:** `staff2@test.com` | Password: `password123`
