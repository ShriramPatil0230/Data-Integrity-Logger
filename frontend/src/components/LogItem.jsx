import React, { useState } from 'react'
import { verifyLog, deleteLog } from '../api/api'
import { formatDate } from '../utils/formatDate'

export default function LogItem({ log, onDelete }) {
  const [status, setStatus] = useState('idle') // idle | verifying | verified | mismatch | error
  const [message, setMessage] = useState('')

  async function handleVerify() {
    try {
      setStatus('verifying')
      setMessage('')
      const res = await verifyLog(log._id)
      setStatus(res.verified ? 'verified' : 'mismatch')
      setMessage(res.verified ? 'Verified' : 'Mismatch')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  async function handleDelete() {
    try {
      await deleteLog(log._id)
      onDelete?.(log._id)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  return (
    <div className="log-item card">
      <div className="log-meta">
        <span className="timestamp">{formatDate(log.createdAt)}</span>
        <code className="hash">{log.hash}</code>
      </div>
      <pre className="text">{log.text}</pre>
      <div className="actions">
        <button onClick={handleVerify} disabled={status === 'verifying'}>
          {status === 'verifying' ? 'Verifying…' : 'Verify'}
        </button>
        {message && <span className={`status ${status}`}>{message}</span>}
        <button onClick={handleDelete} className="danger">Delete</button>
      </div>
    </div>
  )
}


