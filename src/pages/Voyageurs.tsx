import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AnnonceCard from '../components/AnnonceCard';

export default function Voyageurs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('annonces')
          .select('*')
          .eq('type', 'GP');
        if (error) throw error;
        let list = (data || []) as any[];
        // Montrer uniquement les annonces actives si la colonne existe
        if (list.length && Object.prototype.hasOwnProperty.call(list[0], 'status')) {
          list = list.filter((a: any) => (a.status ?? 'active') === 'active');
        }
        list.sort((a: any, b: any) => {
          const da = new Date(a.created_at || a.date_annonce || 0).getTime();
          const db = new Date(b.created_at || b.date_annonce || 0).getTime();
          return db - da;
        });
        setItems(list);
      } catch (e: any) {
        console.error('Erreur chargement GP:', e?.message || e);
        setError("Impossible de charger les voyageurs.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Voyageurs (GP)</h1>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">Aucune annonce GP</div>
        ) : (
          <div className="space-y-4">
            {items.map((a) => (
              <AnnonceCard key={a.id} annonce={a as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
