import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiUserPlus, FiBook } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';

function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 22h8M12 11v11M19 3l-7 8-7-8h14zM5 3h14"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tipsy Bar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Découvrez notre carte de cocktails
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiLogIn size={20} />
              Se connecter
            </Link>

            <Link
              to="/register"
              className="w-full py-3 px-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <FiUserPlus size={20} />
              Créer un compte
            </Link>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  ou
                </span>
              </div>
            </div>

            <Link
              to="/menu"
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiBook size={20} />
              Voir le menu
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-sm mt-6">
          Connectez-vous pour commander
        </p>
      </div>
    </PageWrapper>
  );
}

export default Welcome;
