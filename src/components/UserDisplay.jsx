import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toggleTheme } from '../utils/storage';
import { useState, useEffect } from 'react';

function UserDisplay() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleToggleTheme = () => {
    const newDark = toggleTheme();
    setIsDark(newDark);
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-top">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {user.username}
        </span>
        {user.role === 'admin' && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Changer de thème"
        >
          {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Se déconnecter"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </div>
  );
}

export default UserDisplay;
