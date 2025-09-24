import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  Star,
  Shield,
  Activity,
  Eye,
  MessageSquare,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';

interface ColiDashboardSimpleProps {
  className?: string;
}

interface DashboardStats {
  totalTransactions: number;
  activeTransactions: number;
  completedTransactions: number;
  totalRevenue: number;
  averageRating: number;
  trustScore: number;
}

const ColiDashboardSimple: React.FC<ColiDashboardSimpleProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { annonces } = useAnnonce();
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    activeTransactions: 0,
    completedTransactions: 0,
    totalRevenue: 0,
    averageRating: 4.2,
    trustScore: 85
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculer les stats basées sur les annonces
    if (annonces) {
      const userAnnonces = annonces.filter(a => a.user_id === user?.id);
      const activeCount = userAnnonces.filter(a => ['active', 'secured', 'paid', 'in_transit'].includes(a.status || 'active')).length;
      const completedCount = userAnnonces.filter(a => a.status === 'completed').length;
      const totalRevenue = userAnnonces.reduce((sum, a) => sum + (a.prix_total || 0), 0);

      setStats({
        totalTransactions: userAnnonces.length,
        activeTransactions: activeCount,
        completedTransactions: completedCount,
        totalRevenue,
        averageRating: 4.2,
        trustScore: 85
      });
    }
    setLoading(false);
  }, [annonces, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'secured': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-yellow-600 bg-yellow-100';
      case 'in_transit': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Disponible';
      case 'secured': return 'Sécurisée';
      case 'paid': return 'Payée';
      case 'in_transit': return 'En transit';
      case 'delivered': return 'Livrée';
      case 'completed': return 'Terminée';
      default: return 'Inconnue';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-violet-600" />
        <h2 className="text-xl font-bold text-gray-900">Dashboard Flow-Coli</h2>
        <Shield className="h-5 w-5 text-green-500" />
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Package className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenus et évaluations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Star className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Note moyenne</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= stats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mes annonces récentes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-violet-600" />
          Mes annonces récentes
        </h3>
        
        {annonces && annonces.length > 0 ? (
          <div className="space-y-3">
            {annonces
              .filter(a => a.user_id === user?.id)
              .slice(0, 3)
              .map((annonce) => (
                <div key={annonce.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {annonce.ville_depart} → {annonce.ville_arrivee}
                      </p>
                      <p className="text-sm text-gray-500">
                        {annonce.poids}kg • {annonce.prix_kg} FCFA/kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(annonce.status || 'active')}`}>
                      {getStatusLabel(annonce.status || 'active')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune annonce pour le moment</p>
            <p className="text-sm">Créez votre première annonce pour commencer !</p>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 p-3 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
            <Package className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Nouvelle annonce</span>
          </button>
          
          <button className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Messages</span>
          </button>
          
          <button className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Suivi</span>
          </button>
          
          <button className="flex items-center gap-2 p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <CreditCard className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Paiements</span>
          </button>
        </div>
      </div>

      {/* Score de confiance */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Score de confiance</p>
              <p className="text-sm text-gray-600">Basé sur vos transactions et évaluations</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{stats.trustScore}%</p>
            <p className="text-sm text-green-700">Excellent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColiDashboardSimple;
