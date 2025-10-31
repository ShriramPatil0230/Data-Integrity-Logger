# Data Integrity Logger - Backend

Environment variables:

- `PORT` (optional, default 4000)
- `MONGODB_URI` (required)

Scripts:

- `npm run dev` - start with nodemon
- `npm start` - start server

API:

- `GET /api/health` health check
- `GET /api/logs` list logs
- `POST /api/logs` create log `{ text }`
- `POST /api/logs/:id/verify` verify a log


