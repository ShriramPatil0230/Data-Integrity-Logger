import React from 'react'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Data Integrity Logger</h1>
      </header>
      <main>
        <Home />
      </main>
      <footer className="app-footer">
        <span>SHA-256 verification demo</span>
      </footer>
    </div>
  )
}
