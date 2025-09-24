import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Eye, Download, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface PackagePhoto {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  type: 'initial' | 'pickup' | 'delivery';
  description?: string;
}

interface PackagePhotosProps {
  photos: PackagePhoto[];
  canUpload: boolean;
  photoType: 'initial' | 'pickup' | 'delivery';
  minPhotos?: number;
  maxPhotos?: number;
  onPhotosChange?: (photos: File[]) => void;
  onPhotoDelete?: (photoId: string) => void;
  className?: string;
}

export const PackagePhotos: React.FC<PackagePhotosProps> = ({
  photos,
  canUpload,
  photoType,
  minPhotos = 3,
  maxPhotos = 5,
  onPhotosChange,
  onPhotoDelete,
  className = ''
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPhotoTypeConfig = () => {
    switch (photoType) {
      case 'initial':
        return {
          title: 'Photos du colis',
          description: 'Photos du colis avant expédition',
          instructions: [
            'Prenez des photos claires de tous les côtés du colis',
            'Assurez-vous que l\'emballage est visible',
            'Incluez une photo avec une règle ou un objet de référence',
            'Évitez les reflets et les zones sombres'
          ],
          color: 'blue'
        };
      case 'pickup':
        return {
          title: 'Photos de prise en charge',
          description: 'Photos du colis au moment de la prise en charge',
          instructions: [
            'Photographiez l\'état du colis à la prise en charge',
            'Vérifiez que l\'emballage n\'est pas endommagé',
            'Prenez une photo avec l\'expéditeur si possible',
            'Documentez tout dommage existant'
          ],
          color: 'green'
        };
      case 'delivery':
        return {
          title: 'Photos de livraison',
          description: 'Photos du colis au moment de la livraison',
          instructions: [
            'Photographiez l\'état du colis à la livraison',
            'Prenez une photo avec le receveur si possible',
            'Documentez l\'état final du colis',
            'Confirmez l\'intégrité de l\'emballage'
          ],
          color: 'purple'
        };
    }
  };

  const config = getPhotoTypeConfig();
  const currentPhotoCount = photos.length + selectedPhotos.length;
  const isMinimumMet = photos.length >= minPhotos;
  const canAddMore = currentPhotoCount < maxPhotos;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !canUpload) return;

    const validFiles = Array.from(files).filter(file => {
      // Validation du type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner uniquement des images');
        return false;
      }

      // Validation de la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} dépasse la taille maximale de 5MB`);
        return false;
      }

      return true;
    });

    // Vérifier le nombre maximum
    const availableSlots = maxPhotos - currentPhotoCount;
    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length < validFiles.length) {
      alert(`Seulement ${filesToAdd.length} photos peuvent être ajoutées (maximum ${maxPhotos})`);
    }

    const newSelectedPhotos = [...selectedPhotos, ...filesToAdd];
    setSelectedPhotos(newSelectedPhotos);

    if (onPhotosChange) {
      onPhotosChange(newSelectedPhotos);
    }
  };

  const removeSelectedPhoto = (index: number) => {
    const newSelectedPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(newSelectedPhotos);

    if (onPhotosChange) {
      onPhotosChange(newSelectedPhotos);
    }
  };

  const handlePhotoDelete = (photoId: string) => {
    if (onPhotoDelete) {
      onPhotoDelete(photoId);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const renderPhotoGrid = () => {
    const allPhotos = [
      ...photos.map(photo => ({ type: 'uploaded', data: photo })),
      ...selectedPhotos.map(file => ({ type: 'selected', data: file }))
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {allPhotos.map((item, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
              {item.type === 'uploaded' ? (
                <img
                  src={(item.data as PackagePhoto).url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={URL.createObjectURL(item.data as File)}
                  alt={`Photo sélectionnée ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => {
                    if (item.type === 'uploaded') {
                      setPreviewPhoto((item.data as PackagePhoto).url);
                    } else {
                      setPreviewPhoto(URL.createObjectURL(item.data as File));
                    }
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>

                {item.type === 'uploaded' && onPhotoDelete && (
                  <button
                    onClick={() => handlePhotoDelete((item.data as PackagePhoto).id)}
                    className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}

                {item.type === 'selected' && (
                  <button
                    onClick={() => removeSelectedPhoto(index - photos.length)}
                    className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Indicateur de type */}
            <div className="absolute top-2 left-2">
              {item.type === 'selected' ? (
                <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Nouveau
                </div>
              ) : (
                <div className={`bg-${config.color}-500 text-white px-2 py-1 rounded text-xs font-medium`}>
                  {new Date((item.data as PackagePhoto).uploadedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Bouton d'ajout */}
        {canUpload && canAddMore && (
          <div
            onClick={openFileDialog}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 text-center">
              Ajouter une photo
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {currentPhotoCount}/{maxPhotos}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderInstructions = () => (
    <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-lg p-4`}>
      <h4 className={`font-semibold text-${config.color}-900 mb-2`}>
        Instructions pour les photos
      </h4>
      <ul className={`text-sm text-${config.color}-800 space-y-1`}>
        {config.instructions.map((instruction, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-xs mt-1">•</span>
            <span>{instruction}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderStatusIndicator = () => {
    if (isMinimumMet) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Minimum requis atteint ({photos.length}/{minPhotos})
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Photos manquantes ({photos.length}/{minPhotos} minimum)
          </span>
        </div>
      );
    }
  };

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
        <div className="flex items-center space-x-2">
          <ImageIcon className={`w-6 h-6 text-${config.color}-500`} />
          {renderStatusIndicator()}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        {renderInstructions()}
      </div>

      {/* Grille de photos */}
      <div className="mb-6">
        {renderPhotoGrid()}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Boutons d'action */}
      {canUpload && (
        <div className="flex space-x-3">
          <button
            onClick={openFileDialog}
            disabled={!canAddMore}
            className={`flex-1 bg-${config.color}-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-${config.color}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2`}
          >
            <Upload className="w-5 h-5" />
            <span>
              {canAddMore ? 'Ajouter des photos' : 'Maximum atteint'}
            </span>
          </button>

          {selectedPhotos.length > 0 && (
            <button
              onClick={() => {
                setSelectedPhotos([]);
                if (onPhotosChange) {
                  onPhotosChange([]);
                }
              }}
              className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Format accepté : JPG, PNG, WEBP</p>
        <p>• Taille maximale : 5MB par photo</p>
        <p>• Nombre de photos : {minPhotos} minimum, {maxPhotos} maximum</p>
        <p>• Les photos sont stockées de manière sécurisée et chiffrées</p>
      </div>

      {/* Modal de prévisualisation */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <img
              src={previewPhoto}
              alt="Prévisualisation"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher un résumé des photos dans une transaction
interface PhotoSummaryProps {
  initialPhotos: PackagePhoto[];
  pickupPhotos: PackagePhoto[];
  deliveryPhotos: PackagePhoto[];
  className?: string;
}

export const PhotoSummary: React.FC<PhotoSummaryProps> = ({
  initialPhotos,
  pickupPhotos,
  deliveryPhotos,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'initial' | 'pickup' | 'delivery'>('initial');

  const tabs = [
    { key: 'initial', label: 'Photos initiales', photos: initialPhotos, color: 'blue' },
    { key: 'pickup', label: 'Prise en charge', photos: pickupPhotos, color: 'green' },
    { key: 'delivery', label: 'Livraison', photos: deliveryPhotos, color: 'purple' }
  ];

  const activePhotos = tabs.find(tab => tab.key === activeTab)?.photos || [];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Historique des photos
      </h2>

      {/* Onglets */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? `bg-${tab.color}-600 text-white`
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs">
              ({tab.photos.length})
            </span>
          </button>
        ))}
      </div>

      {/* Grille de photos */}
      {activePhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activePhotos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Aucune photo disponible pour cette étape</p>
        </div>
      )}
    </div>
  );
};
