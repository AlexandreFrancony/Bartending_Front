import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password requirements
  const passwordRequirements = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success('Compte créé avec succès !');
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
            Créez votre compte
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choisissez un pseudo"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
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
                placeholder="Créez un mot de passe"
                autoComplete="new-password"
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
            {/* Password requirements */}
            {password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm ${
                      req.met
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {req.met ? <FiCheck size={14} /> : <FiX size={14} />}
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                confirmPassword && confirmPassword !== password
                  ? 'border-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-sm text-red-500">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Création...'
            ) : (
              <>
                <FiUserPlus size={20} />
                Créer mon compte
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-3 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Se connecter
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

export default Register;
