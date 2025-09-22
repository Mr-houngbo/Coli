import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  full_name: string;
  whatsapp_number: string;
  phone: string;
  role: 'expediteur' | 'gp' | 'admin';
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; name: string; phone: string }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Version simplifiée de fetchProfile pour déboguer
  const fetchProfile = async (userId: string) => {
    console.log(`[Auth] fetchProfile starting for user ${userId}`);
    
    try {
      // Timeout simple de 5 secondes
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('id, full_name, whatsapp_number, phone, role, created_at, updated_at')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('[Auth] Error fetching profile:', error);
        throw error;
      }

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
        phone: user?.user_metadata?.phone || '',
        whatsapp_number: user?.user_metadata?.phone || '',
        role: 'expediteur' as const,
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
      // Ne pas bloquer l'app si le profil échoue
      setProfile(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
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
    
    // Initialiser immédiatement
    initAuth();

    // Écouter les changements de session
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
        
        // S'assurer que loading est toujours false après les changements d'auth
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

  const register = async (data: { email: string; password: string; name: string; phone: string }): Promise<boolean> => {
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
            phone: data.phone,
            whatsapp_number: data.phone,
            role: 'expediteur'
          });
          
        if (profileError) {
          console.warn('[Auth] Profile creation error during register:', profileError);
          // Ne pas échouer l'inscription si le profil échoue
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