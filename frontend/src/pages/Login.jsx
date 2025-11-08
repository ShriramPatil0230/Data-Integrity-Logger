import React, { useState } from 'react'
import { login, register } from '../api/api'

export default function Login({ onAuthSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false) // Default to Login

  
  async function handleSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    setError('')

    if (isRegister && !name) {
      setError('Name is required')
      return
    }
    if (!email || !password) {
      setError('Email and Password are required')
      return
    }
    setLoading(true)
    try {
      if (isRegister) {
        const data = await register(name, email, password)
        if (data?.user?.name) {
          localStorage.setItem('userName', data.user.name)
        }
        onAuthSuccess?.()
      } else {
        const data = await login(email, password)
        if (data?.user?.name) {
          localStorage.setItem('userName', data.user.name)
          onAuthSuccess?.()
        } else {
          setError('User not valid. Try to input valid email and password.')
        }
      }
    } catch (err) {
      if (
        (err?.response && (err.response.status === 401 || err.response.status === 400)) ||
        err?.message === 'Invalid email or password'
      ) {
        setError('User not valid. Try to input valid email and password.')
      } else {
        setError(err.message || 'Authentication failed')
      }
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
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          // Remove browser "required" validation to prevent reload
          noValidate
        >
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
