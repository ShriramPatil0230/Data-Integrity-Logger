import { Router } from 'express'
import { login, register } from '../controllers/authController.js'
import { authLimiter } from '../middlewares/rateLimit.js'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

export default router


