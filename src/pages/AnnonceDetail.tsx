import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAnnonce } from '../contexts/AnnonceContext';
import { Calendar, MapPin, Package, Euro, Plane, Car, Bus, ArrowLeft, MessageSquare, Phone, User, Loader2 } from 'lucide-react';

const AnnonceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnnonceById } = useAnnonce();
  const [annonce, setAnnonce] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!id) {
          setAnnonce(null);
          return;
        }
        const item = await getAnnonceById(id);
        if (mounted) setAnnonce(item ?? null);
      } catch (e: any) {
        console.error('Erreur chargement annonce:', e);
        if (mounted) setError("Impossible de charger l'annonce");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [id, getAnnonceById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!annonce || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Annonce non trouvée</h2>
          <p className="text-gray-600 mb-6">Cette annonce n'existe pas ou a été supprimée.</p>
          <Link
            to="/annonces"
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTransportIcon = (transport?: string) => {
    switch (transport) {
      case 'avion':
        return <Plane className="h-6 w-6" />;
      case 'voiture':
        return <Car className="h-6 w-6" />;
      case 'bus':
        return <Bus className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const isGP = annonce.type === 'GP' || annonce.type === 'gp';

  // Normalisation des champs potentiellement snake_case
  const villeDepart = annonce.villeDepart || annonce.ville_depart || annonce.ville_de_depart || '';
  const villeArrivee = annonce.villeArrivee || annonce.ville_arrivee || annonce.ville_d_arrivee || '';
  const dateStr = annonce.date || annonce.date_annonce || annonce.created_at;
  const poids = annonce.poids || annonce.poids_kg || annonce.weight || 0;
  const prixKg = annonce.prix || annonce.prix_kg || null;
  const moyenTransport = annonce.moyenTransport || annonce.moyen_transport || annonce.transport || undefined;

  const user = annonce.user || {};
  const userName = user.full_name || user.name || 'Utilisateur';
  const userPhone = user.phone || '';
  const userWhatsapp = user.whatsapp_number || user.whatsapp || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                    isGP ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-100'
                  }`}
                >
                  {isGP ? 'GP Voyage' : 'Expéditeur'}
                </span>
                <h1 className="text-3xl font-bold">
                  {villeDepart} → {villeArrivee}
                </h1>
              </div>
              
              {isGP && moyenTransport && (
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-white/80 mb-2">
                    {getTransportIcon(moyenTransport)}
                    <span className="capitalize">{moyenTransport}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trip Details */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Détails du trajet</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-violet-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{formatDate(dateStr)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-violet-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Poids</p>
                        <p className="font-medium">
                          {poids} kg {isGP ? 'disponible' : 'à envoyer'}
                        </p>
                      </div>
                    </div>

                    {prixKg && (
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Euro className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prix</p>
                          <p className="font-medium text-green-600">{prixKg}€/kg</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Itinéraire</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-violet-600 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">{villeDepart}</p>
                          <p className="text-sm text-gray-600">Départ</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-px bg-gray-300 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-400 transform rotate-90"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">{villeArrivee}</p>
                          <p className="text-sm text-gray-600">Arrivée</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {!isGP && (annonce.description || annonce.description_colis) && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description du colis</h2>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{annonce.description || annonce.description_colis}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* User Card */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {isGP ? 'GP' : 'Expéditeur'}
                  </h3>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-violet-100 p-2 rounded-full">
                      <User className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-600">Membre de Coli</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{userPhone || 'Non renseigné'}</span>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="space-y-3">
                    <a
                      href={`https://wa.me/${(userWhatsapp || '').replace(/\s+/g, '').replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Contacter sur WhatsApp</span>
                    </a>
                    
                    <a
                      href={`tel:${userPhone}`}
                      className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="h-5 w-5" />
                      <span>Appeler</span>
                    </a>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-bold text-blue-900 mb-2">💡 Conseils</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vérifiez l'identité du GP</li>
                    <li>• Négociez les modalités par WhatsApp</li>
                    <li>• Remise en main propre recommandée</li>
                    <li>• Vérifiez les restrictions douanières</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonceDetail;