import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { login as apiLogin, register as apiRegister, getMe, updateFavoritesOnServer } from '../utils/api';
import { getToken, setToken, clearToken, getFavorites, setFavorites, setSyncFavoritesCallback } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const syncTimeoutRef = useRef(null);

  // Sync favorites to server (debounced)
  const syncFavoritesToServer = useCallback((favorites) => {
    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    // Debounce by 1 second to avoid too many requests
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await updateFavoritesOnServer(favorites);
      } catch (error) {
        console.warn('Failed to sync favorites to server:', error.message);
      }
    }, 1000);
  }, []);

  // Merge local and server favorites on login
  const mergeFavorites = useCallback((serverFavorites) => {
    const localFavorites = getFavorites();
    // Merge: union of both lists (no duplicates)
    const merged = [...new Set([...localFavorites, ...(serverFavorites || [])])];
    setFavorites(merged);
    // Sync merged list back to server if different from server
    if (merged.length !== (serverFavorites || []).length) {
      updateFavoritesOnServer(merged).catch(() => {});
    }
    return merged;
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await getMe();
          setUser(data.user);
          // Merge favorites from server with local
          mergeFavorites(data.user.favorites);
          // Set up sync callback for future changes
          setSyncFavoritesCallback(syncFavoritesToServer);
        } catch (error) {
          // Token invalid or expired
          console.log('Token invalid, clearing...');
          clearToken();
          setUser(null);
          setSyncFavoritesCallback(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [mergeFavorites, syncFavoritesToServer]);

  const login = useCallback(async (credentials) => {
    const data = await apiLogin(credentials);
    setToken(data.token);
    setUser(data.user);
    // Merge favorites and set up sync
    mergeFavorites(data.user.favorites);
    setSyncFavoritesCallback(syncFavoritesToServer);
    return data.user;
  }, [mergeFavorites, syncFavoritesToServer]);

  const register = useCallback(async (userData) => {
    const data = await apiRegister(userData);
    setToken(data.token);
    setUser(data.user);
    // On register, upload local favorites to server
    const localFavorites = getFavorites();
    if (localFavorites.length > 0) {
      updateFavoritesOnServer(localFavorites).catch(() => {});
    }
    setSyncFavoritesCallback(syncFavoritesToServer);
    return data.user;
  }, [syncFavoritesToServer]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setSyncFavoritesCallback(null);
    // Clear sync timeout on logout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
