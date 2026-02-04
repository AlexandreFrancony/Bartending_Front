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

// Category colors and labels
const categoryStyles = {
  Alcool: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  Fruits: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  Sucrant: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  Diluant: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  Garniture: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  JNPR: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
};

function CocktailDrawer({ cocktail, onClose }) {
  const [isOrdering, setIsOrdering] = useState(false);
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
      await createOrder(cocktail.id);
      toast.success(`${cocktail.name} commandé !`);
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
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col safe-bottom">
          {/* Header with image */}
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={cocktail.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
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
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />

            {/* Title */}
            <h2 className="absolute bottom-3 left-4 right-4 text-2xl font-bold text-gray-900 dark:text-white">
              {cocktail.name}
            </h2>
          </div>

          {/* Ingredients */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Ingrédients
            </h3>
            <ul className="space-y-2">
              {cocktail.ingredients?.map((ing, index) => {
                const style = categoryStyles[ing.category] || {
                  bg: 'bg-gray-100 dark:bg-gray-700',
                  text: 'text-gray-700 dark:text-gray-300',
                };
                return (
                  <li
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                      >
                        {ing.category}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {ing.name}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {ing.quantity}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Order button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={handleOrder}
                disabled={isOrdering || !cocktail.available}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${
                  cocktail.available
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-400 cursor-not-allowed'
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
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  Connectez-vous pour commander ce cocktail
                </p>
                <a
                  href="/login"
                  className="inline-block py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
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
