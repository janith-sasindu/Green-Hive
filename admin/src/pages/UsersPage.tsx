import React, {useState} from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { mockUsers, UserItem} from '../data/mockData';

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>(mockUsers);
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
  // Filter Logic: by selected role and search term
  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    return matchesRole && matchesSearch;
  });
  // Handle Add User submission
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim()) return;
    const createdUser: UserItem = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      location: newUser.location,
      role: newUser.role,
      verified: true,
      status: 'active',
      joined: new Date().toISOString().split('T')[0],
    };
    setUsers([createdUser, ...users]);
    setNewUser({ name: '', email: '', phone: '', location: '', role: 'farmer' });
    setIsModalOpen(false);
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
        {/* Role Filters & Add User Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-sm">
            {(['all', 'farmer', 'seller', 'transporter'] as const).map((role) => {
              const label = role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1);
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>
      {/* User Count */}
      <p className="text-xs font-medium text-slate-400 px-1">
        {filteredUsers.length} users
      </p>
      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name + Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 whitespace-nowrap">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  {/* Role Badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.role === 'farmer'
                          ? 'bg-emerald-50 text-emerald-700'
                          : user.role === 'seller'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  {/* Email */}
                  <td className="py-4 px-6 text-slate-600 font-normal">
                    {user.email}
                  </td>
                  {/* Phone */}
                  <td className="py-4 px-6 text-slate-600 font-normal whitespace-nowrap">
                    {user.phone}
                  </td>
                  {/* Location */}
                  <td className="py-4 px-6 text-slate-600 font-normal whitespace-nowrap">
                    {user.location}
                  </td>
                  {/* Verified */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    {user.verified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : user.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-red-50 text-red-600 border-red-100'
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
                  <td className="py-4 px-6 text-slate-400 font-mono text-xs whitespace-nowrap">
                    {user.joined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Add User Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Form */}
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Perera"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 000 0000"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colombo"
                  value={newUser.location}
                  onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as 'farmer' | 'seller' | 'transporter',
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
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
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}