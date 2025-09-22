'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ClientSideNavigationProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export default function ClientSideNavigation({ 
  isAuthenticated, 
  setIsAuthenticated 
}: ClientSideNavigationProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="relative z-50 flex justify-between items-center p-8">
      <div className="text-3xl font-black dark:text-white text-violet-900">
        Co<span className="text-violet-600 dark:text-violet-400">li</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setIsAuthenticated(!isAuthenticated)}
          className="bg-violet-600 dark:bg-violet-500/20 px-6 py-2 rounded-full text-white dark:text-violet-100 border border-violet-500/30 hover:bg-violet-700 dark:hover:bg-violet-500/30 transition-all duration-300"
        >
          {isAuthenticated ? 'Déconnexion' : 'Se connecter'}
        </button>
      </div>
    </nav>
  );
}
