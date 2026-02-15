import { useState, useEffect } from 'react';
import { FiTrash2, FiRefreshCw, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { getOrders, updateOrderStatus, deleteOrder, deleteAllOrders } from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import UserDisplay from '../components/UserDisplay';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]', icon: FiClock },
  preparing: { label: 'En préparation', color: 'bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]', icon: FiRefreshCw },
  ready: { label: 'Prêt', color: 'bg-[var(--status-green-bg)] text-[var(--status-green-text)]', icon: FiCheck },
  completed: { label: 'Servi', color: 'bg-[var(--bg-input)] text-[var(--text-primary)]', icon: FiCheck },
  cancelled: { label: 'Annulé', color: 'bg-[var(--status-red-bg)] text-[var(--status-red-text)]', icon: FiX },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'all', 'active', 'completed'

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Commande ${statusConfig[newStatus].label.toLowerCase()}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast.success('Commande supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Supprimer TOUTES les commandes ?')) return;
    try {
      await deleteAllOrders();
      setOrders([]);
      toast.success('Toutes les commandes supprimées');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return !['completed', 'cancelled'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['completed', 'cancelled'].includes(order.status);
    }
    return true;
  });

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageWrapper className="pb-nav">
      <UserDisplay />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Commandes
        </h1>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-input)]"
            aria-label="Actualiser"
          >
            <FiRefreshCw size={20} />
          </button>
          {orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="p-2 text-red-500 hover:text-[var(--status-red-text)] rounded-lg hover:bg-[var(--status-red-bg)]"
              aria-label="Tout supprimer"
            >
              <FiTrash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-3 flex gap-2">
        {[
          { value: 'active', label: 'En cours' },
          { value: 'completed', label: 'Terminées' },
          { value: 'all', label: 'Toutes' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="px-4 py-2 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] rounded-xl p-4 animate-pulse"
            >
              <div className="h-5 bg-[var(--bg-input)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--bg-input)] rounded w-1/2" />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)]">
              Aucune commande {filter === 'active' ? 'en cours' : ''}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="bg-[var(--bg-card)] rounded-xl p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {order.cocktail_name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {order.customer_name} • {formatTime(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}
                  >
                    <StatusIcon size={12} />
                    {config.label}
                  </span>
                </div>

                {/* Notes */}
                {order.notes && (
                  <p className="text-sm text-[var(--status-amber-text)] mb-3 italic">
                    📝 {order.notes}
                  </p>
                )}

                {/* Actions */}
                {!['completed', 'cancelled'].includes(order.status) && (
                  <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        className="flex-1 py-2 px-3 bg-[var(--status-blue-bg)] text-[var(--status-blue-text)] rounded-lg text-sm font-medium hover:bg-[var(--status-blue-bg)] transition-colors"
                      >
                        Commencer
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="flex-1 py-2 px-3 bg-[var(--status-green-bg)] text-[var(--status-green-text)] rounded-lg text-sm font-medium hover:bg-[var(--status-green-bg)] transition-colors"
                      >
                        Prêt
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        className="flex-1 py-2 px-3 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors"
                      >
                        Servi
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="py-2 px-3 text-[var(--status-red-text)] rounded-lg text-sm font-medium hover:bg-[var(--status-red-bg)] transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="py-2 px-3 text-[var(--text-muted)] hover:text-[var(--status-red-text)] rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </PageWrapper>
  );
}

export default Orders;
