const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export function getToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

let refreshPromise: Promise<void> | null = null

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!res.ok) throw new Error('Refresh failed')

  const data = await res.json()
  setTokens(data.access_token, data.refresh_token)
}

async function request<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Handle 429 rate limiting
  if (res.status === 429) {
    throw new Error('Too many attempts, please try again later')
  }

  // Handle 401 with token refresh — concurrent requests share the same refresh promise
  // Skip refresh for auth endpoints (login/register return 401 for bad credentials)
  const isAuthRoute = path.startsWith('/auth/')
  if (res.status === 401 && !_retried && !isAuthRoute) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => { refreshPromise = null })
    }

    try {
      await refreshPromise
      return request<T>(path, options, true)
    } catch {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, signal ? { signal } : {}),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}

async function fetchPdfBlob(id: string): Promise<Blob> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/invoices/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to fetch PDF')
  return res.blob()
}

let previousBlobUrl: string | null = null

/** Opens the invoice PDF in a new browser tab */
export async function viewPdf(id: string): Promise<void> {
  // Revoke any previously held blob URL to avoid accumulating memory
  if (previousBlobUrl) {
    URL.revokeObjectURL(previousBlobUrl)
    previousBlobUrl = null
  }

  const blob = await fetchPdfBlob(id)
  const url = URL.createObjectURL(blob)
  const tab = window.open(url, '_blank')
  if (!tab) {
    // Popup was blocked — clean up immediately and fall back to download
    URL.revokeObjectURL(url)
    return downloadPdf(id)
  }
  previousBlobUrl = url
  // Revoke after a timeout — the load event on new tabs is unreliable for blob URLs
  setTimeout(() => {
    if (previousBlobUrl === url) previousBlobUrl = null
    URL.revokeObjectURL(url)
  }, 60_000)
}

/** Streams the PDF and triggers a browser download */
export async function downloadPdf(id: string): Promise<void> {
  const blob = await fetchPdfBlob(id)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
