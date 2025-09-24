import React from 'react';
import { Shield, CheckCircle, Phone, Mail, Star, Plane, Award } from 'lucide-react';
import { Profile, TrustBadge } from '../types';

interface TrustBadgesProps {
  profile: Profile;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  profile,
  size = 'md',
  showLabels = true,
  className = ''
}) => {
  // Générer les badges basés sur le profil
  const generateBadges = (profile: Profile): TrustBadge[] => {
    const badges: TrustBadge[] = [];

    // Badge de vérification d'identité
    if (profile.identity_verified) {
      badges.push({
        type: 'identity_verified',
        name: 'Identité vérifiée',
        description: 'Document d\'identité vérifié par notre équipe',
        icon: 'Shield',
        color: 'blue'
      });
    }

    // Badge de téléphone vérifié
    if (profile.whatsapp_verified) {
      badges.push({
        type: 'phone_verified',
        name: 'Téléphone vérifié',
        description: 'Numéro WhatsApp confirmé',
        icon: 'Phone',
        color: 'green'
      });
    }

    // Badge d'email vérifié
    if (profile.email_verified) {
      badges.push({
        type: 'email_verified',
        name: 'Email vérifié',
        description: 'Adresse email confirmée',
        icon: 'Mail',
        color: 'purple'
      });
    }

    // Badge top rated (note moyenne >= 4.5 avec au moins 10 avis)
    if (profile.average_rating >= 4.5 && profile.total_transactions >= 10) {
      badges.push({
        type: 'top_rated',
        name: 'Top Rated',
        description: 'Excellente réputation avec plus de 10 transactions',
        icon: 'Star',
        color: 'yellow'
      });
    }

    // Badge voyageur fréquent (GP avec plus de 20 transactions)
    if (profile.role === 'gp' && profile.total_transactions >= 20) {
      badges.push({
        type: 'frequent_traveler',
        name: 'Voyageur Expert',
        description: 'Plus de 20 transports réalisés',
        icon: 'Plane',
        color: 'indigo'
      });
    }

    return badges;
  };

  const badges = generateBadges(profile);

  const getIconComponent = (iconName: string) => {
    const icons = {
      Shield,
      CheckCircle,
      Phone,
      Mail,
      Star,
      Plane,
      Award
    };
    return icons[iconName as keyof typeof icons] || Shield;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'w-6 h-6',
          icon: 'w-3 h-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          badge: 'w-10 h-10',
          icon: 'w-5 h-5',
          text: 'text-sm'
        };
      default:
        return {
          badge: 'w-8 h-8',
          icon: 'w-4 h-4',
          text: 'text-xs'
        };
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      red: 'bg-red-100 text-red-600 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const sizeClasses = getSizeClasses();

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {badges.map((badge, index) => {
        const IconComponent = getIconComponent(badge.icon);
        const colorClasses = getColorClasses(badge.color);

        return (
          <div key={index} className="group relative">
            <div
              className={`
                ${sizeClasses.badge} 
                ${colorClasses}
                rounded-full border flex items-center justify-center
                cursor-help transition-transform hover:scale-110
              `}
            >
              <IconComponent className={sizeClasses.icon} />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="font-semibold">{badge.name}</div>
              <div className="text-gray-300">{badge.description}</div>
              {/* Flèche du tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        );
      })}

      {/* Labels textuels (optionnel) */}
      {showLabels && size !== 'sm' && (
        <div className="flex flex-wrap gap-1">
          {badges.slice(0, 2).map((badge, index) => (
            <span
              key={index}
              className={`
                px-2 py-1 rounded-full border text-xs font-medium
                ${getColorClasses(badge.color)}
              `}
            >
              {badge.name}
            </span>
          ))}
          {badges.length > 2 && (
            <span className="px-2 py-1 rounded-full border text-xs font-medium bg-gray-100 text-gray-600 border-gray-200">
              +{badges.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Composant pour afficher le score de confiance
interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const TrustScore: React.FC<TrustScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`
          ${getSizeClasses()}
          ${getScoreColor(score)}
          rounded-full flex items-center justify-center font-bold
        `}
      >
        {score}
      </div>
      {showLabel && (
        <div className="text-sm">
          <div className="font-medium text-gray-900">Score de confiance</div>
          <div className={`text-xs ${getScoreColor(score).split(' ')[0]}`}>
            {getScoreLabel(score)}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher les statistiques de réputation
interface ReputationStatsProps {
  profile: Profile;
  className?: string;
}

export const ReputationStats: React.FC<ReputationStatsProps> = ({
  profile,
  className = ''
}) => {
  const successRate = profile.total_transactions > 0 
    ? Math.round((profile.successful_transactions / profile.total_transactions) * 100)
    : 0;

  const stats = [
    {
      label: 'Transactions',
      value: profile.total_transactions,
      icon: Award,
      color: 'blue'
    },
    {
      label: 'Taux de réussite',
      value: `${successRate}%`,
      icon: CheckCircle,
      color: successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red'
    },
    {
      label: 'Note moyenne',
      value: profile.average_rating > 0 ? profile.average_rating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'yellow'
    }
  ];

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="text-center">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 bg-${stat.color}-100`}>
              <IconComponent className={`w-4 h-4 text-${stat.color}-600`} />
            </div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default TrustBadges;
