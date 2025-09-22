import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { AnnonceProvider } from './contexts/AnnonceContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Publish from './pages/Publish';
import AnnonceDetail from './pages/AnnonceDetail';
import Profile from './pages/Profile';
import AnnoncesList from './pages/AnnoncesList';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <AnnonceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/annonces" element={<AnnoncesList />} />
                <Route path="/annonces/:id" element={<AnnonceDetail />} />
                
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
          </div>
        </Router>
      </AnnonceProvider>
    </AuthProvider>
  );
}

export default App;
