const BASE = 'https://smart-coffee-api.onrender.com/api/v1';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `${method} ${path} failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Admin — machines
  getMachines    : ()         => req('GET',    '/admin/machines'),
  getMachine     : (id)       => req('GET',    `/machines/${id}`),
  createMachine  : (body)     => req('POST',   '/admin/machines', body),
  updateMachine  : (id, body) => req('PUT',    `/admin/machines/${id}`, body),
  deleteMachine  : (id)       => req('DELETE', `/admin/machines/${id}`),
  suspendMachine : (id)       => req('PUT',    `/admin/machines/${id}/suspend`),
  activateMachine: (id)       => req('PUT',    `/admin/machines/${id}/activate`),

  // Admin — other
  getOrders  : () => req('GET', '/admin/orders'),
  getBranches: () => req('GET', '/admin/branches'),
  getFaults  : () => req('GET', '/admin/faults'),

  // Machine detail
  getMenu     : (id) => req('GET', `/machines/${id}/menu`),
  getSuppliers: (id) => req('GET', `/machines/${id}/suppliers`),

  // Orders
  createOrder : (body) => req('POST',   '/orders', body),
  completeOrder: (id)  => req('POST',   `/orders/${id}/complete`),
  cancelOrder  : (id)  => req('DELETE', `/orders/${id}`),
};
