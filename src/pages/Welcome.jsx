import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, setUsername } from '../utils/storage';
import PageWrapper from '../components/PageWrapper';

function Welcome() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useEffect(() => {
    // If user already has a username, redirect to home
    if (getUsername()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      setUsername(trimmedName);
      navigate('/', { replace: true });
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 22h8M12 11v11M19 3l-7 8-7-8h14zM5 3h14" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bienvenue
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Entrez votre nom pour commander
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                autoFocus
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-sm mt-6">
          Bartending V2
        </p>
      </div>
    </PageWrapper>
  );
}

export default Welcome;
