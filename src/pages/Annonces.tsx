import React, { useState, useMemo } from 'react';
import { useAnnonce } from '../contexts/AnnonceContext';
import AnnonceCard from '../components/AnnonceCard';
import { Search, Filter } from 'lucide-react';

const Annonces: React.FC = () => {
  const { annonces } = useAnnonce();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    villeDepart: '',
    villeArrivee: '',
    dateMin: '',
    dateMax: '',
    prixMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const villes = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
    'Dakar', 'Abidjan', 'Casablanca', 'Tunis', 'Alger', 'Bamako', 'Conakry'
  ];

  const filteredAnnonces = useMemo(() => {
    return annonces.filter(annonce => {
      const matchesSearch = searchTerm === '' || 
        annonce.villeDepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annonce.villeArrivee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annonce.user.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filters.type === '' || annonce.type === filters.type;
      const matchesVilleDepart = filters.villeDepart === '' || annonce.villeDepart === filters.villeDepart;
      const matchesVilleArrivee = filters.villeArrivee === '' || annonce.villeArrivee === filters.villeArrivee;
      
      const annonceDate = new Date(annonce.date);
      const matchesDateMin = filters.dateMin === '' || annonceDate >= new Date(filters.dateMin);
      const matchesDateMax = filters.dateMax === '' || annonceDate <= new Date(filters.dateMax);
      
      const matchesPrix = filters.prixMax === '' || !annonce.prix || annonce.prix <= Number(filters.prixMax);

      return matchesSearch && matchesType && matchesVilleDepart && 
             matchesVilleArrivee && matchesDateMin && matchesDateMax && matchesPrix;
    });
  }, [annonces, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      type: '',
      villeDepart: '',
      villeArrivee: '',
      dateMin: '',
      dateMax: '',
      prixMax: '',
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Toutes les annonces
          </h1>
          <p className="text-gray-600">
            Trouvez le GP parfait pour vos colis ou des colis à transporter
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par ville ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="h-5 w-5" />
              <span>Filtres avancés</span>
            </button>
            
            {Object.values(filters).some(f => f !== '') && (
              <button
                onClick={resetFilters}
                className="text-violet-600 hover:text-violet-700 text-sm"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="">Tous</option>
                    <option value="GP">GP</option>
                    <option value="EXPEDITEUR">Expéditeur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Départ
                  </label>
                  <select
                    value={filters.villeDepart}
                    onChange={(e) => setFilters({...filters, villeDepart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="">Toutes</option>
                    {villes.map(ville => (
                      <option key={ville} value={ville}>{ville}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrivée
                  </label>
                  <select
                    value={filters.villeArrivee}
                    onChange={(e) => setFilters({...filters, villeArrivee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="">Toutes</option>
                    {villes.map(ville => (
                      <option key={ville} value={ville}>{ville}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    À partir du
                  </label>
                  <input
                    type="date"
                    value={filters.dateMin}
                    onChange={(e) => setFilters({...filters, dateMin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jusqu'au
                  </label>
                  <input
                    type="date"
                    value={filters.dateMax}
                    onChange={(e) => setFilters({...filters, dateMax: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix max/kg (€)
                  </label>
                  <input
                    type="number"
                    value={filters.prixMax}
                    onChange={(e) => setFilters({...filters, prixMax: e.target.value})}
                    placeholder="Ex: 20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAnnonces.length} annonce{filteredAnnonces.length !== 1 ? 's' : ''} trouvée{filteredAnnonces.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Annonces Grid */}
        {filteredAnnonces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnnonces.map((annonce) => (
              <AnnonceCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou supprimez certains filtres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Annonces;