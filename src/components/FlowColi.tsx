import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Lock, 
  MessageCircle, 
  CreditCard, 
  Truck, 
  Plane, 
  MapPin, 
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  Users,
  Shield
} from 'lucide-react';
import { ColiSpace, PackageTracking, FlowColiStep } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface FlowColiProps {
  coliSpace: ColiSpace;
  onStepComplete?: (step: number) => void;
  className?: string;
}

export const FlowColi: React.FC<FlowColiProps> = ({
  coliSpace,
  onStepComplete,
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<FlowColiStep[]>([]);
  const [loading, setLoading] = useState(false);

  // Définition des 8 étapes du Flow-Coli
  const flowSteps: FlowColiStep[] = [
    {
      step: 1,
      name: 'Annonce créée',
      description: 'L\'annonce a été publiée et sécurisée',
      completed: true,
      required_validations: ['expediteur', 'gp'],
      current_validations: ['expediteur', 'gp']
    },
    {
      step: 2,
      name: 'Espace sécurisé',
      description: 'Espace Coli privé créé pour les 3 acteurs',
      completed: true,
      required_validations: ['expediteur', 'gp', 'receveur'],
      current_validations: ['expediteur', 'gp']
    },
    {
      step: 3,
      name: 'Chat activé',
      description: 'Communication sécurisée entre tous les participants',
      completed: true,
      required_validations: ['expediteur', 'gp', 'receveur'],
      current_validations: ['expediteur', 'gp', 'receveur']
    },
    {
      step: 4,
      name: 'Paiement sécurisé',
      description: 'Paiement effectué et mis en séquestre',
      completed: false,
      required_validations: ['expediteur'],
      current_validations: []
    },
    {
      step: 5,
      name: 'Colis pris en charge',
      description: 'GP confirme la prise en charge du colis',
      completed: false,
      required_validations: ['gp'],
      current_validations: []
    },
    {
      step: 6,
      name: 'En transit',
      description: 'Colis en cours de transport',
      completed: false,
      required_validations: ['gp'],
      current_validations: []
    },
    {
      step: 7,
      name: 'Livré',
      description: 'Colis livré au destinataire',
      completed: false,
      required_validations: ['receveur', 'expediteur'],
      current_validations: []
    },
    {
      step: 8,
      name: 'Transaction terminée',
      description: 'Paiement libéré et avis échangés',
      completed: false,
      required_validations: ['expediteur', 'gp', 'receveur'],
      current_validations: []
    }
  ];

  useEffect(() => {
    setSteps(flowSteps);
    // Déterminer l'étape actuelle basée sur le statut
    const currentStepNumber = getCurrentStepFromStatus(coliSpace.status);
    setCurrentStep(currentStepNumber);
  }, [coliSpace]);

  const getCurrentStepFromStatus = (status: string): number => {
    switch (status) {
      case 'active': return 3;
      case 'paid': return 4;
      case 'in_transit': return 6;
      case 'delivered': return 7;
      case 'completed': return 8;
      default: return 1;
    }
  };

  const getStepIcon = (step: number) => {
    const icons = {
      1: Package,
      2: Lock,
      3: MessageCircle,
      4: CreditCard,
      5: Truck,
      6: Plane,
      7: MapPin,
      8: CheckCircle
    };
    return icons[step as keyof typeof icons] || Package;
  };

  const getUserRole = (): 'expediteur' | 'gp' | 'receveur' | null => {
    if (!user?.id) return null;
    if (user.id === coliSpace.expediteur_id) return 'expediteur';
    if (user.id === coliSpace.gp_id) return 'gp';
    if (user.id === coliSpace.receveur_id) return 'receveur';
    return null;
  };

  const canUserValidateStep = (step: FlowColiStep): boolean => {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    return step.required_validations.includes(userRole) && 
           !step.current_validations.includes(userRole);
  };

  const handleStepValidation = async (stepNumber: number) => {
    const userRole = getUserRole();
    if (!userRole) return;

    setLoading(true);
    try {
      // Ici, vous appelleriez votre API pour valider l'étape
      // await validateFlowStep(coliSpace.id, stepNumber, userRole);
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour localement
      setSteps(prev => 
        prev.map(step => 
          step.step === stepNumber 
            ? {
                ...step,
                current_validations: [...step.current_validations, userRole]
              }
            : step
        )
      );

      if (onStepComplete) {
        onStepComplete(stepNumber);
      }

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: FlowColiStep) => {
    if (step.step < currentStep) return 'completed';
    if (step.step === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const renderValidationBadges = (step: FlowColiStep) => {
    return (
      <div className="flex items-center space-x-2 mt-2">
        {step.required_validations.map((role) => {
          const isValidated = step.current_validations.includes(role);
          const roleNames = {
            expediteur: 'Expéditeur',
            gp: 'GP',
            receveur: 'Receveur'
          };

          return (
            <div
              key={role}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isValidated 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isValidated && <CheckCircle className="w-3 h-3 inline mr-1" />}
              {roleNames[role as keyof typeof roleNames]}
            </div>
          );
        })}
      </div>
    );
  };

  const renderActionButton = (step: FlowColiStep) => {
    const userRole = getUserRole();
    const canValidate = canUserValidateStep(step);
    const status = getStepStatus(step);

    if (status !== 'current' || !canValidate) return null;

    const getActionText = () => {
      switch (step.step) {
        case 4: return 'Effectuer le paiement';
        case 5: return 'Confirmer la prise en charge';
        case 6: return 'Marquer comme en transit';
        case 7: return 'Confirmer la livraison';
        case 8: return 'Finaliser la transaction';
        default: return 'Valider cette étape';
      }
    };

    return (
      <button
        onClick={() => handleStepValidation(step.step)}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Validation...' : getActionText()}
      </button>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Flow-Coli</h2>
          <p className="text-gray-600">Suivi de votre colis étape par étape</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-700">Sécurisé</span>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((currentStep / 8) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Liste des étapes */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const IconComponent = getStepIcon(step.step);
          const status = getStepStatus(step);
          const stepColor = getStepColor(status);

          return (
            <div
              key={step.step}
              className={`relative flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
                status === 'current' 
                  ? 'border-blue-200 bg-blue-50' 
                  : status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-300" />
              )}

              {/* Icône de l'étape */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stepColor}`}>
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Contenu de l'étape */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {step.name}
                  </h3>
                  {status === 'current' && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">En cours</span>
                    </div>
                  )}
                  {status === 'completed' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Terminé</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mt-1">{step.description}</p>

                {/* Badges de validation */}
                {step.required_validations.length > 0 && renderValidationBadges(step)}

                {/* Bouton d'action */}
                {renderActionButton(step)}

                {/* Informations supplémentaires pour certaines étapes */}
                {step.step === 4 && status === 'current' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Paiement sécurisé requis
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Votre paiement sera mis en séquestre jusqu'à la livraison confirmée
                    </p>
                  </div>
                )}

                {step.step === 5 && status === 'current' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Photos de prise en charge requises
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Prenez des photos du colis avant le transport
                    </p>
                  </div>
                )}

                {step.step === 7 && status === 'current' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Double validation requise
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      L'expéditeur et le receveur doivent confirmer la livraison
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Informations sur les participants */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700">Expéditeur</div>
            <div className="text-gray-600">{coliSpace.expediteur?.full_name}</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">GP (Transporteur)</div>
            <div className="text-gray-600">{coliSpace.gp?.full_name}</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">Receveur</div>
            <div className="text-gray-600">{coliSpace.receveur?.full_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
