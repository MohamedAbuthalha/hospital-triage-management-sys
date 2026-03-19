# Deployment Checklist: Frontend + Backend Integration

## ✅ Local Development (Already Working)

Your local setup is already correct:
- ✅ Backend on `localhost:5000`
- ✅ Frontend on `localhost:3000` (with Vite proxy)
- ✅ `.env.local` configured
- ✅ `src/api/axios.js` uses `VITE_API_BASE_URL`

**Test locally:**
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev

# Visit http://localhost:3000 and test login
```

---

## 🚀 Production Deployment Steps

### Step 1: Get Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click your backend web service
3. Copy the URL from the top of the page
   - Example: `https://hms-backend-abc123.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project" → Select your frontend folder
3. Before deploying, add environment variable:

**Environment Variables:**
```
Name:  VITE_API_BASE_URL
Value: https://hms-backend-abc123.onrender.com/api
```
(Replace with your actual Render URL)

4. Click "Deploy" and wait for completion

### Step 3: Test Production Login

1. Go to your Vercel frontend URL (e.g., `https://hms-frontend.vercel.app`)
2. Open DevTools → Network tab
3. Try logging in
4. You should see successful requests to your Render backend ✅

---

## 📋 Files Modified

| File | Changes |
|------|---------|
| `.env.local` | Created for local development |
| `.env.example` | Updated with clearer comments |
| `src/api/axios.js` | Added documentation comments |
| `ENVIRONMENT_SETUP.md` | Created comprehensive guide |

---

## 🔐 Important Notes

1. **Never commit `.env.local`** — It's gitignored
2. **Render URL includes `/api`** — Must end with `/api`, not just the domain
3. **Environment variables are injected at build time** — Vercel builds your frontend with the env var value
4. **CORS is already enabled** — Your backend allows requests from any origin

---

## ❓ Common Issues & Solutions

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Causes & Fixes:**
1. ❌ `VITE_API_BASE_URL` not set in Vercel
   - ✅ Add it in Vercel project settings → Environment Variables

2. ❌ Wrong URL (missing `/api` or typo)
   - ✅ Should be: `https://your-backend.onrender.com/api`
   - ❌ Not: `https://your-backend.onrender.com`

3. ❌ Frontend deployed before backend
   - ✅ Ensure backend is running on Render before redeploying frontend

4. ❌ Backend not listening on `0.0.0.0`
   - ✅ Your backend already uses `process.env.PORT || 5000` (correct for Render)

**Debug Steps:**
1. Check Vercel build logs for the injected `VITE_API_BASE_URL`
2. Open DevTools → Network tab on deployed site
3. Look at request URL in network requests
4. Verify backend URL is reachable and API endpoints work

---

## 📞 Summary

| Component | Local | Production |
|-----------|-------|------------|
| Frontend | `http://localhost:3000` | `https://your-app.vercel.app` |
| Backend | `http://localhost:5000` | `https://your-backend.onrender.com` |
| API URL | `http://localhost:5000/api` | `https://your-backend.onrender.com/api` |
| Env Var Source | `.env.local` | Vercel dashboard |

Your code is production-ready! 🎉
