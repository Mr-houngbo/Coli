import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, User, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { IdentityVerification as IIdentityVerification } from '../../types';

interface IdentityVerificationProps {
  onComplete?: (verification: IIdentityVerification) => void;
  onCancel?: () => void;
}

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  onComplete,
  onCancel
}) => {
  const { submitIdentityVerification, checkVerificationStatus, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState<'cni' | 'passeport' | 'permis'>('cni');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const documentFrontRef = useRef<HTMLInputElement>(null);
  const documentBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'cni', label: 'Carte Nationale d\'Identité', icon: CreditCard },
    { value: 'passeport', label: 'Passeport', icon: FileText },
    { value: 'permis', label: 'Permis de Conduire', icon: User }
  ];

  const handleFileUpload = (file: File, type: 'front' | 'back' | 'selfie') => {
    // Validation de base
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setError(null);

    switch (type) {
      case 'front':
        setDocumentFront(file);
        break;
      case 'back':
        setDocumentBack(file);
        break;
      case 'selfie':
        setSelfie(file);
        break;
    }
  };

  const uploadToSupabase = async (file: File, path: string): Promise<string> => {
    // Simulation d'upload - remplacez par votre logique Supabase Storage
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://your-supabase-storage.com/${path}/${file.name}`);
      }, 1000);
    });
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setError(null);

      if (!documentFront || !selfie) {
        setError('Veuillez fournir tous les documents requis');
        return;
      }

      if (documentType !== 'cni' && !documentBack) {
        setError('Le verso du document est requis pour ce type de document');
        return;
      }

      // Upload des fichiers
      const documentFrontUrl = await uploadToSupabase(documentFront, 'identity-docs');
      const documentBackUrl = documentBack ? await uploadToSupabase(documentBack, 'identity-docs') : undefined;
      const selfieUrl = await uploadToSupabase(selfie, 'identity-docs');

      // Soumettre la vérification
      const success = await submitIdentityVerification({
        document_type: documentType,
        document_number: documentNumber,
        document_front_url: documentFrontUrl,
        document_back_url: documentBackUrl,
        selfie_url: selfieUrl,
        verification_status: 'pending'
      });

      if (success) {
        setStep(4); // Étape de confirmation
        
        // Récupérer le statut de vérification
        const verification = await checkVerificationStatus();
        if (verification && onComplete) {
          onComplete(verification);
        }
      } else {
        setError('Erreur lors de la soumission. Veuillez réessayer.');
      }

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setUploading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vérification d'identité
        </h2>
        <p className="text-gray-600">
          Pour votre sécurité et celle de la communauté, nous devons vérifier votre identité
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Pourquoi cette vérification ?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Assurer la sécurité de tous les utilisateurs</li>
          <li>• Prévenir les fraudes et les arnaques</li>
          <li>• Créer un environnement de confiance</li>
          <li>• Respecter les réglementations en vigueur</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Type de document</h3>
        <div className="grid grid-cols-1 gap-3">
          {documentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setDocumentType(type.value as any)}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                  documentType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-6 h-6 text-gray-600" />
                <span className="font-medium">{type.label}</span>
                {documentType === type.value && (
                  <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro du document
        </label>
        <input
          type="text"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          placeholder="Saisissez le numéro de votre document"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!documentNumber.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continuer
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Photos du document
        </h2>
        <p className="text-gray-600">
          Prenez des photos claires et nettes de votre {documentTypes.find(t => t.value === documentType)?.label.toLowerCase()}
        </p>
      </div>

      <div className="space-y-4">
        {/* Recto du document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recto du document *
          </label>
          <div
            onClick={() => documentFrontRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            {documentFront ? (
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm text-gray-600">{documentFront.name}</p>
                <p className="text-xs text-green-600">Photo ajoutée avec succès</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Cliquez pour ajouter une photo</p>
                <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
              </div>
            )}
          </div>
          <input
            ref={documentFrontRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
            className="hidden"
          />
        </div>

        {/* Verso du document (si nécessaire) */}
        {documentType !== 'cni' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verso du document *
            </label>
            <div
              onClick={() => documentBackRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {documentBack ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-sm text-gray-600">{documentBack.name}</p>
                  <p className="text-xs text-green-600">Photo ajoutée avec succès</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">Cliquez pour ajouter une photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={documentBackRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!documentFront || (documentType !== 'cni' && !documentBack)}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Photo selfie
        </h2>
        <p className="text-gray-600">
          Prenez une photo de votre visage pour confirmer votre identité
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Conseils pour une bonne photo :</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Regardez directement l'objectif</li>
          <li>• Assurez-vous que votre visage est bien éclairé</li>
          <li>• Retirez lunettes de soleil et chapeau</li>
          <li>• Gardez une expression neutre</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo selfie *
        </label>
        <div
          onClick={() => selfieRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          {selfie ? (
            <div className="space-y-2">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              <p className="text-sm text-gray-600">{selfie.name}</p>
              <p className="text-xs text-green-600">Photo ajoutée avec succès</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">Cliquez pour prendre une photo</p>
              <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
            </div>
          )}
        </div>
        <input
          ref={selfieRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selfie || uploading || loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading || loading ? 'Envoi en cours...' : 'Soumettre'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vérification soumise !
        </h2>
        <p className="text-gray-600">
          Votre demande de vérification a été envoyée avec succès
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• Notre équipe va examiner vos documents</li>
          <li>• Vous recevrez une notification sous 24-48h</li>
          <li>• En cas d'approbation, vous obtiendrez le badge vérifié</li>
          <li>• Vous pourrez alors utiliser toutes les fonctionnalités</li>
        </ul>
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Terminer
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenu de l'étape */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* Bouton d'annulation */}
      {step < 4 && onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          Annuler la vérification
        </button>
      )}
    </div>
  );
};

export default IdentityVerification;
