import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';
import { Annonce } from '../types';
import { Package, ArrowRight, Shield, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { FlowColi } from './FlowColi';
import { EscrowPayment } from './EscrowPayment';

interface FlowColiTriggerProps {
  annonce: Annonce;
  onClose?: () => void;
}

export const FlowColiTrigger: React.FC<FlowColiTriggerProps> = ({ annonce, onClose }) => {
  const { user, profile } = useAuth();
  const { takeAnnonce, secureAnnonce } = useAnnonce();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'verify' | 'secure' | 'payment' | 'flow'>('verify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coliSpaceId, setColiSpaceId] = useState<string | null>(null);

  const handleStartFlow = async () => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    // Vérifier si l'utilisateur est vérifié
    if (!profile?.identity_verified) {
      setError('Vous devez compléter votre vérification d\'identité pour utiliser Flow-Coli');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Étape 1: Prendre l'annonce (change le statut à 'secured')
      const result = await takeAnnonce(annonce.id, user.id);
      
      if (!result?.conversationId) {
        throw new Error('Impossible de créer la conversation');
      }

      // Étape 2: Sécuriser l'annonce avec les infos du receveur
      const secureResult = await secureAnnonce(annonce.id, user.id, {
        name: annonce.receiver_name || 'Receveur à définir',
        phone: annonce.receiver_phone || '',
        address: annonce.receiver_address || ''
      });

      if (secureResult?.coliSpaceId) {
        setColiSpaceId(secureResult.coliSpaceId);
        setCurrentStep('payment');
      } else {
        setCurrentStep('secure');
      }

    } catch (err: any) {
      console.error('Erreur lors du démarrage du Flow-Coli:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setCurrentStep('flow');
  };

  const isGP = annonce.type === 'GP';
  const userCanTake = user?.id !== annonce.user_id && (!annonce.status || annonce.status === 'active');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🚀 Flow-Coli</h2>
              <p className="text-violet-100">
                {annonce.ville_depart} → {annonce.ville_arrivee}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <Package className="h-16 w-16 text-violet-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Démarrer le Flow-Coli
                </h3>
                <p className="text-gray-600">
                  Vous êtes sur le point de {isGP ? 'proposer vos services de transport' : 'confier votre colis'} 
                  pour cette annonce.
                </p>
              </div>

              {/* Vérifications préalables */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Vérifications préalables :</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {profile?.identity_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={profile?.identity_verified ? 'text-green-700' : 'text-yellow-700'}>
                      Identité vérifiée
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile?.phone ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={profile?.phone ? 'text-green-700' : 'text-yellow-700'}>
                      Numéro de téléphone
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {userCanTake ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={userCanTake ? 'text-green-700' : 'text-red-700'}>
                      Éligible pour cette annonce
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Erreur</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                {!profile?.identity_verified ? (
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Compléter KYC
                  </button>
                ) : (
                  <button
                    onClick={handleStartFlow}
                    disabled={loading || !userCanTake}
                    className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Démarrage...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Démarrer Flow-Coli
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {currentStep === 'secure' && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Annonce sécurisée
                </h3>
                <p className="text-gray-600">
                  L'annonce a été sécurisée avec succès. Passons au paiement.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('payment')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Continuer vers le paiement
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && coliSpaceId && (
            <div className="space-y-6">
              <div className="text-center">
                <CreditCard className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Paiement Escrow
                </h3>
                <p className="text-gray-600">
                  Sécurisez votre transaction avec notre système de paiement Escrow.
                </p>
              </div>

              <EscrowPayment
                coliSpace={{ id: coliSpaceId } as any}
                amount={annonce.prix_total || (annonce.prix_kg || 0) * annonce.poids}
                onPaymentComplete={handlePaymentComplete}
                onCancel={() => setCurrentStep('verify')}
              />
            </div>
          )}

          {currentStep === 'flow' && coliSpaceId && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Flow-Coli activé !
                </h3>
                <p className="text-gray-600">
                  Votre transaction est maintenant sécurisée. Suivez le processus étape par étape.
                </p>
              </div>

              <FlowColi 
                coliSpaceId={coliSpaceId}
                currentUserRole={isGP ? 'gp' : 'expediteur'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
