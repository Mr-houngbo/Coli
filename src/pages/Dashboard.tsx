import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Annonce, Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';
import Sidebar from '../components/Sidebar';
import AnnonceCard from '../components/AnnonceCard';
import { Plus, Package, TrendingUp, Users, List, User, Loader2 } from 'lucide-react';

type DashboardTab = 'dashboard' | 'mes-annonces' | 'profile';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { getUserAnnonces, loading: annoncesLoading } = useAnnonce();
  const location = useLocation();
  const navigate = useNavigate();
  const [userAnnonces, setUserAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentTab: DashboardTab = location.pathname.includes('mes-annonces') 
    ? 'mes-annonces' 
    : location.pathname.includes('profile')
      ? 'profile'
      : 'dashboard';

  // Memoize computed values
  const { totalAnnonces, gpAnnonces, expediteurAnnonces } = useMemo(() => ({
    totalAnnonces: userAnnonces.length,
    gpAnnonces: userAnnonces.filter((a) => a.type === 'GP').length,
    expediteurAnnonces: userAnnonces.filter((a) => a.type === 'Expediteur').length
  }), [userAnnonces]);

  // Memoize the user ID to prevent unnecessary effect re-runs
  const userId = user?.id;

  useEffect(() => {
    let isMounted = true;
    
    const loadUserAnnonces = async () => {
      if (!userId) {
        if (isMounted) {
          setUserAnnonces([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);
        
        const annonces = await getUserAnnonces(userId);
        
        if (isMounted) {
          setUserAnnonces(Array.isArray(annonces) ? annonces : []);
        }
      } catch (err) {
        console.error('Error loading annonces:', err);
        if (isMounted) {
          setUserAnnonces([]);
          setError('Erreur lors du chargement des annonces. Veuillez réessayer.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Add a small debounce to prevent rapid firing
    const timer = setTimeout(() => {
      loadUserAnnonces();
    }, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userId, getUserAnnonces]);

  // Rediriger vers /login seulement si l'utilisateur n'est pas authentifié
  // (ne pas rediriger quand le profil n'est pas encore chargé pour éviter une boucle)
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const renderDashboard = useCallback(() => {
    if (!user) return null;
    const safeProfile = profile || {
      id: user.id,
      full_name: user.email?.split('@')[0] || 'Utilisateur',
      phone: '',
      whatsapp_number: '',
      role: 'expediteur',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Profile;
    
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {safeProfile.full_name || 'cher utilisateur'}
            </h1>
            <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
          </div>
          <Link
            to="/publish"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle annonce
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-violet-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total annonces</p>
                <p className="text-2xl font-bold text-gray-900">{totalAnnonces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Annonces GP</p>
                <p className="text-2xl font-bold text-gray-900">{gpAnnonces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Colis à envoyer</p>
                <p className="text-2xl font-bold text-gray-900">{expediteurAnnonces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Link to="/publish" className="flex items-center text-violet-600 hover:text-violet-700">
              <div className="bg-violet-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-violet-600">Publier</p>
                <p className="text-lg font-medium">Nouvelle annonce</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mes annonces récentes</h2>
          {loading || annoncesLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
            </div>
          ) : userAnnonces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userAnnonces.slice(0, 3).map((annonce) => ({
                ...annonce,
                user: profile || undefined
              })).map((annonce) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première annonce.</p>
              <div className="mt-6">
                <Link
                  to="/publish"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Nouvelle annonce
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Voyagez avec Coli</h3>
            <p className="text-violet-100 mb-4">
              Monétisez vos voyages en transportant des colis pour d'autres utilisateurs
            </p>
            <Link
              to="/voyageurs"
              className="bg-white text-violet-600 px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Voir les voyageurs (GP)
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Envoyez un colis</h3>
            <p className="text-blue-100 mb-4">
              Trouvez un GP de confiance pour envoyer vos colis rapidement
            </p>
            <Link
              to="/expediteurs"
              className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Voir les expéditeurs
            </Link>
          </div>
        </div>
      </div>
    );
  }, [user, profile, totalAnnonces, gpAnnonces, expediteurAnnonces, loading, annoncesLoading, userAnnonces]);

  const renderMesAnnonces = useCallback(() => {
    if (!user) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <List className="h-5 w-5 mr-2 text-violet-600" />
          Mes annonces
        </h2>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
            </div>
          ) : userAnnonces.length > 0 ? (
            userAnnonces.map((annonce) => {
              // Ensure the annonce has the correct user type
              // Create a properly typed user object with all required fields
              const userProfile: Profile = (
                profile ? {
                  id: profile.id,
                  full_name: profile.full_name || 'Utilisateur',
                  email: user?.email || 'email@example.com',
                  phone: profile.phone || '',
                  whatsapp_number: profile.whatsapp_number || '',
                  role: profile.role || 'expediteur',
                  created_at: profile.created_at || new Date().toISOString(),
                  updated_at: profile.updated_at || new Date().toISOString()
                } : {
                  id: user!.id,
                  full_name: user?.email?.split('@')[0] || 'Utilisateur',
                  email: user?.email || 'email@example.com',
                  phone: '',
                  whatsapp_number: '',
                  role: 'expediteur',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ) as unknown as Profile;
              
              // Create annonce with user, ensuring all required fields are present
              const annonceWithUser = {
                ...annonce,
                user: userProfile
              } as Annonce;
              return <AnnonceCard key={annonce.id} annonce={annonceWithUser} />;
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Vous n'avez pas encore d'annonces.</p>
              <Link
                to="/annonces/nouvelle"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une annonce
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }, [user, profile, loading, userAnnonces]);

  const renderProfile = useCallback(() => {
    if (!user) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <User className="h-5 w-5 mr-2 text-violet-600" />
          Mon Profil
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Informations personnelles</h3>
            <p className="mt-1 text-sm text-gray-600">
              {profile?.full_name || user.email?.split('@')[0] || 'Non renseigné'}
            </p>
            <p className="text-sm text-gray-600">{user.email || 'Non renseigné'}</p>
            <p className="text-sm text-gray-600">
              Téléphone: {profile?.phone || 'Non renseigné'}
            </p>
            <p className="text-sm text-gray-600">
              WhatsApp: {profile?.whatsapp_number || 'Non renseigné'}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Link
              to="/profile"
              className="text-violet-600 hover:text-violet-800 text-sm font-medium"
            >
              Modifier le profil
            </Link>
          </div>
        </div>
      </div>
    );
  }, [profile, user]);

  const renderContent = useCallback(() => {
    if (!user) return null;
    
    switch (currentTab) {
      case 'mes-annonces':
        return renderMesAnnonces();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  }, [currentTab, profile, user, renderMesAnnonces, renderProfile, renderDashboard]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-violet-600 animate-spin mx-auto mb-4" />
          <p>Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Une erreur est survenue</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab={currentTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
