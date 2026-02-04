// API client for Bartending backend
import { getToken, clearToken } from './storage';

// In production (Docker), use /api prefix (nginx proxies and strips it)
// In development, connect directly to backend
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001';

// Helper for making requests
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(url, config);

  // Handle 401 Unauthorized - clear token and throw
  if (response.status === 401) {
    clearToken();
    throw new Error('Session expirée, veuillez vous reconnecter');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const login = (credentials) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const register = (userData) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const getMe = () => request('/auth/me');

export const changePassword = (currentPassword, newPassword) =>
  request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

// ============================================================================
// USERS (Admin only)
// ============================================================================

export const getUsers = () => request('/users');

export const updateUserRole = (id, role) =>
  request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

export const deleteUser = (id) =>
  request(`/users/${id}`, { method: 'DELETE' });

export const resetUserPassword = (id, newPassword) =>
  request(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });

// ============================================================================
// COCKTAILS
// ============================================================================

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

export const createCocktail = (data) =>
  request('/cocktails', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ============================================================================
// ORDERS
// ============================================================================

export const getOrders = (status) => {
  const params = status ? `?status=${status}` : '';
  return request(`/orders${params}`);
};

export const getMyOrders = () => request('/orders/my');

export const createOrder = (cocktailId, notes) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify({ cocktailId, notes }),
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

// ============================================================================
// ADMIN
// ============================================================================

export const getStats = () => request('/admin/stats');

export const getPopularCocktails = (limit = 10) =>
  request(`/admin/cocktails/popular?limit=${limit}`);

export const toggleCocktailsAvailability = (cocktailIds, available) =>
  request('/admin/cocktails/toggle-availability', {
    method: 'POST',
    body: JSON.stringify({ cocktailIds, available }),
  });

// ============================================================================
// INGREDIENTS
// ============================================================================

export const getIngredients = () => request('/ingredients');

export const createIngredient = (name, in_stock = true) =>
  request('/ingredients', {
    method: 'POST',
    body: JSON.stringify({ name, in_stock }),
  });

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
