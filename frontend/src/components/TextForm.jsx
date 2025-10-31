import React, { useState } from 'react'

export default function TextForm({ onSave, loading, disabled }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) {
      setError('Please enter some text')
      return
    }
    setError('')
    try {
      await onSave(value)
      setText('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label htmlFor="text">Enter text to save</label>
      <textarea
        id="text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        disabled={loading || disabled}
      />
      {error && <div className="error">{error}</div>}
      <button className='submit-btn' type="submit" disabled={loading || disabled}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}


