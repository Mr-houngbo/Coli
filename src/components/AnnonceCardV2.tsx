import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  User, 
  Shield, 
  Clock,
  Star,
  MessageSquare,
  Eye,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle,
  Plane,
  Car,
  Train,
  Truck,
  Camera,
  Phone
} from 'lucide-react';
import { Annonce, Profile } from '../types';
import { TrustBadges, TrustScore } from './TrustBadges';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';

interface AnnonceCardV2Props {
  annonce: Annonce;
  onSecure?: (annonce: Annonce) => void;
  onContact?: (annonce: Annonce) => void;
  onViewDetails?: (annonce: Annonce) => void;
  showPhotos?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const AnnonceCardV2: React.FC<AnnonceCardV2Props> = ({
  annonce,
  onSecure,
  onContact,
  onViewDetails,
  showPhotos = true,
  variant = 'default',
  className = ''
}) => {
  const { user, profile } = useAuth();
  const { secureAnnonce, loading } = useAnnonce();
  const [isLiked, setIsLiked] = useState(false);
  const [showReceiverForm, setShowReceiverForm] = useState(false);
  const [receiverData, setReceiverData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const getTransportIcon = (transport: string) => {
    const icons = {
      avion: Plane,
      voiture: Car,
      train: Train,
      bus: Truck
    };
    return icons[transport as keyof typeof icons] || Car;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'secured': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Disponible',
      secured: 'Sécurisé',
      in_progress: 'En cours',
      completed: 'Terminé'
    };
    return labels[status as keyof typeof labels] || 'Disponible';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canSecureAnnonce = () => {
    return user?.id && 
           user.id !== annonce.user_id && 
           annonce.status === 'active' &&
           profile?.identity_verified;
  };

  const handleSecureAnnonce = async () => {
    if (!canSecureAnnonce() || !user?.id) return;

    if (!receiverData.name || !receiverData.phone) {
      alert('Veuillez remplir les informations du receveur');
      return;
    }

    try {
      const result = await secureAnnonce(
        annonce.id,
        user.id,
        receiverData
      );

      if (result && onSecure) {
        onSecure(annonce);
        setShowReceiverForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sécurisation:', error);
    }
  };

  const renderReceiverForm = () => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-blue-900 mb-3">Informations du receveur</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet *
          </label>
          <input
            type="text"
            value={receiverData.name}
            onChange={(e) => setReceiverData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom du destinataire"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            value={receiverData.phone}
            onChange={(e) => setReceiverData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+221 77 123 45 67"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse (optionnel)
          </label>
          <input
            type="text"
            value={receiverData.address}
            onChange={(e) => setReceiverData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Adresse de livraison"
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-4">
        <button
          onClick={() => setShowReceiverForm(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSecureAnnonce}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Sécurisation...' : 'Sécuriser'}
        </button>
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{annonce.ville_depart} → {annonce.ville_arrivee}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(annonce.date_voyage)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(annonce.status)}`}>
              {getStatusLabel(annonce.status)}
            </span>
            <span className="font-bold text-green-600">{annonce.prix?.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>
    );
  }

  const TransportIcon = getTransportIcon(annonce.moyen_transport);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {/* En-tête avec statut et actions rapides */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(annonce.status)}`}>
              {getStatusLabel(annonce.status)}
            </span>
            {annonce.is_urgent && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">URGENT</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Photos du colis (si disponibles) */}
      {showPhotos && annonce.package_photos && annonce.package_photos.length > 0 && (
        <div className="relative">
          <div className="flex overflow-x-auto space-x-2 p-4 pb-2">
            {annonce.package_photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Colis ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {annonce.package_photos.length > 3 && (
              <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-600">+{annonce.package_photos.length - 3}</span>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
            <Camera className="w-3 h-3" />
            <span>{annonce.package_photos.length}</span>
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="p-4">
        {/* Trajet */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-gray-900">{annonce.ville_depart}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-8 border-t border-dashed border-gray-300"></div>
              <TransportIcon className="w-5 h-5" />
              <div className="w-8 border-t border-dashed border-gray-300"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-gray-900">{annonce.ville_arrivee}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {annonce.prix?.toLocaleString()} <span className="text-sm">FCFA</span>
            </div>
            {annonce.prix_negocie && (
              <div className="text-xs text-gray-500">Négociable</div>
            )}
          </div>
        </div>

        {/* Date et détails */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <div>
              <div className="font-medium">{formatDate(annonce.date_voyage)}</div>
              <div className="text-xs">{formatTime(annonce.date_voyage)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <div>
              <div className="font-medium">{annonce.poids} kg</div>
              <div className="text-xs">{annonce.type_colis}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {annonce.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-2">
              {annonce.description}
            </p>
          </div>
        )}

        {/* Informations du GP */}
        {annonce.user && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{annonce.user.full_name}</div>
                <div className="flex items-center space-x-2">
                  <TrustBadges profile={annonce.user as Profile} size="sm" showLabels={false} />
                  <span className="text-xs text-gray-600">
                    {annonce.user.total_transactions || 0} transport(s)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <TrustScore score={annonce.user.trust_score || 0} size="sm" showLabel={false} />
              {annonce.user.average_rating > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>{annonce.user.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options et services */}
        {(annonce.assurance_incluse || annonce.livraison_domicile || annonce.colis_fragile) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {annonce.assurance_incluse && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Shield className="w-3 h-3" />
                <span>Assuré</span>
              </div>
            )}
            {annonce.livraison_domicile && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <Truck className="w-3 h-3" />
                <span>Livraison</span>
              </div>
            )}
            {annonce.colis_fragile && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>Fragile</span>
              </div>
            )}
          </div>
        )}

        {/* Formulaire receveur */}
        {showReceiverForm && renderReceiverForm()}

        {/* Actions */}
        <div className="flex space-x-3">
          {canSecureAnnonce() && !showReceiverForm && (
            <button
              onClick={() => setShowReceiverForm(true)}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Sécuriser</span>
            </button>
          )}
          
          {user?.id !== annonce.user_id && (
            <button
              onClick={() => onContact && onContact(annonce)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contacter</span>
            </button>
          )}

          <button
            onClick={() => onViewDetails && onViewDetails(annonce)}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Avertissement si non vérifié */}
        {!profile?.identity_verified && user?.id !== annonce.user_id && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Vérification requise</p>
                <p>Vérifiez votre identité pour sécuriser des annonces et accéder à toutes les fonctionnalités.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pied de page avec informations supplémentaires */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Publié le {formatDate(annonce.created_at)}</span>
            {annonce.vues && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{annonce.vues} vues</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {annonce.user?.whatsapp_verified && (
              <div className="flex items-center space-x-1 text-green-600">
                <Phone className="w-3 h-3" />
                <span>WhatsApp</span>
              </div>
            )}
            {annonce.user?.identity_verified && (
              <div className="flex items-center space-x-1 text-blue-600">
                <CheckCircle className="w-3 h-3" />
                <span>Vérifié</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
