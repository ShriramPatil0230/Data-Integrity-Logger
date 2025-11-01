import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authKey, setAuthKey] = useState(0) // Force re-render on auth change

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  function handleAuthSuccess() {
    setIsAuthenticated(true)
    setAuthKey(prev => prev + 1) // Force Home to re-check userName
  }

  function handleLogout() {
    setIsAuthenticated(false)
    setAuthKey(0)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Data Integrity Logger</h1>
      </header>
      <main>
        {isAuthenticated ? (
          <Home key={authKey} onLogout={handleLogout} onAuthChange={authKey} />
        ) : (
          <Login onAuthSuccess={handleAuthSuccess} />
        )}
      </main>
      <footer className="app-footer">
        <span>SHA-256 verification demo</span>
      </footer>
    </div>
  )
}
