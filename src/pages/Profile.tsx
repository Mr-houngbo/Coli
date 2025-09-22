import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';
import { User, Phone, Mail, Edit2, Save, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { getUserAnnonces } = useAnnonce();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  } as any;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                </div>
              </div>
              
              {!isEditing && (
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

          {/* Content */}
          <div className="p-8">
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
                            disabled={!isEditing}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-lg ${
                              isEditing 
                                ? 'border-gray-300 focus:ring-violet-500 focus:border-violet-500' 
                                : 'border-gray-200 bg-gray-50 text-gray-700'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
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
                            disabled={isSubmitting}
                            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            {isLoading ? (
                              <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                Enregistrer les modifications
                                <Save className="ml-2 h-4 w-4" />
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
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-violet-100 p-4 rounded-lg">
                    <p className="text-violet-800 text-sm">
                      Vous ne pouvez pas modifier votre adresse email. Contactez le support pour toute modification.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Conseils pour une bonne expérience :</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Soyez précis dans vos annonces</li>
                      <li>• Répondez rapidement aux messages</li>
                      <li>• Respectez vos engagements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;