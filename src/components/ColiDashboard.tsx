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
  CreditCard
} from 'lucide-react';
import { ColiSpace, Transaction, PackageTracking, Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useColiSpace } from '../contexts/ColiSpaceContext';
import { useTransaction } from '../contexts/TransactionContext';
import { TrustBadges, TrustScore } from './TrustBadges';
import { FlowColi } from './FlowColi';

interface ColiDashboardProps {
  className?: string;
}

interface DashboardStats {
  totalTransactions: number;
  activeTransactions: number;
  completedTransactions: number;
  totalEarnings: number;
  averageRating: number;
  successRate: number;
}

export const ColiDashboard: React.FC<ColiDashboardProps> = ({ className = '' }) => {
  const { user, profile } = useAuth();
  const { coliSpaces, getUserColiSpaces, loading: coliSpaceLoading } = useColiSpace();
  const { transactions, getUserTransactions, loading: transactionLoading } = useTransaction();
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'history' | 'earnings'>('overview');
  const [selectedColiSpace, setSelectedColiSpace] = useState<ColiSpace | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    activeTransactions: 0,
    completedTransactions: 0,
    totalEarnings: 0,
    averageRating: 0,
    successRate: 0
  });

  useEffect(() => {
    if (user?.id) {
      getUserColiSpaces(user.id);
      getUserTransactions(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (coliSpaces.length > 0 && transactions.length > 0) {
      calculateStats();
    }
  }, [coliSpaces, transactions, profile]);

  const calculateStats = () => {
    const activeSpaces = coliSpaces.filter(space => 
      ['active', 'in_progress'].includes(space.status)
    );
    
    const completedSpaces = coliSpaces.filter(space => 
      space.status === 'completed'
    );

    const releasedTransactions = transactions.filter(txn => 
      txn.payment_status === 'released'
    );

    const totalEarnings = profile?.role === 'gp' 
      ? releasedTransactions.reduce((sum, txn) => sum + txn.gp_amount, 0)
      : 0;

    const successRate = coliSpaces.length > 0 
      ? Math.round((completedSpaces.length / coliSpaces.length) * 100)
      : 0;

    setStats({
      totalTransactions: coliSpaces.length,
      activeTransactions: activeSpaces.length,
      completedTransactions: completedSpaces.length,
      totalEarnings,
      averageRating: profile?.average_rating || 0,
      successRate
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Actif',
      in_progress: 'En cours',
      completed: 'Terminé',
      disputed: 'En litige',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {profile?.role === 'gp' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gains totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEarnings.toLocaleString()} FCFA
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profil et réputation */}
      {profile && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mon Profil</h3>
          <div className="flex items-start space-x-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{profile.full_name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{profile.role}</p>
                </div>
              </div>
              <TrustBadges profile={profile} size="md" showLabels />
            </div>
            <div className="flex-shrink-0">
              <TrustScore score={profile.trust_score} size="lg" />
            </div>
          </div>
        </div>
      )}

      {/* Transactions récentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
          <button
            onClick={() => setActiveTab('active')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Voir tout
          </button>
        </div>
        
        {coliSpaces.slice(0, 5).map((space) => (
          <div key={space.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {space.annonce?.ville_depart} → {space.annonce?.ville_arrivee}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(space.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(space.status)}`}>
                {getStatusLabel(space.status)}
              </span>
              <button
                onClick={() => setSelectedColiSpace(space)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Transactions Actives</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>{stats.activeTransactions} en cours</span>
        </div>
      </div>

      {coliSpaces.filter(space => ['active', 'in_progress'].includes(space.status)).map((space) => (
        <div key={space.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {space.annonce?.ville_depart} → {space.annonce?.ville_arrivee}
                </h3>
                <p className="text-sm text-gray-600">
                  {space.annonce?.poids}kg • {new Date(space.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(space.status)}`}>
              {getStatusLabel(space.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Expéditeur: {space.expediteur?.full_name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                GP: {space.gp?.full_name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Receveur: {space.receveur?.full_name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedColiSpace(space)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Voir détails</span>
              </button>
              {space.chat_enabled && (
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </button>
              )}
            </div>
            
            {space.transaction && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span>{space.transaction.amount?.toLocaleString()} FCFA</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  space.transaction.payment_status === 'escrowed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {space.transaction.payment_status}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {coliSpaces.filter(space => ['active', 'in_progress'].includes(space.status)).length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune transaction active</h3>
          <p className="text-gray-600">Vos transactions actives apparaîtront ici</p>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Historique</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4" />
          <span>{stats.completedTransactions} terminées</span>
        </div>
      </div>

      {coliSpaces.filter(space => ['completed', 'cancelled'].includes(space.status)).map((space) => (
        <div key={space.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                space.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {space.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {space.annonce?.ville_depart} → {space.annonce?.ville_arrivee}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(space.created_at).toLocaleDateString('fr-FR')} • {space.annonce?.poids}kg
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(space.status)}`}>
                {getStatusLabel(space.status)}
              </span>
              {space.transaction && profile?.role === 'gp' && space.status === 'completed' && (
                <p className="text-sm text-green-600 mt-1">
                  +{space.transaction.gp_amount?.toLocaleString()} FCFA
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mes Gains</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>{stats.totalEarnings.toLocaleString()} FCFA total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gains totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEarnings.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gain moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTransactions > 0 
                  ? Math.round(stats.totalEarnings / stats.completedTransactions).toLocaleString()
                  : 0
                } FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des gains */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Gains</h3>
        {transactions.filter(txn => txn.payment_status === 'released' && profile?.role === 'gp').map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-medium text-gray-900">
                Transaction #{transaction.payment_reference}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(transaction.released_at || transaction.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">
                +{transaction.gp_amount.toLocaleString()} FCFA
              </p>
              <p className="text-xs text-gray-500">
                Commission: {transaction.commission_amount.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'active', label: 'En cours', icon: Clock },
    { id: 'history', label: 'Historique', icon: CheckCircle },
    ...(profile?.role === 'gp' ? [{ id: 'earnings', label: 'Gains', icon: DollarSign }] : [])
  ];

  if (coliSpaceLoading || transactionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Coli
          </h1>
          <p className="text-gray-600">
            Suivez vos transactions et gérez vos colis en temps réel
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'active' && renderActiveTransactions()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'earnings' && renderEarnings()}
      </div>

      {/* Modal de détails Flow-Coli */}
      {selectedColiSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de la Transaction
                </h2>
                <button
                  onClick={() => setSelectedColiSpace(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <FlowColi 
                coliSpace={selectedColiSpace}
                onStepComplete={(step) => {
                  console.log('Étape complétée:', step);
                  // Recharger les données
                  if (user?.id) {
                    getUserColiSpaces(user.id);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColiDashboard;
