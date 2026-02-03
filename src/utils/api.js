// API client for Bartending backend

// In production (Docker), VITE_API_URL should be empty for relative URLs (nginx proxies)
// In development, fallback to localhost:3001
const API_URL = import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

// Helper for making requests
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Cocktails
export const getCocktails = (available) => {
  const params = available !== undefined ? `?available=${available}` : '';
  return request(`/cocktails${params}`);
};

export const getCocktail = (id) => request(`/cocktails/${id}`);

export const updateCocktail = (id, data) =>
  request(`/cocktails/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Customers
export const getCustomers = () => request('/customers');

export const getCustomer = (id) => request(`/customers/${id}`);

export const createCustomer = (data) =>
  request('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Orders
export const getOrders = (status) => {
  const params = status ? `?status=${status}` : '';
  return request(`/orders${params}`);
};

export const createOrder = (customerName, cocktailId, notes) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify({ customerName, cocktailId, notes }),
  });

export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteOrder = (id) =>
  request(`/orders/${id}`, { method: 'DELETE' });

export const deleteAllOrders = () =>
  request('/orders', { method: 'DELETE' });

// Admin
export const getStats = () => request('/admin/stats');

export const getPopularCocktails = (limit = 10) =>
  request(`/admin/cocktails/popular?limit=${limit}`);

export const toggleCocktailsAvailability = (cocktailIds, available) =>
  request('/admin/cocktails/toggle-availability', {
    method: 'POST',
    body: JSON.stringify({ cocktailIds, available }),
  });

// Ingredients
export const getIngredients = () => request('/ingredients');

export const updateIngredient = (id, in_stock) =>
  request(`/ingredients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ in_stock }),
  });

export const toggleIngredient = (name, in_stock) =>
  request('/ingredients/toggle', {
    method: 'POST',
    body: JSON.stringify({ name, in_stock }),
  });

export const bulkUpdateIngredients = (ingredients) =>
  request('/ingredients/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ ingredients }),
  });
