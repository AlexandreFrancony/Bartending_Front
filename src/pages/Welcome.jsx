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
      <PageWrapper className="flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-[var(--bg-input)] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[var(--accent)]"
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
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Tipsy Bar
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              Découvrez notre carte de cocktails
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full py-3 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiLogIn size={20} />
              Se connecter
            </Link>

            <Link
              to="/register"
              className="w-full py-3 px-4 bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] font-semibold rounded-xl border border-[var(--border)] transition-colors flex items-center justify-center gap-2"
            >
              <FiUserPlus size={20} />
              Créer un compte
            </Link>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--bg-card)] text-[var(--text-muted)]">
                  ou
                </span>
              </div>
            </div>

            <Link
              to="/menu"
              className="w-full py-3 px-4 bg-[var(--bg-input)] hover:bg-[var(--border)] text-[var(--text-secondary)] font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiBook size={20} />
              Voir le menu
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Connectez-vous pour commander
        </p>
      </div>
    </PageWrapper>
  );
}

export default Welcome;
