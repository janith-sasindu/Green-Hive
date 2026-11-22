import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Layers,
  Package,
  ShoppingBag,
  Truck,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getOperations } from '../services/api';

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'product' | 'order' | 'transport'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [counts, setCounts] = useState({ all: 0, products: 0, orders: 0, transport: 0 });
  const [allOperations, setAllOperations] = useState<any[]>([]);

  // 1. Fetch live operations data from backend
  const fetchOperations = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await getOperations();

      if (res.data.success) {
        setCounts(res.data.counts);

        // Normalize the 3 datasets into a unified list
        const products = (res.data.products || []).map((p: any) => ({
          id: `prod-${p.id}`,
          type: 'product',
          title: p.name,
          code: `#PR-${p.id}`,
          owner: p.farmer_name,
          details: `${p.category} · Rs. ${p.price}/kg · ${p.quantity} kg`,
          status: p.status,
          date: p.created_at ? p.created_at.split('T')[0] : '',
        }));

        const orders = (res.data.orders || []).map((o: any) => ({
          id: `ord-${o.id}`,
          type: 'order',
          title: o.product_name,
          code: o.order_code,
          owner: `Farmer: ${o.farmer_name} → Buyer: ${o.seller_name}`,
          details: `${o.quantity} kg · Rs. ${Number(o.total_amount).toLocaleString()}`,
          status: o.status,
          date: o.created_at ? o.created_at.split('T')[0] : '',
        }));

        const transports = (res.data.transports || []).map((t: any) => ({
          id: `tr-${t.id}`,
          type: 'transport',
          title: `Delivery (${t.vehicle_type || 'Truck'})`,
          code: t.job_code,
          owner: `Transporter: ${t.transporter_name}`,
          details: `${t.pickup_location} → ${t.drop_location} · Fee: Rs. ${Number(t.fee).toLocaleString()}`,
          status: t.status,
          date: t.created_at ? t.created_at.split('T')[0] : '',
        }));

        setAllOperations([...orders, ...products, ...transports]);
      }
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  // Filter Logic
  const filteredOperations = allOperations.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(term) ||
      item.code?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term) ||
      item.owner?.toLowerCase().includes(term) ||
      item.details?.toLowerCase().includes(term);

    const matchesFrom = fromDate ? item.date >= fromDate : true;
    const matchesTo = toDate ? item.date <= toDate : true;

    return matchesTab && matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search operations by ID, product, farmer, buyer, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Date Pickers & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-white outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-white outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchOperations}
            title="Refresh Operations"
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'product'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20">
            {counts.products}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'order'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20">
            {counts.orders}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'transport'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Transport</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20">
            {counts.transport}
          </span>
        </button>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Operations List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Loading operations from Aiven MySQL...</p>
          </div>
        ) : filteredOperations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800">
            <p className="text-slate-400 text-sm">No operations found matching your filters.</p>
          </div>
        ) : (
          filteredOperations.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-md shadow-slate-200/50 dark:shadow-none flex items-center justify-between gap-4 transition-all"
            >
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.type === 'product'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                      : item.type === 'order'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                  }`}
                >
                  {item.type === 'product' && <Package className="w-5 h-5" />}
                  {item.type === 'order' && <ShoppingBag className="w-5 h-5" />}
                  {item.type === 'transport' && <Truck className="w-5 h-5" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                      {item.title}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">{item.code}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                    {item.owner}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{item.details}</p>
                </div>
              </div>

              {/* Right: Status Pill & Date */}
              <div className="text-right shrink-0 space-y-1">
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 capitalize">
                  {item.status}
                </span>
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}