import React, { useState, useEffect } from 'react';
// This imports icons from the Lucide React icon library.
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Shield,
  Megaphone,
  Box,
  CreditCard,
  BarChart3,
  LogOut,
} from 'lucide-react';
import logo from '../../assets/logo.png';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
}
interface NavSection {
    title?: string;
    items: NavItem[];
}

interface SidebarProps {
    activeItem?: string;
    onSelectItem?: (id: string) => void;
}

export default function Sidebar({
    activeItem = 'Dashboard',
    onSelectItem,
}: SidebarProps){
    const [currentActive, setCurrentActive] = useState(activeItem);

    useEffect(() => {
        if (activeItem) {
            setCurrentActive(activeItem);
        }
    }, [activeItem]);

    const handleSelect = (id: string) => {
        setCurrentActive(id);
        if (onSelectItem){
            onSelectItem(id);
        }
    };

    const menuSections: NavSection[] = [
    {
      items: [
        { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'USERS',
      items: [
        { id: 'All Users', label: 'All Users', icon: Users },
        { id: 'Approvals', label: 'Approvals', icon: CheckCircle2 },
        { id: 'Manage Admins', label: 'Manage Admins', icon: Shield },
      ],
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'Ads Management', label: 'Ads Management', icon: Megaphone },
        { id: 'Operations', label: 'Operations', icon: Box },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'Payments', label: 'Payments', icon: CreditCard },
        { id: 'Reports', label: 'Reports', icon: BarChart3 },
      ],
    },
  ];

  return(
    <aside className='w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between select-none'>
        {/* {Scrollable upper area} */}
        <div className='flex-1 overflow-y-auto'>
                    {/* Top Header Section with Logo & Brand */}
        <div className='p-5 border-b border-slate-100 flex flex-col items-center text-center bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-b-2xl shadow-sm'>
            <img
            src={logo}
            alt='Green Hive Logo'
            className='w-20 h-20 object-contain drop-shadow-md mb-2'/>
            <p className='text-[10px] tracking-wider font-semibold text-emerald-200/90 uppercase'>
              CONNECT · TRADE · TRANSPORT · GROW
</p>
        </div>
        {/* Admin tags */}
        <div className='px-5 pt-4 pb-2'>
            <span className='inline-flex item-center px-3 py-1 bg-emerald-50 text-xs font-semibold rounded-full text-emerald-700 border border-emerald-200'>
                Admin
            </span>
        </div>
        {/* Navigation Section */}
         <nav className="px-3 py-2 space-y-4">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider mb-1.5 uppercase">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentActive === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {/* Green active dot indicator */}
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-200"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      {/* Bottom Admin User Profile Section */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-emerald-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              A
            </div>
            {/* User Details */}
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                Admin User
              </p>
              <p className="text-xs text-slate-400">Admin</p>
            </div>
          </div>
          {/* Logout Button */}
          <button
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
