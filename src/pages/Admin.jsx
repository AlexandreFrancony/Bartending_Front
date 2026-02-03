import { useState, useEffect, useMemo } from 'react';
import { FiRefreshCw, FiCheck, FiX, FiSearch, FiPackage, FiChevronDown, FiChevronRight, FiBook, FiEdit2, FiPlus } from 'react-icons/fi';
import { getCocktails, getStats, getIngredients, updateIngredient, updateCocktail, createCocktail, createIngredient } from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import UserDisplay from '../components/UserDisplay';
import BottomNav from '../components/BottomNav';
import CocktailEditModal from '../components/CocktailEditModal';
import toast from 'react-hot-toast';

// Category configuration with colors and French labels
const categoryConfig = {
  Alcool: { label: 'Alcools', color: 'bg-red-500', lightBg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  Fruits: { label: 'Fruits & Jus', color: 'bg-orange-500', lightBg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  Sucrant: { label: 'Sirops & Sucrants', color: 'bg-yellow-500', lightBg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  Diluant: { label: 'Diluants', color: 'bg-blue-500', lightBg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  Garniture: { label: 'Garnitures', color: 'bg-green-500', lightBg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  JNPR: { label: 'JNPR (Sans alcool)', color: 'bg-purple-500', lightBg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  Autre: { label: 'Autres', color: 'bg-gray-500', lightBg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
};

function Admin() {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [cocktails, setCocktails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingCocktail, setEditingCocktail] = useState(null);
  const [isCreatingCocktail, setIsCreatingCocktail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cocktailsData, statsData, ingredientsData] = await Promise.all([
        getCocktails(),
        getStats(),
        getIngredients(),
      ]);
      setCocktails(cocktailsData);
      setStats(statsData);
      setIngredients(ingredientsData);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredientStock = async (ingredient) => {
    const newInStock = !ingredient.in_stock;
    try {
      await updateIngredient(ingredient.id, newInStock);
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.id === ingredient.id ? { ...ing, in_stock: newInStock } : ing
        )
      );
      // Reload cocktails to update availability
      const updatedCocktails = await getCocktails();
      setCocktails(updatedCocktails);
      toast.success(
        newInStock
          ? `${ingredient.name} en stock`
          : `${ingredient.name} épuisé`
      );
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSaveCocktail = async (data) => {
    // Create new ingredients first if any
    if (data.newIngredients?.length > 0) {
      for (const ing of data.newIngredients) {
        try {
          await createIngredient(ing.name, true);
          console.log(`✅ Created ingredient: ${ing.name}`);
        } catch (error) {
          // Ingredient might already exist, continue
          console.warn(`Could not create ingredient ${ing.name}:`, error.message);
        }
      }
      toast.success(`${data.newIngredients.length} ingrédient(s) créé(s)`);
    }

    if (isCreatingCocktail) {
      await createCocktail(data);
      toast.success(`${data.name} créé`);
    } else {
      await updateCocktail(data.id, {
        name: data.name,
        image: data.image,
        ingredients: data.ingredients,
      });
      toast.success(`${data.name} modifié`);
    }
    // Reload data
    await loadData();
  };

  const openCreateModal = () => {
    setIsCreatingCocktail(true);
    setEditingCocktail({});
  };

  const openEditModal = (cocktail) => {
    setIsCreatingCocktail(false);
    setEditingCocktail(cocktail);
  };

  const closeModal = () => {
    setEditingCocktail(null);
    setIsCreatingCocktail(false);
  };

  // Group ingredients by category (extracted from cocktails)
  const ingredientsByCategory = useMemo(() => {
    // First, build a map of ingredient name -> category from cocktails
    const ingredientCategoryMap = new Map();
    cocktails.forEach((cocktail) => {
      cocktail.ingredients?.forEach((ing) => {
        if (!ingredientCategoryMap.has(ing.name)) {
          ingredientCategoryMap.set(ing.name, ing.category || 'Autre');
        }
      });
    });

    // Group ingredients by category
    const grouped = {};
    ingredients.forEach((ing) => {
      // Filter by search
      if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) {
        return;
      }

      const category = ingredientCategoryMap.get(ing.name) || 'Autre';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(ing);
    });

    // Sort ingredients within each category
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [ingredients, cocktails, search]);

  // Category order
  const categoryOrder = ['Alcool', 'JNPR', 'Fruits', 'Sucrant', 'Diluant', 'Garniture', 'Autre'];
  const sortedCategories = categoryOrder.filter((cat) => ingredientsByCategory[cat]?.length > 0);

  // Count stats
  const inStockCount = ingredients.filter((i) => i.in_stock).length;
  const availableCocktails = cocktails.filter((c) => c.available).length;

  return (
    <PageWrapper className="pb-nav">
      <UserDisplay />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Administration
        </h1>
        <button
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Actualiser"
        >
          <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {availableCocktails}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cocktails dispo</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inStockCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ingrédients</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats?.pendingOrders || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">En attente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 flex gap-2">
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'ingredients'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <FiPackage size={14} />
          Stock
        </button>
        <button
          onClick={() => setActiveTab('cocktails')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'cocktails'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Cocktails
        </button>
        <button
          onClick={() => setActiveTab('recettes')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'recettes'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <FiBook size={14} />
          Recettes
        </button>
      </div>

      {/* Ingredients Tab */}
      {activeTab === 'ingredients' && (
        <>
          {/* Search */}
          <div className="px-4 py-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un ingrédient..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-2 space-y-2">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              ))
            ) : sortedCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucun ingrédient trouvé</p>
              </div>
            ) : (
              sortedCategories.map((category) => {
                const config = categoryConfig[category] || categoryConfig.Autre;
                const categoryIngredients = ingredientsByCategory[category] || [];
                const inStockInCategory = categoryIngredients.filter((i) => i.in_stock).length;
                const isExpanded = expandedCategories.has(category);

                return (
                  <div key={category} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {config.label}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({inStockInCategory}/{categoryIngredients.length})
                        </span>
                      </div>
                      {isExpanded ? (
                        <FiChevronDown size={20} className="text-gray-400" />
                      ) : (
                        <FiChevronRight size={20} className="text-gray-400" />
                      )}
                    </button>

                    {/* Ingredients list */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-700">
                        {categoryIngredients.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            className="px-4 py-2.5 flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {ingredient.name}
                            </span>
                            <button
                              onClick={() => toggleIngredientStock(ingredient)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                ingredient.in_stock
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}
                            >
                              {ingredient.in_stock ? (
                                <>
                                  <FiCheck size={12} />
                                  En stock
                                </>
                              ) : (
                                <>
                                  <FiX size={12} />
                                  Épuisé
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Cocktails Tab */}
      {activeTab === 'cocktails' && (
        <div className="px-4 py-2 space-y-2">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))
          ) : (
            cocktails.map((cocktail) => {
              const missingIngredients = cocktail.ingredients?.filter(
                (ing) => !ing.in_stock
              ) || [];

              return (
                <div
                  key={cocktail.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 ${
                    !cocktail.available ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {cocktail.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        cocktail.available
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {cocktail.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {missingIngredients.length > 0 && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      <span className="font-medium">Manque : </span>
                      {missingIngredients.map((ing) => ing.name).join(', ')}
                    </div>
                  )}

                  {cocktail.available && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {cocktail.ingredients?.length || 0} ingrédients
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Recettes Tab */}
      {activeTab === 'recettes' && (
        <div className="px-4 py-2 space-y-2">
          {/* Add button */}
          <button
            onClick={openCreateModal}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus size={20} />
            Ajouter une recette
          </button>

          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))
          ) : (
            cocktails.map((cocktail) => (
              <div
                key={cocktail.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {cocktail.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cocktail.ingredients?.length || 0} ingrédients
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal(cocktail)}
                    className="ml-3 p-2.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={18} />
                  </button>
                </div>

                {/* Ingredients preview */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {cocktail.ingredients?.slice(0, 4).map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300"
                    >
                      {ing.name}
                    </span>
                  ))}
                  {cocktail.ingredients?.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                      +{cocktail.ingredients.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cocktail Edit Modal */}
      {editingCocktail && (
        <CocktailEditModal
          cocktail={editingCocktail}
          isCreating={isCreatingCocktail}
          onClose={closeModal}
          onSave={handleSaveCocktail}
          existingIngredients={ingredients}
        />
      )}

      <BottomNav />
    </PageWrapper>
  );
}

export default Admin;
