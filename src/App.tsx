import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { AnnonceProvider } from './contexts/AnnonceContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Publish from './pages/Publish';
import AnnonceDetail from './pages/AnnonceDetail';
import Profile from './pages/Profile';
import AnnoncesList from './pages/AnnoncesList';
import EmailConfirmation from './pages/EmailConfirmation';

import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { loading, error, isProfileStub } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-800">
          <div className="text-3xl mb-3">🚨</div>
          <h1 className="text-xl font-semibold mb-2">Serveur indisponible</h1>
          <p className="text-gray-600">Réessaie plus tard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      {isProfileStub && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <p>
              Vous utilisez un profil temporaire. Veuillez compléter votre profil pour une meilleure expérience.
            </p>
            <a href="/profile" className="text-yellow-900 underline hover:no-underline">
              Compléter mon profil
            </a>
          </div>
        </div>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/annonces" element={<AnnoncesList />} />
          <Route path="/annonces/:id" element={<AnnonceDetail />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/mes-annonces" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/publish" element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

function App() {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <AnnonceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppContent />
          </div>
        </Router>
      </AnnonceProvider>
    </AuthProvider>
  );
}

export default App;
