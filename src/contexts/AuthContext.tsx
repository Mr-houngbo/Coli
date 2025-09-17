import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, RegisterData } from '../types';
import { toast } from 'react-toastify';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler la récupération du token au démarrage
    const token = localStorage.getItem('gp-connect-token');
    const userData = localStorage.getItem('gp-connect-user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('gp-connect-token');
        localStorage.removeItem('gp-connect-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulation d'une API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        phone: '+33123456789',
        whatsapp: '+33123456789'
      };

      localStorage.setItem('gp-connect-token', 'mock-jwt-token');
      localStorage.setItem('gp-connect-user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast.success('Connexion réussie !');
      return true;
    } catch (error) {
      toast.error('Erreur de connexion');
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Simulation d'une API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        whatsapp: userData.phone
      };

      localStorage.setItem('gp-connect-token', 'mock-jwt-token');
      localStorage.setItem('gp-connect-user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast.success('Compte créé avec succès !');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('gp-connect-token');
    localStorage.removeItem('gp-connect-user');
    setUser(null);
    toast.info('Déconnecté');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};