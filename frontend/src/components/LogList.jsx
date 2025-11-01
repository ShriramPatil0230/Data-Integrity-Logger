import React from 'react'
import LogItem from './LogItem'

export default function LogList({ logs, onDelete }) {
  if (!logs.length) {
    return <div className="empty">No entries yet. Save your first one above.</div>
  }
  return (
    <div className="log-list">
      {logs.map((log) => (
        <LogItem key={log._id} log={log} onDelete={onDelete} />
      ))}
    </div>
  )
}


