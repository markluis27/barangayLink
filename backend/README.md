# Barangay Tinurik Portal - Backend API

The REST API backend for the **Barangay Tinurik Document Request and Tracking System**. Built with Node.js, Express, PostgreSQL, JWT authentication, and bcrypt password hashing.

Designed for deployment on **AWS EC2 Instance 2 (tinurik-backend)**.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (with SQLite fallback for local zero-setup dev)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Network Protocol:** HTTP REST API (JSON)
- **Default Port:** `5000`

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Unified database pool and adapter
│   ├── controllers/
│   │   ├── authController.js     # Register, login, getMe
│   │   ├── dashboardController.js# Stats for resident and admin
│   │   ├── documentRequestController.js # Full request CRUD + history
│   │   ├── documentTypeController.js    # Document types management
│   │   └── userController.js     # Resident accounts & deactivation
│   ├── middleware/
│   │   └── auth.js               # JWT verification & Admin RBAC
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── documentTypeRoutes.js
│   │   ├── requestRoutes.js
│   │   └── userRoutes.js
│   └── server.js                 # Express server & CORS
├── database/
│   ├── schema.sql                # PostgreSQL table definitions
│   ├── seed.sql                  # Initial accounts & document types
│   └── init-db.js                # Database migration CLI runner
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database
#### Option A: Using PostgreSQL
Make sure PostgreSQL is running and a database named `barangay_tinurik` exists:
```bash
createdb -U postgres barangay_tinurik
npm run db:init
```

#### Option B: Zero-Setup SQLite Fallback
If PostgreSQL is not yet installed on your local machine, keep `USE_SQLITE=true` in `.env`. The backend will automatically create and seed an embedded database (`database/tinurik.sqlite`) with identical schemas and constraints!

### 4. Start the Server
```bash
npm start
# Server listens on http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@tinurik.gov.ph` | `Admin123!` |
| **Resident** | `user@tinurik.gov.ph` | `User123!` |

---

## 📡 REST API Reference

### Health Check
- `GET /api/health` - Check backend status and DB driver

### Authentication
- `POST /api/auth/register` - Register a new resident user
- `POST /api/auth/login` - Authenticate admin or resident
- `GET /api/auth/me` - Get current session user

### Document Requests
- `POST /api/requests` - Submit document request (Resident)
- `GET /api/requests` - List requests (Admin gets all, Resident gets own)
- `GET /api/requests/:id` - Get request details & tracking history
- `PUT /api/requests/:id` - Edit pending request details
- `PATCH /api/requests/:id/status` - Approve, reject (reason required), or complete (Admin)
- `DELETE /api/requests/:id` - Cancel pending request (Resident) or delete (Admin)

### Document Types
- `GET /api/document-types` - Get active document types (Admins can pass `?all=true`)
- `POST /api/document-types` - Create new document type (Admin)
- `PUT /api/document-types/:id` - Update document type (Admin)
- `DELETE /api/document-types/:id` - Delete or deactivate document type (Admin)

### Resident Management
- `GET /api/users` - View registered residents (Admin)
- `GET /api/users/:id` - View single user profile
- `PUT /api/users/:id` - Update user information
- `PATCH /api/users/:id/status` - Deactivate/activate resident account (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Summary counts (residents, total, pending, approved, completed)
