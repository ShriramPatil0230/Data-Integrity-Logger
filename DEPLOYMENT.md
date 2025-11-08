# Deployment Guide

This guide explains how to deploy the Data Integrity Logger to production.

## Production URLs

- **Frontend (Vercel):** https://data-integrity-logger-zbtv.vercel.app/
- **Backend (Render):** https://data-integrity-logger.onrender.com/

## Frontend Deployment (Vercel)

### Environment Variables

In your Vercel project settings, add the following environment variable:

```
VITE_BACKEND_URL=https://data-integrity-logger.onrender.com
```

**Important Notes:**
- The URL must **not** have a trailing slash
- Vercel will automatically use this during the build process
- After adding/changing environment variables, you need to **redeploy** the application

### Steps to Configure:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Key:** `VITE_BACKEND_URL`
   - **Value:** `https://data-integrity-logger.onrender.com`
   - **Environment:** Production (and Preview if needed)
4. Click **Save**
5. Trigger a new deployment (or push a commit to trigger automatic deployment)

### Verifying Frontend Configuration

After deployment, check the browser console. The frontend should be making requests to:
```
https://data-integrity-logger.onrender.com/api/...
```

If you see requests going to `http://localhost:4000`, the environment variable is not set correctly.

---

## Backend Deployment (Render)

### Required Environment Variables

In your Render service settings, configure the following environment variables:

```env
# Required
JWT_SECRET=<generate-with-openssl-rand-hex-32>
INTEGRITY_SECRET=<generate-with-openssl-rand-hex-32-different-from-jwt>
MONGODB_URI=<your-mongodb-connection-string>

# Optional but Recommended
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://data-integrity-logger-zbtv.vercel.app
MAX_TEXT_LENGTH=65536
MAX_REQUEST_BYTES=128kb
```

### Critical Configuration:

1. **CORS_ORIGIN:** Set this to your frontend URL:
   ```
   CORS_ORIGIN=https://data-integrity-logger-zbtv.vercel.app
   ```
   - For multiple origins, use comma-separated values
   - For development, you can use `*` (not recommended for production)

2. **MONGODB_URI:** Your MongoDB connection string
   - For MongoDB Atlas: `mongodb+srv://user:password@cluster.mongodb.net/db?retryWrites=true&w=majority`
   - For local MongoDB: `mongodb://127.0.0.1:27017/data-integrity-logger`

3. **JWT_SECRET & INTEGRITY_SECRET:** Generate secure secrets:
   ```bash
   openssl rand -hex 32  # For JWT_SECRET
   openssl rand -hex 32  # For INTEGRITY_SECRET (must be different!)
   ```

### Steps to Configure on Render:

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add each environment variable:
   - Click **Add Environment Variable**
   - Enter the key and value
   - Click **Save Changes**
4. Render will automatically restart the service

### Verifying Backend Configuration

1. Check backend health:
   ```
   https://data-integrity-logger.onrender.com/api/health
   ```
   Should return: `{"status":"ok","dbConnected":true}`

2. Check backend readiness:
   ```
   https://data-integrity-logger.onrender.com/api/ready
   ```
   Should return: `{"status":"ready","dbConnected":true}`

3. Test CORS by checking the response headers:
   ```bash
   curl -I -X OPTIONS https://data-integrity-logger.onrender.com/api/auth/register \
     -H "Origin: https://data-integrity-logger-zbtv.vercel.app" \
     -H "Access-Control-Request-Method: POST"
   ```
   Should include `Access-Control-Allow-Origin` header.

---

## Troubleshooting

### "Route not found" Error

**Symptoms:** Frontend shows "Route not found" when trying to register/login.

**Possible Causes:**
1. **Frontend not configured:** `VITE_BACKEND_URL` is not set or incorrect
   - **Fix:** Set `VITE_BACKEND_URL=https://data-integrity-logger.onrender.com` in Vercel
   - **Verify:** Check browser network tab - requests should go to Render URL

2. **Backend CORS misconfiguration:** Backend is rejecting requests from frontend
   - **Fix:** Set `CORS_ORIGIN=https://data-integrity-logger-zbtv.vercel.app` in Render
   - **Verify:** Check backend logs for CORS errors

3. **Backend not running:** Backend service is down or crashed
   - **Fix:** Check Render service logs and ensure MongoDB is connected
   - **Verify:** Visit `https://data-integrity-logger.onrender.com/api/health`

4. **Route path mismatch:** Request path doesn't match backend routes
   - **Fix:** Check that frontend is calling `/api/auth/register` (not `/register`)
   - **Verify:** Check backend logs for the actual path being requested

### CORS Errors

**Symptoms:** Browser console shows CORS policy errors.

**Fix:**
1. Ensure `CORS_ORIGIN` in backend includes your frontend URL exactly
2. Check that the frontend URL has no trailing slash
3. Verify backend is sending proper CORS headers (check network tab)

### MongoDB Connection Issues

**Symptoms:** Backend returns 503 on `/api/ready`, health check shows `dbConnected: false`

**Fix:**
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist (if using Atlas)
3. Ensure MongoDB service is running
4. Check backend logs for connection errors

---

## Quick Checklist

### Frontend (Vercel)
- [ ] `VITE_BACKEND_URL` set to `https://data-integrity-logger.onrender.com`
- [ ] No trailing slash in URL
- [ ] Redeployed after setting environment variable
- [ ] Browser network tab shows requests going to Render URL

### Backend (Render)
- [ ] `JWT_SECRET` set (32+ character random string)
- [ ] `INTEGRITY_SECRET` set (different from JWT_SECRET)
- [ ] `MONGODB_URI` set and valid
- [ ] `CORS_ORIGIN` set to `https://data-integrity-logger-zbtv.vercel.app`
- [ ] `NODE_ENV=production`
- [ ] Service is running and healthy
- [ ] `/api/health` returns `{"status":"ok","dbConnected":true}`

---

## Testing Production Deployment

1. **Test Registration:**
   - Go to https://data-integrity-logger-zbtv.vercel.app/
   - Try to register a new account
   - Should succeed without "Route not found" error

2. **Test Login:**
   - Login with registered credentials
   - Should redirect to home page

3. **Test API Endpoints:**
   - Check backend health: https://data-integrity-logger.onrender.com/api/health
   - Check backend info: https://data-integrity-logger.onrender.com/

4. **Check Browser Console:**
   - Open browser DevTools → Console
   - Should see no CORS errors
   - Network tab should show successful API calls

---

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render Environment Variables Documentation](https://render.com/docs/environment-variables)
- [MongoDB Atlas Connection String Guide](https://www.mongodb.com/docs/atlas/connection-string/)

