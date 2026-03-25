# GymMS — Gym Management System

A full-stack **MERN** web application for managing gym operations including user accounts, role-based access, a complete complaint-handling workflow, and an analytics dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Installation](#5-installation)
6. [Environment Variables](#6-environment-variables)
7. [Running the Backend](#7-running-the-backend)
8. [Running the Frontend](#8-running-the-frontend)
9. [Seed the Database](#9-seed-the-database)
10. [Default Demo Users](#10-default-demo-users)
11. [API Reference](#11-api-reference)
12. [Future Improvements](#12-future-improvements)

---

## 1. Project Overview

GymMS is a production-style gym management platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides four role tiers — **Admin**, **Manager**, **Trainer**, and **Member** — each with a dedicated dashboard and access controls.

The system ships with two core modules:

| Module | Description |
|---|---|
| **User & Access Management** | Registration, login, JWT auth, role-based routing, profile management, account lifecycle (activate / suspend / deactivate) |
| **Complaint Handling** | End-to-end complaint submission, tracking, assignment, escalation, resolution, and a full audit timeline |

---

## 2. Features

### Authentication & Access
- JWT-based authentication (7-day expiry)
- bcrypt password hashing (salt rounds: 10)
- Account status enforcement on login (`active`, `pending`, `suspended`, `deactivated`)
- Role-based route guards on both frontend and backend
- Protected API routes via Bearer token middleware

### User Management *(Admin / Manager)*
- Create, view, search, filter and paginate users
- Filter by role and account status
- Activate / suspend / deactivate accounts
- View per-user activity log
- Upload profile avatar via Multer

### Complaint Handling
- Member submits complaint (title, description, category, priority, attachment)
- Auto-generated complaint ID (`COMP-001`, `COMP-002`, …)
- Due-date set automatically by priority (`urgent/high` → 3 days, `medium` → 7, `low` → 14)
- Admin/Manager can assign, reassign, update status, escalate, and resolve
- Full timeline / audit history for every action and comment
- Internal staff comments
- Resolution notes, corrective action, and root cause fields
- Cron job (daily at midnight) auto-escalates overdue open complaints

### Dashboards
| Role | Dashboard Contents |
|---|---|
| **Admin** | Total users, total/open/overdue complaints, complaints by status & category, recent activity feed |
| **Manager** | Same as Admin — focused on complaint assignment and overdue items |
| **Trainer** | Own complaint submissions, profile summary |
| **Member** | Profile card, membership/subscription card, own complaints |

### Analytics (Admin / Manager)
- Complaints by status, category, priority
- Overdue complaint count
- Average resolution time (hours and days)
- Root cause trend summary

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Backend framework** | Express.js 4 |
| **Database** | MongoDB 6+ (Mongoose 8 ODM) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| **File uploads** | Multer (disk storage, 5 MB limit) |
| **Validation** | `express-validator` |
| **Cron jobs** | `node-cron` |
| **Frontend** | React 18 + Vite 5 |
| **Routing** | React Router v6 |
| **HTTP client** | Axios |
| **Styling** | Plain CSS (CSS custom properties, no framework) |

---

## 4. Folder Structure

```
Gym-Management-System/
├── .gitignore
├── README.md
│
├── server/                         # Express + Node.js backend
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── uploads/                    # Multer upload target (auto-created)
│   └── src/
│       ├── server.js               # Entry point — connects DB, starts server, schedules jobs
│       ├── app.js                  # Express app — middleware, routes, error handler
│       ├── config/
│       │   ├── db.js               # Mongoose connection
│       │   └── constants.js
│       ├── models/
│       │   ├── User.js             # User schema with membership fields
│       │   ├── Complaint.js        # Complaint schema
│       │   ├── ComplaintHistory.js # Per-action audit trail
│       │   └── ActivityLog.js      # System-wide activity log
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── complaintController.js
│       │   └── dashboardController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── userRoutes.js
│       │   ├── complaintRoutes.js
│       │   └── dashboardRoutes.js
│       ├── middleware/
│       │   ├── auth.js             # protect + authorize middleware
│       │   ├── validate.js         # express-validator rule sets
│       │   ├── upload.js           # Multer single / multi config
│       │   └── errorHandler.js     # Centralised error handler
│       ├── jobs/
│       │   └── escalationJob.js    # Daily cron — marks overdue, auto-escalates
│       ├── services/
│       │   └── emailService.js     # Email stub (extend for nodemailer)
│       └── utils/
│           ├── apiResponse.js      # successResponse / errorResponse helpers
│           ├── generateId.js       # Sequential COMP-XXX ID generator
│           └── seeder.js           # Database seed script
│
└── client/                         # React + Vite frontend
    ├── .gitignore
    ├── package.json
    ├── vite.config.js              # Dev proxy: /api → localhost:5000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Router tree + AuthProvider wrapper
        ├── index.css               # Global styles, CSS variables, layout
        ├── context/
        │   └── AuthContext.jsx     # Auth state, login/logout, updateUser
        ├── services/
        │   └── api.js              # Axios instance + all service modules
        ├── components/
        │   ├── Alert.jsx
        │   ├── Badge.jsx           # Role / status / priority colour badges
        │   ├── LoadingSpinner.jsx
        │   ├── Modal.jsx
        │   ├── Pagination.jsx
        │   ├── PrivateRoute.jsx    # Auth + role guard wrapper
        │   ├── Sidebar.jsx
        │   ├── StatCard.jsx
        │   ├── Table.jsx
        │   └── Topbar.jsx
        ├── layouts/
        │   ├── AuthLayout.jsx      # Centred card layout for login/register
        │   └── DashboardLayout.jsx # Sidebar + topbar shell
        ├── pages/
        │   ├── Dashboard.jsx       # Role-aware dashboard home
        │   ├── Profile.jsx
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── users/
        │   │   ├── UserManagement.jsx
        │   │   └── UserDetail.jsx
        │   └── complaints/
        │       ├── ComplaintsList.jsx
        │       ├── NewComplaint.jsx
        │       └── ComplaintDetail.jsx
        └── styles/
            ├── auth.css
            ├── complaints.css
            ├── dashboard.css
            └── sidebar.css
```

---

## 5. Installation

### Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| MongoDB | 6.x (local) *or* a MongoDB Atlas connection string |

### Clone and install

```bash
# Clone the repository
git clone https://github.com/IT24104076/Gym-Management-System.git
cd Gym-Management-System

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## 6. Environment Variables

Create `server/.env` by copying the example file:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gym_management

# JWT
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRE=7d

# File uploads
UPLOAD_PATH=uploads
```

> **Security note:** Never commit `.env` to version control. The `.gitignore` in `server/` already excludes it.

---

## 7. Running the Backend

```bash
cd server

# Development (auto-restart via nodemon)
npm run dev

# Production
npm start
```

The API will be available at **http://localhost:5000**.

Health check:
```
GET http://localhost:5000/api/health
→ { "success": true, "message": "Gym Management API is running" }
```

---

## 8. Running the Frontend

```bash
cd client

# Development server (Vite, hot-reload)
npm run dev
```

The app will open at **http://localhost:3000**.

Vite is configured to proxy all `/api` requests to `http://localhost:5000`, so no CORS issues during local development.

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview
```

---

## 9. Seed the Database

The seed script creates 6 users, 5 complaints with full lifecycle histories, and activity logs.

> ⚠️ **This will wipe and replace all existing data** in the `gym_management` database.

```bash
cd server
npm run seed
```

Expected output:

```
MongoDB connected: 127.0.0.1
🗑  Clearing existing data…
👤  Creating users…
📋  Creating complaints…
🕑  Creating complaint histories…
📝  Creating activity logs…

✅  Seed completed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ROLE      │ EMAIL                  │ PASSWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Admin     │ admin@gymms.com         │ password123
  Manager   │ manager@gymms.com       │ password123
  Trainer   │ trainer@gymms.com       │ password123
  Member    │ alice@gymms.com         │ password123
  Member    │ bob@gymms.com           │ password123
  Member    │ carol@gymms.com         │ password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 10. Default Demo Users

After seeding, the following accounts are available:

| Role | Name | Email | Password | Membership |
|---|---|---|---|---|
| **Admin** | Sarah Mitchell | `admin@gymms.com` | `password123` | — |
| **Manager** | James Carter | `manager@gymms.com` | `password123` | — |
| **Trainer** | Marcus Johnson | `trainer@gymms.com` | `password123` | — |
| **Member** | Alice Thompson | `alice@gymms.com` | `password123` | Premium |
| **Member** | Bob Williams | `bob@gymms.com` | `password123` | Standard |
| **Member** | Carol Davis | `carol@gymms.com` | `password123` | Basic |

### Seeded complaints

| ID | Title | Category | Priority | Status |
|---|---|---|---|---|
| COMP-001 | Treadmill in Zone A is broken | equipment | high | in_progress |
| COMP-002 | Double charge on October membership fee | billing | urgent | escalated |
| COMP-003 | Locker room not cleaned for several days | cleanliness | medium | open |
| COMP-004 | Personal trainer missed scheduled session | trainer | medium | resolved |
| COMP-005 | Unable to log in to the gym mobile app | technical | low | closed |

---

## 11. API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login and receive JWT |
| `POST` | `/logout` | 🔒 Any | Logout (logs the event) |
| `GET` | `/me` | 🔒 Any | Get current user profile |
| `PUT` | `/change-password` | 🔒 Any | Change own password |

**Register body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "phone": "+1-555-0100",
  "role": "member"
}
```

**Login body:**
```json
{ "email": "alice@gymms.com", "password": "password123" }
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Alice Thompson", "role": "member", "status": "active", ... }
  }
}
```

---

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | 🔒 Admin, Manager | List all users (search, filter, paginate) |
| `GET` | `/stats` | 🔒 Admin, Manager | User counts by role and status |
| `GET` | `/:id` | 🔒 Any | Get single user |
| `PUT` | `/profile` | 🔒 Any | Update own profile + avatar upload |
| `PATCH` | `/:id/activate` | 🔒 Admin, Manager | Activate a user account |
| `PATCH` | `/:id/suspend` | 🔒 Admin, Manager | Suspend a user account |
| `PATCH` | `/:id/deactivate` | 🔒 Admin, Manager | Deactivate a user account |
| `GET` | `/:id/activity` | 🔒 Admin, Manager | Get activity log for a user |
| `DELETE` | `/:id` | 🔒 Admin | Soft-delete (deactivates) a user |

**Query parameters for `GET /`:**

| Param | Type | Example |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `10` |
| `search` | string | `alice` |
| `role` | string | `member` |
| `status` | string | `active` |
| `sortBy` | string | `createdAt` |
| `order` | string | `desc` |

---

### Complaints — `/api/complaints`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔒 Any | Submit a new complaint (multipart/form-data) |
| `GET` | `/` | 🔒 Any | List complaints (members see own only) |
| `GET` | `/my` | 🔒 Member, Trainer | List own complaints |
| `GET` | `/:id` | 🔒 Any | Get complaint + history |
| `PATCH` | `/:id/status` | 🔒 Admin, Manager | Update complaint status |
| `PATCH` | `/:id/assign` | 🔒 Admin, Manager | Assign complaint to a user |
| `POST` | `/:id/comments` | 🔒 Any | Add comment / internal note |
| `PATCH` | `/:id/escalate` | 🔒 Admin, Manager | Manually escalate complaint |
| `PATCH` | `/:id/resolve` | 🔒 Admin, Manager | Resolve with notes, corrective action, root cause |
| `GET` | `/:id/history` | 🔒 Any | Get full complaint timeline |
| `DELETE` | `/:id` | 🔒 Admin | Delete complaint and its history |

**Submit complaint body (`multipart/form-data`):**

| Field | Type | Required |
|---|---|---|
| `title` | string | ✅ |
| `description` | string | ✅ |
| `category` | enum | ✅ `membership \| billing \| trainer \| facility \| equipment \| cleanliness \| technical \| other` |
| `priority` | enum | optional `low \| medium \| high \| urgent` (default: `medium`) |
| `attachments` | file(s) | optional, max 5 × 5 MB |

**Complaint statuses:** `open` → `acknowledged` → `in_progress` → `awaiting_customer` → `resolved` → `closed` | `escalated` | `rejected`

---

### Dashboard — `/api/dashboard`

All routes require Admin or Manager role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Complaint totals, by-status/category/priority, overdue count, total users |
| `GET` | `/resolution-metrics` | Average resolution time in hours and days |
| `GET` | `/root-cause-trends` | Top root causes from resolved complaints |
| `GET` | `/user-stats` | User counts by role and status |
| `GET` | `/recent-activity` | Latest 15 activity log entries |

**Stats response shape:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 6,
    "totalComplaints": 5,
    "openComplaints": 1,
    "overdueComplaints": 2,
    "complaintsByStatus": [{ "_id": "in_progress", "count": 1 }, ...],
    "complaintsByCategory": [{ "_id": "billing", "count": 1 }, ...],
    "complaintsByPriority": [{ "_id": "urgent", "count": 1 }, ...]
  }
}
```

---

### Consistent response envelope

Every response follows this shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null
}
```

Pagination meta is included inline:
```json
{
  "data": {
    "users": [...],
    "pagination": { "total": 42, "page": 1, "limit": 10, "pages": 5 }
  }
}
```

---

## 12. Future Improvements

| Area | Improvement |
|---|---|
| **Notifications** | Real-time in-app notifications via Socket.io when a complaint status changes |
| **Email** | Nodemailer integration to email members on status changes and resolution |
| **Membership** | Dedicated membership/subscription model with payment tracking and renewal reminders |
| **Workout schedules** | Trainer-assigned workout plans visible on the member dashboard |
| **Charts** | Chart.js or Recharts integration on the analytics dashboard |
| **Unit & integration tests** | Jest + Supertest for backend; Vitest + React Testing Library for frontend |
| **Refresh tokens** | Short-lived access tokens + long-lived refresh token rotation |
| **Two-factor auth** | TOTP-based 2FA for admin and manager accounts |
| **Audit log UI** | Admin page to browse and filter the full ActivityLog |
| **Docker** | `docker-compose.yml` for one-command local development |
| **CI/CD** | GitHub Actions pipeline — lint, test, build, deploy |
| **Rate limiting** | `express-rate-limit` on auth routes to prevent brute-force attacks |

---

## License

MIT © 2024 IT24104076
