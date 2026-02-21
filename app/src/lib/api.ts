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

let isRefreshing = false

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

  // Handle 401 with token refresh
  if (res.status === 401 && !_retried) {
    const refreshToken = getRefreshToken()
    if (refreshToken && !isRefreshing) {
      isRefreshing = true
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setTokens(data.access_token, data.refresh_token)
          isRefreshing = false
          return request<T>(path, options, true)
        }
      } catch {
        // refresh failed — fall through to clear
      }
      isRefreshing = false
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
  get: <T>(path: string) =>
    request<T>(path),

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

/** Opens the invoice PDF in a new browser tab */
export async function viewPdf(id: string): Promise<void> {
  const blob = await fetchPdfBlob(id)
  const url = URL.createObjectURL(blob)
  const tab = window.open(url, '_blank')
  // Revoke after the tab has had time to load
  if (tab) tab.addEventListener('load', () => URL.revokeObjectURL(url), { once: true })
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
