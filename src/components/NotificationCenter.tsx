import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Clock, 
  Package, 
  CreditCard, 
  MessageSquare, 
  AlertTriangle,
  Shield,
  Star,
  User,
  MapPin,
  Settings,
  Filter,
  MoreVertical,
  Eye,
  Trash2
} from 'lucide-react';
import { Notification as CustomNotification } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchNotifications();
    }
  }, [isOpen, user?.id]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Simulation - remplacez par votre API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user?.id || '',
          type: 'payment_received',
          title: 'Paiement reçu',
          message: 'Vous avez reçu un paiement de 15,000 FCFA pour votre transport Dakar → Thiès',
          data: { amount: 15000, transaction_id: 'txn_123' },
          is_read: false,
          priority: 'high',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 min ago
        },
        {
          id: '2',
          user_id: user?.id || '',
          type: 'package_delivered',
          title: 'Colis livré',
          message: 'Votre colis a été livré avec succès à Thiès. Confirmez la réception pour libérer le paiement.',
          data: { coli_space_id: 'space_123' },
          is_read: false,
          priority: 'high',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 min ago
        },
        {
          id: '3',
          user_id: user?.id || '',
          type: 'new_message',
          title: 'Nouveau message',
          message: 'Mamadou vous a envoyé un message concernant votre colis',
          data: { conversation_id: 'conv_123', sender_name: 'Mamadou' },
          is_read: true,
          priority: 'medium',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2h ago
        },
        {
          id: '4',
          user_id: user?.id || '',
          type: 'identity_verified',
          title: 'Identité vérifiée',
          message: 'Félicitations ! Votre identité a été vérifiée avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités.',
          data: {},
          is_read: true,
          priority: 'high',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: '5',
          user_id: user?.id || '',
          type: 'dispute_created',
          title: 'Litige signalé',
          message: 'Un litige a été ouvert pour votre transaction. Notre équipe examine le dossier.',
          data: { dispute_id: 'dispute_123' },
          is_read: false,
          priority: 'high',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      package_status: Package,
      payment_received: CreditCard,
      payment_released: CreditCard,
      new_message: MessageSquare,
      identity_verified: Shield,
      rating_received: Star,
      dispute_created: AlertTriangle,
      dispute_resolved: Check,
      package_delivered: MapPin,
      gp_assigned: User,
      system: Bell
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') {
      return 'bg-red-100 text-red-600';
    }
    
    const colors = {
      package_status: 'bg-blue-100 text-blue-600',
      payment_received: 'bg-green-100 text-green-600',
      payment_released: 'bg-green-100 text-green-600',
      new_message: 'bg-purple-100 text-purple-600',
      identity_verified: 'bg-blue-100 text-blue-600',
      rating_received: 'bg-yellow-100 text-yellow-600',
      dispute_created: 'bg-red-100 text-red-600',
      dispute_resolved: 'bg-green-100 text-green-600',
      package_delivered: 'bg-green-100 text-green-600',
      gp_assigned: 'bg-blue-100 text-blue-600',
      system: 'bg-gray-100 text-gray-600'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Simulation - remplacez par votre API
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Simulation - remplacez par votre API
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Simulation - remplacez par votre API
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const deleteSelectedNotifications = async () => {
    try {
      // Simulation - remplacez par votre API
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif.id))
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.is_read;
      case 'important': return notif.priority === 'high';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes lues'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filtres et actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="important">Importantes</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 && (
                <button
                  onClick={deleteSelectedNotifications}
                  className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Supprimer ({selectedNotifications.length})</span>
                </button>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Tout marquer comme lu</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'Toutes vos notifications ont été lues'
                  : 'Vous recevrez ici toutes vos notifications'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type, notification.priority);
                const isSelected = selectedNotifications.includes(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    } ${isSelected ? 'bg-blue-100' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox de sélection */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1 text-blue-600 rounded"
                      />

                      {/* Icône */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-sm font-semibold ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {notification.priority === 'high' && (
                                <div className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                  Important
                                </div>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              !notification.is_read ? 'text-gray-700' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-4">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                                title="Marquer comme lu"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredNotifications.length} notification(s) affichée(s)
            </p>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Settings className="w-4 h-4" />
              <span>Paramètres de notification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour l'icône de notification avec badge
interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  className = ''
}) => {
  const [unreadCount, setUnreadCount] = useState(3); // Simulation

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  );
};

// Hook pour gérer les notifications en temps réel
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Simulation d'écoute en temps réel
    const interval = setInterval(() => {
      // Ici vous écouteriez les changements Supabase en temps réel
      console.log('Checking for new notifications...');
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [user?.id]);

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Afficher une notification toast
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    requestNotificationPermission
  };
};

export default NotificationCenter;
