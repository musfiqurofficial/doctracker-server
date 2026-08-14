# Doctor Tracker — Backend API Server

> Standalone Node.js + Express RESTful API server with MongoDB & Socket.io for Doctor Tracker application.

---

## 1. Description (Elevator Pitch)

Doctor Tracker Backend is a standalone REST API server built with Express, TypeScript, and MongoDB (Mongoose ODM). It provides JWT authentication over httpOnly cookies, rate-limited login, Zod API validation, indexed database queries, MongoDB aggregation analytics, and real-time Socket.io WebSocket notifications for doctor and patient events.

---

## 2. Setup Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB server (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### Installation Steps

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` environment file (copied from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/doctor_tracker
   JWT_SECRET=super_secret_jwt_key_doctor_tracker_2026
   JWT_EXPIRES_IN=1d
   CLIENT_URL=http://localhost:3000
   RATE_LIMIT_WINDOW_MINS=5
   RATE_LIMIT_MAX=5
   ADMIN_EMAIL=admin@doctracker.com
   ADMIN_PASSWORD=AdminSecretPassword123!
   ```
5. Seed default Admin credentials:
   ```bash
   npm run seed
   ```
6. Start the development API server:
   ```bash
   npm run dev
   ```
   The backend API server will run on `http://localhost:5000`.

---

## 3. System Architecture

```
[ Client Application (Port 3000) ]
       │
       ├─► HTTP REST API requests ────► [ Express Middleware & Controllers ]
       │                                         │ (Mongoose ODM)
       │                                         ▼
       │                                 [ MongoDB Database ]
       │
       └─► Socket.io WebSockets   ────► [ Real-Time Event Bus (socket.ts) ]
```

---

## 4. Technical Decisions

1. **Referenced Schema over Embedded Schema for Patients**: `Patient.doctorId` references `Doctor._id`. This prevents unbound document growth inside MongoDB, allows independent server-side pagination, and enables fast query lookups via indexed `doctorId`.
2. **MongoDB Aggregation Pipelines for Analytics**: Analytics stats (`/api/v1/dashboard/stats`) are calculated via MongoDB `$group`, `$facet`, and `$count` pipeline aggregations directly inside the database, avoiding in-memory Node.js processing.
3. **httpOnly Cookie JWT Authentication**: Issue JWT token set in an `httpOnly, Secure, SameSite=Strict` cookie to prevent XSS token theft.

---

## 5. API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Admin login with rate limiting | No |
| `POST` | `/api/v1/auth/logout` | Clear httpOnly JWT cookie | Yes |
| `GET` | `/api/v1/auth/me` | Get current authenticated admin info | Yes |
| `PUT` | `/api/v1/auth/profile` | Update admin profile email | Yes |
| `PUT` | `/api/v1/auth/change-password` | Verify & change admin password | Yes |
| `GET` | `/api/v1/auth/logs` | Get last 3 days login/logout audit logs | Yes |
| `GET` | `/api/v1/doctors` | List doctors with search, filters, pagination | Yes |
| `POST` | `/api/v1/doctors` | Create new doctor | Yes |
| `GET` | `/api/v1/doctors/:id` | Get doctor by ID with patient count | Yes |
| `PUT` | `/api/v1/doctors/:id` | Update doctor profile | Yes |
| `DELETE` | `/api/v1/doctors/:id` | Delete doctor and unlink patients | Yes |
| `GET` | `/api/v1/patients` | List patients with search, filters, pagination | Yes |
| `POST` | `/api/v1/patients` | Create new patient under doctor | Yes |
| `PUT` | `/api/v1/patients/:id` | Update patient record | Yes |
| `DELETE` | `/api/v1/patients/:id` | Delete patient record | Yes |

---

## 6. Submission Credentials & Repository Links

- **Secret Login Route**: `/secretlogin`
- **Default Seed Admin Email**: `admin@doctracker.com`
- **Default Seed Admin Password**: `AdminSecretPassword123!`
- **Frontend Repository**: `https://github.com/musfiqurofficial/doctracker-client.git`
- **Backend Repository**: `https://github.com/musfiqurofficial/doctracker-server.git`

---
# doctracker-server
