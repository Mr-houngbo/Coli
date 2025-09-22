import React from 'react';
import { Link } from 'react-router-dom';
import { Annonce } from '../types';
import { Calendar, MapPin, Package, Plane, Car, Bus, MessageSquare, Euro } from 'lucide-react';

interface AnnonceCardProps {
  annonce: Annonce;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce }) => {
  const getTransportIcon = (transport?: Annonce['moyen_transport']) => {
    switch (transport) {
      case 'avion':
        return <Plane className="h-4 w-4" />;
      case 'voiture':
        return <Car className="h-4 w-4" />;
      case 'bus':
      case 'train':
        return <Bus className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const isGP = annonce.type === 'GP';
  
  // Format price with thousands separator
  const formatPrice = (price?: number) => {
    if (!price) return 'Négociable';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(price);
  };
  
  // Use the formatPrice function for displaying prices
  const displayPrice = formatPrice(annonce.prix_kg);

  // Format date in French locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
      {/* Header avec type */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            isGP
              ? 'bg-violet-100 text-violet-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {isGP ? 'GP Voyage' : 'Expéditeur'}
        </span>
        <div className="flex items-center text-sm text-gray-500">
          {isGP && annonce.moyen_transport && getTransportIcon(annonce.moyen_transport)}
          {isGP && annonce.moyen_transport && (
            <span className="ml-1 capitalize">{annonce.moyen_transport}</span>
          )}
        </div>
      </div>

      {/* Trajet */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-gray-900">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span className="font-medium">{annonce.ville_depart}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-px bg-gray-300"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-gray-900">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span className="font-medium">{annonce.ville_arrivee}</span>
          </div>
        </div>
      </div>

      {/* Auteur */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-medium text-lg">
              {annonce.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {annonce.user?.role === 'gp' && (
              <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                ✓
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {annonce.user?.full_name || 'Utilisateur inconnu'}
            </p>
            <p className="text-xs text-gray-500">
              Membre depuis {annonce.user?.created_at ? new Date(annonce.user.created_at).getFullYear() : '---'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {annonce.user?.whatsapp_number && (
            <a
              href={`https://wa.me/${annonce.user.whatsapp_number}?text=Bonjour, je suis intéressé par votre annonce ${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              WhatsApp
            </a>
          )}
          <Link
            to={`/annonces/${annonce.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            <span>Détails</span>
            <svg
              className="ml-1 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(annonce.date_annonce)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Package className="h-4 w-4" />
          <span>
            {annonce.poids} kg {isGP ? 'disponible' : 'à envoyer'}
          </span>
        </div>
      </div>

      {/* Transport pour GP */}
      {isGP && annonce.moyen_transport && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              {getTransportIcon(annonce.moyen_transport)}
              <span>{annonce.moyen_transport || 'Non spécifié'}</span>
        </div>
      )}

      {/* Prix */}
      {annonce.prix_kg && (
        <div className="flex items-center space-x-2 text-violet-600 mb-4">
          <Euro className="h-4 w-4" />
          <span className="font-medium">{displayPrice}/kg</span>
        </div>
      )}

      {/* Description pour expéditeur */}
      {!isGP && annonce.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {annonce.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {annonce.user?.full_name ? (
            <span>Par <span className="font-medium">{annonce.user.full_name}</span></span>
          ) : (
            <span>Annonceur inconnu</span>
          )}
        </div>
        <Link
          to={`/annonces/${annonce.id}`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          Voir détails
        </Link>
      </div>
    </div>
  );
};

export default AnnonceCard;