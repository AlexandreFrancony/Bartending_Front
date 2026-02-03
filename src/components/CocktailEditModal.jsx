import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Category configuration
const categories = [
  { value: 'Alcool', label: 'Alcool' },
  { value: 'JNPR', label: 'JNPR (Sans alcool)' },
  { value: 'Fruits', label: 'Fruits & Jus' },
  { value: 'Sucrant', label: 'Sirops & Sucrants' },
  { value: 'Diluant', label: 'Diluants' },
  { value: 'Garniture', label: 'Garnitures' },
];

const emptyIngredient = { name: '', quantity: '', category: 'Alcool' };

function CocktailEditModal({ cocktail, onClose, onSave, isCreating }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState([{ ...emptyIngredient }]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cocktail && !isCreating) {
      setName(cocktail.name || '');
      setImage(cocktail.image || '');
      setIngredients(
        cocktail.ingredients?.length > 0
          ? cocktail.ingredients.map((ing) => ({ ...ing }))
          : [{ ...emptyIngredient }]
      );
    } else {
      setName('');
      setImage('');
      setIngredients([{ ...emptyIngredient }]);
    }
  }, [cocktail, isCreating]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Au moins un ingrédient est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      // Filter out empty ingredients
      const validIngredients = ingredients.filter((ing) => ing.name.trim());

      await onSave({
        id: cocktail?.id,
        name: name.trim(),
        image: image.trim() || null,
        ingredients: validIngredients,
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ...emptyIngredient }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isCreating ? 'Nouvelle recette' : 'Modifier la recette'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du cocktail *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mojito"
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.name
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image (URL)
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Ex: mojito.jpg"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ingrédients *
                </label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <FiPlus size={16} />
                  Ajouter
                </button>
              </div>

              {errors.ingredients && (
                <p className="mb-2 text-sm text-red-500">{errors.ingredients}</p>
              )}

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, 'name', e.target.value)
                        }
                        placeholder="Nom de l'ingrédient"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, 'quantity', e.target.value)
                        }
                        placeholder="Quantité (ex: 4 cl)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                      <select
                        value={ingredient.category}
                        onChange={(e) =>
                          updateIngredient(index, 'category', e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                'Enregistrement...'
              ) : (
                <>
                  <FiSave size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CocktailEditModal;
