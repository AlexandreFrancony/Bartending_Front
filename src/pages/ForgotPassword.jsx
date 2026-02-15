import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

// In production (Docker), use /api prefix (nginx proxies it)
// In development, connect directly to backend
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSent(true);
      toast.success('Email envoy\é !');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8"
        >
          <FiArrowLeft size={20} />
          Retour \à la connexion
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Mot de passe oubli\é
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {sent
              ? 'V\érifiez votre bo\îte mail'
              : 'Entrez votre email pour recevoir un lien de r\éinitialisation'}
          </p>
        </div>

        {sent ? (
          /* Success message */
          <div className="bg-[var(--status-green-bg)] border border-[var(--status-green-text)]/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">&#128231;</div>
            <p className="text-[var(--status-green-text)]">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions pour r\éinitialiser votre mot de passe.
            </p>
            <p className="text-[var(--status-green-text)] text-sm mt-4">
              N'oubliez pas de v\érifier vos spams !
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
              >
                Adresse email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 pl-12 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
