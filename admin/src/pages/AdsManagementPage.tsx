import React, { useState } from 'react';
import {
  Package,
  FileText,
  MapPin,
  Calendar,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import {
  mockSellingAds,
  mockRequirementAds,
  SellingAd,
  RequirementAd,
} from '../data/mockData';

export default function AdsManagementPage() {
  const [activeTab, setActiveTab] = useState<'selling' | 'requirement'>('selling');
  const [sellingAds, setSellingAds] = useState<SellingAd[]>(mockSellingAds);
  const [requirementAds, setRequirementAds] = useState<RequirementAd[]>(mockRequirementAds);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for "Create Ad"
  const [formData, setFormData] = useState({
    type: 'selling' as 'selling' | 'requirement',
    title: '',
    postedBy: '',
    category: 'Vegetables',
    price: '',
    quantity: '',
    location: '',
    deadline: '',
    description: '',
  });

  // Delete Handlers
  const handleDeleteSellingAd = (id: string) => {
    setSellingAds(sellingAds.filter((ad) => ad.id !== id));
  };

  const handleDeleteRequirementAd = (id: string) => {
    setRequirementAds(requirementAds.filter((ad) => ad.id !== id));
  };

  // Create Ad Submit
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.postedBy.trim()) return;

    if (formData.type === 'selling') {
      const newSellingAd: SellingAd = {
        id: Date.now().toString(),
        title: formData.title,
        postedBy: formData.postedBy,
        category: formData.category,
        price: formData.price.startsWith('Rs.') ? formData.price : `Rs. ${formData.price}/kg`,
        quantity: `${formData.quantity} kg available`,
        location: formData.location,
        validUntil: `Until ${formData.deadline || '2026-10-01'}`,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
      };
      setSellingAds([newSellingAd, ...sellingAds]);
      setActiveTab('selling');
    } else {
      const newReqAd: RequirementAd = {
        id: Date.now().toString(),
        title: formData.title,
        postedBy: formData.postedBy,
        category: formData.category,
        offeredPrice: formData.price.startsWith('Rs.') ? formData.price : `Rs. ${formData.price}/kg offered`,
        quantityNeeded: `${formData.quantity} kg needed`,
        location: formData.location,
        deadline: `By ${formData.deadline || '2026-10-01'}`,
        description: formData.description || 'Quality product required.',
        responsesCount: 0,
        status: 'open',
      };
      setRequirementAds([newReqAd, ...requirementAds]);
      setActiveTab('requirement');
    }

    setFormData({
      type: 'selling',
      title: '',
      postedBy: '',
      category: 'Vegetables',
      price: '',
      quantity: '',
      location: '',
      deadline: '',
      description: '',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls: Tabs & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-3">
          {/* Selling Ads Tab */}
          <button
            onClick={() => setActiveTab('selling')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'selling'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Selling Ads</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'selling'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {sellingAds.length}
            </span>
          </button>

          {/* Requirement Ads Tab */}
          <button
            onClick={() => setActiveTab('requirement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'requirement'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Requirement Ads</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'requirement'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {requirementAds.length}
            </span>
          </button>
        </div>

        {/* Create Ad Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </button>
      </div>

      {/* Helper Subtext */}
      <p className="text-xs text-slate-400">
        {activeTab === 'selling'
          ? 'Farmer product listings visible on the marketplace. Admins can remove any listing.'
          : 'Seller requirement listings posted to attract farmer responses. Admins can remove any listing.'}
      </p>

      {/* Ads List */}
      <div className="space-y-3">
        {activeTab === 'selling' ? (
          /* SELLING ADS LIST */
          sellingAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm"
            >
              {/* Left: Thumbnail + Details */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 text-base">{ad.title}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {ad.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    by {ad.postedBy} · {ad.category}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs pt-0.5">
                    <span className="font-bold text-emerald-600">{ad.price}</span>
                    <span className="text-slate-500">{ad.quantity}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {ad.location}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {ad.validUntil}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Delete Action */}
              <button
                onClick={() => handleDeleteSellingAd(ad.id)}
                title="Remove listing"
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          /* REQUIREMENT ADS LIST */
          requirementAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-start justify-between gap-4 transition-all hover:shadow-sm"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-base">{ad.title}</h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                    {ad.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  by {ad.postedBy} · {ad.category}
                </p>

                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs pt-0.5">
                  <span className="font-bold text-blue-600">{ad.offeredPrice}</span>
                  <span className="text-slate-500">{ad.quantityNeeded}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {ad.location}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {ad.deadline}
                  </span>
                </div>

                <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                  {ad.description}
                </p>

                <p className="text-xs font-medium text-emerald-600 pt-0.5 cursor-pointer hover:underline">
                  {ad.responsesCount} farmer responses
                </p>
              </div>

              {/* Right: Delete Action */}
              <button
                onClick={() => handleDeleteRequirementAd(ad.id)}
                title="Remove listing"
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* CREATE AD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Create New Ad</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAd} className="space-y-3.5">
              {/* Ad Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Ad Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'selling' })}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      formData.type === 'selling'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Selling Ad (Farmer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'requirement' })}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      formData.type === 'requirement'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Requirement Ad (Seller)
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Red Onions"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
              </div>

              {/* Posted By & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Posted By
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Perera"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {formData.type === 'selling' ? 'Price (Rs/kg)' : 'Offered Price (Rs/kg)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 150"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Quantity (kg)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Location & Valid Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dambulla"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valid Until / Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description (for requirement ads) */}
              {formData.type === 'requirement' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Description / Specifications
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Quality grade A preferred. Regular supply needed."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                  Create Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
