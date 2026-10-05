// On GitHub Pages there is no backend — we use VITE_API_URL if provided,
// otherwise fall back to the same origin (works when running locally with Express).
const API_BASE = import.meta.env.VITE_API_URL || '';

// Small fetch wrapper: adds the JWT and turns error responses into thrown Errors.
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
