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
  isProfileStub: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileStub, setIsProfileStub] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const withTimeout = async <T,>(fn: () => PromiseLike<T>, ms = 5000, label = 'op') => {
      let timer: any;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout:${label}:${ms}ms`)), ms);
      });
      try {
        const op = Promise.resolve(fn());
        const result = await Promise.race([op, timeout]);
        return result as T;
      } finally {
        clearTimeout(timer);
      }
    };

    try {
      // Try to load existing profile
      console.log('[Auth] fetchProfile select start for', userId);
      const respSelect: any = await withTimeout(
        () => (supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single() as any),
        5000,
        'profiles.select'
      );
      const data = respSelect?.data;
      const error = respSelect?.error;
      console.log('[Auth] fetchProfile select done for', userId, 'error:', !!error);

      if (!error && data) {
        setProfile(data as any);
        setIsProfileStub(false);
        return data;
      }

      // If profile is missing, attempt to auto-create a minimal one
      const fullName = (typeof (user as any)?.user_metadata?.full_name === 'string' && (user as any)?.user_metadata?.full_name)
        || (user as any)?.user_metadata?.name
        || (user as any)?.email?.split('@')[0]
        || 'Utilisateur';

      const phoneMeta = (user as any)?.user_metadata?.phone || (user as any)?.user_metadata?.whatsapp || '';

      const upsertPayload: any = {
        id: userId,
        full_name: fullName,
        phone: phoneMeta,
        whatsapp_number: phoneMeta,
        role: 'expediteur',
      };

      console.log('[Auth] fetchProfile upsert start');
      await withTimeout(
        () => (supabase.from('profiles').upsert([upsertPayload], { onConflict: 'id' }) as any),
        5000,
        'profiles.upsert'
      );
      console.log('[Auth] fetchProfile upsert done');

      // Re-fetch after upsert
      console.log('[Auth] fetchProfile reselect start');
      const respSelect2: any = await withTimeout(
        () => (supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single() as any),
        5000,
        'profiles.reselect'
      );
      const data2 = respSelect2?.data;
      console.log('[Auth] fetchProfile reselect done, has data:', !!data2);

      if (data2) {
        setProfile(data2 as any);
        setIsProfileStub(false);
        return data2;
      }

      // Fallback: set a stub to avoid UI blocking
      const stub: any = {
        id: userId,
        full_name: fullName,
        phone: phoneMeta,
        whatsapp_number: phoneMeta,
        role: 'expediteur',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(stub);
      setIsProfileStub(true);
      return stub;
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      // As a last resort, keep UI usable with a stub profile
      const stub: any = {
        id: userId,
        full_name: (user as any)?.user_metadata?.full_name || (user as any)?.email?.split('@')[0] || 'Utilisateur',
        phone: '',
        whatsapp_number: '',
        role: 'expediteur',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(stub);
      setIsProfileStub(true);
      return stub;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Récupérer la session au premier rendu
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Auth] getSession user:', session?.user || null);
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log('[Auth] fetching profile for user id from getSession:', session.user.id);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        setError("Impossible de se connecter au serveur");
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
        console.log('[Auth] loading set to false after getSession');
      }
    };
    
    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[Auth] onAuthStateChange event:', _event, 'user:', session?.user || null);
        try {
          setUser(session?.user ?? null);
          if (session?.user?.id) {
            console.log('[Auth] fetching profile for user id from onAuthStateChange:', session.user.id);
            await fetchProfile(session.user.id);
            setError(null);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Erreur dans onAuthStateChange:', err);
          setError('Impossible de se connecter au serveur');
        } finally {
          setLoading(false);
          console.log('[Auth] loading set to false after onAuthStateChange');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Debug logs to observe state transitions
  useEffect(() => {
    console.log('[Auth] loading state:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('[Auth] user state:', user);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authentifier avec Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Le profile sera automatiquement chargé via l'écouteur d'état d'authentification
      return true;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
      return false;
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone: string }): Promise<boolean> => {
    try {
      // 1. Créer le compte d'authentification
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

      // Créer le profil utilisateur après l'inscription
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: data.name,
            phone: data.phone,
            whatsapp_number: data.phone,
            role: 'expediteur' // Rôle par défaut
          });
          
        if (profileError) throw profileError;
      }

      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la connexion avec Google:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

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
    isProfileStub,
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