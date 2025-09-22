import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Plus, Settings, User } from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard' }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Tableau de bord',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Mes annonces',
      path: '/dashboard/mes-annonces',
      icon: Package
    },
    {
      name: 'Publier',
      path: '/publish',
      icon: Plus
    },
    {
      name: 'Profil',
      path: '/profile',
      icon: User
    },
    {
      name: 'Paramètres',
      path: '/dashboard/settings',
      icon: Settings
    }
  ];

  const isActive = (path: string) => {
    // Si on est sur la page de dashboard, on vérifie aussi l'onglet actif
    if (path === '/dashboard' && activeTab === 'dashboard') return true;
    if (path === '/dashboard/mes-annonces' && activeTab === 'mes-annonces') return true;
    if (path === '/profile' && activeTab === 'profile') return true;
    
    // Fallback à la vérification de l'URL
    return location.pathname === path;
  };


  return (
    <div className="bg-white h-full shadow-sm border-r border-gray-200 w-64 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                  isActive(item.path)
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;