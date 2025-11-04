# Data Integrity Logger

A simple web application that allows you to save text entries alongside their SHA-256 hashes and later verify data integrity. 

---

## Tech Stack

- **Frontend:** React (built with Vite)
- **Backend:** Node.js & Express
- **Database:** MongoDB (local or Atlas, accessed via Mongoose)
- **Hashing:** Node's built-in `crypto` library (SHA-256)

---

## How to Run Locally

**Prerequisites:**  
- Node.js v16+  
- Docker (optional, for MongoDB)

### 1. Start MongoDB

- **Via Docker (recommended):**  
  ```
  docker run -d --name dil-mongo -p 27017:27017 mongo:7
  ```
- **Or local install:**  
  Ensure MongoDB is running on `localhost:27017`.

### 2. Configure Backend

- Copy `backend/.env.example` to `backend/.env`:
  ```bash
  cd backend
  cp .env.example .env
  ```
- Edit `backend/.env` and set your values:
  ```
  # For local dev:
  MONGODB_URI=mongodb://127.0.0.1:27017/data-integrity-logger
  PORT=4000
  JWT_SECRET=change-me  # Generate with: openssl rand -hex 32
  INTEGRITY_SECRET=separate-integrity-secret  # Generate with: openssl rand -hex 32
  MAX_TEXT_LENGTH=65536
  ```
  See `backend/README.md` for detailed environment variable documentation, secrets rotation policy, and production configuration.
- Install dependencies and start backend:
  ```
  npm install
  npm run dev
  ```
  Readiness returns 503 until MongoDB is connected (`GET /api/ready`).

### 3. Configure Frontend

- Copy `frontend/.env.example` to `frontend/.env`:
  ```bash
  cd frontend
  cp .env.example .env
  ```
- Edit `frontend/.env`:
  ```
  VITE_BACKEND_URL=http://localhost:4000
  ```

- Install dependencies and start frontend:
  ```
  npm install
  npm run dev
  ```
- Open the shown URL (usually [http://localhost:5173](http://localhost:5173)).

---

## How Verification Works

- The backend canonicalizes text (Unicode NFKC; newlines normalized to `\n`), then stores:
  - `hash = SHA-256(canonicalText)`
  - `hmac = HMAC-SHA-256(canonicalText + "\n" + createdAtISO + "\n" + userId, INTEGRITY_SECRET)`
- Verification recomputes both and only returns verified when both SHA and HMAC match.
- UI shows: "Verified against stored value (tamper-evident)".

---

## Bonus Features

- **User Login and Registration**
- **Search functionality**: Quickly find logs or entries by text.
- **Soft delete**: Deletions now mark records as deleted (audit-friendly).
- Visual status indicators for "verifying", "verified", "mismatch", and "error"


---

## Deploy

### Backend (recommended: Render)
- Deploy the `backend` folder as a Node app
- Build: `npm install`
- Start: `npm start`
- Set environment variables: `MONGODB_URI`, `PORT`, `JWT_SECRET`, `INTEGRITY_SECRET`

### Frontend (recommended: Vercel)
- Import the repo with the `frontend` folder as the project root
- Set environment variable: `VITE_BACKEND_URL` to your backend's URL
- Build command: `npm run build`
- Output directory: `dist`

---
## Health and Readiness

- `GET /api/health` returns liveness with `{ dbConnected }` flag.
- `GET /api/ready` returns 200 only when MongoDB is connected; otherwise 503.

