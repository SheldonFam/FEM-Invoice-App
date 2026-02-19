const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export function getToken(): string | null {
  return localStorage.getItem('access_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

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
