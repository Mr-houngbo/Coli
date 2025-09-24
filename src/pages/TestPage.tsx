import React, { useState, useEffect } from 'react';
import { useAnnonce } from '../contexts/AnnonceContext';
import { useAuth } from '../contexts/AuthContext';
import AnnonceCard from '../components/AnnonceCard';
import TestConnection from '../components/TestConnection';
import ConversationDebug from '../components/ConversationDebug';
import { Annonce } from '../types';
import { Package, Database, CheckCircle, AlertTriangle } from 'lucide-react';

const TestPage: React.FC = () => {
  const { annonces, getAllAnnonces, loading } = useAnnonce();
  const { user } = useAuth();
  const [testAnnonces, setTestAnnonces] = useState<Annonce[]>([]);
  const [activeTab, setActiveTab] = useState<'annonces' | 'connection' | 'conversations'>('annonces');

  useEffect(() => {
    // Charger les annonces au montage
    getAllAnnonces();
  }, []);

  useEffect(() => {
    // Créer des annonces de test avec les nouveaux statuts Flow-Coli
    const mockAnnonces: Annonce[] = [
      {
        id: 'test-1',
        user_id: 'user-1',
        type: 'Expediteur',
        ville_depart: 'Dakar',
        ville_arrivee: 'Abidjan',
        date_annonce: new Date().toISOString(),
        poids: 5,
        prix_kg: 2500,
        transport: 'avion',
        description: 'Colis urgent - documents importants',
        status: 'active',
        package_photos: [],
        package_type: 'document',
        fragile: false,
        urgent: true,
        insurance_requested: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 'user-1',
          full_name: 'Amadou Diallo',
          email: 'amadou@example.com',
          phone: '+221701234567',
          whatsapp_number: '+221701234567',
          role: 'expediteur',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: true,
          verification_status: 'verified',
          trust_score: 85,
          total_transactions: 12,
          successful_transactions: 11,
          average_rating: 4.5,
          identity_verified: true,
          whatsapp_verified: true,
          email_verified: true
        }
      },
      {
        id: 'test-2',
        user_id: 'user-2',
        type: 'GP',
        ville_depart: 'Bamako',
        ville_arrivee: 'Ouagadougou',
        date_annonce: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        poids: 20,
        prix_kg: 1500,
        transport: 'voiture',
        description: 'Voyage régulier - espace disponible',
        status: 'secured',
        package_photos: [],
        package_type: 'vetement',
        fragile: false,
        urgent: false,
        insurance_requested: true,
        insurance_value: 50000,
        receiver_name: 'Fatou Traoré',
        receiver_phone: '+226701234567',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 'user-2',
          full_name: 'Ibrahim Koné',
          email: 'ibrahim@example.com',
          phone: '+223701234567',
          whatsapp_number: '+223701234567',
          role: 'gp',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: true,
          verification_status: 'verified',
          trust_score: 92,
          total_transactions: 45,
          successful_transactions: 44,
          average_rating: 4.8,
          identity_verified: true,
          whatsapp_verified: true,
          email_verified: true
        }
      },
      {
        id: 'test-3',
        user_id: 'user-3',
        type: 'Expediteur',
        ville_depart: 'Lomé',
        ville_arrivee: 'Accra',
        date_annonce: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        poids: 3,
        transport: 'bus',
        description: 'Petit colis fragile',
        status: 'in_transit',
        package_photos: [],
        package_type: 'electronique',
        fragile: true,
        urgent: false,
        insurance_requested: true,
        insurance_value: 75000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 'user-3',
          full_name: 'Koffi Mensah',
          email: 'koffi@example.com',
          phone: '+228701234567',
          whatsapp_number: '+228701234567',
          role: 'expediteur',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: false,
          verification_status: 'pending',
          trust_score: 65,
          total_transactions: 3,
          successful_transactions: 3,
          average_rating: 4.2,
          identity_verified: false,
          whatsapp_verified: true,
          email_verified: true
        }
      }
    ];
    setTestAnnonces(mockAnnonces);
  }, []);

  const getStatusInfo = (status: Annonce['status']) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-green-600', label: 'Disponible' };
      case 'secured':
        return { icon: Package, color: 'text-blue-600', label: 'Sécurisée' };
      case 'paid':
        return { icon: CheckCircle, color: 'text-yellow-600', label: 'Payée' };
      case 'in_transit':
        return { icon: Package, color: 'text-purple-600', label: 'En transit' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-orange-600', label: 'Livrée' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-emerald-600', label: 'Terminée' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600', label: 'Inconnue' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Page de Test Flow-Coli
          </h1>
          <p className="text-gray-600">
            Testez les nouvelles fonctionnalités et vérifiez que tout fonctionne correctement.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('annonces')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'annonces'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Annonces Test
              </button>
              <button
                onClick={() => setActiveTab('connection')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connection'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="h-4 w-4 inline mr-2" />
                Test Connexion
              </button>
              <button
                onClick={() => setActiveTab('conversations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'conversations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Debug Conversations
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'annonces' && (
          <div>
            {/* Statuts Flow-Coli */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Nouveaux Statuts Flow-Coli
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(['active', 'secured', 'paid', 'in_transit', 'delivered', 'completed'] as const).map((status) => {
                  const { icon: Icon, color, label } = getStatusInfo(status);
                  return (
                    <div key={status} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <div>
                        <div className="text-xs font-medium text-gray-900">{label}</div>
                        <div className="text-xs text-gray-500">{status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">👤 Utilisateur connecté</h3>
                <p className="text-sm text-blue-800">
                  ID: {user.id} | Email: {user.email}
                </p>
              </div>
            )}

            {/* Annonces de test */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                🎯 Annonces de Test (avec nouveaux statuts)
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testAnnonces.map((annonce) => (
                  <AnnonceCard key={annonce.id} annonce={annonce} />
                ))}
              </div>
            </div>

            {/* Annonces réelles */}
            {annonces.length > 0 && (
              <div className="space-y-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  📦 Annonces Réelles (Base de données)
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Chargement...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {annonces.map((annonce) => (
                      <AnnonceCard key={annonce.id} annonce={annonce} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'connection' && (
          <TestConnection />
        )}

        {activeTab === 'conversations' && (
          <ConversationDebug />
        )}
      </div>
    </div>
  );
};

export default TestPage;
