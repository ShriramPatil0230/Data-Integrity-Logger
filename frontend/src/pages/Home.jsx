import React, { useEffect, useState } from 'react'
import TextForm from '../components/TextForm'
import LogList from '../components/LogList'
import { createLog, fetchLogs } from '../api/api'

export default function Home({ onLogout }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [q, setQ] = useState('')
  const [total, setTotal] = useState(0)
  const [userName, setUserName] = useState('')

  async function load(p = page) {
    try {
      setError('')
      const data = await fetchLogs({ page: p, limit, q })
      setLogs(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLogs([])
      setTotal(0)
      return
    }
    
    load(1)
  }, [q])

  useEffect(() => {
    // Get user name from token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserName(payload.name || '')
      } catch (e) {
        // Ignore token decode errors
      }
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    onLogout?.()
  }

  async function handleSave(text) {
    setLoading(true)
    setError('')
    try {
      const created = await createLog(text)
      setLogs((prev) => [created, ...prev])
      setTotal((prev) => prev + 1)
    } catch (e) {
      setError(e.message || 'Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      setLogs((prev) => prev.filter((log) => log._id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      // Reload to sync with server (in case pagination needs adjustment)
      await load(page)
    } catch (e) {
      setError(e.message || 'Failed to delete entry')
    }
  }

  return (
    <div className="home">
      <div className="header-actions">
        {userName && (
          <div className="welcome-message">
            Welcome, {userName}! 👋
          </div>
        )}
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="searchbar">
        <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <TextForm onSave={handleSave} loading={loading} disabled={false} />
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <LogList logs={logs} onDelete={handleDelete} />
      <div className="pagination">
        <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p) }} disabled={page <= 1}>Prev</button>
        <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
        <button onClick={() => { const p = page + 1; const max = Math.max(1, Math.ceil(total / limit)); if (p <= max) { setPage(p); load(p) } }} disabled={page >= Math.max(1, Math.ceil(total / limit))}>Next</button>
      </div>
    </div>
  )
}


