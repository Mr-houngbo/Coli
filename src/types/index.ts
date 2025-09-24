// ===== PROFILS & UTILISATEURS =====
export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  whatsapp_number: string;
  role: 'expediteur' | 'gp' | 'receveur' | 'admin';
  created_at: string;
  updated_at: string;
  // Nouveaux champs pour la sécurité
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  trust_score: number; // Score de confiance (0-100)
  total_transactions: number;
  successful_transactions: number;
  average_rating: number;
  identity_verified: boolean;
  whatsapp_verified: boolean;
  email_verified: boolean;
}

// ===== VÉRIFICATION D'IDENTITÉ =====
export interface IdentityVerification {
  id: string;
  user_id: string;
  document_type: 'cni' | 'passeport' | 'permis';
  document_number: string;
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

// ===== ANNONCES AMÉLIORÉES =====
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
  prix_total?: number;
  transport?: 'avion' | 'voiture' | 'bus' | 'train';
  description?: string;
  // Nouveaux statuts pour le Flow-Coli
  status: 'active' | 'secured' | 'paid' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  // Photos obligatoires du colis
  package_photos: string[]; // URLs des photos
  package_type: 'document' | 'vetement' | 'electronique' | 'alimentaire' | 'autre';
  fragile: boolean;
  urgent: boolean;
  insurance_requested: boolean;
  insurance_value?: number;
  // Receveur
  receiver_id?: string;
  receiver_name?: string;
  receiver_phone?: string;
  receiver_address?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  receiver?: Profile;
}

// ===== FLOW-COLI : SUIVI DES COLIS =====
export interface PackageTracking {
  id: string;
  annonce_id: string;
  expediteur_id: string;
  gp_id: string;
  receveur_id: string;
  // Étapes du Flow-Coli (8 étapes)
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  step_name: 'created' | 'secured' | 'space_created' | 'paid' | 'picked_up' | 'in_transit' | 'delivered' | 'completed';
  step_description: string;
  completed_at?: string;
  // Validations
  expediteur_validated: boolean;
  gp_validated: boolean;
  receveur_validated: boolean;
  // Photos de validation
  pickup_photos?: string[];
  delivery_photos?: string[];
  created_at: string;
  updated_at: string;
}

// ===== ESPACE COLI PRIVÉ =====
export interface ColiSpace {
  id: string;
  annonce_id: string;
  expediteur_id: string;
  gp_id: string;
  receveur_id: string;
  status: 'active' | 'completed' | 'disputed' | 'cancelled';
  // Chat intégré
  chat_enabled: boolean;
  // Documents partagés
  shared_documents: string[];
  created_at: string;
  updated_at: string;
  // Relations
  annonce?: Annonce;
  expediteur?: Profile;
  gp?: Profile;
  receveur?: Profile;
  tracking?: PackageTracking;
  transaction?: Transaction;
}

// ===== SYSTÈME DE PAIEMENT ESCROW =====
export interface Transaction {
  id: string;
  annonce_id: string;
  coli_space_id: string;
  expediteur_id: string;
  gp_id: string;
  // Montants
  amount: number; // Montant total
  commission_rate: number; // Taux de commission (10%)
  commission_amount: number; // Montant de la commission
  gp_amount: number; // Montant pour le GP
  insurance_amount?: number; // Montant de l'assurance
  // Statuts de paiement
  payment_status: 'pending' | 'paid' | 'escrowed' | 'released' | 'refunded' | 'disputed';
  payment_method: 'mobile_money' | 'card' | 'paypal';
  payment_provider: 'orange_money' | 'wave' | 'stripe' | 'paypal';
  // Références de paiement
  payment_reference: string;
  escrow_reference?: string;
  release_reference?: string;
  // Dates importantes
  paid_at?: string;
  escrowed_at?: string;
  released_at?: string;
  // Facture
  invoice_url?: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
}

// ===== CONVERSATIONS AMÉLIORÉES =====
export interface Conversation {
  id: string;
  coli_space_id?: string; // Lien vers l'espace Coli
  annonce_id: string;
  // Support pour 3 participants
  expediteur_id: string;
  gp_id: string;
  receveur_id?: string;
  conversation_type: 'public' | 'private_space'; // Public ou espace privé
  created_at: string;
  updated_at?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  participant_count?: number;
  participants?: Array<{
    user_id: string;
    role: 'expediteur' | 'gp' | 'receveur';
    profile?: Profile;
  }>;
  annonce?: Annonce;
  coli_space?: ColiSpace;
}

// ===== MESSAGES AMÉLIORÉS =====
export interface Message {
  id: string;
  conversation_id: string;
  coli_space_id?: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'system';
  attachment_url?: string;
  attachment_type?: string;
  is_system_message: boolean;
  read_by: string[]; // IDs des utilisateurs qui ont lu
  created_at: string;
  updated_at: string;
}

// ===== SYSTÈME DE NOTATION =====
export interface Rating {
  id: string;
  transaction_id: string;
  coli_space_id: string;
  rater_id: string; // Celui qui note
  rated_id: string; // Celui qui est noté
  rating: number; // Note de 1 à 5
  comment?: string;
  rating_type: 'expediteur_to_gp' | 'gp_to_expediteur' | 'receveur_to_gp' | 'gp_to_receveur' | 'expediteur_to_receveur';
  // Critères spécifiques
  punctuality?: number; // Ponctualité
  communication?: number; // Communication
  package_condition?: number; // État du colis
  professionalism?: number; // Professionnalisme
  created_at: string;
  updated_at: string;
  // Relations
  rater?: Profile;
  rated?: Profile;
  transaction?: Transaction;
}

// ===== GESTION DES LITIGES =====
export interface Dispute {
  id: string;
  transaction_id: string;
  coli_space_id: string;
  complainant_id: string; // Celui qui ouvre le litige
  respondent_id: string; // Celui contre qui le litige est ouvert
  dispute_type: 'package_damaged' | 'package_lost' | 'payment_issue' | 'communication_issue' | 'other';
  title: string;
  description: string;
  evidence_urls: string[]; // Photos/documents de preuve
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  resolution?: string;
  resolved_by?: string; // Admin qui a résolu
  resolved_at?: string;
  // Montants en jeu
  disputed_amount?: number;
  refund_amount?: number;
  compensation_amount?: number;
  created_at: string;
  updated_at: string;
  // Relations
  complainant?: Profile;
  respondent?: Profile;
  transaction?: Transaction;
  coli_space?: ColiSpace;
}

// ===== NOTIFICATIONS =====
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'transaction' | 'message' | 'rating' | 'dispute' | 'verification' | 'system';
  related_id?: string; // ID de l'objet lié (transaction, message, etc.)
  related_type?: 'transaction' | 'message' | 'coli_space' | 'dispute';
  is_read: boolean;
  action_url?: string; // URL vers laquelle rediriger
  created_at: string;
  read_at?: string;
}

// ===== UTILISATEURS & AUTHENTIFICATION =====
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

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'expediteur' | 'gp' | 'receveur';
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  // Nouvelles méthodes pour la vérification
  submitIdentityVerification: (data: Omit<IdentityVerification, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  checkVerificationStatus: () => Promise<IdentityVerification | null>;
}

// ===== CONTEXTES POUR LES NOUVEAUX SYSTÈMES =====
export interface ColiSpaceContextType {
  coliSpaces: ColiSpace[];
  currentColiSpace: ColiSpace | null;
  loading: boolean;
  error: string | null;
  createColiSpace: (annonceId: string, expediteurId: string, gpId: string, receveurId: string) => Promise<ColiSpace | null>;
  getColiSpace: (id: string) => Promise<ColiSpace | null>;
  updateColiSpaceStatus: (id: string, status: ColiSpace['status']) => Promise<boolean>;
  getUserColiSpaces: (userId: string) => Promise<ColiSpace[]>;
}

export interface TransactionContextType {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  createTransaction: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<Transaction | null>;
  processPayment: (transactionId: string, paymentData: any) => Promise<boolean>;
  releaseEscrow: (transactionId: string) => Promise<boolean>;
  refundTransaction: (transactionId: string, reason: string) => Promise<boolean>;
  getUserTransactions: (userId: string) => Promise<Transaction[]>;
}

export interface RatingContextType {
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  submitRating: (data: Omit<Rating, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  getUserRatings: (userId: string) => Promise<Rating[]>;
  getAverageRating: (userId: string) => Promise<number>;
}

export interface DisputeContextType {
  disputes: Dispute[];
  currentDispute: Dispute | null;
  loading: boolean;
  error: string | null;
  createDispute: (data: Omit<Dispute, 'id' | 'created_at' | 'updated_at'>) => Promise<Dispute | null>;
  updateDisputeStatus: (id: string, status: Dispute['status'], resolution?: string) => Promise<boolean>;
  getUserDisputes: (userId: string) => Promise<Dispute[]>;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  getUserNotifications: (userId: string) => Promise<Notification[]>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: (userId: string) => Promise<boolean>;
  createNotification: (data: Omit<Notification, 'id' | 'created_at'>) => Promise<boolean>;
}

// ===== TYPES UTILITAIRES =====
export interface FlowColiStep {
  step: number;
  name: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  required_validations: ('expediteur' | 'gp' | 'receveur')[];
  current_validations: ('expediteur' | 'gp' | 'receveur')[];
}

export interface PaymentMethod {
  type: 'mobile_money' | 'card' | 'paypal';
  provider: string;
  account_info: string;
  is_verified: boolean;
}

export interface TrustBadge {
  type: 'identity_verified' | 'phone_verified' | 'email_verified' | 'top_rated' | 'frequent_traveler';
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ===== TYPES POUR LES STATISTIQUES =====
export interface UserStats {
  user_id: string;
  total_transactions: number;
  successful_transactions: number;
  success_rate: number;
  average_rating: number;
  total_ratings: number;
  trust_score: number;
  badges: TrustBadge[];
  joined_date: string;
  last_activity: string;
}