import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  Lock,
} from 'lucide-react';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
  const [formError, setFormError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter,
      });
      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.createUser(formData);
      showToast(`User "${formData.username}" created successfully.`);
      setIsCreateOpen(false);
      setFormData({ username: '', password: '', role: 'user' });
      fetchUsers(pagination.page);
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = {
        username: formData.username,
        role: formData.role,
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      await api.updateUser(editingUser.id, payload);
      showToast(`User "${formData.username}" updated successfully.`);
      setEditingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setFormError(err.message || 'Failed to update user.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await api.deleteUser(deletingUser.id);
      showToast(`User "${deletingUser.username}" removed.`);
      setDeletingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({ username: u.username, password: '', role: u.role });
    setFormError('');
  };

  const openCreateModal = () => {
    setFormData({ username: '', password: '', role: 'user' });
    setFormError('');
    setIsCreateOpen(true);
  };

  return (
    <div className="users-page-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="users-header-bar">
        <div>
          <h1 className="page-title">Users Directory & CRUD</h1>
          <p className="page-subtitle">
            Admin console: Manage application accounts, roles, and privileges.
          </p>
        </div>
        <button id="btn-create-user" className="btn-primary" onClick={openCreateModal}>
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="users-filters-row glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            id="users-search-input"
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={18} className="filter-icon" />
          <select
            id="users-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admins only</option>
            <option value="user">Users only</option>
          </select>
        </div>

        <div className="total-counter">
          <span>Total Records: <strong>{pagination.total}</strong></span>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-wrapper glass-panel">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Role</th>
              <th>Created At</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  <div className="spinner-md"></div>
                  <p className="mt-2 text-muted">Loading user accounts...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  <p className="text-muted">No users found matching query.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                const isAdmin = u.role === 'admin';

                return (
                  <tr key={u.id} className="user-row">
                    <td className="font-mono text-muted">#{u.id}</td>
                    <td>
                      <div className="user-cell">
                        <div className={`table-avatar ${isAdmin ? 'admin-avatar' : 'user-avatar'}`}>
                          {isAdmin ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <span className="user-table-name">{u.username}</span>
                          {isCurrent && <span className="you-pill">You</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-pill ${isAdmin ? 'role-admin' : 'role-user'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          id={`edit-user-${u.id}`}
                          className="btn-icon-action edit"
                          onClick={() => openEditModal(u)}
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          id={`delete-user-${u.id}`}
                          className="btn-icon-action delete"
                          onClick={() => setDeletingUser(u)}
                          disabled={isCurrent}
                          title={isCurrent ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <span className="pagination-info">
            Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
          </span>
          <div className="pagination-buttons">
            <button
              id="pagination-prev-btn"
              className="btn-page"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              id="pagination-next-btn"
              className="btn-page"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="btn-close" onClick={() => setIsCreateOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-box error">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. user51"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User (Weather only)</option>
                  <option value="admin">Admin (Weather + CRUD)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h2>Edit User #{editingUser.id}</h2>
              <button className="btn-close" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-box error">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Leave empty to keep current password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User (Weather only)</option>
                  <option value="admin">Admin (Weather + CRUD)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel danger-modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="btn-close" onClick={() => setDeletingUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete user{' '}
                <strong>"{deletingUser.username}"</strong>?
              </p>
              <p className="text-warning-subtle">
                This operation removes the record directly from PostgreSQL and cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
