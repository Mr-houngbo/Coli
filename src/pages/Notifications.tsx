import React from 'react';
import { Bell, MessageSquare, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
// Supprimez cette import car Header est déjà dans App.tsx
// import Header from '../components/Header';

const Notifications: React.FC = () => {
  // Données factices pour les notifications
  const notifications = [
    {
      id: 1,
      type: 'message',
      title: 'Nouveau message',
      message: 'Vous avez reçu un nouveau message de Jean Dupont concernant votre annonce',
      time: 'Il y a 5 min',
      read: false,
      link: '/conversations/1'
    },
    {
      id: 2,
      type: 'success',
      title: 'Annonce approuvée',
      message: 'Votre annonce "Appartement moderne à Dakar" a été approuvée et est maintenant visible',
      time: 'Il y a 2h',
      read: true,
      link: '/annonces/123'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Paiement en attente',
      message: 'Votre dernier paiement est en attente de validation',
      time: 'Il y a 1 jour',
      read: true,
      link: '/paiements'
    },
    {
      id: 4,
      type: 'info',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de l\'application est disponible',
      time: 'Il y a 2 jours',
      read: true,
      link: '/parametres'
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Supprimez cette ligne car Header est déjà dans App.tsx */}
      {/* <Header /> */}
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Consultez toutes vos notifications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-violet-600 hover:text-violet-700">
              Tout marquer comme lu
            </button>
            <button className="text-sm font-medium text-red-600 hover:text-red-700">
              Tout effacer
            </button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li key={notification.id} className={`hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                  <Link to={notification.link} className="block px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-xs text-gray-500">{notification.time}</p>
                            {!notification.read && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Nouveau
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;