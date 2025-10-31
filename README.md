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

- Make a file at `backend/.env` for settings (use local or MongoDB Atlas):
  ```
  # For local dev:
  MONGODB_URI=mongodb://127.0.0.1:27017/data-integrity-logger
  PORT=4000
  ```
  _or for Atlas:_
  ```
  MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
  PORT=4000
  ```

- Install dependencies and start backend:
  ```
  cd backend
  npm install
  npm run dev
  ```
  _Note: Backend will run and warn if MongoDB isn't connected._

### 3. Configure Frontend

- Create `frontend/.env`:
  ```
  VITE_BACKEND_URL=http://localhost:4000
  ```

- Install dependencies and start frontend:
  ```
  cd frontend
  npm install
  npm run dev
  ```
- Open the shown URL (usually [http://localhost:5173](http://localhost:5173)).

---

## How Verification Works

- When a log is saved, the backend calculates `SHA-256(text)` and stores the original text alongside its hash.
- When you verify a log, the backend recalculates the SHA-256 hash from the stored text, then compares this "fresh" hash to the stored hash:
  - **If they match:** status is "Verified".
  - **If not:** status is "Mismatch" (indicates possible tampering or data corruption).

---

## Bonus Features

- **User Login and Registration**
- **Search functionality**: Quickly find logs or entries by text.
- **Delete entries**: Remove logs instantly with immediate feedback.
- Visual status indicators for "verifying", "verified", "mismatch", and "error"
- Support for local MongoDB or MongoDB Atlas
- Both backend and frontend can be easily deployed (see below)

---

## Deploy

### Backend (recommended: Render)
- Deploy the `backend` folder as a Node app
- Build: `npm install`
- Start: `npm start`
- Set environment variables: `MONGODB_URI`, `PORT`

### Frontend (recommended: Vercel)
- Import the repo with the `frontend` folder as the project root
- Set environment variable: `VITE_BACKEND_URL` to your backend's URL
- Build command: `npm run build`
- Output directory: `dist`

---
