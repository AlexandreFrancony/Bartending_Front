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
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)] safe-top">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-[var(--text-primary)]">
          {user.username}
        </span>
        {user.role === 'admin' && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]">
            Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleTheme}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Changer de th\ème"
        >
          {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--status-red-text)] rounded-full hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Se d\éconnecter"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </div>
  );
}

export default UserDisplay;
