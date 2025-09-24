import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const EscrowPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Paiement Escrow</h1>
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-gray-600">
            Système de paiement sécurisé intégré au processus Flow-Coli.
          </p>
        </div>

        {/* Comment ça marche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comment fonctionne l'Escrow ?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">1. Paiement</h3>
              <p className="text-sm text-gray-600">
                L'expéditeur paie le montant convenu. Les fonds sont bloqués en sécurité.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">2. Séquestre</h3>
              <p className="text-sm text-gray-600">
                Les fonds restent bloqués pendant tout le transport jusqu'à la livraison.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">3. Libération</h3>
              <p className="text-sm text-gray-600">
                À la livraison confirmée, les fonds sont libérés automatiquement au GP.
              </p>
            </div>
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Méthodes de paiement acceptées</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">OM</span>
                </div>
                <span className="font-medium">Orange Money</span>
              </div>
              <p className="text-sm text-gray-600">Paiement mobile sécurisé</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">W</span>
                </div>
                <span className="font-medium">Wave</span>
              </div>
              <p className="text-sm text-gray-600">Transfert d'argent mobile</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-8 h-8 text-gray-600" />
                <span className="font-medium">Carte bancaire</span>
              </div>
              <p className="text-sm text-gray-600">Visa, Mastercard via Stripe</p>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-medium text-green-800 mb-2">Sécurité garantie</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Fonds protégés jusqu'à la livraison confirmée</li>
                <li>• Commission transparente de 10% prélevée automatiquement</li>
                <li>• Remboursement possible en cas de problème</li>
                <li>• Système de litiges intégré</li>
                <li>• Conformité aux réglementations financières</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comment utiliser */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Comment utiliser l'Escrow ?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Le système Escrow est automatiquement intégré dans le processus Flow-Coli. 
                Vous n'avez pas besoin de l'activer séparément.
              </p>
              <div className="flex items-center gap-2">
                <Link 
                  to="/annonces" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ArrowRight className="h-4 w-4" />
                  Voir les annonces disponibles
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ rapide */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Quand les fonds sont-ils libérés ?</h3>
              <p className="text-sm text-gray-600">
                Les fonds sont automatiquement libérés lorsque le receveur confirme avoir reçu le colis en bon état.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Que se passe-t-il en cas de problème ?</h3>
              <p className="text-sm text-gray-600">
                Vous pouvez ouvrir un litige. Notre équipe examine le cas et peut ordonner un remboursement si nécessaire.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Combien coûte le service ?</h3>
              <p className="text-sm text-gray-600">
                Une commission de 10% est prélevée automatiquement sur chaque transaction réussie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscrowPage;
