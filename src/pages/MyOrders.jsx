import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiClock, FiCheck, FiX, FiCoffee } from 'react-icons/fi';
import { getMyOrders } from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]',
    icon: FiClock,
    description: 'Votre commande a été reçue',
  },
  preparing: {
    label: 'En préparation',
    color: 'bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]',
    icon: FiCoffee,
    description: 'Le barman prépare votre cocktail',
  },
  ready: {
    label: 'Prêt !',
    color: 'bg-[var(--status-green-bg)] text-[var(--status-green-text)]',
    icon: FiCheck,
    description: 'Votre cocktail vous attend au bar',
  },
  completed: {
    label: 'Servi',
    color: 'bg-[var(--bg-input)] text-[var(--text-primary)]',
    icon: FiCheck,
    description: 'Cocktail récupéré',
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-[var(--status-red-bg)] text-[var(--status-red-text)]',
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
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)] px-4 py-3 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-input)]"
          >
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Mes commandes
          </h1>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-input)]"
          aria-label="Actualiser"
        >
          <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Active orders */}
        {activeOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
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
                    className="bg-[var(--bg-card)] rounded-xl p-4 shadow-sm border-l-4 border-[var(--accent)]"
                  >
                    <div className="flex gap-4">
                      {/* Cocktail image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-input)] flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={order.cocktail_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                            <FiCoffee size={24} />
                          </div>
                        )}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[var(--text-primary)] truncate">
                            {order.cocktail_name}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${config.color}`}
                          >
                            <StatusIcon size={12} />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                          {config.description}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
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
                            : 'bg-[var(--bg-input)]'
                        }`}
                      />
                      <div
                        className={`flex-1 h-1.5 rounded-full ${
                          order.status === 'ready'
                            ? 'bg-green-400'
                            : 'bg-[var(--bg-input)]'
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
              <FiCoffee size={32} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] font-medium">
              Aucune commande en cours
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Commandez un cocktail depuis le menu !
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl transition-colors"
            >
              Voir les cocktails
            </Link>
          </div>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Historique
            </h2>
            <div className="space-y-2">
              {pastOrders.slice(0, 10).map((order) => {
                const config = statusConfig[order.status];

                return (
                  <div
                    key={order.id}
                    className="bg-[var(--bg-card)] rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          order.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span className="text-[var(--text-primary)] truncate">
                        {order.cocktail_name}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--text-muted)] flex-shrink-0">
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
                className="bg-[var(--bg-card)] rounded-xl p-4 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[var(--bg-input)]" />
                  <div className="flex-1">
                    <div className="h-5 bg-[var(--bg-input)] rounded w-1/2 mb-2" />
                    <div className="h-4 bg-[var(--bg-input)] rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--bg-header)]/80 text-[var(--text-primary)] text-xs rounded-full backdrop-blur-sm">
        Mise à jour automatique
      </div>
    </PageWrapper>
  );
}

export default MyOrders;
