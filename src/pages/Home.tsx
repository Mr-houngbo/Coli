import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, Plane, Shield, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Trouvez un <span className="text-violet-600">GP</span> pour vos colis
            <br />
            <span className="text-2xl md:text-4xl text-gray-600">transfrontaliers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connectez-vous avec des voyageurs de confiance pour envoyer vos colis rapidement et en toute sécurité entre la France et l'Afrique.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/voyageurs"
              className="bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-violet-700 transition-colors inline-flex items-center justify-center"
            >
              <Plane className="mr-2 h-5 w-5" />
              Je voyage (GP)
            </Link>
            <Link
              to="/expediteurs"
              className="bg-white text-violet-600 border-2 border-violet-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-violet-50 transition-colors inline-flex items-center justify-center"
            >
              <Package className="mr-2 h-5 w-5" />
              J'envoie un colis
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurisé</h3>
            <p className="text-gray-600">
              Tous nos GP sont vérifiés. Contactez-les directement via WhatsApp pour plus de transparence.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapide</h3>
            <p className="text-gray-600">
              Trouvez un GP pour votre trajet en quelques clics. Publication et recherche instantanées.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Économique</h3>
            <p className="text-gray-600">
              Des prix compétitifs pour l'envoi de vos colis. Négociez directement avec le GP.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Commencez dès maintenant
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Rejoignez notre communauté de voyageurs et d'expéditeurs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 transition-colors"
                  >
                    Créer un compte
                  </Link>
                  <Link
                    to="/annonces"
                    className="text-violet-600 border border-violet-600 px-6 py-3 rounded-lg font-medium hover:bg-violet-50 transition-colors"
                  >
                    Voir les annonces
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/publish"
                    className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 transition-colors"
                  >
                    Publier une annonce
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-violet-600 border border-violet-600 px-6 py-3 rounded-lg font-medium hover:bg-violet-50 transition-colors"
                  >
                    Mon tableau de bord
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;