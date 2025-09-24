import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Profile, AuthContextType, RegisterData, IdentityVerification } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour gérer les retries avec backoff exponentiel
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = initialDelay * Math.pow(2, attempt - 1);
          console.log(`[Auth] Retry attempt ${attempt + 1} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await fn();
      } catch (error) {
        console.warn(`[Auth] Attempt ${attempt + 1} failed:`, error);
        lastError = error as Error;
        
        if (
          error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('NetworkError'))
        ) {
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError || new Error('Max retries reached');
  };

  // Version améliorée de fetchProfile avec retry et backoff
  const fetchProfile = async (userId: string) => {
    console.log(`[Auth] fetchProfile starting for user ${userId}`);
    
    try {
      const attemptFetch = async () => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        );
        
        const fetchPromise = supabase
          .from('profiles')
          .select(`
            id, full_name, email, phone, whatsapp_number, role, created_at, updated_at,
            is_verified, verification_status, trust_score, total_transactions,
            successful_transactions, average_rating, identity_verified,
            whatsapp_verified, email_verified
          `)
          .eq('id', userId)
          .single();
        
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        return { data };
      };
      
      const { data } = await retryWithBackoff(attemptFetch, 3, 1000);

      if (data) {
        console.log(`[Auth] Profile loaded successfully:`, data);
        setProfile(data as Profile);
        return data;
      }

      // Si pas de profil trouvé, créer un profil minimal
      console.log(`[Auth] No profile found, creating minimal profile...`);
      
      const profileData = {
        id: userId,
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Utilisateur',
        email: user?.email || '',
        phone: user?.user_metadata?.phone || '',
        whatsapp_number: user?.user_metadata?.phone || '',
        role: 'expediteur' as const,
        is_verified: false,
        verification_status: 'pending' as const,
        trust_score: 0,
        total_transactions: 0,
        successful_transactions: 0,
        average_rating: 0.0,
        identity_verified: false,
        whatsapp_verified: false,
        email_verified: false
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });
      
      if (upsertError) {
        console.error('[Auth] Error creating profile:', upsertError);
        throw upsertError;
      }

      console.log('[Auth] Profile created successfully');
      setProfile(profileData as Profile);
      return profileData;
      
    } catch (error) {
      console.error('[Auth] fetchProfile error:', error);
      setProfile(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  // Nouvelles méthodes pour la vérification d'identité
  const submitIdentityVerification = async (data: Omit<IdentityVerification, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('identity_verifications')
        .insert({
          user_id: user.id,
          ...data
        });

      if (error) throw error;

      console.log('[Auth] Identity verification submitted successfully');
      return true;
    } catch (error: any) {
      console.error('[Auth] Identity verification error:', error);
      setError(error.message);
      return false;
    }
  };

  const checkVerificationStatus = async (): Promise<IdentityVerification | null> => {
    try {
      if (!user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as IdentityVerification || null;
    } catch (error: any) {
      console.error('[Auth] Check verification status error:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('[Auth] AuthProvider useEffect triggered');
    
    const initAuth = async () => {
      try {
        console.log('[Auth] Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session error:', error);
          setError("Impossible de se connecter au serveur");
          return;
        }

        console.log('[Auth] Initial session:', session?.user ? 'User found' : 'No user');
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log('[Auth] Fetching profile for user:', session.user.id);
          await fetchProfile(session.user.id);
        }
        
      } catch (error) {
        console.error("[Auth] Init error:", error);
        setError("Impossible de se connecter au serveur");
      } finally {
        console.log('[Auth] Setting loading to false');
        setLoading(false);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state change:', event, session?.user ? 'User found' : 'No user');
        
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log('[Auth] Fetching profile for user from auth change:', session.user.id);
          await fetchProfile(session.user.id);
          setError(null);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('[Auth] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Forcer loading à false après 10 secondes maximum (fallback de sécurité)
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Forcing loading to false after 10s timeout');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(fallbackTimer);
  }, [loading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[Auth] Login attempt for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('[Auth] Login successful');
      return true;
    } catch (error: any) {
      console.error('[Auth] Login error:', error.message);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[Auth] Register attempt for:', data.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: data.name,
            email: data.email,
            phone: data.phone,
            whatsapp_number: data.phone,
            role: data.role,
            is_verified: false,
            verification_status: 'pending',
            trust_score: 0,
            total_transactions: 0,
            successful_transactions: 0,
            average_rating: 0.0,
            identity_verified: false,
            whatsapp_verified: false,
            email_verified: false
          });
          
        if (profileError) {
          console.warn('[Auth] Profile creation error during register:', profileError);
        }
      }

      console.log('[Auth] Registration successful');
      return true;
    } catch (error: any) {
      console.error('[Auth] Register error:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      console.log('[Auth] Google login attempt');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('[Auth] Google login error:', error);
      setError(error.message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('[Auth] Logout attempt');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  };

  // Debug logs
  useEffect(() => {
    console.log('[Auth] State update - Loading:', loading, 'User:', !!user, 'Profile:', !!profile, 'Error:', error);
  }, [loading, user, profile, error]);

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    refreshProfile,
    submitIdentityVerification,
    checkVerificationStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
