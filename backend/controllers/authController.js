import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

function createToken(user) {
  const secret = process.env.JWT_SECRET || 'dev-secret'
  const payload = { sub: user.id, email: user.email }
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export async function register(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash })
    const token = createToken(user)
    return res.status(201).json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    return next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = createToken(user)
    return res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    return next(err)
  }
}


