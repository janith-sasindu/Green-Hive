import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Layers,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { mockOperations, OperationItem } from '../data/mockData';

export default function OperationsPage(){
    const [operations, setOperations] = useState<OperationItem[]>(mockOperations);
    const [activeTab, setActiveTab] = useState<'all' | 'product' | 'order' | 'transport'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

  const allCount = operations.length;
  const productCount = operations.filter((i) => i.type === 'product').length;
  const orderCount = operations.filter((i) => i.type === 'order').length;
  const transportCount = operations.filter((i) => i.type === 'transport').length;

    // Filter Logic
  const filteredOperations = operations.filter((item) => {
    // 1. Tab filter
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    // 2. Search query filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term) ||
      (item.owner && item.owner.toLowerCase().includes(term)) ||
      (item.route && item.route.toLowerCase().includes(term)) ||
      (item.pickupDrop && item.pickupDrop.toLowerCase().includes(term));
    // 3. Date range filter
    const matchesFrom = fromDate ? item.date >= fromDate : true;
    const matchesTo = toDate ? item.date <= toDate : true;
    return matchesTab && matchesSearch && matchesFrom && matchesTo;
  });

  // Render Status Badge
  const renderStatusBadge = (status: OperationItem['status']) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            {status}
          </span>
        );
      case 'Open':
      case 'Payment Held':
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            {status}
          </span>
        );
      case 'In Transit':
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };
   // Render Icon Box based on item type
  const renderItemIcon = (type: OperationItem['type']) => {
    if (type === 'product') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'order') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5" />
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Search & Date Filter Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, order ID, farmer, seller, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
          />
        </div>
        {/* Date Pickers */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          {(fromDate || toDate || searchTerm) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setSearchTerm('');
              }}
              className="text-xs text-red-500 hover:underline sm:ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      {/* Category Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* All Tab */}
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {allCount}
          </span>
        </button>
        {/* Products Tab */}
        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'product'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'product'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {productCount}
          </span>
        </button>
        {/* Orders Tab */}
        <button
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'order'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'order'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {orderCount}
          </span>
        </button>
        {/* Transport Tab */}
        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'transport'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Transport</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'transport'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {transportCount}
          </span>
        </button>
      </div>
      {/* Result Count */}
      <p className="text-xs font-medium text-slate-400 px-1">
        {filteredOperations.length} results
      </p>
      {/* Operations List */}
      <div className="space-y-3">
        {filteredOperations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <p className="text-slate-400 text-sm">No operation records match your filters.</p>
          </div>
        ) : (
          filteredOperations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm"
            >
              {/* Left: Type Icon + Info */}
              <div className="flex items-center gap-4 min-w-0">
                {renderItemIcon(item.type)}
                <div className="space-y-1 min-w-0">
                  {/* Title & Code */}
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                    <span className="text-xs font-mono text-slate-400">{item.code}</span>
                  </div>
                  {/* Product Specific Line */}
                  {item.type === 'product' && (
                    <>
                      <p className="text-xs text-slate-500">
                        {item.category} · {item.quantity} · {item.rate}
                      </p>
                      <p className="text-xs text-slate-400">{item.owner}</p>
                    </>
                  )}
                  {/* Order Specific Line */}
                  {item.type === 'order' && (
                    <>
                      <p className="text-xs text-slate-600 font-medium">{item.route}</p>
                      <p className="text-xs text-slate-400">{item.pickupDrop}</p>
                    </>
                  )}
                  {/* Transport Specific Line */}
                  {item.type === 'transport' && (
                    <>
                      <p className="text-xs text-slate-600 font-medium">{item.pickupDrop}</p>
                      <p className="text-xs text-slate-400">{item.schedule}</p>
                    </>
                  )}
                </div>
              </div>
              {/* Right: Status, Amount, Date */}
              <div className="text-right shrink-0 space-y-1">
                <div>{renderStatusBadge(item.status)}</div>
                {item.amount && (
                  <p className="text-sm font-bold text-slate-800">{item.amount}</p>
                )}
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

}