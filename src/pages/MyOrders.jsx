import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiClock, FiCheck, FiX, FiCoffee } from 'react-icons/fi';
import { getMyOrders } from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: FiClock,
    description: 'Votre commande a été reçue',
  },
  preparing: {
    label: 'En préparation',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: FiCoffee,
    description: 'Le barman prépare votre cocktail',
  },
  ready: {
    label: 'Prêt !',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: FiCheck,
    description: 'Votre cocktail vous attend au bar',
  },
  completed: {
    label: 'Servi',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    icon: FiCheck,
    description: 'Cocktail récupéré',
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: FiX,
    description: 'Commande annulée',
  },
};

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

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      if (loading) {
        toast.error('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Split orders into active and past
  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['completed', 'cancelled'].includes(o.status)
  );

  return (
    <PageWrapper>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Mes commandes
          </h1>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Actualiser"
        >
          <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Active orders */}
        {activeOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              En cours ({activeOrders.length})
            </h2>
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;
                const imageUrl = getImageUrl(order.cocktail_image);

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500"
                  >
                    <div className="flex gap-4">
                      {/* Cocktail image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={order.cocktail_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiCoffee size={24} />
                          </div>
                        )}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {order.cocktail_name}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${config.color}`}
                          >
                            <StatusIcon size={12} />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Commandé à {formatTime(order.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Progress indicator for active orders */}
                    <div className="mt-4 flex items-center gap-2">
                      <div
                        className={`flex-1 h-1.5 rounded-full ${
                          order.status === 'pending'
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                        }`}
                      />
                      <div
                        className={`flex-1 h-1.5 rounded-full ${
                          order.status === 'preparing'
                            ? 'bg-blue-400'
                            : order.status === 'ready'
                            ? 'bg-green-400'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                      <div
                        className={`flex-1 h-1.5 rounded-full ${
                          order.status === 'ready'
                            ? 'bg-green-400'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state for active orders */}
        {!loading && activeOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FiCoffee size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Aucune commande en cours
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Commandez un cocktail depuis le menu !
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Voir les cocktails
            </Link>
          </div>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Historique
            </h2>
            <div className="space-y-2">
              {pastOrders.slice(0, 10).map((order) => {
                const config = statusConfig[order.status];

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          order.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span className="text-gray-900 dark:text-white truncate">
                        {order.cocktail_name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800/80 dark:bg-gray-700/80 text-white text-xs rounded-full backdrop-blur-sm">
        Mise à jour automatique
      </div>
    </PageWrapper>
  );
}

export default MyOrders;
