import React, { useState } from 'react'
import { verifyLog, deleteLog } from '../api/api'
import { formatDate } from '../utils/formatDate'

export default function LogItem({ log, onDelete }) {
  const [status, setStatus] = useState('idle') // idle | verifying | verified | mismatch | error
  const [message, setMessage] = useState('')
  const [verifyDetails, setVerifyDetails] = useState(null)

  function truncateHash(h) {
    if (!h) return ''
    return h.length > 20 ? `${h.slice(0, 10)}…${h.slice(-10)}` : h
  }

  function copy(text) {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  async function handleVerify() {
    try {
      setStatus('verifying')
      setMessage('')
      const res = await verifyLog(log._id)
      setStatus(res.verified ? 'verified' : 'mismatch')
      setMessage(res.verified ? 'Verified against stored value (tamper-evident)' : 'Mismatch')
      setVerifyDetails(res)
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
        <code className="hash" title={log.hash}>{truncateHash(log.hash)}</code>
        <button className="link" onClick={() => copy(log.hash)}>Copy</button>
      </div>
      <pre className="text">{log.text}</pre>
      <div className="actions">
        <button onClick={handleVerify} disabled={status === 'verifying'}>
          {status === 'verifying' && <span className="loading-spinner"></span>}
          {status === 'verifying' ? 'Verifying…' : 'Verify'}
        </button>
        {message && <span className={`status ${status}`}>{message}</span>}
        <button onClick={handleDelete} className="danger">Delete</button>
      </div>
      {verifyDetails && (
        <div className="verify-details">
          <small>SHA match: {verifyDetails.verifiedSha ? 'yes' : 'no'}; HMAC match: {verifyDetails.verifiedHmac ? 'yes' : 'no'}</small>
        </div>
      )}
    </div>
  )
}


