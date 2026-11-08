import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserItem } from '../data/mockData';
import { getUsers, createUser } from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedRole, setSelectedRole] = useState<'all' | 'farmer' | 'seller' | 'transporter'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'farmer' as 'farmer' | 'seller' | 'transporter',
  });

  // 1. Fetch Users from Live Backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await getUsers({
        role: selectedRole !== 'all' ? selectedRole : undefined,
      });

      if (response.data.success) {
        // Map database columns to UserItem structure
        const mappedUsers: UserItem[] = response.data.users.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          location: u.location,
          verified: Boolean(u.verified),
          status: u.status,
          joined: u.created_at ? u.created_at.split('T')[0] : 'N/A',
        }));
        setUsers(mappedUsers);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to load users from database'
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when role filter changes
  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  // Client-side search filtering across loaded users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    return matchesSearch;
  });

  // 2. Handle Add User Submission to Backend Database
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    try {
      setSubmitting(true);
      const res = await createUser({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        location: newUser.location,
        role: newUser.role,
        status: 'active',
      });

      if (res.data.success) {
        // Reset form & close modal
        setNewUser({ name: '', email: '', phone: '', location: '', role: 'farmer' });
        setIsModalOpen(false);
        // Refresh users from database
        await fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user in database');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Role Filters & Add User Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
            {(['all', 'farmer', 'seller', 'transporter'] as const).map((role) => {
              const label = role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1);
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            title="Refresh Users"
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Add User Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* User Count & Status info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredUsers.length} users from database
        </p>
        {loading && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing with Aiven Cloud...
          </span>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Users Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-4 px-6 font-medium">NAME</th>
                <th className="py-4 px-6 font-medium">ROLE</th>
                <th className="py-4 px-6 font-medium">EMAIL</th>
                <th className="py-4 px-6 font-medium">PHONE</th>
                <th className="py-4 px-6 font-medium">LOCATION</th>
                <th className="py-4 px-6 font-medium">VERIFIED</th>
                <th className="py-4 px-6 font-medium">STATUS</th>
                <th className="py-4 px-6 font-medium">JOINED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {filteredUsers.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Name + Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          user.role === 'farmer'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                            : user.role === 'seller'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-normal">
                      {user.email}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-normal whitespace-nowrap">
                      {user.phone || '-'}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-normal whitespace-nowrap">
                      {user.location || '-'}
                    </td>

                    {/* Verified */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {user.verified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500">
                          <AlertCircle className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          user.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
                            : user.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/60'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 border-red-200/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active'
                              ? 'bg-emerald-600'
                              : user.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        ></span>
                        {user.status}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-slate-400 dark:text-slate-500 font-mono text-xs whitespace-nowrap">
                      {user.joined}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Add User to Database
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Perera"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 000 0000"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Location (City / District)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kandy / Dambulla"
                  value={newUser.location}
                  onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Platform Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as 'farmer' | 'seller' | 'transporter',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="farmer">Farmer</option>
                  <option value="seller">Seller</option>
                  <option value="transporter">Transporter</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Add User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}