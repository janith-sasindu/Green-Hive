import React, { useState } from 'react';
import { UserPlus, X, Trash2 } from 'lucide-react';
import { mockAdmins, AdminAccount } from '../data/mockData';

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>(mockAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Admin Form State
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    username: '',
    role: 'Admin' as 'Admin' | 'Moderator',
  });

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name.trim() || !newAdmin.username.trim()) return;

    const createdAdmin: AdminAccount = {
      id: Date.now().toString(),
      name: newAdmin.name,
      username: newAdmin.username.replace('@', ''),
      role: newAdmin.role,
      addedDate: new Date().toLocaleDateString('en-US'),
      isSuperAdmin: false,
    };

    setAdmins([...admins, createdAdmin]);
    setNewAdmin({ name: '', username: '', role: 'Admin' });
    setIsModalOpen(false);
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar: Count & Add Admin Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">
          {admins.length} {admins.length === 1 ? 'admin account' : 'admin accounts'}
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Admin Accounts List */}
      <div className="space-y-3">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-sm"
          >
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-4">
              {/* Avatar Circle */}
              <div className="w-11 h-11 rounded-full bg-emerald-900 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                {admin.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="font-bold text-slate-800 text-base">{admin.name}</h4>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      admin.role === 'Super Admin'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {admin.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  @{admin.username} · Added {admin.addedDate}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div>
              {!admin.isSuperAdmin && (
                <button
                  onClick={() => handleDeleteAdmin(admin.id)}
                  title="Remove Admin"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Note Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 shadow-xs space-y-1.5">
        <h5 className="font-bold text-amber-800 text-sm">Security note</h5>
        <p className="leading-relaxed">
          Admin accounts have full access to the Green Hive platform. Only create accounts for trusted staff. The Super Admin account (username: admin) cannot be deleted.
        </p>
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Add Admin Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruwan Silva"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ruwan_admin"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Role
                </label>
                <select
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      role: e.target.value as 'Admin' | 'Moderator',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
