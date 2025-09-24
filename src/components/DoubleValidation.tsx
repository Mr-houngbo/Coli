import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Camera, MessageSquare, Shield, Users } from 'lucide-react';
import { ColiSpace, Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DoubleValidationProps {
  coliSpace: ColiSpace;
  validationType: 'pickup' | 'delivery' | 'payment_release';
  onValidationComplete?: (validated: boolean) => void;
  className?: string;
}

interface ValidationState {
  expediteur_validated: boolean;
  gp_validated: boolean;
  receveur_validated: boolean;
  expediteur_timestamp?: string;
  gp_timestamp?: string;
  receveur_timestamp?: string;
  expediteur_photos?: string[];
  gp_photos?: string[];
  receveur_photos?: string[];
  expediteur_comment?: string;
  gp_comment?: string;
  receveur_comment?: string;
}

export const DoubleValidation: React.FC<DoubleValidationProps> = ({
  coliSpace,
  validationType,
  onValidationComplete,
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [validationState, setValidationState] = useState<ValidationState>({
    expediteur_validated: false,
    gp_validated: false,
    receveur_validated: false
  });
  const [userComment, setUserComment] = useState('');
  const [userPhotos, setUserPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showValidationForm, setShowValidationForm] = useState(false);

  const getUserRole = (): 'expediteur' | 'gp' | 'receveur' | null => {
    if (!user?.id) return null;
    if (user.id === coliSpace.expediteur_id) return 'expediteur';
    if (user.id === coliSpace.gp_id) return 'gp';
    if (user.id === coliSpace.receveur_id) return 'receveur';
    return null;
  };

  const getValidationConfig = () => {
    switch (validationType) {
      case 'pickup':
        return {
          title: 'Validation de prise en charge',
          description: 'Confirmez que le colis a été pris en charge par le GP',
          requiredValidators: ['expediteur', 'gp'] as const,
          photosRequired: true,
          commentRequired: false
        };
      case 'delivery':
        return {
          title: 'Validation de livraison',
          description: 'Confirmez que le colis a été livré au destinataire',
          requiredValidators: ['expediteur', 'receveur'] as const,
          photosRequired: true,
          commentRequired: false
        };
      case 'payment_release':
        return {
          title: 'Validation de libération de paiement',
          description: 'Confirmez que la transaction peut être finalisée',
          requiredValidators: ['expediteur', 'gp', 'receveur'] as const,
          photosRequired: false,
          commentRequired: true
        };
    }
  };

  const config = getValidationConfig();
  const userRole = getUserRole();
  const canUserValidate = userRole && config.requiredValidators.includes(userRole);
  const hasUserValidated = userRole ? validationState[`${userRole}_validated`] : false;

  const getValidationProgress = () => {
    const validatedCount = config.requiredValidators.filter(
      role => validationState[`${role}_validated`]
    ).length;
    return {
      validated: validatedCount,
      total: config.requiredValidators.length,
      percentage: Math.round((validatedCount / config.requiredValidators.length) * 100)
    };
  };

  const progress = getValidationProgress();
  const isComplete = progress.validated === progress.total;

  useEffect(() => {
    if (isComplete && onValidationComplete) {
      onValidationComplete(true);
    }
  }, [isComplete, onValidationComplete]);

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newPhotos = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner uniquement des images');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Les images ne doivent pas dépasser 5MB');
        return false;
      }
      return true;
    });

    setUserPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setUserPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleValidation = async () => {
    if (!userRole) return;

    setLoading(true);
    try {
      // Upload des photos si nécessaire
      let photoUrls: string[] = [];
      if (userPhotos.length > 0) {
        // Simulation d'upload - remplacez par votre logique
        photoUrls = await Promise.all(
          userPhotos.map(async (photo, index) => {
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 500));
            return `https://storage.supabase.com/validation-photos/${coliSpace.id}/${userRole}_${Date.now()}_${index}.jpg`;
          })
        );
      }

      // Mettre à jour l'état de validation
      const newState = {
        ...validationState,
        [`${userRole}_validated`]: true,
        [`${userRole}_timestamp`]: new Date().toISOString(),
        [`${userRole}_photos`]: photoUrls,
        [`${userRole}_comment`]: userComment.trim() || undefined
      };

      setValidationState(newState);
      setShowValidationForm(false);

      // Ici, vous appelleriez votre API pour sauvegarder la validation
      // await saveValidation(coliSpace.id, validationType, newState);

      console.log('Validation enregistrée:', newState);

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderValidatorStatus = (role: 'expediteur' | 'gp' | 'receveur') => {
    if (!config.requiredValidators.includes(role)) return null;

    const isValidated = validationState[`${role}_validated`];
    const timestamp = validationState[`${role}_timestamp`];
    const comment = validationState[`${role}_comment`];
    const photos = validationState[`${role}_photos`];

    const roleNames = {
      expediteur: 'Expéditeur',
      gp: 'GP (Transporteur)',
      receveur: 'Receveur'
    };

    const roleUser = role === 'expediteur' ? coliSpace.expediteur : 
                    role === 'gp' ? coliSpace.gp : coliSpace.receveur;

    return (
      <div className="flex items-start space-x-4 p-4 border rounded-lg">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isValidated ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          {isValidated ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Clock className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900">
              {roleNames[role]}
            </h4>
            {isValidated && timestamp && (
              <span className="text-xs text-gray-500">
                {new Date(timestamp).toLocaleString('fr-FR')}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {roleUser?.full_name || 'Utilisateur'}
          </p>

          {isValidated ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Validé</span>
              </div>
              
              {comment && (
                <div className="bg-gray-50 p-2 rounded text-sm text-gray-700">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  {comment}
                </div>
              )}

              {photos && photos.length > 0 && (
                <div className="flex space-x-2">
                  {photos.slice(0, 3).map((photo, index) => (
                    <div key={index} className="w-12 h-12 bg-gray-200 rounded border">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                  {photos.length > 3 && (
                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                      +{photos.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">En attente de validation</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderValidationForm = () => (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Votre validation
        </h3>
      </div>

      {config.photosRequired && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos de validation *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files)}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Camera className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Cliquez pour ajouter des photos
              </span>
              <span className="text-xs text-gray-500">
                Max 5 photos, 5MB chacune
              </span>
            </label>
          </div>

          {userPhotos.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {userPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-16 object-cover rounded border"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire {config.commentRequired ? '*' : '(optionnel)'}
        </label>
        <textarea
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          rows={3}
          placeholder="Ajoutez un commentaire sur cette validation..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setShowValidationForm(false)}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleValidation}
          disabled={
            loading || 
            (config.photosRequired && userPhotos.length === 0) ||
            (config.commentRequired && !userComment.trim())
          }
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Validation...' : 'Valider'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {config.title}
          </h2>
          <p className="text-gray-600 mt-1">
            {config.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {progress.validated}/{progress.total}
          </div>
          <div className="text-sm text-gray-600">Validations</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-medium text-gray-700">
            {progress.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Statut de validation par utilisateur */}
      <div className="space-y-4 mb-6">
        {config.requiredValidators.map(role => renderValidatorStatus(role))}
      </div>

      {/* Message de statut */}
      {isComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Validation terminée !</h3>
            <p className="text-sm text-green-700">
              Toutes les validations requises ont été effectuées.
            </p>
          </div>
        </div>
      ) : canUserValidate && !hasUserValidated ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Votre validation est requise</h3>
              <p className="text-sm text-blue-700">
                Vous devez valider cette étape pour continuer le processus.
              </p>
            </div>
          </div>

          {!showValidationForm ? (
            <button
              onClick={() => setShowValidationForm(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Procéder à la validation
            </button>
          ) : (
            renderValidationForm()
          )}
        </div>
      ) : hasUserValidated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Vous avez validé</h3>
            <p className="text-sm text-green-700">
              En attente des autres validations requises.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-3">
          <Users className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">En attente</h3>
            <p className="text-sm text-gray-700">
              Cette validation ne vous concerne pas directement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
