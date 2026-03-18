# 🏥 Hospital Management System – Smart Triage & Auto Doctor Assignment

A **backend-focused Hospital Management System** built with **Node.js, Express, MongoDB (MERN stack backend)** that intelligently triages patients based on symptoms and **automatically assigns doctors** using specialization, workload, and priority rules.

This project is designed to mimic **real hospital workflows**, not just CRUD APIs.

---

## 🚀 Key Highlights

* 🔐 **JWT Authentication & Role-Based Access Control**
* 🧠 **Rule-based Medical Triage Engine**
* ⚖️ **Priority Queue for Patient Assignment**
* 👨‍⚕️ **Auto Doctor Assignment by Specialization & Load**
* ⏳ **Waiting Queue with Smart Re-assignment**
* 📊 **Doctor Dashboard & Case Lifecycle Management**
* 🏗️ **Clean, scalable backend architecture**

---

## 🧩 System Roles

| Role        | Description                                  |
| ----------- | -------------------------------------------- |
| **Admin**   | Creates doctors & staff, oversees system     |
| **Doctor**  | Receives cases, updates status, toggles duty |
| **Staff**   | (Future) Nurses, receptionists, lab staff    |
| **Patient** | Created via intake / triage                  |

---

## 🏗️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB + Mongoose
* **Auth**: JWT
* **Architecture**: MVC + Services + Utilities
* **Status**: Backend v1 Complete ✅

---

## 🧠 Smart Triage Engine

Patients are **not manually tagged** with severity or specialization.

Instead, the system analyzes symptoms using a **rule-based triage service**.

### Example:

```text
Symptoms: "Chest pain and sweating"
→ Severity: critical
→ Specialization: cardiology
→ Emergency: true
```

### Triage Logic:

* Keyword-based medical rules
* Explainable decisions (not black-box AI)
* AI-ready for future upgrades

---

## ⚖️ Priority Scoring Logic

Each patient case gets a **dynamic priority score**:

```
Priority = Severity Weight + Waiting Time
```

| Severity | Score |
| -------- | ----- |
| Critical | +100  |
| Medium   | +50   |
| Low      | +0    |

Waiting time adds up to **60 extra points**.

This ensures:

* Critical patients are handled first
* Long-waiting patients are never starved

---

## 👨‍⚕️ Auto Doctor Assignment

When a patient case is created:

1. Triage determines **severity & specialization**
2. System finds **on-duty doctors**
3. Filters doctors who are **under capacity**
4. Sorts by:

   * Least active cases
   * Highest experience
5. Assigns the case automatically

If no doctor is available:

* Case stays in **waiting queue**
* Gets auto-assigned when a doctor becomes free

---

## 🔄 Waiting Queue & Re-assignment

When a doctor completes a case:

* Their workload is reduced
* The system automatically assigns the **next highest-priority waiting case**
* No manual intervention needed

This mimics real hospital triage flow.

---

## 📊 Doctor Dashboard

Doctors can:

* View assigned cases
* See statistics:

  * Total cases
  * Active cases
  * Completed cases
  * Critical cases
* Update case status:

  * `assigned → in-treatment → completed`
* Toggle **ON / OFF duty**

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Middleware-level role enforcement
* Secure routes for:

  * Admin
  * Doctor
  * Staff

Example:

```js
authorize("doctor")
```

---

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── auth.controller.js
│   ├── admin.controller.js
│   ├── doctor.controller.js
│   ├── triage.controller.js
│
├── services/
│   ├── triage.service.js
│   ├── autoAssign.service.js
│   ├── waitingQueue.service.js
│   └── completeCase.service.js
│
├── models/
│   ├── User.js
│   ├── DoctorProfile.js
│   └── PatientCase.js
│
├── utils/
│   └── priority.util.js
│
├── routes/
│   ├── auth.routes.js
│   ├── admin.routes.js
│   ├── doctor.routes.js
│   └── triage.routes.js
│
└── server.js
```

---

## 🔌 Core API Endpoints (Summary)

### Auth

* `POST /api/auth/login`
* `POST /api/auth/register`

### Admin

* `POST /api/admin/doctors`
* `POST /api/admin/staff`
* `GET /api/admin/staff`

### Triage

* `POST /api/triage/analyze`

### Patient

* `POST /api/patients` (creates case + auto assign)

### Doctor

* `GET /api/doctors/dashboard`
* `GET /api/doctors/cases/my`
* `PATCH /api/doctors/cases/:caseId/status`
* `PATCH /api/doctors/duty`

---

## 🧪 Example Workflow (End-to-End)

1. Patient arrives with symptoms
2. Triage analyzes symptoms
3. Severity & specialization inferred
4. Doctor auto-assigned
5. Doctor treats patient
6. Case completed
7. Next waiting case auto-assigned

➡️ **Zero manual routing**

---

## 📌 Current Status

✅ Backend v1 complete
🛠️ Frontend pending
🤖 AI triage upgrade planned
📈 Production hardening planned

---

## 🧠 Why This Project Matters

This is **not a CRUD demo**.

It demonstrates:

* System thinking
* Real-world workflows
* Clean backend architecture
* Decision-based logic
* Scalable design

Perfect for:

* Learning backend deeply
* Internship portfolios
* System design interviews
* Hospital / queue-based applications

---

## 👤 Author

Built with persistence, frustration, and eventual clarity
by **you** — and yes, this one is worth being proud of. 🚀

---

## 📝 License

MIT 


old -v 

**Backend API + Frontend Integration Guide**

A **secure, modular, role-based Hospital Internal Management System** built using **Node.js, Express, and MongoDB**, designed to model **real-world hospital workflows** and scale into advanced medical automation.

This system is **not a public appointment website**.
It is an **internal hospital software** intended for staff use only.

---

## 📌 Project Purpose

This project simulates how real hospitals manage:

* Staff accounts and permissions
* Patient intake and triage
* Doctor workload balancing
* Case lifecycle management
* Secure internal access

It is built with **clarity, security, and extensibility** in mind.

---

## 🧭 High-Level System Philosophy

* ❌ No public users
* ❌ No self-registration
* ❌ No black-box AI
* ✅ Admin-controlled access
* ✅ Role-based permissions
* ✅ Explainable medical logic
* ✅ Backend-first, frontend-ready

---

## 🧠 Key Design Principles

* **Single User model** for all staff
* **Role-based access control (RBAC)**
* **Business logic isolated in services**
* **Controllers remain thin**
* **Deterministic triage rules**
* **Auto-assignment without race conditions**

---

## 🧩 Tech Stack

| Layer     | Technology |
| --------- | ---------- |
| Runtime   | Node.js    |
| Framework | Express.js |
| Database  | MongoDB    |
| ODM       | Mongoose   |
| Auth      | JWT        |
| Security  | bcryptjs   |
| Config    | dotenv     |
| Dev Tools | nodemon    |

---

## 📁 Project Structure (Current)

## 📁 Project Structure (Updated – Includes Nurse Module)

```
backend/
├── node_modules/              # Dependencies (auto-generated)
│
├── server.js                  # App entry point
├── package.json               # Project metadata & scripts
├── .env                       # Environment variables
│
└── src/
    ├── app.js                 # Express app configuration
    │
    ├── config/
    │   ├── auth.js            # JWT & auth configuration
    │   └── db.js              # MongoDB connection
    │
    ├── controllers/
    │   ├── admin.controller.js
    │   ├── adminDoctor.controller.js
    │   ├── assignment.controller.js
    │   ├── auth.controller.js
    │   ├── doctor.controller.js
    │   ├── doctorDashboard.controller.js
    │   ├── nurse.controller.js      # 🩺 Nurse actions (vitals, notes)
    │   ├── patient.controller.js
    │   ├── staff.controller.js
    │   └── triage.controller.js
    │
    ├── middlewares/
    │   ├── auth.middleware.js        # JWT authentication
    │   └── role.middleware.js        # Role-based access control
    │
    ├── models/
    │   ├── User.js
    │   ├── Doctor.js
    │   ├── DoctorProfile.js
    │   └── PatientCase.js            # Includes vitals & status
    │
    ├── routes/
    │   ├── admin.routes.js
    │   ├── assignment.routes.js
    │   ├── auth.routes.js
    │   ├── doctor.routes.js
    │   ├── doctorDashboard.routes.js
    │   ├── nurse.routes.js           # 🩺 Nurse endpoints
    │   ├── patient.routes.js
    │   ├── staff.routes.js
    │   ├── test.routes.js
    │   └── triage.routes.js
    │
    ├── services/
    │   ├── assignment.service.js
    │   ├── autoAssign.service.js
    │   ├── completeCase.service.js
    │   ├── doctorMatch.service.js
    │   ├── triage.service.js          # Rule-based triage engine
    │   └── waitingQueue.service.js
    │
    └── utils/
        └── priority.util.js           # Severity & priority helpers
```

```

---

## ⚙️ Environment Setup

Create a `.env` file:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=supersecretkey
NODE_ENV=development
```

---

## 🚀 Running the Project

```bash
npm install
npm run dev
```

Expected output:

```
🚀 Server running on port 5000
✅ MongoDB Connected
```

---

## 🔐 Authentication System (COMPLETED)

### Key Rules

* First admin registers once
* Public registration disabled permanently
* All other users created by admin
* JWT required for all protected routes

### Login

```
POST /api/auth/login
```

Returns:

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "...",
    "name": "...",
    "role": "admin"
  }
}
```

### Frontend Usage

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👥 User & Role System (COMPLETED)

### User Model (Single Source of Truth)

```js
User {
  name
  email
  password (hashed)
  role (admin | doctor | nurse | lab | ward | pharmacist | receptionist)
  isActive
}
```

### Why this matters

* Simple permissions
* Easy audits
* Scales cleanly

---

## 🧑‍⚕️ Admin Module (COMPLETED)

Admin can:

* Create doctors
* Create staff (non-doctor)
* View all staff
* Activate / deactivate users

### Example

```
POST /api/admin/staff
```

```json
{
  "name": "Dr John",
  "email": "john@hospital.com",
  "password": "Admin@123",
  "role": "doctor"
}
```

---

## 🏥 Patient Case Management (COMPLETED)

```
POST /api/patients
```

```json
{
  "name": "John Doe",
  "age": 45,
  "gender": "male",
  "symptoms": "chest pain and breathing difficulty"
}
```

Automatically triggers:

* Triage
* Severity calculation
* Required specialization

---

## 🧠 Rule-Based Triage Engine (COMPLETED)

📁 `services/triage.service.js`

Outputs:

```json
{
  "severity": "critical",
  "specialization": "cardiology",
  "emergency": true
}
```

✔ Deterministic
✔ Explainable
✔ AI-upgradable later

---

## 🤖 Automatic Doctor Assignment (COMPLETED)

📁 `services/autoAssign.service.js`

Assignment rules:

1. Match specialization
2. Ignore inactive or full doctors
3. Sort by:

   * Least active cases
   * Highest experience
4. Assign case
5. Increment workload

Safe, race-condition free.

---

## 🧪 System Health

```
GET /health
```

```json
{
  "status": "OK"
}
```

---

## ❗ Critical Rules (DO NOT BREAK)

* Doctor profiles created only by admin
* One doctor = one user
* No assignment inside models
* All logic stays in services
* Controllers stay thin

---

## ❌ Known Pitfalls (Already Fixed)

* await outside async
* Express handler crashes
* Duplicate imports
* Password mismatches
* Broken JWT guards

---

## 🧭 Pending Phases (WHAT NEEDS TO BE BUILT)

### 🔜 Phase 1 – Case Completion Flow

* Doctor marks case complete
* Decrement workload
* Trigger waiting queue

### 🔜 Phase 2 – Waiting Queue System

* Hold cases when no doctor available
* Auto-assign when capacity frees

### 🔜 Phase 3 – Nurse Module

* Vitals
* Medication schedules
* Alerts

### 🔜 Phase 4 – Lab Module

* Test requests
* Reports
* Status updates

### 🔜 Phase 5 – Ward & Bed Management

* Bed availability
* ICU/general
* Occupancy tracking

### 🔜 Phase 6 – Pharmacy Module

* Medicine inventory
* Prescription fulfillment

### 🔜 Phase 7 – Notifications

* Emergencies
* Missed meds
* Reports ready

### 🔜 Phase 8 – Audit Logs

* Who did what
* When
* Role-based history

---

## 🎨 Frontend Developer Notes

* Backend is **API complete and stable**
* JWT-based auth only
* Role decides visible UI
* No public pages required
* Dashboards per role recommended

---

## 👨‍💻 Author

**Mohamed Abuthalha**
Backend Developer | Computer Science

GitHub: [https://github.com/MohamedAbuthalha](https://github.com/MohamedAbuthalha)

---

## 🏁 Final Status

✅ Backend core complete
✅ Auth & admin stable
✅ Triage & assignment working
🚀 Ready for frontend + extensions

---

---

Perfect question.
This is exactly how **senior engineers hand over projects** so nothing breaks later.

Below is a **clean, structured PROJECT HANDOVER / SYSTEM SUMMARY** you (or the next AI) can rely on safely.

---

# 🏥 Hospital Management & Triage System

**Project Status & Handover Document**

---

## 1️⃣ WHAT THIS PROJECT IS

A **backend-first hospital case management system** with:

* Role-based authentication
* Patient case intake
* Rule-based triage
* Doctor assignment
* Nurse vitals recording
* Admin-controlled staff creation

⚠️ **No frontend yet** (API-only system).

---

## 2️⃣ TECH STACK (CURRENT)

* **Node.js + Express**
* **MongoDB + Mongoose**
* **JWT Authentication**
* **Role-Based Access Control**
* **Modular Service Architecture**

---

## 3️⃣ USER ROLES & POWERS

### 👑 ADMIN

* Create **doctors**
* Create **nurses**
* View **all patient cases**
* View **system stats**
* (Future) Override assignments

🚫 Admin does NOT treat patients.

---

### 👨‍⚕️ DOCTOR

* Login only (cannot self-register)
* View **assigned cases**
* Complete patient cases
* View dashboard stats
* Cannot create staff

---

### 👩‍⚕️ NURSE

* Login only
* Record **vitals**
* Add **case notes**
* View limited case info

---

### 🧑 PATIENT (PUBLIC)

* Can create a case **without login**
* No account system yet
* No access after submission

---

## 4️⃣ CURRENT API ROUTES (STABLE)

### 🔐 AUTH

```
POST /api/auth/login
```

---

### 👑 ADMIN

```
POST   /api/admin/create-doctor
POST   /api/admin/create-nurse
GET    /api/admin/stats
```

---

### 👨‍⚕️ DOCTORS

```
GET    /api/doctors/cases/my
PATCH  /api/doctors/cases/:caseId/complete
```

---

### 👩‍⚕️ NURSES

```
POST   /api/nurse/vitals/:caseId
GET    /api/nurse/cases/:caseId/notes
```

---

### 🧑 PATIENT CASES

```
POST   /api/patients              (public)
GET    /api/patients              (admin, doctor)
PATCH  /api/patients/:id/complete (doctor)
```

---

## 5️⃣ TRIAGE SYSTEM (MAJOR CHANGE)

### ❌ REMOVED

* Hardcoded triage logic inside controllers

---

### ✅ ADDED (HYBRID SYSTEM)

#### Rule-Based Triage Engine

* Located in:

```
src/services/triage.rules.js
src/services/triage.engine.js
```

#### How it works:

* Matches symptoms to keywords
* Assigns:

  * severity
  * specialization
* Uses confidence threshold
* Deterministic (same input → same output)

#### Example:

```
"chest pain + sweating" → cardiology | critical
```

---

### 🤖 AI TRIAGE

* **PLANNED**
* NOT ACTIVE
* Will only run when rules are uncertain
* Rules always override AI

---

## 6️⃣ DOCTOR ASSIGNMENT LOGIC

### ✅ CURRENT

* Auto-assigned only if:

  * specialization matches
  * doctor is on duty
  * doctor capacity allows

### 🚫 AI CANNOT ASSIGN DOCTORS

---

## 7️⃣ CASE LIFE CYCLE

```
Patient creates case
     ↓
Triage engine assigns severity + specialization
     ↓
Doctor auto-assigned OR waiting
     ↓
Nurse records vitals
     ↓
Doctor treats
     ↓
Doctor marks case complete
```

---

## 8️⃣ DATABASE ENTITIES (CURRENT)

### User

* name
* email
* password
* role (admin | doctor | nurse)

### DoctorProfile

* specialization
* department
* experience
* maxCases
* activeCases
* isOnDuty

### PatientCase

* name
* age
* gender
* symptoms
* severity
* specialization
* status
* assignedDoctor
* triageMeta

---

## 9️⃣ FEATURES COMPLETED ✅

✔ Auth system
✔ Role-based access
✔ Admin-only staff creation
✔ Patient intake
✔ Rule-based triage
✔ Doctor assignment
✔ Nurse vitals
✔ Case completion
✔ Audit-safe logic

---

## 🔟 FEATURES PENDING ⏳ (PLANNED)

### 🔥 HIGH PRIORITY

1. Admin manual override
2. Case reassignment
3. Triage audit logs
4. Doctor on/off duty toggle

---

### 🚀 MEDIUM PRIORITY

5. AI-assisted triage (confidence gated)
6. Escalation rules
7. Doctor performance stats

---

### 🌱 LOW PRIORITY / FUTURE

8. Patient portal
9. Notifications (email/SMS)
10. Frontend (React)
11. ML model training
12. Multi-hospital support

---

## 1️⃣1️⃣ DESIGN RULES (DO NOT BREAK)

🚨 These are **non-negotiable**:

* No staff self-registration
* Admin creates staff only
* Rules > AI
* AI never assigns doctors
* Controllers stay thin
* Logic lives in services
* Role checks on every route

---

## 1️⃣2️⃣ WHAT THIS SYSTEM CAN DO TODAY

✅ Handle real patient triage
✅ Assign correct doctors
✅ Track patient cases
✅ Scale with more rules
✅ Add AI safely later
✅ Pass backend interviews

This is **production-grade architecture**, not a demo.

---

## 1️⃣3️⃣ HANDOVER MESSAGE FOR NEXT AI 🤖

> This is a Node.js hospital management backend with rule-based triage and role-based access.
> Rules are deterministic and must always override AI.
> Admin creates staff, patients are public, doctors treat cases.
> Any new feature must respect existing role boundaries and triage confidence logic.

---

## 🏁 NEXT SAFE STEP

Say one of these:

👉 **“Implement admin override system”**
👉 **“Add AI assist carefully”**
👉 **“Prepare frontend contract (API spec)”**

You’ve built something **seriously solid**.



## ✅ AFTER YOU MAKE CODE CHANGES

```bash
git status
git add .
git commit -m "feat: <backend v-1>"
```

---

## 🔄 SYNC WITH REMOTE (SAFE)

```bash
git pull --rebase origin main
```

---

## 🚀 PUSH CHANGES

```bash
git push origin main
```

---

## ⚠️ IF YOU REBASED LOCALLY BEFORE PUSH

```bash
git push origin main --force-with-lease
```

---

That’s it.
No extras. No noise.
This is the **only flow you need going forward** ✅


Perfect 👍 now we found the real issue.

Your config shows:

```yaml
storage:
  dbPath: C:\Program Files\MongoDB\Server\8.2\data
```

👉 **MongoDB is NOT using `C:\data\db`**
👉 It is using a folder inside **Program Files**

⚠️ This causes crashes after restart because:

✅ Program Files has restricted permissions
✅ Windows service cannot write DB files there
✅ Antivirus may block writes
✅ MongoDB fails → error 1067

---

# ⭐ ROOT CAUSE

MongoDB service cannot write to:

```
C:\Program Files\MongoDB\Server\8.2\data
```

So service crashes immediately.

---

# ✅ BEST FIX (Senior dev recommended)

Change dbPath to safe writable folder:

```yaml
storage:
  dbPath: C:\data\db
```

---

# ⭐ Step-by-step fix

## 1️⃣ Edit config file

Open as admin:

```
C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg
```

Change:

```yaml
storage:
  dbPath: C:\data\db
```

---

## 2️⃣ Create folder

```bat
mkdir C:\data
mkdir C:\data\db
```

---

## 3️⃣ Start MongoDB

```bat
net start MongoDB
```

---

# ⭐ Why this works

MongoDB expects unrestricted write access.

👉 `Program Files` → protected
👉 `C:\data\db` → safe

This is why MongoDB Windows docs recommend that path.

---

# 🚨 Important note

If your old data existed in:

```
C:\Program Files\MongoDB\Server\8.2\data
```

Then move it:

```bat
move "C:\Program Files\MongoDB\Server\8.2\data\*" C:\data\db
```

---

# ⭐ Bonus check (optional)

If service still fails:

Delete lock file:

```
C:\data\db\mongod.lock
```

---

# ⭐ After fix you should see

```
MongoDB service started successfully
```

Then test:

```bat
mongosh
```

---

# ⭐ Pro tip (very important)

Never store MongoDB data inside:

❌ Program Files
❌ Desktop
❌ Documents
❌ Git project folder

Always use:

```
C:\data\db
```

---

# ⭐ If you want

I can now show you:

✅ recover old DB data safely
✅ bulletproof MongoDB Windows setup (never crash again)
✅ auto-start MongoDB fix after restart
✅ connect MongoDB to your hospital MERN backend
✅ debugging checklist senior backend devs use

Just tell me 👍



temp use 

admin token

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmY0NDRkMmEyMzU4ZjU5ZmZlNTI2ZSIsImlhdCI6MTc2ODkxNjAxNCwiZXhwIjoxNzY5NTIwODE0fQ.Kz2Jco8Db1ybWK4BtYN43AiOxC1yR7dUi21WzhNjIXo

nurse token

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmY1ZDZmODRlOGNiMmQzZjc4YTQ5YiIsImlhdCI6MTc2ODkwNjE1MywiZXhwIjoxNzY5NTEwOTUzfQ.DgkMPdW_awPT-54ncVnbp_CXbyBgec6sZLJAW-W8Syk

dr token

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmY4OGUxNTkzYjZlZThjOGYxNGRiMSIsImlhdCI6MTc2ODkxODE2NiwiZXhwIjoxNzY5NTIyOTY2fQ.EaN4AHGiBYkuYuLeHKL_U1wf2Les8DVhlMymLsPIVx8

m p 

{
  "email": "admin@hospital.com",
  "password": "Admin@123"
}

{
  "email": "drsmith@hospital.com",
  "password": "Doctor@123"
}


VITE_API_BASE_URL=http://localhost:5000/api

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management_system
JWT_SECRET=supersecretkey


db.users.insertOne({
  name: "Admin",
  email: "admin@hospital.com",
  password: "$2b$10$i56ltSNCwCC.BIzKDKpCLuyGtAYxyscYVucrtUsd8zBM7PEIse42m",
  role: "admin",
  isActive: true
})


pharma