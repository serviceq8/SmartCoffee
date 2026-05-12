const BASE = 'https://smart-coffee-api.onrender.com/api/v1';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  // Admin
  getMachines   : ()   => get('/admin/machines'),
  getOrders     : ()   => get('/admin/orders'),
  getBranches   : ()   => get('/admin/branches'),
  getFaults     : ()   => get('/admin/faults'),
  resolveFault  : (id) => put(`/admin/faults/${id}/resolve`),

  // Machine detail
  getMachine    : (id) => get(`/machines/${id}`),
  getMenu       : (id) => get(`/machines/${id}/menu`),
  getSuppliers  : (id) => get(`/machines/${id}/suppliers`),

  // Orders
  createOrder   : (body) => post('/orders', body),
  completeOrder : (id)   => post(`/orders/${id}/complete`),
  cancelOrder   : (id)   => fetch(`${BASE}/orders/${id}`, { method: 'DELETE' }),
};
