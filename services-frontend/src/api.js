const BASE_URL = '/api/v1';
const AUTH_URL = '/api/v1/auth';

async function request(path, options = {}, baseUrl = BASE_URL) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ── Auth ─────────────────────────────────────
export const authApi = {
  register: (body) => request('/register', { method: 'POST', body: JSON.stringify(body) }, AUTH_URL),
  login:    (body) => request('/login',    { method: 'POST', body: JSON.stringify(body) }, AUTH_URL),
  logout:   ()     => request('/logout',   { method: 'POST' },                             AUTH_URL),
};

// ── Categories ──────────────────────────────

export const categoryApi = {
  getAll:    ()         => request('/categories'),
  getById:   (id)       => request(`/categories/${id}`),
  create:    (body)     => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id, body) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id)       => request(`/categories/${id}`, { method: 'DELETE' }),
};

// ── Users ────────────────────────────────────
export const userApi = {
  getAll:    ()         => request('/users'),
  getById:   (id)       => request(`/users/${id}`),
  create:    (body)     => request('/users', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id, body) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id)       => request(`/users/${id}`, { method: 'DELETE' }),
};

// ── Services ─────────────────────────────────
export const serviceApi = {
  getAll:       ()           => request('/services'),
  getById:      (id)         => request(`/services/${id}`),
  getByCategory:(catId)      => request(`/services/by-category/${catId}`),
  getByUser:    (userId)     => request(`/services/by-user/${userId}`),
  create:       (body)       => request('/services', { method: 'POST', body: JSON.stringify(body) }),
  update:       (id, body)   => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:       (id)         => request(`/services/${id}`, { method: 'DELETE' }),
};
