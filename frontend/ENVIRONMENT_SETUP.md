# Frontend Environment Configuration Guide

## Overview

Your React/Vite frontend uses environment variables to dynamically configure the API base URL, allowing the same code to work in:
- **Local development** (connecting to `localhost:5000`)
- **Production** (connecting to your Render deployed backend)

## Files Involved

- **`.env.local`** — Local development environment (gitignored)
- **`.env.example`** — Template for developers
- **`src/api/axios.js`** — Centralized API client with environment variable
- **`vite.config.js`** — Vite proxy configuration for development

## 1. Local Development Setup

### Step 1: Create `.env.local`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

This file is already created and gitignored.

### Step 2: Ensure Backend is Running

```bash
cd backend
npm start
```

Backend should be running on `http://localhost:5000`

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be on `http://localhost:3000`

### How It Works Locally

1. Frontend runs on `http://localhost:3000`
2. All API calls go through `src/api/axios.js` which reads `VITE_API_BASE_URL`
3. Vite proxy (in `vite.config.js`) redirects `/api/*` requests to `http://localhost:5000`
4. Backend responds on port 5000

**Result**: Login and all API calls work locally ✅

---

## 2. Production Setup on Vercel & Render

### Step 1: Deploy Backend on Render

Your backend is already deployed. Get your Render URL:
- Go to https://dashboard.render.com
- Find your backend web service
- Copy the URL (e.g., `https://your-backend.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com and sign in
2. Click "New Project" → Select your frontend repo
3. In the environment variables section, add:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` |

**Example:**
```
VITE_API_BASE_URL=https://my-hms-backend.onrender.com/api
```

4. Click "Deploy"

### Step 3: Verify in Production

Once deployed, test the login:
- Frontend URL: `https://your-app.vercel.app`
- Open DevTools → Network tab
- Try logging in
- You should see requests to `https://your-backend.onrender.com/api/auth/login` ✅

---

## 3. How Environment Variables Work

### In Development
```javascript
// vite.config.js reads .env.local
VITE_API_BASE_URL = "http://localhost:5000/api"

// src/api/axios.js uses it
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
// Result: "http://localhost:5000/api"
```

### In Production (Vercel)
```javascript
// Vercel injects the environment variable at build time
VITE_API_BASE_URL = "https://my-hms-backend.onrender.com/api"

// src/api/axios.js uses it
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
// Result: "https://my-hms-backend.onrender.com/api"
```

---

## 4. API Client Usage

All API calls go through `src/api/axios.js`:

```javascript
// src/api/auth.js
import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
```

**Benefits:**
- ✅ Single source of truth for API configuration
- ✅ Automatic token attachment (Authorization header)
- ✅ Error handling (401 redirects to login)
- ✅ No hardcoded URLs anywhere

---

## 5. Checklist

### Local Development
- [ ] `.env.local` exists with `VITE_API_BASE_URL=http://localhost:5000/api`
- [ ] Backend running on `localhost:5000`
- [ ] Frontend running on `localhost:3000`
- [ ] Login works → test with DevTools

### Production (Vercel + Render)
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Vercel environment variable set: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- [ ] Login works from production URL

---

## 6. Troubleshooting

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Cause:** Frontend trying to connect to wrong backend URL

**Solution:**
1. Check Vercel environment variables (must include `VITE_API_BASE_URL`)
2. Check backend URL is correct and includes `/api`
3. Verify backend is running and accessible
4. Redeploy frontend after changing env vars

### CORS Errors

**Solution:** Your backend already has CORS enabled in `src/app.js`:
```javascript
cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
```

This allows requests from any origin, including Vercel.

---

## 7. Environment Variable Reference

| Variable | Local Value | Production Value |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | `https://your-backend.onrender.com/api` |

**Important:** Variable names starting with `VITE_` are exposed to the browser and are visible in code. Don't store secrets here. Use backend environment variables for sensitive data.
