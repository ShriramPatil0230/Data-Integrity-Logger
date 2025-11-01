const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleJson(response) {
  if (!response.ok) {
    let message;
    try {
      const data = await response.json();
      message = data.message || data.error || `HTTP ${response.status}`;
    } catch {
      message = await response.text() || `HTTP ${response.status}`;
    }
    throw new Error(message);
  }
  return response.json()
}

export async function fetchLogs({ page = 1, limit = 10, q = '' } = {}) {
  try {
    const url = new URL(`${BASE_URL}/api/logs`)
    if (page) url.searchParams.set('page', String(page))
    if (limit) url.searchParams.set('limit', String(limit))
    if (q) url.searchParams.set('q', q)
    const res = await fetch(url, {
      headers: { ...authHeaders() },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    return handleJson(res)
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('NetworkError: Cannot reach backend server. Make sure the backend is running: cd backend && npm run dev')
    }
    throw error
  }
}

export async function createLog(text) {
  try {
    const res = await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    return handleJson(res)
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('NetworkError: Cannot reach backend server. Make sure the backend is running: cd backend && npm run dev')
    }
    throw error
  }
}

export async function verifyLog(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/logs/${id}/verify`, {
      method: 'POST',
      headers: { ...authHeaders() },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    return handleJson(res)
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('NetworkError: Cannot reach backend server. Make sure the backend is running: cd backend && npm run dev')
    }
    throw error
  }
}

export async function deleteLog(id) {
  const res = await fetch(`${BASE_URL}/api/logs/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    signal: AbortSignal.timeout(10000)
  })
  if (res.status === 204) return true
  return handleJson(res)
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await handleJson(res)
  localStorage.setItem('token', data.token)
  // Store user info (including name) from API response
  if (data.user) {
    if (data.user.name) {
      localStorage.setItem('userName', data.user.name)
    }
  } else if (data.name) {
    // Fallback: some APIs might return name at root level
    localStorage.setItem('userName', data.name)
  }
  return data
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const data = await handleJson(res)
  localStorage.setItem('token', data.token)
  // Store user info (including name) from API response
  if (data.user) {
    if (data.user.name) {
      localStorage.setItem('userName', data.user.name)
    }
  } else if (data.name) {
    // Fallback: some APIs might return name at root level
    localStorage.setItem('userName', data.name)
  }
  return data
}


