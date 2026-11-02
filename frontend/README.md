# Barangay Tinurik Portal - Frontend Application

Modern React web application for the **Barangay Tinurik Document Request and Tracking System**. Built with React 18, Vite, JavaScript, Tailwind CSS, and Lucide icons.

Designed for deployment on **AWS EC2 Instance 1 (tinurik-frontend)** on port 3000 (development) or served via Nginx on ports 80/443 (production).

---

## 🛠 Tech Stack

- **Framework:** React 18 (SPA)
- **Bundler & Dev Server:** Vite 5
- **Language:** JavaScript (ES6+ Modules)
- **Styling:** Tailwind CSS with custom Barangay Tinurik palette
- **Icons:** Lucide React
- **HTTP Client:** Native Fetch API wrapper (`src/api/api.js`)
- **Default Port:** `3000`

---

## 📁 Directory Structure

```
frontend/
├── public/                       # Static public assets
├── src/
│   ├── api/
│   │   └── api.js                # REST API wrapper communicating with EC2 Backend
│   ├── components/
│   │   ├── ConfirmModal.jsx      # Confirmation dialogs for deletions
│   │   ├── Footer.jsx            # Official government footer
│   │   ├── Modal.jsx             # Accessible modal container
│   │   ├── Navbar.jsx            # Header & live backend status indicator
│   │   ├── StatusBadge.jsx       # Color-coded workflow badges
│   │   └── TrackingTimeline.jsx  # Step-by-step progress & audit history
│   ├── context/
│   │   └── AuthContext.jsx       # JWT session state & role helpers
│   ├── pages/
│   │   ├── About.jsx             # Barangay Tinurik profile & leadership
│   │   ├── AdminDashboard.jsx    # Complete admin management console
│   │   ├── Documents.jsx         # Catalog of clearance types & guidelines
│   │   ├── Home.jsx              # Landing page & features overview
│   │   ├── Login.jsx             # Sign-in with 1-click demo credential buttons
│   │   ├── Register.jsx          # Resident registration form
│   │   └── ResidentDashboard.jsx # Resident request submission & tracking
│   ├── App.jsx                   # Main routing & layout controller
│   ├── index.css                 # Tailwind CSS styles
│   └── main.jsx                  # React DOM entry point
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend API Endpoint
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to your backend:
```env
# Local development
VITE_API_URL=http://localhost:5000/api

# When deploying to AWS EC2:
# VITE_API_URL=http://<EC2_INSTANCE_2_PUBLIC_IP>:5000/api
```

### 3. Start Development Server
```bash
npm run dev
# The application will be accessible at http://localhost:3000
```

### 4. Build for Production (Nginx Deployment)
```bash
npm run build
# Compiles optimized static assets to the frontend/dist folder
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@tinurik.gov.ph` | `Admin123!` |
| **Resident** | `user@tinurik.gov.ph` | `User123!` |

*(Both accounts are pre-configured with convenient one-click auto-fill buttons on the login page!)*
