# Data Integrity Logger - Backend

## Environment Variables

### Required Variables

- **`JWT_SECRET`** (required)
  - Used for signing and verifying JWT tokens for authentication
  - **Security:** Must be a strong, random string (minimum 32 characters recommended)
  - **Production:** Use a cryptographically secure random value (e.g., `openssl rand -hex 32`)
  - **Rotation:** Rotate periodically (e.g., every 90 days). When rotating, invalidate existing tokens or migrate users.

- **`INTEGRITY_SECRET`** (required)
  - Used to compute HMAC-SHA256 for tamper-evidence over log entries
  - **Security:** Must be a strong, random string, different from JWT_SECRET (minimum 32 characters recommended)
  - **Production:** Use a cryptographically secure random value
  - **Rotation:** **CRITICAL:** Rotating this invalidates verification of existing logs. Only rotate if compromised. Plan migration strategy if rotation is needed.

- **`MONGODB_URI`** (required in production)
  - MongoDB connection string
  - **Development:** Defaults to `mongodb://127.0.0.1:27017/data-integrity-logger` if not set
  - **Production:** Must be explicitly set (e.g., MongoDB Atlas URI)
  - **Security:** Store in environment variables, never commit to version control
  - **Format:** `mongodb://[username:password@]host[:port][/database][?options]` or `mongodb+srv://[username:password@]cluster/database[?options]`

### Optional Variables

- **`PORT`** (optional, default: 4000)
  - HTTP server port
  - **Production:** Set to your desired port (e.g., `4000` or use reverse proxy)

- **`NODE_ENV`** (optional, default: development)
  - Environment mode: `development` or `production`
  - **Production:** Must be set to `production` for security features (masked logging, fail-fast DB connection)
  - **Development:** Defaults to `development` for verbose logging

- **`MAX_TEXT_LENGTH`** (optional, default: 65536 bytes / 64KB)
  - Maximum allowed text entry size in bytes
  - **Production:** Adjust based on your use case (10KB-64KB recommended)

- **`MAX_REQUEST_BYTES`** (optional, default: 128KB)
  - Maximum HTTP request body size
  - **Format:** Use suffix `b`, `kb`, `mb` (e.g., `131072b`, `128kb`)

## Production vs Development Configuration

### Development (`.env` example)
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/data-integrity-logger
JWT_SECRET=dev-secret-change-in-production
INTEGRITY_SECRET=dev-integrity-secret-change-in-production
MAX_TEXT_LENGTH=65536
```

**Development notes:**
- Server will warn if required env vars are missing but may continue running
- Verbose logging enabled (includes request details)
- More permissive error handling

### Production (`.env` example)
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db?retryWrites=true&w=majority
JWT_SECRET=<generated-32-byte-random-hex-string>
INTEGRITY_SECRET=<different-generated-32-byte-random-hex-string>
MAX_TEXT_LENGTH=65536
MAX_REQUEST_BYTES=128kb
```

**Production notes:**
- Server **fails fast** if DB connection cannot be established (exits on startup failure)
- Request bodies are **masked in logs** (only metadata logged: IDs, status, sizes)
- Strict error handling
- All required env vars must be set

## Secrets Management & Rotation Policy

### Initial Setup
1. Generate strong secrets:
   ```bash
   # Generate JWT_SECRET
   openssl rand -hex 32
   
   # Generate INTEGRITY_SECRET (must be different!)
   openssl rand -hex 32
   ```

2. Store secrets securely:
   - Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never commit `.env` files to version control
   - Restrict access to production secrets to authorized personnel only

### Rotation Schedule

- **JWT_SECRET:** Rotate every 90 days or immediately if compromised
  - Impact: Invalidates existing user sessions (users must re-login)
  - Procedure: Update env var, restart server, notify users if needed

- **INTEGRITY_SECRET:** Rotate only if compromised
  - Impact: **CRITICAL** - Invalidates HMAC verification of all existing logs
  - Procedure: This requires a migration strategy. Consider maintaining both secrets temporarily and re-hashing logs if rotation is necessary.

### Security Best Practices

1. **Never share secrets** between environments (dev/staging/prod)
2. **Use separate secrets** for JWT and integrity (never reuse)
3. **Monitor secret access** and rotation in production
4. **Backup secrets securely** in a separate, encrypted location
5. **Document rotation procedures** in your operational runbooks

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

## Rate Limiting & Auth Protections

### Rate Limits

The system implements IP/user-based rate limiting to prevent brute-force and spam attacks:

- **Auth Endpoints** (`/api/auth/login`, `/api/auth/register`):
  - **Limit**: 50 requests per 15 minutes per IP
  - **Purpose**: Prevents brute-force login attempts and registration spam
  
- **Write Endpoints** (`POST /api/logs`, `POST /api/logs/:id/verify`, `DELETE /api/logs/:id`):
  - **Limit**: 30 requests per minute per IP/user
  - **Purpose**: Prevents abuse and resource exhaustion

- **Implementation**: Uses `express-rate-limit` with standard headers (`X-RateLimit-*`)
- **Response**: HTTP 429 (Too Many Requests) when limit exceeded

Security & limits:

- Text is canonicalized (NFKC, newlines -> `\n`) before hashing/HMAC.
- Size limited via `MAX_TEXT_LENGTH` (default 64KB).
- Soft-deletes: `DELETE /api/logs/:id` marks records deleted (audit-friendly).
- Rate limits applied to auth and write/verify routes.


