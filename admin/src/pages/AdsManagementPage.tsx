import React, { useState, useEffect } from 'react';
import {
  Package,
  FileText,
  MapPin,
  Calendar,
  Trash2,
  Plus,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getAds, deleteAd } from '../services/api';

export default function AdsManagementPage() {
  const [activeTab, setActiveTab] = useState<'selling' | 'requirement'>('selling');
  const [sellingAds, setSellingAds] = useState<any[]>([]);
  const [requirementAds, setRequirementAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch live ads from the backend
  const fetchAds = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await getAds();

      if (res.data.success) {
        setSellingAds(res.data.sellingAds || []);
        setRequirementAds(res.data.requirementAds || []);
      }
    } catch (err: any) {
      console.error('Error fetching ads:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to load ads from database'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // 2. Real Backend Action: Delete an Ad
  const handleDeleteAd = async (id: number | string, type: 'selling' | 'requirement') => {
    if (!window.confirm(`Are you sure you want to delete this ${type} ad from the marketplace?`)) {
      return;
    }

    try {
      setActionLoading(id);
      const res = await deleteAd(id, type);
      if (res.data.success) {
        await fetchAds(); // Refresh the list
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete ad');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Tabs, Refresh & Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-3">
          {/* Selling Ads Tab */}
          <button
            onClick={() => setActiveTab('selling')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'selling'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Selling Ads</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'selling'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {sellingAds.length}
            </span>
          </button>

          {/* Requirement Ads Tab */}
          <button
            onClick={() => setActiveTab('requirement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'requirement'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Requirement Ads</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'requirement'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {requirementAds.length}
            </span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchAds}
          title="Refresh Ads"
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Helper Subtext */}
      <p className="text-xs text-slate-400">
        {activeTab === 'selling'
          ? 'Farmer product listings live on the marketplace. Admins can moderate or remove any listing.'
          : 'Seller requirement listings posted to source produce from farmers. Admins can moderate or remove any listing.'}
      </p>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ads List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Loading listings from database...</p>
          </div>
        ) : activeTab === 'selling' ? (
          /* ========================================================= */
          /* SELLING ADS LIST */
          /* ========================================================= */
          sellingAds.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800">
              <p className="text-slate-400 text-sm">No selling ads found.</p>
            </div>
          ) : (
            sellingAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-md shadow-slate-200/50 dark:shadow-none flex items-center justify-between gap-4 transition-all"
              >
                {/* Thumbnail + Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={
                      ad.image_url ||
                      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={ad.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">{ad.title}</h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 capitalize">
                        {ad.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Farmer: <span className="font-semibold text-slate-700 dark:text-slate-300">{ad.farmer_name}</span> · {ad.category}
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs pt-0.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        Rs. {ad.price_per_kg}/{ad.unit || 'kg'}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {ad.quantity_available} {ad.unit || 'kg'} available
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {ad.location}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Valid: {ad.valid_until ? new Date(ad.valid_until).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteAd(ad.id, 'selling')}
                  disabled={actionLoading === ad.id}
                  title="Remove ad from marketplace"
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === ad.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))
          )
        ) : (
          /* ========================================================= */
          /* REQUIREMENT ADS LIST */
          /* ========================================================= */
          requirementAds.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800">
              <p className="text-slate-400 text-sm">No requirement ads found.</p>
            </div>
          ) : (
            requirementAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-md shadow-slate-200/50 dark:shadow-none flex items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{ad.title}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 capitalize">
                      {ad.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Buyer: <span className="font-semibold text-slate-700 dark:text-slate-300">{ad.seller_name}</span> · {ad.category}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs pt-0.5">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      Offered: Rs. {ad.offered_price_per_kg}/{ad.unit || 'kg'}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {ad.quantity_needed} {ad.unit || 'kg'} needed
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {ad.location}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Deadline: {ad.deadline ? new Date(ad.deadline).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {ad.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                      {ad.description}
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteAd(ad.id, 'requirement')}
                  disabled={actionLoading === ad.id}
                  title="Remove ad from marketplace"
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === ad.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}