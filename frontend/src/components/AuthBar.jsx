import React, { useState } from 'react'
import { login, register } from '../api/api'

export default function AuthBar({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function doAuth(fn) {
    try {
      setLoading(true)
      setError('')
      await fn(email, password)
      setEmail('')
      setPassword('')
      onAuthed?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  function logout() {
    localStorage.removeItem('token')
    onAuthed?.()
  }

  if (token) {
    return (
      <div className="authbar">
        <span>Signed in</span>
        <button onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <div className="authbar">
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={loading} onClick={() => doAuth(login)}>{loading ? '...' : 'Login'}</button>
      <button disabled={loading} onClick={() => doAuth(register)}>{loading ? '...' : 'Register'}</button>
      {error && <span className="error">{error}</span>}
    </div>
  )
}


