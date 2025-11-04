# Data Integrity Logger - Backend

Environment variables:

- `PORT` (optional, default 4000)
- `MONGODB_URI` (required)
- `JWT_SECRET` (required for auth)
- `INTEGRITY_SECRET` (required; used to compute HMAC for tamper-evidence)
- `MAX_TEXT_LENGTH` (optional; default 65536 bytes)

Scripts:

- `npm run dev` - start with nodemon
- `npm start` - start server

API:

- `GET /api/health` liveness (includes `dbConnected`)
- `GET /api/ready` readiness (503 until DB is connected)
- `GET /api/logs` list logs
- `POST /api/logs` create log `{ text }`
- `POST /api/logs/:id/verify` verify a log
  - Returns `{ verified, verifiedSha, verifiedHmac, currentHash, originalHash }`
  - Verification is tamper-evident using server-side HMAC over `(text, createdAt, userId)`

Security & limits:

- Text is canonicalized (NFKC, newlines -> `\n`) before hashing/HMAC.
- Size limited via `MAX_TEXT_LENGTH` (default 64KB).
- Soft-deletes: `DELETE /api/logs/:id` marks records deleted (audit-friendly).
- Rate limits applied to auth and write/verify routes.


