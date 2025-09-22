import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnnonce } from '../contexts/AnnonceContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { africanCities } from '../data/africanCities';
import { Plane, Package } from 'lucide-react';

const PublishSchema = Yup.object().shape({
  type: Yup.string().oneOf(['GP', 'EXPEDITEUR']).required('Sélectionnez un type'),
  villeDepart: Yup.string().required('La ville de départ est requise'),
  villeArrivee: Yup.string().required('La ville d\'arrivée est requise'),
  date: Yup.date().min(new Date(), 'La date doit être future').required('La date est requise'),
  poids: Yup.number().positive('Le poids doit être positif').required('Le poids est requis'),
  prix: Yup.number().positive('Le prix doit être positif'),
  moyenTransport: Yup.string().when('type', {
    is: 'GP',
    then: (schema) => schema.required('Le moyen de transport est requis'),
  }),
  description: Yup.string(),
});

const Publish: React.FC = () => {
  const { user } = useAuth();
  const { addAnnonce } = useAnnonce();
  const navigate = useNavigate();
  const [annonceType, setAnnonceType] = useState<'GP' | 'EXPEDITEUR'>('GP');

  // Liste des grandes villes d'Afrique (échantillon extensible)
  const sortedCities = useMemo(() => {
    return [...new Set(africanCities.map(city => city.name))].sort();
  }, []);

  const oneToHundred = Array.from({ length: 100 }, (_, i) => (i + 1));

  const handleSubmit = async (values: any, { setSubmitting, setStatus }: any) => {
    setStatus(undefined);
    try {
      // Mapper les champs du formulaire vers le schéma DB
      const mapped: any = {
        type: values.type === 'EXPEDITEUR' ? 'Expediteur' : 'GP',
        ville_depart: values.villeDepart,
        ville_arrivee: values.villeArrivee,
        date_annonce: values.date, // IMPORTANT: utiliser date_annonce
        poids: Number(values.poids),
        prix_kg: values.prix ? Number(values.prix) : null,
        description: values.description || null,
      };
      if (mapped.type === 'GP') {
        mapped.transport = values.moyenTransport || null;
      }

      await addAnnonce(mapped, user!.id);
      navigate('/dashboard');
    } catch (e: any) {
      console.error('Erreur publication:', e?.message || e);
      setStatus(e?.message || "Impossible de publier l'annonce.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Publier une annonce</h1>

          <Formik
            initialValues={{
              type: 'GP',
              villeDepart: '',
              villeArrivee: '',
              date: '',
              poids: '',
              prix: '',
              moyenTransport: '',
              description: '',
            }}
            validationSchema={PublishSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting, status }) => (
              <Form className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Type d'annonce
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFieldValue('type', 'GP');
                        setAnnonceType('GP');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        values.type === 'GP'
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Plane className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Je voyage (GP)</div>
                      <div className="text-sm text-gray-600">J'ai de l'espace dans mes bagages</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFieldValue('type', 'EXPEDITEUR');
                        setAnnonceType('EXPEDITEUR');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        values.type === 'EXPEDITEUR'
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">J'envoie un colis</div>
                      <div className="text-sm text-gray-600">Je cherche un GP pour mon colis</div>
                    </button>
                  </div>
                </div>

                {/* Trajet */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="villeDepart" className="block text-sm font-medium text-gray-700 mb-1">
                      {annonceType === 'GP' ? 'Ville de départ' : 'Ville d\'envoi'}
                    </label>
                    <Field
                      as="select"
                      id="villeDepart"
                      name="villeDepart"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Sélectionner une ville</option>
                      {sortedCities.map((ville) => (
                        <option key={ville} value={ville}>
                          {ville}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="villeDepart" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="villeArrivee" className="block text-sm font-medium text-gray-700 mb-1">
                      {annonceType === 'GP' ? 'Ville d\'arrivée' : 'Ville de réception'}
                    </label>
                    <Field
                      as="select"
                      id="villeArrivee"
                      name="villeArrivee"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Sélectionner une ville</option>
                      {sortedCities.map((ville) => (
                        <option key={ville} value={ville}>
                          {ville}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="villeArrivee" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                {/* Date et Poids */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      {annonceType === 'GP' ? 'Date du trajet' : 'Date souhaitée'}
                    </label>
                    <Field
                      id="date"
                      name="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    />
                    <ErrorMessage name="date" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="poids" className="block text-sm font-medium text-gray-700 mb-1">
                      {annonceType === 'GP' ? 'Poids disponible (kg)' : 'Poids du colis (kg)'}
                    </label>
                    <Field
                      id="poids"
                      name="poids"
                      as="input"
                      type="number"
                      list="oneToHundred"
                      step="1"
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                      placeholder="1 - 100"
                    />
                    <ErrorMessage name="poids" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                {/* Champs spécifiques aux GP */}
                {annonceType === 'GP' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="moyenTransport" className="block text-sm font-medium text-gray-700 mb-1">
                        Moyen de transport
                      </label>
                      <Field
                        as="select"
                        id="moyenTransport"
                        name="moyenTransport"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                      >
                        <option value="">Sélectionner</option>
                        <option value="avion">Avion</option>
                        <option value="voiture">Voiture</option>
                        <option value="bus">Bus</option>
                      </Field>
                      <ErrorMessage name="moyenTransport" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">
                        Prix par kg (€) <span className="text-gray-500">(optionnel)</span>
                      </label>
                      <Field
                        id="prix"
                        name="prix"
                        as="input"
                        type="number"
                        list="oneToHundred"
                        step="1"
                        min={1}
                        max={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        placeholder="1 - 100"
                      />
                      <ErrorMessage name="prix" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                )}

                {/* Description pour expéditeur */}
                {annonceType === 'EXPEDITEUR' && (
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description du colis <span className="text-gray-500">(optionnel)</span>
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                      placeholder="Décrivez votre colis..."
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  {status && (
                    <div className="flex-1 text-sm text-red-600 self-center">{String(status)}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Publication...' : 'Publier mon annonce'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Publish;