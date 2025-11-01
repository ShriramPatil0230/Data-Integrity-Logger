import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  function handleAuthSuccess() {
    setIsAuthenticated(true)
  }

  function handleLogout() {
    setIsAuthenticated(false)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Data Integrity Logger</h1>
      </header>
      <main>
        {isAuthenticated ? (
          <Home onLogout={handleLogout} />
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
