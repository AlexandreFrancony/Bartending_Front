import { NavLink } from 'react-router-dom';
import { FiHome, FiList, FiSettings, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function BottomNav() {
  const { isAdmin } = useAuth();

  // Only show for admin users
  if (!isAdmin) return null;

  const linkClasses = ({ isActive }) =>
    `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom z-30">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        <NavLink to="/" className={linkClasses}>
          <FiHome size={22} />
          <span className="text-xs font-medium">Accueil</span>
        </NavLink>

        <NavLink to="/orders" className={linkClasses}>
          <FiList size={22} />
          <span className="text-xs font-medium">Commandes</span>
        </NavLink>

        <NavLink to="/users" className={linkClasses}>
          <FiUsers size={22} />
          <span className="text-xs font-medium">Utilisateurs</span>
        </NavLink>

        <NavLink to="/admin" className={linkClasses}>
          <FiSettings size={22} />
          <span className="text-xs font-medium">Admin</span>
        </NavLink>
      </div>
    </nav>
  );
}

export default BottomNav;
