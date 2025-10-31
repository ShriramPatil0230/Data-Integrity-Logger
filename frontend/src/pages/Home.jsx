import React, { useEffect, useState } from 'react'
import TextForm from '../components/TextForm'
import LogList from '../components/LogList'
import { createLog, fetchLogs } from '../api/api'
import AuthBar from '../components/AuthBar'

export default function Home() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [q, setQ] = useState('')
  const [total, setTotal] = useState(0)
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null))

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
    if (!token) {
      setLogs([])
      setTotal(0)
      return
    }
    load(1)
  }, [q, token])

  async function handleSave(text) {
    setLoading(true)
    setError('')
    try {
      const created = await createLog(text)
      setLogs((prev) => [created, ...prev])
    } catch (e) {
      setError(e.message || 'Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <AuthBar onAuthed={() => { setToken(localStorage.getItem('token')); load(1) }} />
      <div className="searchbar">
        <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <TextForm onSave={handleSave} loading={loading} disabled={!token} />
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {!token && (
        <div className="info">Please login or register to view and create your logs.</div>
      )}
      <LogList logs={logs} />
      <div className="pagination">
        <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p) }} disabled={page <= 1}>Prev</button>
        <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
        <button onClick={() => { const p = page + 1; const max = Math.max(1, Math.ceil(total / limit)); if (p <= max) { setPage(p); load(p) } }} disabled={page >= Math.max(1, Math.ceil(total / limit))}>Next</button>
      </div>
    </div>
  )
}


