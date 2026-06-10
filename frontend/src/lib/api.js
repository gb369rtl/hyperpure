const BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'hp_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const qs = (params = {}) =>
  new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  ).toString();

async function request(path, { method = 'GET', body, authed = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authed) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {
      /* ignore */
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // public
  getCategories: () => request('/categories'),
  getContent: () => request('/content'),
  // returns { items, total, page, pages, limit, facets }
  getProducts: (params = {}) => request(`/products${qs(params) ? `?${qs(params)}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),
  createLead: (lead) => request('/leads', { method: 'POST', body: lead }),
  createOrder: (order) => request('/orders', { method: 'POST', body: order }),
  getOrder: (id) => request(`/orders/${id}`),
  trackOrders: (body) => request('/orders/track', { method: 'POST', body }),

  // admin
  login: (creds) => request('/admin/login', { method: 'POST', body: creds }),
  overview: () => request('/admin/overview', { authed: true }),
  updateContent: (body) => request('/admin/content', { method: 'PUT', body, authed: true }),
  leads: (params = {}) => request(`/admin/leads${qs(params) ? `?${qs(params)}` : ''}`, { authed: true }),
  updateLead: (id, body) => request(`/admin/leads/${id}`, { method: 'PUT', body, authed: true }),
  orders: (params = {}) => request(`/admin/orders${qs(params) ? `?${qs(params)}` : ''}`, { authed: true }),
  updateOrder: (id, body) => request(`/admin/orders/${id}`, { method: 'PUT', body, authed: true }),
  createProduct: (body) => request('/products', { method: 'POST', body, authed: true }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body, authed: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', authed: true }),
  createCategory: (body) => request('/categories', { method: 'POST', body, authed: true }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body, authed: true }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', authed: true }),
};
