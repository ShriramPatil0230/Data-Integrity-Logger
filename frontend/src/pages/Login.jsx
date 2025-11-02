import React, { useState } from 'react'
import { login, register } from '../api/api'

export default function Login({ onAuthSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(true)

  async function handleSubmit(e) {
    e.preventDefault()
    if (isRegister && !name) {
      setError('Name is required')
      return
    }
    if (!email || !password) {
      setError('Email and Password are required')
      return
    }
    try {
      setLoading(true)
      setError('')
      if (isRegister) {
        const data = await register(name, email, password)
        // Ensure userName is stored before navigating
        if (data?.user?.name) {
          localStorage.setItem('userName', data.user.name)
        }
      } else {
        const data = await login(email, password)
        // Ensure userName is stored before navigating
        if (data?.user?.name) {
          localStorage.setItem('userName', data.user.name)
        }
      }
      onAuthSuccess?.()
    } catch (e) {
      setError(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {isRegister ? 'Register to start logging your data' : 'Login to access your logs'}
        </p>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? '...' : isRegister ? 'Register' : 'Login'}
          </button>
          <div className="toggle-auth">
            <span>{isRegister ? 'Already have an account? ' : "Don't have an account? "}</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setName('')
                setEmail('')
                setPassword('')
              }}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

