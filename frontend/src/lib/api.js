const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, { method='GET', token, body, formData } = {}) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let opts = { method, headers };
  if (formData) {
    opts.body = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.error || JSON.stringify(j); } catch {}
    throw new Error(msg);
  }
  const type = res.headers.get('content-type') || '';
  return type.includes('application/json') ? res.json() : res.text();
}
