import React, { useState } from 'react';
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
    id: string,
    lable: string,
    icon: React.ElementType;
}
interface NavSection {
    title?: string,
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

    const handleSelect = (id: string) => {
        setCurrentActive(id);
        if (onSelectItem){
            onSelectItem(id);
        }
    };

    const menuSections: NavSection[] = [
        
    ]
}