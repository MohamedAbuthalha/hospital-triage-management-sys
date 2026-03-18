# Frontend Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file:**
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000 (must be running)

## Default Login Credentials

Use the test credentials from the backend README:

### Admin
- Email: `admin@hospital.com`
- Password: `Admin@123`

### Doctor
- Email: `drsmith@hospital.com`  
- Password: `Doctor@123`

### Nurse
- Check backend for nurse credentials

## Features Implemented

✅ JWT Authentication with auto token attachment
✅ Role-based routing (admin, doctor, nurse)
✅ Admin dashboard (create doctor/nurse, view staff)
✅ Doctor dashboard (view cases, complete cases)
✅ Nurse dashboard (view cases, add vitals)
✅ Public patient intake form
✅ Error handling and unauthorized redirects
✅ Token expiration handling (auto-logout on 401)

## Project Structure

- `src/api/` - API configuration and endpoints
- `src/auth/` - Authentication context
- `src/routes/` - Protected route components
- `src/pages/` - Page components

## Notes

- All API requests automatically include JWT token
- 401 responses trigger automatic logout
- Role-based access is enforced on frontend and backend
- Patient intake is public (no authentication required)
