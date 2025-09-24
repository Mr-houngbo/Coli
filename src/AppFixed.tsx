import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { AnnonceProvider } from './contexts/AnnonceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import Home from './pages/HomeFinal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashboardFixed';
import Publish from './pages/Publish';
import AnnonceDetail from './pages/AnnonceDetail';
import Profile from './pages/ProfileFixed';
import AnnoncesList from './pages/AnnoncesList';
import EmailConfirmation from './pages/EmailConfirmation';
import Settings from './pages/Settings';
import Conversations from './pages/Conversations';
import ChatPage from './pages/ChatPage';
import Notifications from './pages/Notifications';
import { ConversationProvider } from './contexts/ConversationContext';
import { ColiSpaceProvider } from './contexts/ColiSpaceContext';
import { TransactionProvider } from './contexts/TransactionContext';
import Voyageurs from './pages/Voyageurs';
import Expediteurs from './pages/Expediteurs';
import TestPage from './pages/TestPage';
import FlowColiPage from './pages/FlowColiPage';
import EscrowPage from './pages/EscrowPage';

import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { loading, error } = useAuth();

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
      <Routes>
        {/* Page d'accueil sans Header (navigation intégrée) */}
        <Route path="/" element={<Home />} />
        
        {/* Autres pages avec Header */}
        <Route path="/login" element={
          <>
            <Header />
            <Login />
          </>
        } />
        
        <Route path="/register" element={
          <>
            <Header />
            <Register />
          </>
        } />
        
        <Route path="/annonces" element={
          <>
            <Header />
            <AnnoncesList />
          </>
        } />
        
        <Route path="/annonces/:id" element={
          <>
            <Header />
            <AnnonceDetail />
          </>
        } />
        
        <Route path="/email-confirmation" element={
          <>
            <Header />
            <EmailConfirmation />
          </>
        } />
        
        <Route path="/voyageurs" element={
          <>
            <Header />
            <Voyageurs />
          </>
        } />
        
        <Route path="/expediteurs" element={
          <>
            <Header />
            <Expediteurs />
          </>
        } />
        
        <Route path="/test" element={
          <>
            <Header />
            <TestPage />
          </>
        } />
        
        {/* Routes Flow-Coli avec Header */}
        <Route path="/flow-coli" element={
          <ProtectedRoute>
            <>
              <Header />
              <FlowColiPage />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/escrow" element={
          <ProtectedRoute>
            <>
              <Header />
              <EscrowPage />
            </>
          </ProtectedRoute>
        } />

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
            <>
              <Header />
              <Publish />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <>
              <Header />
              <Settings />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/conversations" element={
          <ProtectedRoute>
            <>
              <Header />
              <Conversations />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/conversations/:id" element={
          <ProtectedRoute>
            <>
              <Header />
              <ChatPage />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <>
              <Header />
              <Notifications />
            </>
          </ProtectedRoute>
        } />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
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
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AnnonceProvider>
            <ConversationProvider>
              <ColiSpaceProvider>
                <TransactionProvider>
                  <AppContent />
                </TransactionProvider>
              </ColiSpaceProvider>
            </ConversationProvider>
          </AnnonceProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
