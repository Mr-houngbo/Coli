import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { Menu, Bell, X, User, MessageSquare, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { conversations } = useConversations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount] = useState(0); // TODO: Implémenter la gestion des notifications
  const location = useLocation();
  const navigate = useNavigate();

  // Mettre à jour les compteurs de messages non lus
  useEffect(() => {
    if (conversations) {
      const totalUnread = conversations.reduce(
        (total, conv) => total + (conv.unread_count || 0), 
        0
      );
      setUnreadMessagesCount(totalUnread);
    }
  }, [conversations]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Fermer le menu de notification lors d'un clic en dehors
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdown = document.querySelector('.notifications-dropdown');
      const button = document.querySelector('[aria-label="Notifications"]');
      
      if (dropdown && !dropdown.contains(target) && button && !button.contains(target)) {
        dropdown.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Bouton Menu (ouvre Sidebar) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Empêcher la propagation de l'événement
                try {
                  // Créer et dispatcher l'événement de manière compatible avec tous les navigateurs
                  const event = new CustomEvent('open-sidebar', { bubbles: true, cancelable: true });
                  window.dispatchEvent(event);
                } catch (error) {
                  console.error('Erreur lors de l\'ouverture du menu :', error);
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              aria-label="Ouvrir le menu latéral"
              aria-haspopup="menu"
              aria-controls="sidebar-menu"
              title="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-violet-600">Coli</h1>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/annonces"
              className={`text-gray-600 hover:text-violet-600 transition-colors ${
                isActive('/annonces') ? 'text-violet-600 font-medium' : ''
              }`}
            >
              Annonces
            </Link>
            
            <Link
              to="/flow-coli"
              className={`text-gray-600 hover:text-violet-600 transition-colors ${
                isActive('/flow-coli') ? 'text-violet-600 font-medium' : ''
              }`}
            >
              🚀 Flow-Coli
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-gray-600 hover:text-violet-600 transition-colors ${
                    isActive('/dashboard') ? 'text-violet-600 font-medium' : ''
                  }`}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/publish"
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Publier
                </Link>
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-violet-600">
                    <User className="h-5 w-5" />
                    <span className="truncate max-w-20">{user?.email?.split('@')[0] || 'Moi'}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-b-lg flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
                
                {/* Bouton de notifications */}
                <div className="relative">
                  <div className="relative group">
                    <button 
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full relative"
                      aria-label="Notifications"
                      aria-haspopup="true"
                      aria-expanded="false"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.querySelector('.notifications-dropdown')?.classList.toggle('hidden');
                      }}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown des notifications */}
                    <div 
                      className="hidden absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 notifications-dropdown"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="notifications-title"
                    >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900" id="notifications-title">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto" role="region" aria-live="polite">
                          {/* Exemple de notification */}
                          <a
                            href="#"
                            className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                            onClick={(e) => {
                              e.preventDefault();
                              // Marquer comme lu
                              // setUnreadCount(prev => Math.max(0, prev - 1));
                            }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                <Bell className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Nouveau message</p>
                                <p className="text-xs text-gray-500">Vous avez reçu un nouveau message de Jean</p>
                                <p className="text-xs text-gray-400 mt-1">Il y a 5 min</p>
                              </div>
                            </div>
                          </a>
                          
                          {/* Autres exemples de notifications */}
                          <a
                            href="#"
                            className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                            onClick={(e) => e.preventDefault()}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Bell className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Nouvelle annonce</p>
                                <p className="text-xs text-gray-500">Votre annonce a été approuvée</p>
                                <p className="text-xs text-gray-400 mt-1">Il y a 2h</p>
                              </div>
                            </div>
                          </a>
                          
                          <a
                            href="#"
                            className="block px-4 py-3 hover:bg-gray-50"
                            onClick={(e) => e.preventDefault()}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Bell className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Mise à jour</p>
                                <p className="text-xs text-gray-500">Nouvelle mise à jour disponible</p>
                                <p className="text-xs text-gray-400 mt-1">Il y a 1 jour</p>
                              </div>
                            </div>
                          </a>
                          
                          <div className="px-4 py-2 text-center border-t border-gray-100">
                          <a href="/notifications" className="text-sm font-medium text-violet-600 hover:text-violet-500">
                            Voir toutes les notifications
                          </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                
                {/* Bouton de messages */}
                <div className="relative">
                  <Link 
                    to="/conversations" 
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full relative inline-block"
                    aria-label="Messages"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="sr-only">Messages</span>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-violet-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/annonces"
              className="block px-3 py-2 text-gray-600 hover:text-violet-600 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Annonces
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-600 hover:text-violet-600 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/publish"
                  className="block px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Publier
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-600 hover:text-violet-600 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-600 hover:text-violet-600 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;