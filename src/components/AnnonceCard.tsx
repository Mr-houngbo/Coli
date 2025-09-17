import React from 'react';
import { Link } from 'react-router-dom';
import { Annonce } from '../types';
import { Calendar, MapPin, Package, Euro, Plane, Car, Bus, MessageSquare } from 'lucide-react';

interface AnnonceCardProps {
  annonce: Annonce;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTransportIcon = (transport?: string) => {
    switch (transport) {
      case 'avion':
        return <Plane className="h-4 w-4" />;
      case 'voiture':
        return <Car className="h-4 w-4" />;
      case 'bus':
        return <Bus className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const isGP = annonce.type === 'GP';

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
          {isGP && annonce.moyenTransport && getTransportIcon(annonce.moyenTransport)}
          {isGP && annonce.moyenTransport && (
            <span className="ml-1 capitalize">{annonce.moyenTransport}</span>
          )}
        </div>
      </div>

      {/* Trajet */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-gray-900">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span className="font-medium">{annonce.villeDepart}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-px bg-gray-300"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-gray-900">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span className="font-medium">{annonce.villeArrivee}</span>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(annonce.date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Package className="h-4 w-4" />
          <span>
            {annonce.poids} kg {isGP ? 'disponible' : 'à envoyer'}
          </span>
        </div>
      </div>

      {/* Prix */}
      {annonce.prix && (
        <div className="flex items-center space-x-2 text-violet-600 mb-4">
          <Euro className="h-4 w-4" />
          <span className="font-medium">{annonce.prix}€/kg</span>
        </div>
      )}

      {/* Description pour expéditeur */}
      {!isGP && annonce.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {annonce.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Par <span className="font-medium">{annonce.user.name}</span>
        </div>
        <div className="flex space-x-2">
          <a
            href={`https://wa.me/${annonce.user.whatsapp.replace(/\s+/g, '').replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
          <Link
            to={`/annonces/${annonce.id}`}
            className="bg-violet-600 text-white px-3 py-1 rounded text-sm hover:bg-violet-700 transition-colors"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnnonceCard;