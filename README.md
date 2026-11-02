# Barangay Tinurik Portal: Document Request and Tracking System

[![System Architecture](https://img.shields.io/badge/Architecture-Decoupled%20Dual--EC2-orange.svg)](#system-architecture)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-blue.svg)](file:///frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20PostgreSQL-green.svg)](file:///backend)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](#license)

A clean, production-ready, beginner-friendly web application engineered to demonstrate how two independently deployable applications (**Frontend** and **Backend**) run on two separate **AWS EC2 instances** and communicate seamlessly via REST APIs.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features & Role Capabilities](#key-features--role-capabilities)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Prerequisites](#prerequisites)
7. [Local Development Setup](#local-development-setup)
   - [A. Backend Setup](#a-backend-setup)
   - [B. Frontend Setup](#b-frontend-setup)
8. [Demo Credentials](#demo-credentials)
9. [REST API Documentation & Sample Requests](#rest-api-documentation--sample-requests)
10. [Testing the CRUD Operations](#testing-the-crud-operations)
11. [AWS EC2 Deployment Guide](#aws-ec2-deployment-guide)
    - [Architecture Blueprint](#architecture-blueprint)
    - [Configuring AWS Security Groups](#configuring-aws-security-groups)
    - [Deploying Backend to EC2 Instance 2](#deploying-backend-to-ec2-instance-2)
    - [Deploying Frontend to EC2 Instance 1](#deploying-frontend-to-ec2-instance-1)
    - [Verifying Frontend-to-Backend Connectivity](#verifying-frontend-to-backend-connectivity)
12. [Future Laboratory: AWS Application Load Balancer (ALB) & Auto Scaling](#future-laboratory-aws-application-load-balancer-alb--auto-scaling)
13. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## 🏛 Project Overview

The **Barangay Tinurik Portal** enables constituents of Barangay Tinurik (City of Tanauan, Batangas) to request official barangay documents online and track their application progress through a visual workflow timeline.

The core learning objective of this project is to demonstrate:
- **Two separate codebases**: A Client Single Page Application (SPA) and a Server REST API.
- **Independent hosting**: Frontend on **EC2 Instance 1**, Backend on **EC2 Instance 2**.
- **Network communication**: The browser/frontend sends HTTP requests across public/private IP addresses to the Backend REST API.
- **Relational database persistence**: PostgreSQL stores users, document types, requests, and complete status audit histories.

---

## 👥 Key Features & Role Capabilities

### A. Resident / Constituent (User Role)
- **Account Registration & Login**: Secure signup with verified barangay address and contact details.
- **Resident Dashboard**: Real-time counter of total, pending, approved, and completed requests.
- **Submit Document Requests**: Apply for official certifications with custom purpose notes.
- **Live Visual Tracking**: Step-by-step progression tracker (`Pending` → `Approved` → `Completed`, or `Rejected` with official remarks).
- **Edit Pending Requests**: Modify contact information or purpose while in `Pending` review.
- **Cancel Requests**: Delete pending requests before they are locked for processing.
- **Profile Management**: Keep contact number and street address up-to-date.
- **Data Privacy**: Residents can strictly access only their own records; cross-resident data access is blocked by authorization middleware.

### B. Barangay Administrator (Admin Role)
- **Administrative Dashboard**: Real-time KPI statistics across all residents and requests.
- **Document Requests Management**:
  - Filter requests by status (`Pending`, `Approved`, `Rejected`, `Completed`) or document type.
  - Approve requests to move them into processing.
  - Reject requests with a **mandatory written reason** displayed to the resident.
  - Mark approved requests as **Completed** once issued and claimed at the barangay hall.
  - Edit or delete duplicate and invalid requests.
- **Document Types Management**: Create new clearance types, edit descriptions, or toggle active availability.
- **Resident Management**: Inspect registered constituents, view request counts, update contact information, or deactivate suspicious accounts.
- **Self-Protection Guard**: The system strictly prevents administrators from accidentally deactivating or deleting their own account.

---

## 🏗 System Architecture

The project strictly decouples presentation from application logic and database persistence:

```mermaid
flowchart TD
    subgraph Client["Resident & Admin Devices (Web Browser)"]
        Browser["User Web Browser"]
    end

    subgraph EC2_1["AWS EC2 Instance 1 (tinurik-frontend)"]
        Nginx["Nginx Web Server (Port 80 / 443)"]
        ReactApp["React 18 SPA (Vite Production Build)"]
        Nginx --> ReactApp
    end

    subgraph EC2_2["AWS EC2 Instance 2 (tinurik-backend)"]
        Express["Express.js REST API (Port 5000)"]
        AuthMiddleware["JWT Auth & Role Guard"]
        Controllers["Controllers & Business Logic"]
        Express --> AuthMiddleware --> Controllers
    end

    subgraph Database["Database Tier (EC2 #2 or AWS RDS)"]
        Postgres[("PostgreSQL Database (Port 5432)")]
        Controllers --> Postgres
    end

    Browser -- "1. Loads UI via HTTP (Port 80)" --> Nginx
    Browser -- "2. REST API Calls via VITE_API_URL (Port 5000)" --> Express
```

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | React 18, Vite | Component-driven reactive user interface |
| **Styling** | Tailwind CSS | Clean, responsive government portal styling |
| **Icons** | Lucide React | Modern, accessible iconography |
| **Backend API** | Node.js (v18+ / v20+), Express.js | High-throughput REST API routing & middleware |
| **Database** | PostgreSQL (v14+) | ACID-compliant relational data store with foreign key cascades |
| **Local Fallback** | better-sqlite3 | Embedded zero-setup database fallback for rapid offline testing |
| **Authentication**| JSON Web Tokens (JWT) | Stateless token-based session management |
| **Password Security**| bcryptjs (Cost 10) | One-way cryptographic password hashing |
| **Deployment** | AWS EC2, Nginx, Systemd | Scalable Linux virtual instances with daemon process control |

---

## 📁 Folder Structure

```
barangay-tinurik-portal/
├── frontend/                     # APPLICATION 1: REACT FRONTEND
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js            # REST API client consuming EC2 Backend
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx  # Confirmation dialog for critical actions
│   │   │   ├── Footer.jsx        # Government portal footer
│   │   │   ├── Modal.jsx         # Accessible modal container
│   │   │   ├── Navbar.jsx        # Header with live EC2 Backend status indicator
│   │   │   ├── StatusBadge.jsx   # Color-coded workflow badges
│   │   │   └── TrackingTimeline.jsx # Visual step-by-step progress & history
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context & session token
│   │   ├── pages/
│   │   │   ├── About.jsx         # Barangay Tinurik history & leadership
│   │   │   ├── AdminDashboard.jsx# Full admin console with CRUD
│   │   │   ├── Documents.jsx     # Document catalog & guidelines
│   │   │   ├── Home.jsx          # Public landing page
│   │   │   ├── Login.jsx         # Sign-in with 1-click demo accounts
│   │   │   ├── Register.jsx      # Resident signup
│   │   │   └── ResidentDashboard.jsx # Resident request submission & tracking
│   │   ├── App.jsx               # Main router & layout
│   │   ├── index.css             # Tailwind CSS directives
│   │   └── main.jsx              # React DOM entry point
│   ├── .env.example              # Sample frontend environment config
│   ├── index.html                # HTML template
│   ├── package.json              # Frontend scripts & dependencies
│   ├── tailwind.config.js        # Custom Barangay Tinurik color palette
│   ├── vite.config.js            # Vite bundler configuration
│   └── README.md
│
├── backend/                      # APPLICATION 2: NODE.JS / EXPRESS BACKEND
│   ├── database/
│   │   ├── schema.sql            # PostgreSQL schema definitions
│   │   ├── seed.sql              # Initial demo accounts & document types
│   │   └── init-db.js            # Migration CLI runner
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # Universal PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js # Signup, login, session verify
│   │   │   ├── dashboardController.js # Statistics calculation
│   │   │   ├── documentRequestController.js # Request CRUD & status history
│   │   │   ├── documentTypeController.js    # Document types CRUD
│   │   │   └── userController.js # Resident directory & deactivation
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication & admin authorization
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /api/auth routes
│   │   │   ├── dashboardRoutes.js# /api/dashboard routes
│   │   │   ├── documentTypeRoutes.js # /api/document-types routes
│   │   │   ├── requestRoutes.js  # /api/requests routes
│   │   │   └── userRoutes.js     # /api/users routes
│   │   └── server.js             # Express app, CORS, health check
│   ├── test/
│   │   └── api.test.js           # 22-step automated integration test suite
│   ├── .env.example              # Sample backend environment config
│   ├── package.json              # Backend scripts & dependencies
│   └── README.md
│
├── aws-deploy/                   # AWS DEPLOYMENT TEMPLATES
│   ├── nginx/
│   │   └── tinurik-frontend.conf # Nginx configuration for EC2 Instance 1
│   ├── systemd/
│   │   └── tinurik-backend.service # Systemd daemon file for EC2 Instance 2
│   ├── setup-ec2-backend.sh      # Automated bash script for EC2 #2
│   └── setup-ec2-frontend.sh     # Automated bash script for EC2 #1
│
└── README.md                     # Master documentation
```

---

## ⚙️ Prerequisites

- **Node.js**: Version `18.0.0` or higher (`20.x LTS` recommended).
- **NPM**: Version `9.x` or higher.
- **PostgreSQL**: Version `12` or higher (or use the built-in SQLite auto-fallback for local development).
- **Git**: Installed for version control.
- **AWS Account**: With permissions to launch EC2 instances and configure Security Groups.

---

## 🚀 Local Development Setup

You can run both applications locally on your computer before deploying to AWS.

### A. Backend Setup

1. Open your terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env

   # On Linux/macOS:
   cp .env.example .env
   ```

4. Database Setup:
   - **Option 1 (Zero-Setup Fallback - Recommended for Students):** Keep `USE_SQLITE=true` in `.env`. The backend will automatically create and seed an embedded database file (`backend/database/tinurik.sqlite`) with identical schemas and constraints.
   - **Option 2 (PostgreSQL):** Ensure PostgreSQL is running locally, create a database named `barangay_tinurik`, and run the initialization script:
     ```bash
     npm run db:init
     ```

5. Start the Backend API server:
   ```bash
   npm start
   ```
   *The backend will listen on `http://localhost:5000`.*
   *Verify health status by opening `http://localhost:5000/api/health` in your browser.*

---

### B. Frontend Setup

1. Open a **new terminal tab** and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create the frontend environment configuration:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env

   # On Linux/macOS:
   cp .env.example .env
   ```

4. Ensure `.env` points to the local backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*
   *Open your browser to `http://localhost:3000` to interact with the portal!*

---

## 🔑 Demo Credentials

The database comes pre-seeded with two demonstration accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@tinurik.gov.ph` | `Admin123!` | Full administrative dashboard, request processing, document type management, and resident directory. |
| **Resident** | `user@tinurik.gov.ph` | `User123!` | Resident dashboard, submit document requests, visual tracking, and personal profile. |

> [!TIP]
> On the **Login** page, you can click the **"Admin Demo"** or **"Resident Demo"** buttons to auto-fill these credentials instantly with a single click!

---

## 📡 REST API Documentation & Sample Requests

All protected endpoints require the HTTP Header: `Authorization: Bearer <JWT_TOKEN>`.

### 1. System Health
- **`GET /api/health`**
  - **Description:** Verifies service uptime, database driver, and system status (used by AWS ALB target groups).
  - **Sample Response:**
    ```json
    {
      "status": "HEALTHY",
      "service": "Barangay Tinurik Portal - Backend API",
      "timestamp": "2026-11-02T11:38:00.000Z",
      "uptimeSeconds": 1420,
      "databaseDriver": "postgres",
      "environment": "development"
    }
    ```

### 2. Authentication
- **`POST /api/auth/register`**
  - **Body:** `{ "full_name": "Juan Dela Cruz", "email": "juan@tinurik.ph", "password": "Password123!", "address": "Purok 2", "contact_number": "0917-123-4567" }`
- **`POST /api/auth/login`**
  - **Body:** `{ "email": "user@tinurik.gov.ph", "password": "User123!" }`
  - **Response:** Returns `{ "success": true, "token": "...", "user": { ... } }`
- **`GET /api/auth/me`**
  - **Description:** Returns profile details for the authenticated user.

### 3. Document Requests
- **`POST /api/requests`**
  - **Description:** Submit a document request.
  - **Body:**
    ```json
    {
      "document_type_id": 1,
      "full_name": "Juan Dela Cruz",
      "address": "Purok 3, Barangay Tinurik",
      "contact_number": "0998-765-4321",
      "purpose": "Employment requirement for manufacturing facility"
    }
    ```
- **`GET /api/requests`**
  - **Query Parameters:** `?status=Pending&search=Juan`
  - **Authorization:** Admins receive all requests; Residents strictly receive only their own requests.
- **`GET /api/requests/:id`**
  - **Description:** Retrieves request details along with complete chronological status history entries.
- **`PUT /api/requests/:id`**
  - **Description:** Edit request details (Allowed for residents only while status is `Pending`).
- **`PATCH /api/requests/:id/status`** *(Admin Only)*
  - **Description:** Approve, reject, or complete a request.
  - **Body (Reject):**
    ```json
    {
      "status": "Rejected",
      "rejection_reason": "Proof of residency address incomplete. Please resubmit with Purok number."
    }
    ```
- **`DELETE /api/requests/:id`**
  - **Description:** Cancel/delete request (Allowed for residents if `Pending`; Admins can delete invalid/duplicate records).

### 4. Document Types
- **`GET /api/document-types`** (Active types for residents; pass `?all=true` for admin view)
- **`POST /api/document-types`** *(Admin Only)*
- **`PUT /api/document-types/:id`** *(Admin Only)*
- **`DELETE /api/document-types/:id`** *(Admin Only)*

### 5. Resident Directory
- **`GET /api/users`** *(Admin Only)* - List residents with request counts
- **`PUT /api/users/:id`** - Update profile information
- **`PATCH /api/users/:id/status`** *(Admin Only)* - Deactivate or re-activate account

---

## 🧪 Testing the CRUD Operations

An automated end-to-end integration test suite is included in `backend/test/api.test.js`. It runs 22 comprehensive assertions covering all role rules, validation constraints, and security guards.

To run the automated test suite:
```bash
cd backend
node test/api.test.js
```

### Manual Testing Flow

1. **Resident Flow:**
   - Log in as `user@tinurik.gov.ph` / `User123!`.
   - On the Resident Dashboard, click **"New Document Request"**.
   - Select **"Barangay Clearance"**, enter a purpose (e.g., *"Job Application"*), and submit.
   - Observe the new request appears in the table with status `Pending`.
   - Click the **"Track"** button to view the live 3-step progression and audit entry.
   - Click the **"Edit"** pencil icon to update the purpose. Confirm the update succeeds.

2. **Admin Review Flow:**
   - Log out and log in as `admin@tinurik.gov.ph` / `Admin123!`.
   - Notice the **Pending Review** counter has incremented.
   - Go to the **Document Requests** tab.
   - Find the resident's request and click **"Approve"**.
   - Log back into the resident account: notice the status badge has changed to **Approved** with an updated timeline!
   - Return to Admin: click **"Complete"** to simulate releasing the document at the barangay hall counter.

3. **Rejection Validation Test:**
   - Submit another request as resident.
   - As admin, attempt to reject without a reason: the system prevents the action and requires a reason.
   - Enter a reason (e.g. *"Duplicate application"*) and submit.
   - As resident, open the tracking modal: the official reason callout is prominently displayed in red.

4. **Self-Deactivation Protection Guard:**
   - As admin, go to **Registered Residents**.
   - Attempt to deactivate your own admin account.
   - Confirm that the system blocks the action with: *"You cannot deactivate your own administrative account."*

---

## ☁️ AWS EC2 Deployment Guide

This guide walks you through deploying the two decoupled applications across two separate AWS EC2 instances running Ubuntu 22.04 LTS.

```mermaid
flowchart LR
    subgraph Internet["Public Internet"]
        UserBrowser["User Browser"]
    end

    subgraph AWS["AWS Virtual Private Cloud (VPC)"]
        subgraph SG_FE["Security Group: sg-tinurik-frontend"]
            FE_EC2["EC2 Instance 1: tinurik-frontend<br/>React + Nginx<br/>Ports: 80, 443, 22"]
        end

        subgraph SG_BE["Security Group: sg-tinurik-backend"]
            BE_EC2["EC2 Instance 2: tinurik-backend<br/>Node.js REST API + PostgreSQL<br/>Ports: 5000, 22"]
        end
    end

    UserBrowser -- "HTTP :80" --> FE_EC2
    UserBrowser -- "REST API :5000" --> BE_EC2
    FE_EC2 -. "Inbound SG rule: 5000" .-> BE_EC2
```

---

### Step 1: Launch Two AWS EC2 Instances

1. Sign in to the **AWS Management Console** and open the **EC2 Dashboard**.
2. Click **Launch Instances** and create two instances with the following settings:

| Setting | EC2 Instance 1 (Frontend) | EC2 Instance 2 (Backend) |
|---|---|---|
| **Instance Name** | `tinurik-frontend` | `tinurik-backend` |
| **AMI** | Ubuntu Server 22.04 LTS (HVM) | Ubuntu Server 22.04 LTS (HVM) |
| **Instance Type** | `t2.micro` or `t3.micro` (Free Tier eligible) | `t2.micro` or `t3.micro` (Free Tier eligible) |
| **Key Pair** | Select or create an SSH key pair (`.pem`) | Use the same key pair |
| **Auto-assign Public IP** | **Enable** | **Enable** |

---

### Step 2: Configure AWS Security Groups

Create two distinct Security Groups to enforce network segregation:

#### 1. Security Group 1: `sg-tinurik-frontend` (Attached to EC2 Instance 1)
- **Inbound Rules:**
  - **SSH (Port 22):** Source: `My IP` (Restricted to administrator's IP).
  - **HTTP (Port 80):** Source: `0.0.0.0/0` (Anywhere - allows residents to access the web portal).
  - **HTTPS (Port 443):** Source: `0.0.0.0/0` (Anywhere - for SSL/TLS certificates).
  - **Custom TCP (Port 3000):** Source: `0.0.0.0/0` (Optional - for Vite preview testing).

#### 2. Security Group 2: `sg-tinurik-backend` (Attached to EC2 Instance 2)
- **Inbound Rules:**
  - **SSH (Port 22):** Source: `My IP` (Restricted to administrator's IP).
  - **Custom TCP (Port 5000):** Source: `0.0.0.0/0` (Allows browsers to make cross-origin REST calls to the backend API).
    > [!IMPORTANT]
    > **Port 5432 (PostgreSQL) must NEVER be exposed to `0.0.0.0/0`**. The database is accessed locally on `localhost:5432` by the Express API running on the same instance, protecting resident data from public exposure.

---

### Step 3: Deploy Backend to EC2 Instance 2 (`tinurik-backend`)

1. Connect to EC2 Instance 2 via SSH:
   ```bash
   ssh -i your-key.pem ubuntu@<EC2_BACKEND_PUBLIC_IP>
   ```

2. Update system packages and install Node.js 20 & PostgreSQL:
   ```bash
   sudo apt-get update -y
   sudo apt-get install -y curl git postgresql postgresql-contrib

   # Install Node.js LTS
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Configure PostgreSQL Database:
   ```bash
   # Set a password for the postgres database user
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'PostgresSecure2026!';"

   # Create the barangay_tinurik database
   sudo -u postgres psql -c "CREATE DATABASE barangay_tinurik;"
   ```

4. Clone or transfer the project files to `/home/ubuntu/barangay-tinurik-portal`:
   ```bash
   cd /home/ubuntu
   git clone <YOUR_REPOSITORY_URL> barangay-tinurik-portal
   cd barangay-tinurik-portal/backend
   ```

5. Install dependencies:
   ```bash
   npm install --production
   ```

6. Create production `.env` configuration:
   ```bash
   nano .env
   ```
   Add the following values:
   ```env
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=http://<EC2_FRONTEND_PUBLIC_IP>
   JWT_SECRET=super_secret_jwt_tinurik_portal_production_2026
   DATABASE_URL=postgresql://postgres:PostgresSecure2026!@localhost:5432/barangay_tinurik
   USE_SQLITE=false
   ```

7. Run database migrations and seed demo accounts:
   ```bash
   npm run db:init
   ```

8. Configure Systemd to keep the backend running permanently:
   ```bash
   # Copy systemd unit file
   sudo cp /home/ubuntu/barangay-tinurik-portal/aws-deploy/systemd/tinurik-backend.service /etc/systemd/system/

   # Reload and start service
   sudo systemctl daemon-reload
   sudo systemctl enable tinurik-backend
   sudo systemctl start tinurik-backend
   ```

9. Test Backend Health:
   ```bash
   curl http://localhost:5000/api/health
   ```
   *Expected result: `{"status":"HEALTHY",...}`*

---

### Step 4: Deploy Frontend to EC2 Instance 1 (`tinurik-frontend`)

1. Connect to EC2 Instance 1 via SSH:
   ```bash
   ssh -i your-key.pem ubuntu@<EC2_FRONTEND_PUBLIC_IP>
   ```

2. Install Node.js and Nginx:
   ```bash
   sudo apt-get update -y
   sudo apt-get install -y curl git nginx

   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clone repository and navigate to `frontend`:
   ```bash
   cd /home/ubuntu
   git clone <YOUR_REPOSITORY_URL> barangay-tinurik-portal
   cd barangay-tinurik-portal/frontend
   ```

4. Configure Frontend Environment to point to EC2 Instance 2:
   ```bash
   nano .env
   ```
   Set `VITE_API_URL` using the **public IPv4 address of EC2 Instance 2**:
   ```env
   VITE_API_URL=http://<EC2_BACKEND_PUBLIC_IP>:5000/api
   ```

5. Build the React production bundle:
   ```bash
   npm install
   npm run build
   ```
   *This compiles optimized HTML/CSS/JS into the `frontend/dist/` directory.*

6. Copy build to web root and configure permissions:
   ```bash
   sudo mkdir -p /var/www/tinurik-frontend
   sudo rm -rf /var/www/tinurik-frontend/*
   sudo cp -r dist/* /var/www/tinurik-frontend/
   sudo chown -R www-data:www-data /var/www/tinurik-frontend
   ```

7. Configure Nginx:
   ```bash
   sudo cp /home/ubuntu/barangay-tinurik-portal/aws-deploy/nginx/tinurik-frontend.conf /etc/nginx/sites-available/tinurik-frontend
   sudo ln -sf /etc/nginx/sites-available/tinurik-frontend /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default

   # Verify syntax and restart
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Step 5: Verify Frontend-to-Backend Connectivity

1. Open your web browser and navigate to:
   ```
   http://<EC2_FRONTEND_PUBLIC_IP>
   ```
2. Look at the top navigation bar:
   - If the badge displays **`EC2 Backend: Online`** (with a pulsing green dot), the frontend has successfully executed a REST health check against EC2 Instance 2!
3. Click **"Sign In"** → Click **"Resident Demo"** → Click **"Sign In to Account"**.
4. Submit a new document request.
5. In your browser's Developer Tools (F12) → **Network Tab**, observe the HTTP `POST` request going to `http://<EC2_BACKEND_PUBLIC_IP>:5000/api/requests` and returning `HTTP 201 Created`.

Both applications are now independently running on two separate AWS EC2 instances and successfully communicating through REST APIs!

---

## 📈 Future Laboratory: AWS Application Load Balancer (ALB) & Auto Scaling

This architecture has been designed to transition into advanced AWS laboratory exercises without requiring application refactoring:

```mermaid
flowchart TD
    subgraph Route53["DNS Tier"]
        DNS["Route 53 or Public IP"]
    end

    subgraph ALB["AWS Application Load Balancer"]
        Listener["ALB Listener (Port 80 / 443)"]
        RuleFE["Path: /* -> Target Group Frontend"]
        RuleBE["Path: /api/* -> Target Group Backend"]
        Listener --> RuleFE
        Listener --> RuleBE
    end

    subgraph ASG_FE["Auto Scaling Group: Frontend"]
        FE1["EC2 Instance 1 (Frontend)"]
        FE2["EC2 Instance 2 (Frontend)"]
    end

    subgraph ASG_BE["Auto Scaling Group: Backend"]
        BE1["EC2 Instance 1 (Backend Node.js)"]
        BE2["EC2 Instance 2 (Backend Node.js)"]
    end

    subgraph RDS["Managed Database Tier"]
        PostgresRDS[("Amazon RDS PostgreSQL Multi-AZ")]
    end

    DNS --> Listener
    RuleFE --> ASG_FE
    RuleBE --> ASG_BE
    BE1 --> PostgresRDS
    BE2 --> PostgresRDS
```

### Architectural Readiness Highlights:
1. **Stateless Backend Nodes**: All user authentication is verified via cryptographically signed JWT tokens. No user sessions are tied to server RAM, allowing any backend EC2 instance behind an ALB to fulfill any incoming request.
2. **Dedicated Health Check Endpoint**: Target Groups can be configured with Health Check Path: `/api/health` (Port 5000, Success code: 200).
3. **Database Externalization**: By migrating the PostgreSQL database to **Amazon RDS for PostgreSQL**, multiple backend instances can read and write to the same relational tables simultaneously.
4. **Target Tracking Scaling Policies**: Configure CPU Utilization target tracking (e.g. 70%) to automatically scale backend EC2 instances in or out during high-volume document request periods.

---

## 🔧 Troubleshooting Common Issues

### 1. Frontend shows "EC2 Backend: Disconnected"
- **Cause:** Security Group on EC2 Instance 2 is blocking inbound traffic on port 5000, or `VITE_API_URL` is pointing to the wrong IP.
- **Solution:**
  1. Go to AWS EC2 Console → Security Groups → `sg-tinurik-backend`.
  2. Verify an inbound rule exists: `Type: Custom TCP`, `Port: 5000`, `Source: 0.0.0.0/0`.
  3. Ensure `VITE_API_URL` in `frontend/.env` matches `http://<EC2_BACKEND_PUBLIC_IP>:5000/api`. Re-run `npm run build` after editing `.env`.

### 2. CORS Error in Browser Console (`Access-Control-Allow-Origin`)
- **Cause:** Backend does not recognize the frontend's origin URL.
- **Solution:**
  1. On EC2 Instance 2, check `backend/.env`.
  2. Ensure `FRONTEND_URL` is set to `http://<EC2_FRONTEND_PUBLIC_IP>`.
  3. Restart backend service: `sudo systemctl restart tinurik-backend`.

### 3. PostgreSQL Connection Refused on Backend
- **Cause:** PostgreSQL service stopped or credentials mismatch.
- **Solution:**
  1. Check status: `sudo systemctl status postgresql`.
  2. Test local connection: `psql -U postgres -d barangay_tinurik`.
  3. Verify `DATABASE_URL` matches credentials set during setup.

### 4. Page 404 Not Found on Route Refresh in Nginx
- **Cause:** Client-side routing requires Nginx to fallback to `index.html`.
- **Solution:**
  Ensure `/etc/nginx/sites-available/tinurik-frontend` includes:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
  Then reload Nginx: `sudo systemctl reload nginx`.

---

## 📄 License

This project is licensed under the MIT License — free for educational, student laboratory, and barangay government use.
