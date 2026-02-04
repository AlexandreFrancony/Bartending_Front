import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX, FiLogIn } from 'react-icons/fi';
import { getCocktails } from '../utils/api';
import { getFavorites } from '../utils/storage';
import PageWrapper from '../components/PageWrapper';
import CocktailCard from '../components/CocktailCard';
import toast from 'react-hot-toast';

// Simplified drawer for menu view (no ordering)
function MenuCocktailDrawer({ cocktail, onClose }) {
  if (!cocktail) return null;

  const hasAlcohol = cocktail.ingredients?.some((ing) => ing.category === 'Alcool');

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col safe-bottom">
          {/* Image */}
          {cocktail.image && (
            <div className="relative h-48 flex-shrink-0">
              <img
                src={cocktail.image}
                alt={cocktail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/30 rounded-full text-white hover:bg-black/50"
              >
                <FiX size={20} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {cocktail.name}
                </h2>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    hasAlcohol
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}
                >
                  {hasAlcohol ? 'Avec alcool' : 'Sans alcool'}
                </span>
              </div>
              {!cocktail.available && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg">
                  Indisponible
                </span>
              )}
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Ingrédients
              </h3>
              <div className="space-y-2">
                {cocktail.ingredients?.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {ing.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {ing.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login prompt */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                Connectez-vous pour commander ce cocktail
              </p>
              <div className="flex gap-2 justify-center">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiLogIn size={18} />
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Menu() {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  useEffect(() => {
    loadCocktails();
  }, []);

  const loadCocktails = async () => {
    try {
      const data = await getCocktails();
      setCocktails(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des cocktails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCocktails = useMemo(() => {
    const favorites = getFavorites();

    let result = cocktails.filter((cocktail) => {
      if (search) {
        const searchLower = search.toLowerCase();
        if (!cocktail.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filter !== 'all') {
        const hasAlcohol = cocktail.ingredients?.some(
          (ing) => ing.category === 'Alcool'
        );
        if (filter === 'alcohol' && !hasAlcohol) return false;
        if (filter === 'no-alcohol' && hasAlcohol) return false;
      }

      return true;
    });

    // Sort: available first, then favorites, then alcoholic, then alphabetically
    result.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;

      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then alcoholic cocktails before non-alcoholic
      const aHasAlcohol = a.ingredients?.some((ing) => ing.category === 'Alcool');
      const bHasAlcohol = b.ingredients?.some((ing) => ing.category === 'Alcool');
      if (aHasAlcohol && !bHasAlcohol) return -1;
      if (!aHasAlcohol && bHasAlcohol) return 1;

      return a.name.localeCompare(b.name);
    });

    return result;
  }, [cocktails, search, filter]);

  const filterOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'alcohol', label: 'Avec alcool' },
    { value: 'no-alcohol', label: 'Sans alcool' },
  ];

  return (
    <PageWrapper className="pb-24">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          🍹 Menu
        </h1>
        <Link
          to="/login"
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
        >
          <FiLogIn size={16} />
          Connexion
        </Link>
      </div>

      {/* Search and filters */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 py-3 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cocktail..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cocktail grid */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                <div className="p-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCocktails.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {search
                ? 'Aucun cocktail trouvé pour cette recherche'
                : 'Aucun cocktail disponible'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredCocktails.map((cocktail) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                onClick={() => setSelectedCocktail(cocktail)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4 safe-bottom z-30">
        <div className="flex gap-3 max-w-md mx-auto">
          <Link
            to="/login"
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl text-center hover:bg-blue-700"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="flex-1 py-3 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl text-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Créer un compte
          </Link>
        </div>
      </div>

      {/* Cocktail drawer */}
      {selectedCocktail && (
        <MenuCocktailDrawer
          cocktail={selectedCocktail}
          onClose={() => setSelectedCocktail(null)}
        />
      )}
    </PageWrapper>
  );
}

export default Menu;
