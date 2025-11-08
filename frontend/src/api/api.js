// Normalize BASE_URL to remove trailing slashes
const rawBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
const BASE_URL = rawBaseUrl.replace(/\/+$/, '') // Remove trailing slashes

// Debug: Log the backend URL being used (only in development)
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('🔗 Backend URL:', BASE_URL)
}

// Helper function to build API URLs safely
function buildApiUrl(path) {
  // Ensure path starts with / and BASE_URL doesn't end with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}${cleanPath}`
}

function authHeaders() {
  const token = localStorage.getItem('token')
  if (!token) {
    // eslint-disable-next-line no-console
    console.warn('No token found in localStorage')
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

async function handleJson(response) {
  if (!response.ok) {
    let message;
    try {
      const data = await response.json();
      message = data.message || data.error || `Request failed with status ${response.status}`;
      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        message = 'Session expired. Please login again.';
        // Trigger page reload to show login page
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else if (response.status === 404) {
        message = 'Service endpoint not found. Please try again later or contact support.';
      } else if (response.status === 503) {
        message = 'Service temporarily unavailable. Please try again in a moment.';
      } else if (response.status === 500) {
        message = 'An internal server error occurred. Please try again later.';
      }
    } catch {
      const text = await response.text();
      message = text || `Request failed with status ${response.status}`;
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        message = 'Session expired. Please login again.';
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else if (response.status === 404) {
        message = 'Service endpoint not found. Please try again later or contact support.';
      } else if (response.status === 503) {
        message = 'Service temporarily unavailable. Please try again in a moment.';
      } else if (response.status === 500) {
        message = 'An internal server error occurred. Please try again later.';
      }
    }
    // Include status code in error for debugging
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json()
}

export async function fetchLogs({ page = 1, limit = 10, q = '' } = {}) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated. Please login first.')
    }
    
    const url = new URL(buildApiUrl('/api/logs'))
    if (page) url.searchParams.set('page', String(page))
    if (limit) url.searchParams.set('limit', String(limit))
    if (q) url.searchParams.set('q', q)
    
    const headers = authHeaders()
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    return handleJson(res)
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

export async function createLog(text) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated. Please login first.')
    }
    
    const headers = { 'Content-Type': 'application/json', ...authHeaders() }
    const res = await fetch(buildApiUrl('/api/logs'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    return handleJson(res)
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

export async function verifyLog(id) {
  try {
    const res = await fetch(buildApiUrl(`/api/logs/${id}/verify`), {
      method: 'POST',
      headers: { ...authHeaders() },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    return handleJson(res)
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

export async function deleteLog(id) {
  const res = await fetch(buildApiUrl(`/api/logs/${id}`), {
    method: 'DELETE',
    headers: { ...authHeaders() },
    signal: AbortSignal.timeout(10000)
  })
  if (res.status === 204) return true
  return handleJson(res)
}

export async function login(email, password) {
  try {
    const res = await fetch(buildApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
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
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

export async function register(name, email, password) {
  try {
    const res = await fetch(buildApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
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
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}


