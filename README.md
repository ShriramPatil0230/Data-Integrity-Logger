# Data Integrity Logger
A simple web application that allows you to save text entries alongside their SHA-256 hashes and later 
verify data integrity. 
This application helps you store text entries along with their cryptographic hashes, so you can later prove that your data hasn’t been tampered with. It includes easy data saving, secure verification, user accounts, search, and strong audit features.

---

**Live App:** [https://data-integrity-logger-zbtv.vercel.app/](https://data-integrity-logger-zbtv.vercel.app/)  
**Backend API:** [https://data-integrity-logger.onrender.com/](https://data-integrity-logger.onrender.com/)

---

## Tech Stack

- **Frontend:** React (powered by Vite)
- **Backend:** Node.js with Express
- **Database:** MongoDB (via Mongoose, runs locally or on Atlas)
- **Hashing/Crypto:** Node’s built-in `crypto` module (SHA-256/HMAC for integrity)

---

## Running the Project Locally

**Requirements**
- Node.js v16 or newer
- Docker (*optional*, for running MongoDB)
- npm

### 1. Launch MongoDB

**Recommended (Docker):**
```sh
docker run -d --name dil-mongo -p 27017:27017 mongo:7
```
Or use your own local MongoDB on `localhost:27017`.

---

### 2. Backend Setup

1. Copy and edit environment config:
   ```sh
   cd backend
   cp .env.example .env
   ```
2. Edit `backend/.env` with your values:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/data-integrity-logger
   PORT=4000
   JWT_SECRET=your-jwt-secret         # Use: openssl rand -hex 32
   INTEGRITY_SECRET=your-hmac-secret  # Use: openssl rand -hex 32
   MAX_TEXT_LENGTH=65536
   ```
   *(See [backend/README.md](./backend/README.md) for full options and best practices.)*
3. Install dependencies and start the API:
   ```sh
   npm install
   npm run dev
   ```
   - The server will start immediately and return `503` on `/api/ready` until MongoDB is connected.
   - Check backend health: `http://localhost:4000/api/health` (always returns 200)
   - Check readiness: `http://localhost:4000/api/ready` (returns 503 until DB connected)

---

### 3. Frontend Setup

1. Configure frontend environment:
   ```sh
   cd frontend
   cp .env.example .env
   ```
2. Edit `frontend/.env`:
   ```
   VITE_BACKEND_URL=http://localhost:4000
   ```
3. Install frontend deps and launch:
   ```sh
   npm install
   npm run dev
   ```
4. Open the displayed local URL (usually [http://localhost:5173](http://localhost:5173)).

---

## How Verification Works

- **Canonicalization:** Before storing or verifying, the backend standardizes input text (Unicode NFKC, normalized newlines).
- **Secure Hash:** It computes `SHA-256(canonicalText)`.
- **Tamper-Evident Signature:** It also computes an HMAC:  
  ```
  HMAC = HMAC-SHA-256(canonicalText + "\n" + createdAtISO + "\n" + userId, INTEGRITY_SECRET)
  ```
- **Verification:** On re-check, both the hash and the HMAC are recomputed and must exactly match what's stored. Only then does the UI show a “Verified” badge.

---

## Bonus Features

- **User Authentication:** Register/login to manage your own entries.
- **Search:** Find your saved logs using text search.
- **Soft Delete:** Entries you remove are only marked deleted—nothing disappears from the audit trail!
- **Visualization:** The UI shows distinct states (“verifying”, “verified”, “mismatch”, “error”).
- **Audit & Readiness:**  
  - Health: `/api/health` and `/api/ready` endpoints signal liveness and DB readiness.
  - Strict repo hygiene: `node_modules/` always ignored, clear mono-repo separation.

---

## Future Improvements (planned, not yet implemented)

- Anchoring daily/periodic batch hashes to an external append-only log (e.g., Merkle roots).
- Hard deletes with dual-approval; append-only audit events.
- Optional CAPTCHA for surge-protection on user signup.

---

## Additional Resources

- **Backend Documentation:** See [backend/README.md](./backend/README.md) for detailed environment variable configuration and API documentation.
- **Frontend Documentation:** See [frontend/README.md](./frontend/README.md) for frontend-specific setup instructions.
- **Quick Start Guide:** See [START_SERVER.md](./START_SERVER.md) for troubleshooting and quick setup steps.
- **Deployment Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions and troubleshooting.
