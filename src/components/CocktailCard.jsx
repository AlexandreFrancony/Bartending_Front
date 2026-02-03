import { FiHeart } from 'react-icons/fi';
import { isFavorite, toggleFavorite } from '../utils/storage';
import { useState } from 'react';

// Import all cocktail images dynamically
const images = import.meta.glob('../assets/images/*.{jpg,jpeg,png,webp}', { eager: true });

function getImageUrl(imageName) {
  if (!imageName) return null;

  // Try to find the image in our assets
  for (const path in images) {
    if (path.includes(imageName)) {
      return images[path].default;
    }
  }
  return null;
}

function CocktailCard({ cocktail, onClick }) {
  const [favorite, setFavorite] = useState(isFavorite(cocktail.id));
  const imageUrl = getImageUrl(cocktail.image);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(cocktail.id);
    setFavorite(!favorite);
  };

  // Check if cocktail has alcohol
  const hasAlcohol = cocktail.ingredients?.some(
    (ing) => ing.category === 'Alcool'
  );

  return (
    <div
      onClick={onClick}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={cocktail.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 22h8M12 11v11M19 3l-7 8-7-8h14zM5 3h14" />
            </svg>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            favorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
          }`}
          aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <FiHeart
            size={18}
            className={favorite ? 'fill-current' : ''}
          />
        </button>

        {/* Alcohol badge */}
        {!hasAlcohol && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
            Sans alcool
          </div>
        )}

        {/* Unavailable overlay */}
        {!cocktail.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-full text-sm">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-white text-center truncate">
          {cocktail.name}
        </h3>
      </div>
    </div>
  );
}

export default CocktailCard;
