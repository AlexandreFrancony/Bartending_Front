import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX, FiList } from 'react-icons/fi';
import { getCocktails, getMyOrders } from '../utils/api';
import { getFavorites } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';
import UserDisplay from '../components/UserDisplay';
import BottomNav from '../components/BottomNav';
import CocktailCard from '../components/CocktailCard';
import CocktailDrawer from '../components/CocktailDrawer';
import toast from 'react-hot-toast';

function Home() {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'alcohol', 'no-alcohol'
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadCocktails();
    loadActiveOrders();
  }, []);

  const loadActiveOrders = async () => {
    try {
      const orders = await getMyOrders();
      const active = orders.filter(
        (o) => !['completed', 'cancelled'].includes(o.status)
      );
      setActiveOrderCount(active.length);
    } catch (error) {
      // Silently fail - not critical
    }
  };

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

  // Filter and sort cocktails
  const filteredCocktails = useMemo(() => {
    const favorites = getFavorites();

    let result = cocktails.filter((cocktail) => {
      // Search filter (searches cocktail name AND ingredient names)
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = cocktail.name.toLowerCase().includes(searchLower);
        const ingredientMatch = cocktail.ingredients?.some(
          (ing) => ing.name.toLowerCase().includes(searchLower)
        );
        if (!nameMatch && !ingredientMatch) {
          return false;
        }
      }

      // Alcohol filter
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
      // Available cocktails first
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;

      // Then favorites
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then alcoholic cocktails before non-alcoholic
      const aHasAlcohol = a.ingredients?.some((ing) => ing.category === 'Alcool');
      const bHasAlcohol = b.ingredients?.some((ing) => ing.category === 'Alcool');
      if (aHasAlcohol && !bHasAlcohol) return -1;
      if (!aHasAlcohol && bHasAlcohol) return 1;

      // Then alphabetically
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
    <PageWrapper className="pb-nav">
      <UserDisplay />

      {/* Search and filters */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 py-3 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cocktail ou ingrédient..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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

        {/* Filter tabs */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Cocktail drawer */}
      {selectedCocktail && (
        <CocktailDrawer
          cocktail={selectedCocktail}
          onClose={() => {
            setSelectedCocktail(null);
            // Refresh order count after closing drawer (in case order was placed)
            loadActiveOrders();
          }}
        />
      )}

      {/* My Orders floating button (for non-admin users) */}
      {!isAdmin && (
        <Link
          to="/my-orders"
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <FiList size={20} />
          <span>Mes commandes</span>
          {activeOrderCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeOrderCount}
            </span>
          )}
        </Link>
      )}

      <BottomNav />
    </PageWrapper>
  );
}

export default Home;
