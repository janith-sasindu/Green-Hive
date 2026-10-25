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

}