## Data Integrity Logger - Frontend

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and configure:

- **`VITE_BACKEND_URL`** (required)
  - Backend API URL
  - **Development:** `http://localhost:4000`
  - **Production:** Your deployed backend URL (e.g., `https://your-backend.onrender.com`)
  - **Note:** Must not include trailing slash

## Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your backend URL

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

Scripts:

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
