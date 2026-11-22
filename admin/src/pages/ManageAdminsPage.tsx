import React, { useState, useEffect } from 'react';
import { UserPlus, X, Shield, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { getAdmins, createAdminAccount } from '../services/api';

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Admin Form State
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    admin_role: 'Moderator',
  });

  // 1. Fetch live admin accounts
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await getAdmins();
      if (res.data.success) {
        setAdmins(res.data.admins || []);
      }
    } catch (err: any) {
      console.error('Error fetching admins:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // 2. Submit New Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) return;

    try {
      setSubmitting(true);
      const res = await createAdminAccount(newAdmin);
      if (res.data.success) {
        setNewAdmin({ name: '', email: '', phone: '', password: '', admin_role: 'Moderator' });
        setIsModalOpen(false);
        await fetchAdmins(); // Refresh
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      {/* Top Bar: Count & Add Admin Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {admins.length} {admins.length === 1 ? 'admin account' : 'admin accounts'} registered
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdmins}
            title="Refresh Admins"
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Admin Accounts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Loading admin accounts from Aiven...</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-md shadow-slate-200/50 dark:shadow-none flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-emerald-900 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                  {admin.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                      {admin.name}
                    </h4>
                    {admin.is_super_admin ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        Super Admin
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {admin.admin_role || 'Moderator'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {admin.email} · Added {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">
                  {admin.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Admin Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Silva"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@greenhive.lk"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Admin Role
                </label>
                <select
                  value={newAdmin.admin_role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, admin_role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Moderator">Moderator</option>
                  <option value="Support Admin">Support Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}