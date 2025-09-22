export interface Profile {
  id: string;
  full_name: string;
  email?: string; // Made optional with ?
  phone: string;
  whatsapp_number: string;
  role: 'expediteur' | 'gp' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Annonce {
  id: string;
  user_id: string;
  type: 'GP' | 'Expediteur';
  ville_depart: string;
  ville_arrivee: string;
  date_annonce: string;
  date_limite?: string;
  poids: number;
  prix_kg?: number;
  moyen_transport?: 'avion' | 'voiture' | 'bus' | 'train';
  description?: string;
  statut?: 'en_attente' | 'validee' | 'terminee' | 'annulee';
  created_at: string;
  updated_at: string;
  user?: Profile; // Jointure avec la table profiles
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
  app_metadata?: {
    provider?: string;
  };
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}