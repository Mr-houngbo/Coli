import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Plus, Settings, User, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard' }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fermer la sidebar automatiquement lors d'un changement de route (desktop et mobile)
  useEffect(() => {
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // (Optionnel) on pourrait adapter au resize, mais on laisse l'utilisateur contrôler manuellement
  
  // Ouvrir la sidebar via un évènement global (déclenché par le Header)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-sidebar', handler as any);
    return () => window.removeEventListener('open-sidebar', handler as any);
  }, []);

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
    <>
      {/* Bouton flottant pour (ré)ouvrir sur mobile quand la sidebar est fermée */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed left-3 top-20 z-50 p-2 rounded-lg bg-white shadow border border-gray-200 text-gray-700 hover:bg-gray-50"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div
        className={`bg-white h-full shadow-sm border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-all duration-300 ${
          isOpen ? 'w-64 pointer-events-auto' : 'w-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Bouton de fermeture */}
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-3 md:mt-6">
          <div className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) setIsOpen(false);
                  }}
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
    </>
  );
};

export default Sidebar;