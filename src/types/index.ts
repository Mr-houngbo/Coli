export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface Annonce {
  id: string;
  userId: string;
  type: 'GP' | 'EXPEDITEUR';
  villeDepart: string;
  villeArrivee: string;
  date: string;
  poids: number;
  prix?: number;
  moyenTransport?: 'voiture' | 'bus' | 'avion';
  description?: string;
  user: User;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}