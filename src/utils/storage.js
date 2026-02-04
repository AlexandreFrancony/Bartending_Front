// localStorage utilities

// ============================================================================
// AUTH TOKEN
// ============================================================================

const TOKEN_KEY = 'auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ============================================================================
// FAVORITES
// ============================================================================

export function getFavorites() {
  try {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(cocktailId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(cocktailId);

  if (index === -1) {
    favorites.push(cocktailId);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  return favorites;
}

export function isFavorite(cocktailId) {
  return getFavorites().includes(cocktailId);
}

// ============================================================================
// THEME
// ============================================================================

export function getTheme() {
  return localStorage.getItem('theme') || 'system';
}

export function setTheme(theme) {
  localStorage.setItem('theme', theme);

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // System preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
  return !isDark;
}

// ============================================================================
// LEGACY (kept for migration, will be removed)
// ============================================================================

export function getUsername() {
  return localStorage.getItem('username') || '';
}

export function setUsername(name) {
  localStorage.setItem('username', name);
}

export function clearUsername() {
  localStorage.removeItem('username');
}

// Legacy admin check - now handled by AuthContext
export function isAdmin() {
  // This is deprecated - use useAuth().isAdmin instead
  return false;
}
