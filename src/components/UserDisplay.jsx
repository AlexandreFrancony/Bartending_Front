import { FiEdit2, FiSun, FiMoon } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getUsername, clearUsername, toggleTheme } from '../utils/storage';
import { useState, useEffect } from 'react';

function UserDisplay() {
  const navigate = useNavigate();
  const username = getUsername();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleEditUsername = () => {
    clearUsername();
    navigate('/welcome');
  };

  const handleToggleTheme = () => {
    const newDark = toggleTheme();
    setIsDark(newDark);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-top">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {username}
        </span>
        <button
          onClick={handleEditUsername}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Changer de nom"
        >
          <FiEdit2 size={16} />
        </button>
      </div>

      <button
        onClick={handleToggleTheme}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Changer de thème"
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    </div>
  );
}

export default UserDisplay;
