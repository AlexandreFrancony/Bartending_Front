import { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiUser, FiTrash2, FiKey, FiSearch } from 'react-icons/fi';
import { getUsers, updateUserRole, deleteUser, resetUserPassword } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';
import UserDisplay from '../components/UserDisplay';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Modal states
  const [deleteModal, setDeleteModal] = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    // Prevent self-demotion
    if (userId === currentUser?.id && newRole === 'user') {
      toast.error('Vous ne pouvez pas vous retirer les droits admin');
      return;
    }

    setActionLoading(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast.success(`Rôle modifié en ${newRole === 'admin' ? 'Admin' : 'Utilisateur'}`);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la modification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;

    setActionLoading(deleteModal.id);
    try {
      await deleteUser(deleteModal.id);
      setUsers(users.filter(u => u.id !== deleteModal.id));
      toast.success('Utilisateur supprimé');
      setDeleteModal(null);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal || !newPassword.trim()) return;

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setActionLoading(resetModal.id);
    try {
      await resetUserPassword(resetModal.id, newPassword);
      toast.success('Mot de passe réinitialisé');
      setResetModal(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la réinitialisation');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <PageWrapper className="pb-24">
      <UserDisplay />

      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <FiUsers className="text-[var(--accent)]" size={24} />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Gestion des utilisateurs
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {users.length} utilisateur{users.length !== 1 ? 's' : ''} • {adminCount} admin{adminCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-3 sticky top-0 z-10 bg-[var(--bg-primary)]">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* User list */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--bg-card)] rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-input)]" />
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--bg-input)] rounded w-1/3 mb-2" />
                    <div className="h-3 bg-[var(--bg-input)] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)]">
              {search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-[var(--bg-card)] rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'admin'
                          ? 'bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]'
                          : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <FiShield size={20} />
                      ) : (
                        <FiUser size={20} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {user.username}
                        </span>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-[var(--accent)]">
                            (vous)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        {user.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.role === 'admin'
                            ? 'bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={actionLoading === user.id}
                      className={`p-2 rounded-lg transition-colors ${
                        user.role === 'admin'
                          ? 'text-[var(--status-purple-text)] hover:bg-[var(--status-purple-bg)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)]'
                      }`}
                      title={user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                    >
                      <FiShield size={18} />
                    </button>

                    <button
                      onClick={() => setResetModal(user)}
                      disabled={actionLoading === user.id}
                      className="p-2 text-[var(--status-amber-text)] hover:bg-[var(--status-amber-bg)] rounded-lg transition-colors"
                      title="Réinitialiser mot de passe"
                    >
                      <FiKey size={18} />
                    </button>

                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => setDeleteModal(user)}
                        disabled={actionLoading === user.id}
                        className="p-2 text-[var(--status-red-text)] hover:bg-[var(--status-red-bg)] rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setDeleteModal(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Supprimer l'utilisateur ?
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {deleteModal.username}
                </span>{' '}
                ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 py-2.5 px-4 bg-[var(--bg-input)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--border)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading === deleteModal.id}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reset password modal */}
      {resetModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setResetModal(null);
              setNewPassword('');
            }}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Réinitialiser le mot de passe
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                Nouveau mot de passe pour{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {resetModal.username}
                </span>
              </p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResetModal(null);
                    setNewPassword('');
                  }}
                  className="flex-1 py-2.5 px-4 bg-[var(--bg-input)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--border)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading === resetModal.id || !newPassword.trim()}
                  className="flex-1 py-2.5 px-4 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </PageWrapper>
  );
}

export default UserManagement;
