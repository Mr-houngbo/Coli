import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonces } from '../contexts/AnnonceContext';
import { User, Phone, Mail, Package, Edit2, Save, X } from 'lucide-react';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
  phone: Yup.string()
    .matches(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone français invalide')
    .required('Le numéro WhatsApp est requis'),
});

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getUserAnnonces } = useAnnonces();
  const [isEditing, setIsEditing] = useState(false);

  const userAnnonces = getUserAnnonces(user?.id || '');
  const totalAnnonces = userAnnonces.length;
  const gpAnnonces = userAnnonces.filter(a => a.type === 'GP').length;
  const expediteurAnnonces = userAnnonces.filter(a => a.type === 'EXPEDITEUR').length;

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    // Simulation de la mise à jour
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setSubmitting(false);
  };

  if (!user) {
    return null;
  }

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
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-violet-100">Membre GP Connect</p>
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
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
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
                            <User className="h-5 w-5 text-gray-400" />
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
                            <Mail className="h-5 w-5 text-gray-400" />
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
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            id="phone"
                            name="phone"
                            type="tel"
                            disabled={!isEditing}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-lg ${
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
                            <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
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
                      <span className="font-bold text-2xl text-violet-600">{totalAnnonces}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Annonces GP</span>
                      <span className="font-bold text-xl text-green-600">{gpAnnonces}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Colis à envoyer</span>
                      <span className="font-bold text-xl text-blue-600">{expediteurAnnonces}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-violet-50 rounded-lg p-6">
                  <h4 className="font-bold text-violet-900 mb-2">🎯 Conseils</h4>
                  <ul className="text-sm text-violet-800 space-y-1">
                    <li>• Complétez votre profil</li>
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
  );
};

export default Profile;