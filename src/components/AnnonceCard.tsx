import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Annonce } from '../types';
import { Calendar, MapPin, Package, Plane, Car, Bus, MessageSquare, CircleDollarSign, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useConversations } from '../contexts/ConversationContext';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';

interface AnnonceCardProps {
  annonce: Annonce;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrCreateConversation } = useConversations();
  const { takeAnnonce } = useAnnonce();
  const getTransportIcon = (transport?: Annonce['transport']) => {
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
  const formatShortDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };
  const monthsSince = (dateString?: string) => {
    if (!dateString) return '---';
    const start = new Date(dateString).getTime();
    const now = Date.now();
    const months = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30)));
    if (months <= 1) return 'depuis 1 mois';
    return `depuis ${months} mois`;
  };

  const isGP = annonce.type === 'GP';
  
  // Format price with thousands separator
  const formatPrice = (price?: number) => {
    if (!price) return null;
    // Format en XOF (F CFA)
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Use the formatPrice function for displaying prices
  const displayPrice = formatPrice(annonce.prix_kg);


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${isGP ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'}`}
            aria-label={isGP ? 'Type: Gros Porteur' : 'Type: Expéditeur'}
            title={isGP ? 'Gros Porteur (GP)' : 'Expéditeur'}
          >
            {isGP ? 'GP Voyage' : 'Expéditeur'}
          </span>
          {/* Badge statut explicite */}
          {annonce.status && (
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                annonce.status === 'active'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : annonce.status === 'prise'
                  ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
              aria-label={`Statut: ${annonce.status}`}
              title={`Statut de l'annonce: ${annonce.status}`}
            >
              {annonce.status}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500" aria-label="Moyen de transport" title={annonce.transport || 'non spécifié'}>
          {annonce.transport && getTransportIcon(annonce.transport)}
          {annonce.transport && <span className="ml-1 capitalize">{annonce.transport}</span>}
        </div>
      </div>

      {/* Trajet en grand */}
      <div className="mb-5" aria-label="Trajet">
        <div className="flex items-center gap-2 text-gray-900">
          {annonce.transport ? (
            <span title={annonce.transport} aria-label={`Transport: ${annonce.transport}`}>{getTransportIcon(annonce.transport)}</span>
          ) : (
            <MapPin className="h-5 w-5 text-violet-600" aria-hidden="true" />
          )}
          <h3 className="text-xl font-bold">
            {annonce.ville_depart} 
            <span className="mx-1">→</span> 
            {annonce.ville_arrivee}
          </h3>
        </div>
      </div>

      {/* Disponibilité */}
      {(!annonce.status || annonce.status === 'active') && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-2.5 py-1 mb-3 w-fit" aria-label="Annonce disponible" title="Annonce disponible">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">Annonce disponible</span>
        </div>
      )}

      {/* Infos clés en blocs */}
      <div className="grid grid-cols-3 gap-3 mb-5" role="group" aria-label="Informations clés">
        <div className="bg-gray-50 rounded-md p-3 flex items-center gap-2" aria-label={`Poids: ${annonce.poids} kg`} title={`${annonce.poids} kg ${isGP ? 'disponible' : 'à envoyer'}`}>
          <Package className="h-4 w-4 text-gray-700" aria-hidden="true" />
          <div className="text-sm text-gray-800">
            <div className="font-medium">{annonce.poids} kg</div>
            <div className="text-xs text-gray-500">{isGP ? 'disponible' : 'à envoyer'}</div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 flex items-center gap-2" aria-label={`Départ: ${formatShortDate(annonce.date_annonce)}`} title={`Départ: ${formatShortDate(annonce.date_annonce)}`}>
          <Calendar className="h-4 w-4 text-gray-700" aria-hidden="true" />
          <div className="text-sm text-gray-800">
            <div className="font-medium">{formatShortDate(annonce.date_annonce)}</div>
            <div className="text-xs text-gray-500">Départ</div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 flex items-center gap-2" aria-label={displayPrice ? `Prix par kg: ${displayPrice}` : 'Prix négociable'} title={displayPrice ? `Prix par kg: ${displayPrice}` : 'Prix négociable'}>
          <CircleDollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
          <div className="text-sm text-gray-800">
            {displayPrice ? (
              <>
                <div className="font-medium">{displayPrice}</div>
                <div className="text-xs text-gray-500">par kg</div>
              </>
            ) : (
              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">Prix négociable</span>
            )}
          </div>
        </div>
      </div>

      {/* Auteur + actions */}
      <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-medium text-lg">
            {annonce.user?.full_name?.charAt(0)?.toUpperCase() || <UserIcon className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{annonce.user?.full_name || 'Utilisateur inconnu'}</div>
            <div className="text-xs text-gray-500">Membre {monthsSince(annonce.user?.created_at)}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/annonces/${annonce.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            aria-label="Voir les détails de l'annonce"
            title="Voir les détails"
          >
            Détails
          </Link>
          <button
            type="button"
            onClick={async () => {
              if (!user?.id) {
                navigate('/login', { state: { redirectTo: `/annonces/${annonce.id}` } });
                return;
              }
              if (!annonce.user_id) return;
              const conv = await getOrCreateConversation(annonce.id, annonce.user_id);
              if (conv?.id) navigate(`/conversations/${conv.id}`);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Discuter avec l'annonceur"
            title="Discuter"
          >
            Discuter
          </button>
          {(!annonce.status || annonce.status === 'active') && (
            <button
              type="button"
              onClick={async () => {
                if (!user?.id) {
                  navigate('/login', { state: { redirectTo: `/annonces/${annonce.id}` } });
                  return;
                }
                const res = await takeAnnonce(annonce.id, user.id);
                if (res?.conversationId) navigate(`/conversations/${res.conversationId}`);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label="Prendre cette annonce"
              title="Prendre l'annonce"
            >
              Prendre
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnonceCard;