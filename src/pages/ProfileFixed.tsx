import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';
import { User, Mail, Edit2, Save, X, Loader2, Shield, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import IdentityVerification from '../components/auth/IdentityVerification';
import TrustBadges from '../components/TrustBadges';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
  phone: Yup.string()
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      'Numéro de téléphone invalide. Exemples: +221 77 123 45 67, 00221771234567, 771234567'
    )
    .required('Le numéro WhatsApp est requis'),
});

const ProfileFixed: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { getUserAnnonces } = useAnnonce();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'trust'>('profile');

  const [annonces, setAnnonces] = useState<{total: number; gp: number; expediteur: number}>({total: 0, gp: 0, expediteur: 0});

  useEffect(() => {
    const loadAnnonces = async () => {
      if (!user?.id) return;
      
      try {
        const userAnnonces = await getUserAnnonces(user.id);
        setAnnonces({
          total: userAnnonces.length,
          gp: userAnnonces.filter((a: any) => a.type === 'GP').length,
          expediteur: userAnnonces.filter((a: any) => a.type === 'Expediteur').length
        });
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
      }
    };

    loadAnnonces();
  }, [user?.id, getUserAnnonces]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Mise à jour du profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.name,
          phone: values.phone,
          whatsapp_number: values.phone,
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Rafraîchir les données du profil
      await refreshProfile();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const safeProfile = profile || {
    id: user.id,
    full_name: user.email?.split('@')[0] || 'Utilisateur',
    phone: '',
    whatsapp_number: '',
    role: 'expediteur',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    identity_verified: false,
    trust_score: 0,
    total_transactions: 0,
    successful_transactions: 0,
    average_rating: 0,
  } as any;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{safeProfile.full_name}</h1>
                  <p className="text-violet-100">
                    {safeProfile.role === 'gp' ? 'Transporteur' : 'Expéditeur'} sur Coli
                  </p>
                  {/* Trust Badges dans le header */}
                  <div className="mt-2">
                    <TrustBadges 
                      profile={safeProfile}
                      size="sm"
                      showLabels={false}
                    />
                  </div>
                </div>
              </div>
              
              {!isEditing && activeTab === 'profile' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('kyc')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'kyc'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Vérification KYC
                {!safeProfile.identity_verified && (
                  <AlertTriangle className="h-4 w-4 inline ml-1 text-yellow-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('trust')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trust'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Star className="h-4 w-4 inline mr-2" />
                Confiance & Badges
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
                  
                  <Formik
                    initialValues={{
                      name: safeProfile.full_name,
                      email: user.email || '',
                      phone: safeProfile.phone || '',
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom complet
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="name"
                              name="name"
                              type="text"
                              disabled={!isEditing}
                              className={`block w-full pl-10 pr-3 py-2 border rounded-lg ${
                                isEditing 
                                  ? 'border-gray-300 focus:ring-violet-500 focus:border-violet-500' 
                                  : 'border-gray-200 bg-gray-50 text-gray-700'
                              }`}
                            />
                          </div>
                          <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="email"
                              name="email"
                              type="email"
                              disabled={true}
                              className="block w-full pl-10 pr-3 py-2 border rounded-lg border-gray-200 bg-gray-50 text-gray-700"
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">L'email ne peut pas être modifié</p>
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro WhatsApp
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-500">+</span>
                            </div>
                            <Field
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="221 77 123 45 67"
                              disabled={!isEditing}
                              className={`block w-full pl-8 pr-3 py-2 border rounded-lg ${
                                isEditing 
                                  ? 'border-gray-300 focus:ring-violet-500 focus:border-violet-500' 
                                  : 'border-gray-200 bg-gray-50 text-gray-700'
                              }`}
                            />
                          </div>
                          <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        {isEditing && (
                          <div className="flex space-x-4">
                            <button
                              type="submit"
                              disabled={isSubmitting || isLoading}
                              className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin h-4 w-4" />
                                  <span>Enregistrement...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  <span>Enregistrer</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <X className="h-4 w-4" />
                              <span>Annuler</span>
                            </button>
                          </div>
                        )}
                      </Form>
                    )}
                  </Formik>
                </div>

                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total annonces</span>
                        <span className="font-bold text-2xl text-violet-600">{annonces.total}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Annonces GP</span>
                        <span className="font-bold text-xl text-green-600">{annonces.gp}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Colis à envoyer</span>
                        <span className="font-bold text-xl text-blue-600">{annonces.expediteur}</span>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Score de confiance</span>
                          <span className="font-bold text-xl text-yellow-600">{safeProfile.trust_score || 0}/100</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Note moyenne</span>
                          <span className="font-bold text-xl text-orange-600">
                            {safeProfile.average_rating ? `${safeProfile.average_rating}/5` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Conseils Flow-Coli :</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Complétez votre vérification KYC</li>
                        <li>• Ajoutez des photos à vos annonces</li>
                        <li>• Répondez rapidement aux messages</li>
                        <li>• Respectez vos engagements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="max-w-4xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification d'identité (KYC)</h2>
                  <p className="text-gray-600">
                    La vérification d'identité est essentielle pour utiliser toutes les fonctionnalités Flow-Coli 
                    et gagner la confiance des autres utilisateurs.
                  </p>
                </div>

                {!safeProfile.identity_verified ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Vérification requise</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Votre identité n'est pas encore vérifiée. Complétez le processus ci-dessous.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-800">Identité vérifiée ✅</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Votre identité a été vérifiée avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités Flow-Coli.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <IdentityVerification />
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="max-w-4xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Badges de confiance</h2>
                  <p className="text-gray-600">
                    Vos badges de confiance reflètent votre réputation et vos accomplissements sur la plateforme Coli.
                  </p>
                </div>

                <TrustBadges 
                  profile={safeProfile}
                  size="lg"
                  showLabels={true}
                />

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-medium text-blue-800 mb-3">Comment améliorer votre score de confiance :</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Actions recommandées :</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Vérifiez votre identité (KYC)</li>
                        <li>• Confirmez votre numéro de téléphone</li>
                        <li>• Complétez vos transactions</li>
                        <li>• Obtenez de bonnes évaluations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Avantages :</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Plus de visibilité pour vos annonces</li>
                        <li>• Accès aux fonctionnalités premium</li>
                        <li>• Confiance accrue des utilisateurs</li>
                        <li>• Priorité dans les recherches</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFixed;
