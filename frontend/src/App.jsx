import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authKey, setAuthKey] = useState(0) // Force re-render on auth change

  useEffect(() => {
    // Check authentication on mount and when storage changes
    function checkAuth() {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Listen for storage changes (e.g., token cleared in another tab)
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
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
        <span>Simple React log app with hash verification</span>
      </footer>
    </div>
  )
}
