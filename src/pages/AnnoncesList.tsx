import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Annonce = {
  id: string;
  type: string;
  ville_depart: string;
  ville_arrivee: string;
  date_annonce: string;
  poids: number;
  prix_kg?: number;
  transport?: string;
  description?: string;
  created_at: string;
};

export default function AnnoncesList() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('annonces')
          .select('*');

        if (error) {
          throw error;
        }

        const items = (data || []) as Annonce[];
        items.sort((a, b) => {
          const da = new Date((a as any).created_at || (a as any).date_annonce || 0).getTime();
          const db = new Date((b as any).created_at || (b as any).date_annonce || 0).getTime();
          return db - da;
        });
        setAnnonces(items);
      } catch (err) {
        console.error('Erreur lors du chargement des annonces:', err);
        setError('Impossible de charger les annonces. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonces();

    // S'abonner aux changements en temps réel
    const subscription = supabase
      .channel('public:annonces')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'annonces' },
        () => {
          fetchAnnonces();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Toutes les annonces</h2>
      </div>
      
      {annonces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune annonce disponible</h3>
          <p className="mt-1 text-sm text-gray-500">Soyez le premier à publier une annonce !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {annonces.map((annonce) => (
            <div
              key={annonce.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {annonce.type === 'GP' ? 'Gros porteur' : 'Expéditeur'} : {annonce.ville_depart} → {annonce.ville_arrivee}
                  </h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-800">
                    {annonce.type}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date de départ</p>
                    <p className="font-medium">{formatDate(annonce.date_annonce)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Poids</p>
                    <p className="font-medium">{annonce.poids} kg</p>
                  </div>
                  {annonce.prix_kg && (
                    <div>
                      <p className="text-sm text-gray-500">Prix au kilo</p>
                      <p className="font-medium">{annonce.prix_kg} CFA/kg</p>
                    </div>
                  )}
                  {annonce.transport && (
                    <div>
                      <p className="text-sm text-gray-500">Type de transport</p>
                      <p className="font-medium capitalize">{annonce.transport}</p>
                    </div>
                  )}
                </div>
                {annonce.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1 text-gray-700">{annonce.description}</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                  >
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
