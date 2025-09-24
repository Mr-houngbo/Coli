import React from 'react';
import ColiDashboardSimple from '../components/ColiDashboardSimple';
import { BarChart3, Shield } from 'lucide-react';

const FlowColiPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-gray-900">Flow-Coli Dashboard</h1>
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-gray-600">
            Tableau de bord avancé pour suivre vos transactions Flow-Coli en temps réel.
          </p>
        </div>

        {/* Dashboard Flow-Coli */}
        <ColiDashboardSimple />

        {/* Information supplémentaire */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-3">💡 À propos du Flow-Coli</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Workflow en 8 étapes :</h4>
              <ol className="text-sm text-blue-600 space-y-1">
                <li>1. 📦 Création de l'annonce</li>
                <li>2. 🔒 Sécurisation (GP sélectionné)</li>
                <li>3. 🏠 Espace privé créé</li>
                <li>4. 💳 Paiement Escrow</li>
                <li>5. 📋 Récupération du colis</li>
                <li>6. 🚛 Transport en cours</li>
                <li>7. 📍 Livraison au receveur</li>
                <li>8. ✅ Transaction finalisée</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Avantages :</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• 🛡️ Sécurité maximale avec KYC</li>
                <li>• 💳 Paiement sécurisé par Escrow</li>
                <li>• 📱 Suivi en temps réel</li>
                <li>• 🏆 Système de confiance</li>
                <li>• ⚡ Notifications intelligentes</li>
                <li>• 🔍 Transparence totale</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowColiPage;
