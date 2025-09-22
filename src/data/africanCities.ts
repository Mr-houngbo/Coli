// Liste des principales villes d'Afrique par pays
export const africanCities = [
  // Afrique du Nord
  { name: 'Alger', country: 'Algérie' },
  { name: 'Oran', country: 'Algérie' },
  { name: 'Constantine', country: 'Algérie' },
  { name: 'Le Caire', country: 'Égypte' },
  { name: 'Alexandrie', country: 'Égypte' },
  { name: 'Tripoli', country: 'Libye' },
  { name: 'Benghazi', country: 'Libye' },
  { name: 'Rabat', country: 'Maroc' },
  { name: 'Casablanca', country: 'Maroc' },
  { name: 'Marrakech', country: 'Maroc' },
  { name: 'Tunis', country: 'Tunisie' },
  { name: 'Sfax', country: 'Tunisie' },
  
  // Afrique de l'Ouest
  { name: 'Cotonou', country: 'Bénin' },
  { name: 'Ouagadougou', country: 'Burkina Faso' },
  { name: 'Abidjan', country: 'Côte d\'Ivoire' },
  { name: 'Yamoussoukro', country: 'Côte d\'Ivoire' },
  { name: 'Accra', country: 'Ghana' },
  { name: 'Kumasi', country: 'Ghana' },
  { name: 'Conakry', country: 'Guinée' },
  { name: 'Bamako', country: 'Mali' },
  { name: 'Nouakchott', country: 'Mauritanie' },
  { name: 'Niamey', country: 'Niger' },
  { name: 'Lagos', country: 'Nigeria' },
  { name: 'Abuja', country: 'Nigeria' },
  { name: 'Kano', country: 'Nigeria' },
  { name: 'Dakar', country: 'Sénégal' },
  { name: 'Touba', country: 'Sénégal' },
  { name: 'Lomé', country: 'Togo' },
  
  // Afrique Centrale
  { name: 'Yaoundé', country: 'Cameroun' },
  { name: 'Douala', country: 'Cameroun' },
  { name: 'Bangui', country: 'République centrafricaine' },
  { name: 'N\'Djamena', country: 'Tchad' },
  { name: 'Brazzaville', country: 'République du Congo' },
  { name: 'Kinshasa', country: 'République démocratique du Congo' },
  { name: 'Libreville', country: 'Gabon' },
  { name: 'Malabo', country: 'Guinée équatoriale' },
  { name: 'São Tomé', country: 'Sao Tomé-et-Principe' },
  
  // Afrique de l'Est
  { name: 'Djibouti', country: 'Djibouti' },
  { name: 'Asmara', country: 'Érythrée' },
  { name: 'Addis-Abeba', country: 'Éthiopie' },
  { name: 'Nairobi', country: 'Kenya' },
  { name: 'Mombasa', country: 'Kenya' },
  { name: 'Mogadiscio', country: 'Somalie' },
  { name: 'Jouba', country: 'Soudan du Sud' },
  { name: 'Khartoum', country: 'Soudan' },
  { name: 'Darfour', country: 'Soudan' },
  { name: 'Dodoma', country: 'Tanzanie' },
  { name: 'Dar es Salam', country: 'Tanzanie' },
  { name: 'Kampala', country: 'Ouganda' },
  
  // Afrique Australe
  { name: 'Luanda', country: 'Angola' },
  { name: 'Gaborone', country: 'Botswana' },
  { name: 'Maseru', country: 'Lesotho' },
  { name: 'Antananarivo', country: 'Madagascar' },
  { name: 'Lilongwe', country: 'Malawi' },
  { name: 'Port-Louis', country: 'Maurice' },
  { name: 'Maputo', country: 'Mozambique' },
  { name: 'Windhoek', country: 'Namibie' },
  { name: 'Saint-Denis', country: 'La Réunion' },
  { name: 'Kigali', country: 'Rwanda' },
  { name: 'Pretoria', country: 'Afrique du Sud' },
  { name: 'Le Cap', country: 'Afrique du Sud' },
  { name: 'Durban', country: 'Afrique du Sud' },
  { name: 'Johannesburg', country: 'Afrique du Sud' },
  { name: 'Mbabane', country: 'Eswatini' },
  { name: 'Lusaka', country: 'Zambie' },
  { name: 'Harare', country: 'Zimbabwe' }
];

// Fonction pour obtenir les villes uniques triées
export const getSortedCities = () => {
  return [...new Set(africanCities.map(city => city.name))].sort();
};
