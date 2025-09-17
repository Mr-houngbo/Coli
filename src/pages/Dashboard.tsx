import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonces } from '../contexts/AnnonceContext';
import Sidebar from '../components/Sidebar';
import AnnonceCard from '../components/AnnonceCard';
import { Plus, Package, TrendingUp, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserAnnonces, annonces } = useAnnonces();

  const userAnnonces = getUserAnnonces(user?.id || '');
  const totalAnnonces = userAnnonces.length;
  const gpAnnonces = userAnnonces.filter(a => a.type === 'GP').length;
  const expediteurAnnonces = userAnnonces.filter(a => a.type === 'EXPEDITEUR').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Voici un aperçu de votre activité sur GP Connect
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-violet-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total annonces</p>
                <p className="text-2xl font-bold text-gray-900">{totalAnnonces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Annonces GP</p>
                <p className="text-2xl font-bold text-gray-900">{gpAnnonces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Colis à envoyer</p>
                <p className="text-2xl font-bold text-gray-900">{expediteurAnnonces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Link
              to="/publish"
              className="flex items-center text-violet-600 hover:text-violet-700"
            >
              <div className="bg-violet-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-violet-600">Publier</p>
                <p className="text-lg font-medium">Nouvelle annonce</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Annonces */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Mes annonces récentes</h2>
            <Link
              to="/dashboard/mes-annonces"
              className="text-violet-600 hover:text-violet-700 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>

          {userAnnonces.length > 0 ? (
            <div className="grid gap-6">
              {userAnnonces.slice(0, 3).map((annonce) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune annonce publiée
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par publier votre première annonce
              </p>
              <Link
                to="/publish"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Publier une annonce
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Voyagez avec GP Connect</h3>
            <p className="text-violet-100 mb-4">
              Monétisez vos voyages en transportant des colis pour d'autres utilisateurs
            </p>
            <Link
              to="/publish"
              className="bg-white text-violet-600 px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Je voyage (GP)
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Envoyez un colis</h3>
            <p className="text-blue-100 mb-4">
              Trouvez un GP de confiance pour envoyer vos colis rapidement
            </p>
            <Link
              to="/annonces"
              className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Voir les GP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;