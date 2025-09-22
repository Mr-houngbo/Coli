import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Settings, 
  User, 
  Menu, 
  X, 
  MessageSquare,
  Bell,
  Home,
  Search,
  Heart,
  HelpCircle
} from 'lucide-react';

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

  // Gestion de l'événement personnalisé pour ouvrir le menu
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setIsOpen(true);
      // Ajouter une classe au body pour empêcher le défilement
      document.body.classList.add('overflow-hidden');
    };
    
    const closeHandler = (e: Event) => {
      e.preventDefault();
      setIsOpen(false);
      // Rétablir le défilement
      document.body.classList.remove('overflow-hidden');
    };
    
    // Gérer le clic en dehors du menu pour le fermer
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar-menu');
      const menuButton = document.querySelector('[aria-haspopup="menu"]');
      
      if (isOpen && sidebar && !sidebar.contains(e.target as Node) && 
          menuButton && !menuButton.contains(e.target as Node)) {
        closeHandler(e);
      }
    };
    
    // Gérer la touche Echap pour fermer le menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeHandler(e);
      }
    };
    
    // Écouter les événements
    window.addEventListener('open-sidebar', handler as EventListener);
    window.addEventListener('close-sidebar', closeHandler as EventListener);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    // Nettoyer les écouteurs d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('open-sidebar', handler as EventListener);
      window.removeEventListener('close-sidebar', closeHandler as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      // S'assurer de réactiver le défilement
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]); // Ajout de isOpen comme dépendance
  

  const menuItems = [
    {
      name: 'Accueil',
      path: '/',
      icon: Home
    },
    {
      name: 'Rechercher',
      path: '/recherche',
      icon: Search
    },
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
      name: 'Favoris',
      path: '/favoris',
      icon: Heart
    },
    {
      name: 'Messages',
      path: '/conversations',
      icon: MessageSquare,
      badge: true // Pour afficher un badge de notification
    },
    {
      name: 'Publier une annonce',
      path: '/publish',
      icon: Plus,
      highlight: true // Pour mettre en évidence cette option
    },
    {
      name: 'Profil',
      path: '/profile',
      icon: User
    },
    {
      name: 'Aide & Support',
      path: '/aide',
      icon: HelpCircle
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
        id="sidebar-menu"
        className={`bg-white h-full shadow-sm border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-all duration-300 ${
          isOpen ? 'w-64 pointer-events-auto' : 'w-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Bouton de fermeture */}
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={() => {
              setIsOpen(false);
              // Émettre un événement pour fermer le menu
              window.dispatchEvent(new Event('close-sidebar'));
            }}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-3 md:mt-6" aria-label="Navigation principale">
          <ul className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      item.highlight 
                        ? 'bg-violet-600 text-white hover:bg-violet-700' 
                        : isActive(item.path) 
                          ? 'bg-gray-100 font-medium text-violet-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                        3
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;