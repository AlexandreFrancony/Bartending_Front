import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiSave, FiAlertTriangle } from 'react-icons/fi';
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

function CocktailEditModal({ cocktail, onClose, onSave, isCreating, existingIngredients = [] }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState([{ ...emptyIngredient }]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [newIngredientsWarning, setNewIngredientsWarning] = useState(null);

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
      newErrors.ingredients = 'Au moins un ingr\u00e9dient est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (confirmedNewIngredients = false) => {
    if (!validate()) return;

    // Filter out empty ingredients
    const validIngredients = ingredients.filter((ing) => ing.name.trim());

    // Check for new ingredients (not in existing list)
    const existingNames = new Set(existingIngredients.map((ing) => ing.name.toLowerCase().trim()));
    const newIngredients = validIngredients.filter(
      (ing) => !existingNames.has(ing.name.toLowerCase().trim())
    );

    // If there are new ingredients and user hasn't confirmed, show warning
    if (newIngredients.length > 0 && !confirmedNewIngredients) {
      setNewIngredientsWarning(newIngredients);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: cocktail?.id,
        name: name.trim(),
        image: image.trim() || null,
        ingredients: validIngredients,
        newIngredients: confirmedNewIngredients ? newIngredients : [],
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const confirmNewIngredients = () => {
    handleSave(true);
  };

  const cancelNewIngredients = () => {
    setNewIngredientsWarning(null);
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
          className="bg-[var(--bg-card)] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {isCreating ? 'Nouvelle recette' : 'Modifier la recette'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-input)]"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
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
                    : 'border-[var(--border)]'
                } bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)]`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Image (URL)
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Ex: mojito.jpg"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Ingr\u00e9dients *
                </label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
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
                    className="bg-[var(--bg-primary)] rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, 'name', e.target.value)
                        }
                        placeholder="Nom de l'ingr\u00e9dient"
                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-[var(--status-red-bg)] rounded-lg"
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
                        placeholder="Quantit\u00e9 (ex: 4 cl)"
                        className="w-1/3 min-w-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm"
                      />
                      <select
                        value={ingredient.category}
                        onChange={(e) =>
                          updateIngredient(index, 'category', e.target.value)
                        }
                        className="w-2/3 min-w-0 px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm truncate"
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
              <div className="p-3 bg-[var(--status-red-bg)] rounded-xl text-[var(--status-red-text)] text-sm">
                {errors.submit}
              </div>
            )}

            {/* New Ingredients Warning */}
            {newIngredientsWarning && (
              <div className="p-4 bg-[var(--status-yellow-bg)] rounded-xl border border-[var(--status-yellow-text)]/30">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="text-[var(--status-yellow-text)] mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-[var(--status-yellow-text)]">
                      Nouveaux ingr\u00e9dients d\u00e9tect\u00e9s
                    </p>
                    <p className="text-sm text-[var(--status-yellow-text)] mt-1">
                      Les ingr\u00e9dients suivants n'existent pas encore et seront cr\u00e9\u00e9s :
                    </p>
                    <ul className="mt-2 space-y-1">
                      {newIngredientsWarning.map((ing, idx) => (
                        <li key={idx} className="text-sm text-[var(--status-yellow-text)] flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span className="font-medium">{ing.name}</span>
                          <span className="text-[var(--status-yellow-text)]">({ing.category})</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={cancelNewIngredients}
                        className="px-3 py-1.5 text-sm rounded-lg border border-[var(--status-yellow-text)]/30 text-[var(--status-yellow-text)] hover:bg-[var(--status-yellow-bg)]"
                      >
                        Corriger
                      </button>
                      <button
                        type="button"
                        onClick={confirmNewIngredients}
                        className="px-3 py-1.5 text-sm rounded-lg bg-yellow-600 text-white hover:bg-yellow-700"
                      >
                        Cr\u00e9er et continuer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--border)] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-input)] transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
