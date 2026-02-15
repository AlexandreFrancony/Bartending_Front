import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { createOrder } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Import all cocktail images dynamically
const images = import.meta.glob('../assets/images/*.{jpg,jpeg,png,webp}', { eager: true });

function getImageUrl(imageName) {
  if (!imageName) return null;
  for (const path in images) {
    if (path.includes(imageName)) {
      return images[path].default;
    }
  }
  return null;
}

// Category colors and labels (semantic - keep as-is)
const categoryStyles = {
  Alcool: { bg: 'bg-[var(--status-red-bg)]', text: 'text-[var(--status-red-text)]' },
  Fruits: { bg: 'bg-[var(--status-orange-bg)]', text: 'text-[var(--status-orange-text)]' },
  Sucrant: { bg: 'bg-[var(--status-yellow-bg)]', text: 'text-[var(--status-yellow-text)]' },
  Diluant: { bg: 'bg-[var(--status-blue-bg)]', text: 'text-[var(--status-blue-text)]' },
  Garniture: { bg: 'bg-[var(--status-green-bg)]', text: 'text-[var(--status-green-text)]' },
  JNPR: { bg: 'bg-[var(--status-purple-bg)]', text: 'text-[var(--status-purple-text)]' },
};

function CocktailDrawer({ cocktail, onClose }) {
  const [isOrdering, setIsOrdering] = useState(false);
  const [notes, setNotes] = useState('');
  const { isAuthenticated } = useAuth();
  const imageUrl = getImageUrl(cocktail?.image);

  if (!cocktail) return null;

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour commander');
      return;
    }

    if (!cocktail.available) {
      toast.error('Ce cocktail n\'est pas disponible');
      return;
    }

    setIsOrdering(true);
    try {
      await createOrder(cocktail.id, notes.trim() || undefined);
      toast.success(`${cocktail.name} command\u00e9 !`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la commande');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop animate-fadeIn"
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <div className="bg-[var(--bg-card)] rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col safe-bottom">
          {/* Header with image */}
          <div className="relative h-48 bg-[var(--bg-input)] flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={cocktail.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 22h8M12 11v11M19 3l-7 8-7-8h14zM5 3h14" />
                </svg>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Fermer"
            >
              <FiX size={20} />
            </button>

            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />

            {/* Title */}
            <h2 className="absolute bottom-3 left-4 right-4 text-2xl font-bold text-[var(--text-primary)]">
              {cocktail.name}
            </h2>
          </div>

          {/* Ingredients */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Ingr\u00e9dients
            </h3>
            <ul className="space-y-2">
              {cocktail.ingredients?.map((ing, index) => {
                const style = categoryStyles[ing.category] || {
                  bg: 'bg-[var(--bg-input)]',
                  text: 'text-[var(--text-secondary)]',
                };
                return (
                  <li
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                      >
                        {ing.category}
                      </span>
                      <span className="text-[var(--text-primary)]">
                        {ing.name}
                      </span>
                    </div>
                    <span className="text-[var(--text-muted)] text-sm">
                      {ing.quantity}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Notes input */}
          {isAuthenticated && cocktail.available && (
            <div className="px-4 pb-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (sans glace, plus de citron...)"
                maxLength={100}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          )}

          {/* Order button */}
          <div className="p-4 border-t border-[var(--border)] flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={handleOrder}
                disabled={isOrdering || !cocktail.available}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${
                  cocktail.available
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)]'
                    : 'bg-[var(--text-muted)] cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {isOrdering
                  ? 'Commande en cours...'
                  : cocktail.available
                  ? 'Commander'
                  : 'Indisponible'}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-[var(--text-muted)] text-sm mb-2">
                  Connectez-vous pour commander ce cocktail
                </p>
                <a
                  href="/login"
                  className="inline-block py-2.5 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl transition-colors"
                >
                  Se connecter
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CocktailDrawer;
