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
  transport?: 'avion' | 'voiture' | 'bus' | 'train';
  description?: string;
  status?: 'active' | 'prise' | 'terminee';
  statut?: 'en_attente' | 'validee' | 'terminee' | 'annulee';
  created_at: string;
  updated_at: string;
  user?: Profile; // Jointure avec la table profiles
}

export interface Conversation {
  id: string;
  annonce_id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  participant_count?: number;
  participants?: Array<{
    user_id: string;
    profile?: {
      id: string;
      full_name: string;
      phone: string;
      whatsapp_number: string;
      role: 'expediteur' | 'gp' | 'admin';
    };
  }>;
  annonce?: {
    id: string;
    ville_depart: string;
    ville_arrivee: string;
    date_voyage?: string;
    user_id?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
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