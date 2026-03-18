# Hospital Triage Backend Database Guide

## 1) Overview

This Node.js + Express + MongoDB backend manages hospital triage and doctor assignment.

- Patients submit triage cases.
- An AI/keyword engine determines a specialization and severity.
- The system auto-assigns an on-duty doctor based on specialization and capacity.
- Doctors update case status and nurses log notes.

## 2) Collections Summary

- `users` — authentication accounts with role and optional doctor profile link.
- `doctorprofiles` — active doctor metadata used for assignment and workload tracking.
- `patientcases` — triage cases with symptoms, assigned specialization, and status.
- `nursingnotes` — nurse observations linked to patient cases.
- `doctors` — admin-level doctor registry used for doctor creation endpoints.

## 3) Roles & Users

### Roles

- `admin`: system administrator; creates doctors/staff, manages users and assignment operations.
- `doctor`: receives assignments, updates case status, completes patient cases.
- `nurse`: updates patient vitals and adds nursing notes.
- `lab`, `ward`, `pharmacist`, `receptionist`: reserved roles for future operations.

### Minimum users required

- 1 admin (required for safe startup and user management).
- At least 1 doctor per required specialization (see Specializations).
- At least 1 nurse for nursing notes operations (optional if not using nurse flows).

## 4) Specializations (CRITICAL)

Standard specializations used by assignment logic:

- `general`
- `cardiology`
- `neurology`
- `orthopedics`

Additional specializations exist in knowledge base, but these are critical for consistency.

### Important rules

- Always use lowercase specialization values.
- Trim whitespace before saving.
- Assignments fail when specialization mismatch occurs (database string mismatch, case mismatch, or unknown value).

## 5) Required Initial Setup (Step-by-step)

1. **Create admin** (one-time): use `/api/auth/register` in development or DB seed.
2. **Create doctor users**: create `User` with `role: doctor`.
3. **Create doctor profiles**: create `DoctorProfile` linked to doctor user.
4. **Ensure `isOnDuty = true`** for doctors who should receive assignments.
5. **Verify `activeCases < maxCases`** so doctors are eligible.

## 6) Doctor Setup Guide

For each specialization:

- Minimum: 1 doctor (production may need more for load).
- Recommended: 2–3 doctors per specialization to handle queue and coverage.

Required fields when creating doctor profile:

- `specialization` (lowercase string)
- `experience` (number >= 0)
- `maxCases` (number >= 1)
- `isOnDuty` (true for assignment receiving)

## 7) Patient Case Flow

### Creation

- POST `/api/patients` creates a new `PatientCase` with name, age, gender, symptoms, description.
- Auto-assignment engine runs to determine `specialization` and `severity`.

### Assignment

- The engine selects a `DoctorProfile` by matching specialization, on-duty status, and available capacity.
- If assigned, `assignedDoctor` is set and status becomes `assigned`.
- If no doctor available, status remains `waiting`.

### Status lifecycle

- `waiting` → `assigned` → `in-treatment` → `completed`

## 8) Nursing Notes Flow

- Nurses call nursing endpoints with `caseId` to add vitals/notes.
- `NursingNote` stores `patientCase`, `nurse`, vitals measurements, optional notes.
- Vitals also may be stored in `PatientCase.vitals`.

## 9) Relationships Diagram (text-based)

```
User
 ├─ doctorProfile (1:1 for doctor user)
DoctorProfile
 └─ used by auto-assignment to match patient cases
PatientCase
 ├─ assignedDoctor -> DoctorProfile
 └─ vitals.recordedBy -> User
NursingNote
 ├─ patientCase -> PatientCase
 └─ nurse -> User
```

## 10) Indexes (Performance)

Indexes added for performance:

- `users.email` (unique, qualified by scheme-level unique)
- `doctorprofiles.user` (unique keyed by schema)
- `doctorprofiles.specialization` (find available doctors)
- `patientcases.status` (query waiting/in-treatment)
- `patientcases.specialization` (selector queries)
- `patientcases.assignedDoctor` (doctor dashboard queries)

## 11) Environment Requirements

Required env vars for production:

- `MONGO_URI` (MongoDB connection string)
- `JWT_SECRET` (JWT signing secret)
- `PORT` (server port)
- `NODE_ENV` (`development`/`production`/`test`)

Optional:

- `CORS_ORIGIN` (if restricting domains)
- `AI_ASSIGNMENT_ENABLED`, `AI_CONFIDENCE_THRESHOLD` for AI assignment behavior.

## 12) Production Checklist

- [ ] `MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV` configured
- [ ] At least one admin account exists
- [ ] Doctor profiles in required specializations
- [ ] Doctors on-duty and activeCases < maxCases
- [ ] Health route `/health` returns OK
- [ ] Request logging enabled (morgan)
- [ ] Global error handling in place
- [ ] DB backups and restore plan configured

## 13) Common Failure Cases (IMPORTANT)

- **No doctor available**: assignment remains `waiting`, system must retry manually.
- **Specialization mismatch**: if case specialization and doctor specialization don’t match, no assignment.
- **activeCases not updated**: if doctor active counter not decremented at completion, capacity is blocked.
- **Doctor not on duty**: doctor will not be selected in auto-assignment.

## 14) Best Practices

- Always store specialization values as lowercase and trimmed.
- Keep `maxCases` realistic per doctor load.
- Monitor `activeCases` vs `maxCases` for each doctor profile.
- Avoid duplicate doctor creation by linking doctor user and profile consistently.
- Use unique email and role-based access control.
- Keep admin user safe; disable open registration in production.

---

This guide provides an operational reference for running the hospital triage backend in production with safe initialization and expected data flow.

{  
  "doctors": [
    
    { "name": "Cardiologist_Dr-1", "email": "Cardiologist_Dr-1@hospital.com", "password": "CardiologistPassDr1", "specialization": "cardiology", "experience": 10, "maxCases": 5 },
    { "name": "Cardiologist_Dr-2", "email": "Cardiologist_Dr-2@hospital.com", "password": "CardiologistPassDr2", "specialization": "cardiology", "experience": 8, "maxCases": 6 },
    { "name": "Cardiologist_Dr-3", "email": "Cardiologist_Dr-3@hospital.com", "password": "CardiologistPassDr3", "specialization": "cardiology", "experience": 12, "maxCases": 4 },

    { "name": "Neurologist_Dr-1", "email": "Neurologist_Dr-1@hospital.com", "password": "NeurologistPassDr1", "specialization": "neurology", "experience": 9, "maxCases": 5 },
    { "name": "Neurologist_Dr-2", "email": "Neurologist_Dr-2@hospital.com", "password": "NeurologistPassDr2", "specialization": "neurology", "experience": 7, "maxCases": 6 },
    { "name": "Neurologist_Dr-3", "email": "Neurologist_Dr-3@hospital.com", "password": "NeurologistPassDr3", "specialization": "neurology", "experience": 11, "maxCases": 4 },

    { "name": "Pulmonologist_Dr-1", "email": "Pulmonologist_Dr-1@hospital.com", "password": "PulmonologistPassDr1", "specialization": "pulmonology", "experience": 10, "maxCases": 5 },
    { "name": "Pulmonologist_Dr-2", "email": "Pulmonologist_Dr-2@hospital.com", "password": "PulmonologistPassDr2", "specialization": "pulmonology", "experience": 8, "maxCases": 6 },
    { "name": "Pulmonologist_Dr-3", "email": "Pulmonologist_Dr-3@hospital.com", "password": "PulmonologistPassDr3", "specialization": "pulmonology", "experience": 12, "maxCases": 4 },

    { "name": "Orthopedic_Dr-1", "email": "Orthopedic_Dr-1@hospital.com", "password": "OrthopedicPassDr1", "specialization": "orthopedics", "experience": 9, "maxCases": 5 },
    { "name": "Orthopedic_Dr-2", "email": "Orthopedic_Dr-2@hospital.com", "password": "OrthopedicPassDr2", "specialization": "orthopedics", "experience": 11, "maxCases": 6 },
    { "name": "Orthopedic_Dr-3", "email": "Orthopedic_Dr-3@hospital.com", "password": "OrthopedicPassDr3", "specialization": "orthopedics", "experience": 7, "maxCases": 4 },

    { "name": "Gastroenterologist_Dr-1", "email": "Gastroenterologist_Dr-1@hospital.com", "password": "GastroPassDr1", "specialization": "gastroenterology", "experience": 10, "maxCases": 5 },
    { "name": "Gastroenterologist_Dr-2", "email": "Gastroenterologist_Dr-2@hospital.com", "password": "GastroPassDr2", "specialization": "gastroenterology", "experience": 8, "maxCases": 6 },
    { "name": "Gastroenterologist_Dr-3", "email": "Gastroenterologist_Dr-3@hospital.com", "password": "GastroPassDr3", "specialization": "gastroenterology", "experience": 12, "maxCases": 4 },

    { "name": "Endocrinologist_Dr-1", "email": "Endocrinologist_Dr-1@hospital.com", "password": "EndocrinePassDr1", "specialization": "endocrinology", "experience": 9, "maxCases": 5 },
    { "name": "Endocrinologist_Dr-2", "email": "Endocrinologist_Dr-2@hospital.com", "password": "EndocrinePassDr2", "specialization": "endocrinology", "experience": 7, "maxCases": 6 },
    { "name": "Endocrinologist_Dr-3", "email": "Endocrinologist_Dr-3@hospital.com", "password": "EndocrinePassDr3", "specialization": "endocrinology", "experience": 11, "maxCases": 4 },

    { "name": "Psychiatrist_Dr-1", "email": "Psychiatrist_Dr-1@hospital.com", "password": "PsychPassDr1", "specialization": "psychiatry", "experience": 10, "maxCases": 5 },
    { "name": "Psychiatrist_Dr-2", "email": "Psychiatrist_Dr-2@hospital.com", "password": "PsychPassDr2", "specialization": "psychiatry", "experience": 8, "maxCases": 6 },
    { "name": "Psychiatrist_Dr-3", "email": "Psychiatrist_Dr-3@hospital.com", "password": "PsychPassDr3", "specialization": "psychiatry", "experience": 12, "maxCases": 4 },

    { "name": "Dermatologist_Dr-1", "email": "Dermatologist_Dr-1@hospital.com", "password": "DermPassDr1", "specialization": "dermatology", "experience": 9, "maxCases": 5 },
    { "name": "Dermatologist_Dr-2", "email": "Dermatologist_Dr-2@hospital.com", "password": "DermPassDr2", "specialization": "dermatology", "experience": 7, "maxCases": 6 },
    { "name": "Dermatologist_Dr-3", "email": "Dermatologist_Dr-3@hospital.com", "password": "DermPassDr3", "specialization": "dermatology", "experience": 11, "maxCases": 4 },

    { "name": "Ophthalmologist_Dr-1", "email": "Ophthalmologist_Dr-1@hospital.com", "password": "OphthalPassDr1", "specialization": "ophthalmology", "experience": 10, "maxCases": 5 },
    { "name": "Ophthalmologist_Dr-2", "email": "Ophthalmologist_Dr-2@hospital.com", "password": "OphthalPassDr2", "specialization": "ophthalmology", "experience": 8, "maxCases": 6 },
    { "name": "Ophthalmologist_Dr-3", "email": "Ophthalmologist_Dr-3@hospital.com", "password": "OphthalPassDr3", "specialization": "ophthalmology", "experience": 12, "maxCases": 4 },

    { "name": "ENT_Dr-1", "email": "ENT_Dr-1@hospital.com", "password": "ENTPassDr1", "specialization": "ent", "experience": 9, "maxCases": 5 },
    { "name": "ENT_Dr-2", "email": "ENT_Dr-2@hospital.com", "password": "ENTPassDr2", "specialization": "ent", "experience": 7, "maxCases": 6 },
    { "name": "ENT_Dr-3", "email": "ENT_Dr-3@hospital.com", "password": "ENTPassDr3", "specialization": "ent", "experience": 11, "maxCases": 4 },

    { "name": "Urologist_Dr-1", "email": "Urologist_Dr-1@hospital.com", "password": "UroPassDr1", "specialization": "urology", "experience": 10, "maxCases": 5 },
    { "name": "Urologist_Dr-2", "email": "Urologist_Dr-2@hospital.com", "password": "UroPassDr2", "specialization": "urology", "experience": 8, "maxCases": 6 },
    { "name": "Urologist_Dr-3", "email": "Urologist_Dr-3@hospital.com", "password": "UroPassDr3", "specialization": "urology", "experience": 12, "maxCases": 4 },

    { "name": "Gynecologist_Dr-1", "email": "Gynecologist_Dr-1@hospital.com", "password": "GynPassDr1", "specialization": "gynecology", "experience": 9, "maxCases": 5 },
    { "name": "Gynecologist_Dr-2", "email": "Gynecologist_Dr-2@hospital.com", "password": "GynPassDr2", "specialization": "gynecology", "experience": 7, "maxCases": 6 },
    { "name": "Gynecologist_Dr-3", "email": "Gynecologist_Dr-3@hospital.com", "password": "GynPassDr3", "specialization": "gynecology", "experience": 11, "maxCases": 4 },

    { "name": "Pediatrician_Dr-1", "email": "Pediatrician_Dr-1@hospital.com", "password": "PediaPassDr1", "specialization": "pediatrics", "experience": 10, "maxCases": 5 },
    { "name": "Pediatrician_Dr-2", "email": "Pediatrician_Dr-2@hospital.com", "password": "PediaPassDr2", "specialization": "pediatrics", "experience": 8, "maxCases": 6 },
    { "name": "Pediatrician_Dr-3", "email": "Pediatrician_Dr-3@hospital.com", "password": "PediaPassDr3", "specialization": "pediatrics", "experience": 12, "maxCases": 4 },

    { "name": "Hematologist_Dr-1", "email": "Hematologist_Dr-1@hospital.com", "password": "HemaPassDr1", "specialization": "hematology", "experience": 9, "maxCases": 5 },
    { "name": "Hematologist_Dr-2", "email": "Hematologist_Dr-2@hospital.com", "password": "HemaPassDr2", "specialization": "hematology", "experience": 7, "maxCases": 6 },
    { "name": "Hematologist_Dr-3", "email": "Hematologist_Dr-3@hospital.com", "password": "HemaPassDr3", "specialization": "hematology", "experience": 11, "maxCases": 4 },

    { "name": "Oncologist_Dr-1", "email": "Oncologist_Dr-1@hospital.com", "password": "OncoPassDr1", "specialization": "oncology", "experience": 10, "maxCases": 5 },
    { "name": "Oncologist_Dr-2", "email": "Oncologist_Dr-2@hospital.com", "password": "OncoPassDr2", "specialization": "oncology", "experience": 8, "maxCases": 6 },
    { "name": "Oncologist_Dr-3", "email": "Oncologist_Dr-3@hospital.com", "password": "OncoPassDr3", "specialization": "oncology", "experience": 12, "maxCases": 4 },

    { "name": "GeneralPhysician_Dr-1", "email": "GeneralPhysician_Dr-1@hospital.com", "password": "GenPassDr1", "specialization": "general", "experience": 9, "maxCases": 5 },
    { "name": "GeneralPhysician_Dr-2", "email": "GeneralPhysician_Dr-2@hospital.com", "password": "GenPassDr2", "specialization": "general", "experience": 7, "maxCases": 6 },
    { "name": "GeneralPhysician_Dr-3", "email": "GeneralPhysician_Dr-3@hospital.com", "password": "GenPassDr3", "specialization": "general", "experience": 11, "maxCases": 4 }

  ]
}
