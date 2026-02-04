import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!login.trim() || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await authLogin({ login: login.trim(), password });
      toast.success('Connexion réussie !');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🍹 Tipsy Bar
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nom d'utilisateur ou email
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Votre identifiant"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Connexion...'
            ) : (
              <>
                <FiLogIn size={20} />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-3 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Créer un compte
            </Link>
          </p>
          <Link
            to="/menu"
            className="block text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Voir le menu sans compte →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
