# Quick Start Guide

## To Fix NetworkError - Start the Backend Server!

### Step 1: Start MongoDB (choose one method)

**Option A - Docker (Recommended):**
```powershell
docker run -d --name dil-mongo -p 27017:27017 mongo:7
```

**Option B - If MongoDB is already installed:**
Make sure MongoDB service is running on `localhost:27017`

### Step 2: Start Backend Server

Open a terminal and run:
```powershell
cd backend
npm install
npm run dev
```

You should see:
```
⚠️  MongoDB connection failed: ... (if MongoDB not running)
🚀 Server listening on port 4000
```

### Step 3: Start Frontend

Open **another** terminal and run:
```powershell
cd frontend
npm install
npm run dev
```

### Step 4: Verify

1. Open browser to: `http://localhost:5173` (or URL shown in terminal)
2. Check backend health: `http://localhost:4000/api/health` should return `{"status":"ok"}`

## Common Issues

### "NetworkError when attempting to fetch resource"
- **Backend is not running** - Make sure Step 2 shows "Server listening on port 4000"
- Check the backend terminal for errors

### "Database not connected"
- MongoDB is not running
- Run the Docker command from Step 1
- Or start your local MongoDB service

### Server won't start
- Check for errors in the backend terminal
- Make sure port 4000 is not already in use
- Try: `netstat -ano | findstr :4000` to check if port is occupied

