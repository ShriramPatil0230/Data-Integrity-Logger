import { Router } from 'express'
import { login, register } from '../controllers/authController.js'
import { authLimiter } from '../middlewares/rateLimit.js'

const router = Router()

// Handle OPTIONS for CORS preflight
router.options('/register', (_req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.sendStatus(204)
})

router.options('/login', (_req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.sendStatus(204)
})

// POST routes for authentication
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

// Handle wrong HTTP methods (GET, PUT, DELETE, etc.) with helpful error
// These are registered AFTER POST routes so they only catch non-POST requests
router.get('/register', (_req, res) => {
  res.status(405).json({ 
    message: 'Method not allowed. Use POST /api/auth/register',
    method: 'GET',
    allowed: ['POST', 'OPTIONS']
  })
})

router.get('/login', (_req, res) => {
  res.status(405).json({ 
    message: 'Method not allowed. Use POST /api/auth/login',
    method: 'GET',
    allowed: ['POST', 'OPTIONS']
  })
})

// Catch-all for other methods (PUT, DELETE, PATCH, etc.)
router.all('/register', (req, res) => {
  res.status(405).json({ 
    message: 'Method not allowed. Use POST /api/auth/register',
    method: req.method,
    allowed: ['POST', 'OPTIONS']
  })
})

router.all('/login', (req, res) => {
  res.status(405).json({ 
    message: 'Method not allowed. Use POST /api/auth/login',
    method: req.method,
    allowed: ['POST', 'OPTIONS']
  })
})

export default router


