import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Missing Authorization token' })
  }
  
  // Get JWT secret with validation
  const jwtSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) || 'dev-secret'
  if (!jwtSecret || jwtSecret.length === 0) {
    // eslint-disable-next-line no-console
    console.error('JWT_SECRET is missing or empty')
    return res.status(500).json({ message: 'Server configuration error: JWT_SECRET must be set' })
  }
  
  try {
    const payload = jwt.verify(token, jwtSecret)
    if (!payload || !payload.sub) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }
    req.user = { id: payload.sub, email: payload.email }
    return next()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('JWT verification error:', e.name, e.message)
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    return res.status(401).json({ message: 'Token verification failed' })
  }
}


