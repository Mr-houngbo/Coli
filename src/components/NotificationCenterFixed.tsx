import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Package, 
  CreditCard, 
  MessageSquare, 
  AlertTriangle,
  Shield,
  Star,
  User,
  Settings,
  Filter,
  Eye,
  Trash2
} from 'lucide-react';
import { Notification as CustomNotification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen = true,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Mock data pour les notifications (à remplacer par de vraies données)
  const mockNotifications: CustomNotification[] = [
    {
      id: '1',
      user_id: user?.id || '',
      title: 'Nouveau message',
      message: 'Vous avez reçu un nouveau message concernant votre colis',
      notification_type: 'message',
      related_id: 'conv_123',
      related_type: 'message',
      is_read: false,
      action_url: '/conversations/conv_123',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
      id: '2',
      user_id: user?.id || '',
      title: 'Paiement reçu',
      message: 'Le paiement pour votre transport a été reçu',
      notification_type: 'transaction',
      related_id: 'trans_456',
      related_type: 'transaction',
      is_read: false,
      action_url: '/dashboard?tab=transactions',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
    },
    {
      id: '3',
      user_id: user?.id || '',
      title: 'Identité vérifiée',
      message: 'Votre identité a été vérifiée avec succès',
      notification_type: 'verification',
      is_read: true,
      action_url: '/profile?tab=kyc',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: '4',
      user_id: user?.id || '',
      title: 'Nouvelle évaluation',
      message: 'Vous avez reçu une nouvelle évaluation 5 étoiles',
      notification_type: 'rating',
      is_read: true,
      action_url: '/profile?tab=badges',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    }
  ];

  useEffect(() => {
    if (user?.id) {
      // Simuler le chargement des notifications
      setLoading(true);
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    }
  }, [user?.id]);

  const getNotificationIcon = (type: CustomNotification['notification_type']) => {
    const iconMap = {
      transaction: CreditCard,
      message: MessageSquare,
      rating: Star,
      dispute: AlertTriangle,
      verification: Shield,
      system: Settings
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type: CustomNotification['notification_type'], isRead: boolean) => {
    const baseColors = {
      transaction: 'text-green-600 bg-green-100',
      message: 'text-blue-600 bg-blue-100',
      rating: 'text-yellow-600 bg-yellow-100',
      dispute: 'text-red-600 bg-red-100',
      verification: 'text-purple-600 bg-purple-100',
      system: 'text-gray-600 bg-gray-100'
    };
    
    if (isRead) {
      return 'text-gray-500 bg-gray-50';
    }
    
    return baseColors[type] || 'text-gray-600 bg-gray-100';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true, read_at: new Date().toISOString() }
          : notif
      )
    );
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notif => ({ 
        ...notif, 
        is_read: true, 
        read_at: new Date().toISOString() 
      }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              Tout marquer lu
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-100">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex gap-1">
          {(['all', 'unread', 'read'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === filterType
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filterType === 'all' ? 'Toutes' : filterType === 'unread' ? 'Non lues' : 'Lues'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>
              {filter === 'unread' 
                ? 'Aucune notification non lue' 
                : filter === 'read'
                  ? 'Aucune notification lue'
                  : 'Aucune notification'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.notification_type);
              const colorClasses = getNotificationColor(notification.notification_type, notification.is_read);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${colorClasses}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            notification.is_read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            notification.is_read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50"
                              title="Marquer comme lu"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
};

// Hook pour utiliser les notifications
export const useNotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Ici vous pouvez implémenter la logique pour charger depuis Supabase
      // Pour l'instant, on utilise des données mock
      const mockData: CustomNotification[] = [
        {
          id: '1',
          user_id: user.id,
          title: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message',
          notification_type: 'message',
          is_read: false,
          created_at: new Date().toISOString(),
        }
      ];
      
      setNotifications(mockData);
      setUnreadCount(mockData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications
  };
};

export default NotificationCenter;
