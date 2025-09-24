import React, { useState } from 'react';
import { Star, MessageSquare, Clock, Shield, Truck, User } from 'lucide-react';
import { Rating, Profile, Transaction } from '../types';

interface RatingFormProps {
  transaction: Transaction;
  ratedUser: Profile;
  raterRole: 'expediteur' | 'gp' | 'receveur';
  onSubmit: (rating: Omit<Rating, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onCancel?: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  transaction,
  ratedUser,
  raterRole,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [criteria, setCriteria] = useState({
    punctuality: 5,
    communication: 5,
    package_condition: 5,
    professionalism: 5
  });
  const [loading, setLoading] = useState(false);

  const getRatingType = (): Rating['rating_type'] => {
    if (raterRole === 'expediteur' && ratedUser.role === 'gp') return 'expediteur_to_gp';
    if (raterRole === 'gp' && ratedUser.role === 'expediteur') return 'gp_to_expediteur';
    if (raterRole === 'receveur' && ratedUser.role === 'gp') return 'receveur_to_gp';
    if (raterRole === 'gp' && ratedUser.role === 'receveur') return 'gp_to_receveur';
    if (raterRole === 'expediteur' && ratedUser.role === 'receveur') return 'expediteur_to_receveur';
    return 'expediteur_to_gp'; // fallback
  };

  const criteriaLabels = {
    punctuality: 'Ponctualité',
    communication: 'Communication',
    package_condition: 'État du colis',
    professionalism: 'Professionnalisme'
  };

  const criteriaIcons = {
    punctuality: Clock,
    communication: MessageSquare,
    package_condition: Shield,
    professionalism: User
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ratingData: Omit<Rating, 'id' | 'created_at' | 'updated_at'> = {
        transaction_id: transaction.id,
        coli_space_id: transaction.coli_space_id,
        rater_id: transaction.expediteur_id, // À adapter selon le rôle
        rated_id: ratedUser.id,
        rating,
        comment: comment.trim() || undefined,
        rating_type: getRatingType(),
        ...criteria
      };

      const success = await onSubmit(ratingData);
      if (success && onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (
    value: number, 
    onChange: (rating: number) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Évaluer {ratedUser.full_name}
        </h2>
        <p className="text-gray-600 mt-1">
          Votre avis aide à améliorer la communauté Coli
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note globale */}
        {renderStarRating(rating, setRating, 'Note globale')}

        {/* Critères détaillés */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Critères détaillés</h3>
          {Object.entries(criteria).map(([key, value]) => {
            const IconComponent = criteriaIcons[key as keyof typeof criteriaIcons];
            return (
              <div key={key} className="flex items-center space-x-3">
                <IconComponent className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  {renderStarRating(
                    value,
                    (newValue) => setCriteria(prev => ({ ...prev, [key]: newValue })),
                    criteriaLabels[key as keyof typeof criteriaLabels]
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Partagez votre expérience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Boutons */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Envoi...' : 'Soumettre l\'avis'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Composant pour afficher les avis reçus
interface RatingDisplayProps {
  ratings: Rating[];
  profile: Profile;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  ratings,
  profile,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedRatings = showAll ? ratings : ratings.slice(0, 3);

  const getAverageForCriteria = (criteria: keyof Rating) => {
    const validRatings = ratings.filter(r => r[criteria] !== undefined && r[criteria] !== null);
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((acc, r) => acc + (r[criteria] as number), 0);
    return sum / validRatings.length;
  };

  const criteriaAverages = {
    punctuality: getAverageForCriteria('punctuality'),
    communication: getAverageForCriteria('communication'),
    package_condition: getAverageForCriteria('package_condition'),
    professionalism: getAverageForCriteria('professionalism')
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (ratings.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis pour le moment</h3>
        <p className="text-gray-600">
          Les premiers avis apparaîtront après les premières transactions
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Avis et évaluations
          </h3>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {renderStars(profile.average_rating)}
              <span className="text-lg font-bold text-gray-900">
                {profile.average_rating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {ratings.length} avis
            </p>
          </div>
        </div>

        {/* Moyennes par critère */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(criteriaAverages).map(([key, average]) => {
            const labels = {
              punctuality: 'Ponctualité',
              communication: 'Communication',
              package_condition: 'État du colis',
              professionalism: 'Professionnalisme'
            };

            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {labels[key as keyof typeof labels]}
                </span>
                <div className="flex items-center space-x-2">
                  {renderStars(average, 'sm')}
                  <span className="text-sm font-medium text-gray-900">
                    {average.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {displayedRatings.map((rating, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {renderStars(rating.rating, 'sm')}
                <span className="text-sm font-medium text-gray-900">
                  {rating.rating}/5
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(rating.created_at)}
              </span>
            </div>
            
            {rating.comment && (
              <p className="text-gray-700 text-sm mb-2">
                "{rating.comment}"
              </p>
            )}

            {/* Détail des critères si disponibles */}
            {(rating.punctuality || rating.communication || rating.package_condition || rating.professionalism) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {rating.punctuality && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Ponctualité: {rating.punctuality}/5
                  </span>
                )}
                {rating.communication && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    Communication: {rating.communication}/5
                  </span>
                )}
                {rating.package_condition && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    État colis: {rating.package_condition}/5
                  </span>
                )}
                {rating.professionalism && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Professionnalisme: {rating.professionalism}/5
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton pour voir plus */}
      {ratings.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          {showAll ? 'Voir moins' : `Voir les ${ratings.length - 3} autres avis`}
        </button>
      )}
    </div>
  );
};
