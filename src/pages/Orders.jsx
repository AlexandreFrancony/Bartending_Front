import { useState, useEffect } from 'react';
import { FiTrash2, FiRefreshCw, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { getOrders, updateOrderStatus, deleteOrder, deleteAllOrders } from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import UserDisplay from '../components/UserDisplay';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: FiClock },
  preparing: { label: 'En préparation', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FiRefreshCw },
  ready: { label: 'Prêt', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: FiCheck },
  completed: { label: 'Servi', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: FiCheck },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: FiX },
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
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Commandes
        </h1>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Actualiser"
          >
            <FiRefreshCw size={20} />
          </button>
          {orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
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
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
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
              className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
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
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {order.cocktail_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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

                {/* Actions */}
                {!['completed', 'cancelled'].includes(order.status) && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Commencer
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Prêt
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Servi
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="py-2 px-3 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="py-2 px-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
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
