# Data Integrity Logger – Developer Guide

## Project layout

- backend/ – Node.js + Express API (MongoDB via Mongoose)
- frontend/ – React (Vite)
- .gitignore – ignores node_modules, builds, env files

## Environment

Create `backend/.env`:

```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/data-integrity-logger
JWT_SECRET=change-me
INTEGRITY_SECRET=separate-integrity-secret
MAX_TEXT_LENGTH=65536
NODE_ENV=development
```

Create `frontend/.env`:

```
VITE_BACKEND_URL=http://localhost:4000
```

## Run locally

- Backend:
  - cd backend && npm i && npm run dev
- Frontend:
  - cd frontend && npm i && npm run dev

## Docker Compose

```
docker compose up --build
```
- Wait for `mongo` to become healthy, then `backend` becomes healthy on `/api/ready`.

## Security model (short)

- Canonicalize text (NFKC, newlines -> `\n`), store `hash = SHA-256(canonicalText)`.
- Compute `hmac = HMAC-SHA-256(canonicalText + "\n" + createdAtISO + "\n" + userId, INTEGRITY_SECRET)`.
- Verify both SHA and HMAC; UI shows “Tamper-evident verified” only when both match.
- Soft-delete with audit events for create/verify/delete.

## Limits & validation

- Request body size limited (default 128kb, override with `MAX_REQUEST_BYTES`).
- `text` length <= `MAX_TEXT_LENGTH` (default 64KB) via validation and server checks.

## Audit log

- `backend/models/AuditEvent.js` records `{ user, action, entity, entityId, success, metadata }`.
- Events are written on create/verify/delete.

## Optional external anchoring (demo idea)

- Batch daily Merkle root of `{_id, hash}` and publish to a timestamping service.
- Store proof/timestamp in DB; expose `/api/logs/:id/proof` to return inclusion proof.


