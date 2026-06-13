const BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'sm_token';
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

  // reviews (public)
  getReviews: (productId, params = {}) => request(`/products/${productId}/reviews${qs(params) ? `?${qs(params)}` : ''}`),
  submitReview: (productId, body) => request(`/products/${productId}/reviews`, { method: 'POST', body }),

  // auth (unified — works for all users)
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getMe: () => request('/auth/me', { authed: true }),
  // settings (public read)
  getSettings: () => request('/settings'),
  updateSettings: (body) => request('/admin/settings', { method: 'PUT', body, authed: true }),
  // admin
  overview: () => request('/admin/overview', { authed: true }),
  updateContent: (body) => request('/admin/content', { method: 'PUT', body, authed: true }),
  // admin: roles
  getRoles: () => request('/admin/roles', { authed: true }),
  createRole: (body) => request('/admin/roles', { method: 'POST', body, authed: true }),
  updateRole: (id, body) => request(`/admin/roles/${id}`, { method: 'PUT', body, authed: true }),
  deleteRole: (id) => request(`/admin/roles/${id}`, { method: 'DELETE', authed: true }),

  // admin: users
  getUsers: (params = {}) => request(`/admin/users${qs(params) ? `?${qs(params)}` : ''}`, { authed: true }),
  createUser: (body) => request('/admin/users', { method: 'POST', body, authed: true }),
  updateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body, authed: true }),
  resetUserPassword: (id, body) => request(`/admin/users/${id}/password`, { method: 'PUT', body, authed: true }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE', authed: true }),

  // admin: permissions list
  getPermissions: () => request('/admin/permissions', { authed: true }),

  // admin: reviews
  adminReviews: (params = {}) => request(`/admin/reviews${qs(params) ? `?${qs(params)}` : ''}`, { authed: true }),
  updateReview: (productId, reviewId, body) => request(`/admin/reviews/${productId}/${reviewId}`, { method: 'PUT', body, authed: true }),
  deleteReview: (productId, reviewId) => request(`/admin/reviews/${productId}/${reviewId}`, { method: 'DELETE', authed: true }),

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
  // tags
  getTags: () => request('/tags'),
  // coupons (public)
  validateCoupon: (body) => request('/coupons/validate', { method: 'POST', body }),
  // coupons (admin)
  getCoupons: () => request('/admin/coupons', { authed: true }),
  createCoupon: (body) => request('/admin/coupons', { method: 'POST', body, authed: true }),
  updateCoupon: (id, body) => request(`/admin/coupons/${id}`, { method: 'PUT', body, authed: true }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE', authed: true }),
  // bulk discount
  bulkDiscount: (body) => request('/admin/products/bulk-discount', { method: 'PUT', body, authed: true }),
};
