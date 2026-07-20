import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Donate from './pages/Donate';

import NgoDashboard from './pages/NgoDashboard';
import NgoImpact from './pages/ImpactPage';
// import DonationDetails from './pages/DonationDetails';
import DocsPage from './pages/DocsPage'; // kept for direct URL access, not in nav
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import DonorPortal from './pages/DonorPortal';
import ImpactPage from './pages/ImpactPage';
import Profile from './pages/Profile';
import DonationSuccess from './pages/DonationSuccess';
import Leaderboard from './pages/Leaderboard';
import Certificate from './pages/Certificate';
import AiExplanation from './pages/AiExplanation';
import About from './pages/About';
import ChatBot from './components/ChatBot';

// Route guards
import AdminRoute from './components/AdminRoute';

// Generic auth guard — redirects unauthenticated users to /login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Smart dashboard redirect by role
const SmartDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'charity') return <Navigate to="/ngo-dashboard" replace />;
  return <Dashboard />;
};

const Spinner = () => (
  <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950">
    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
  </div>
);

const DonorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'donor') return <Navigate to="/dashboard" replace />;
  return children;
};

const CharityRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'charity') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppContent() {
  const location = useLocation();

  const isLightTheme = [
    '/', '/login', '/register', '/analytics', '/dashboard', '/ai-explanation', '/about',
    '/donate', '/donor-portal', '/impact', '/my-donations', '/find-food', '/ngo-dashboard', '/ngo-impact',
    '/admin/login', '/admin/dashboard', '/profile', '/donation-success', '/leaderboard', '/certificate'
  ].includes(location.pathname) || location.pathname.startsWith('/donation/');

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isLightTheme ? 'bg-[#F8FAFC] text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ai-explanation" element={<AiExplanation />} />
          <Route path="/about" element={<About />} />
          {/* /docs accessible at direct URL, removed from user navigation */}
          <Route path="/docs" element={<DocsPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <SmartDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <PrivateRoute>
                <DonorRoute>
                  <Donate />
                </DonorRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/ngo-dashboard"
            element={
              <PrivateRoute>
                <CharityRoute>
                  <NgoDashboard />
                </CharityRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/ngo-impact"
            element={
              <PrivateRoute>
                <CharityRoute>
                  <NgoImpact />
                </CharityRoute>
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/donation/:id"
            element={
              <PrivateRoute>
                <DonationDetails />
              </PrivateRoute>
            }
          /> */}
          <Route
            path="/donor-portal"
            element={
              <PrivateRoute>
                <DonorRoute>
                  <DonorPortal />
                </DonorRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/impact"
            element={
              <PrivateRoute>
                <ImpactPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/donation-success"
            element={
              <PrivateRoute>
                <DonorRoute>
                  <DonationSuccess />
                </DonorRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/certificate"
            element={
              <PrivateRoute>
                <DonorRoute>
                  <Certificate />
                </DonorRoute>
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
