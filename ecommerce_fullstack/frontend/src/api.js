const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export async function getProducts({ search = '', category = 'All' } = {}) {
  const params = new URLSearchParams()
  if (search.trim()) params.set('search', search.trim())
  if (category && category !== 'All') params.set('category', category)
  const response = await fetch(`${API_BASE}/products/?${params.toString()}`)
  if (!response.ok) throw new Error('Could not load products. Is the backend running?')
  return response.json()
}

export async function getCategories() {
  const response = await fetch(`${API_BASE}/categories/`)
  if (!response.ok) throw new Error('Could not load categories.')
  return response.json()
}

export async function createOrder(order) {
  const response = await fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Could not place order.')
  return data
}
