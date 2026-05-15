import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CreatePoll from './pages/CreatePoll';
import PollAnalytics from './pages/PollAnalytics';
import PollView from './pages/PollView';
import PollResults from './pages/PollResults';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen text-gray-200 font-sans">
            <Navbar />
            <div className="pt-20 px-4 max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create-poll" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
                <Route path="/poll/:id/analytics" element={<ProtectedRoute><PollAnalytics /></ProtectedRoute>} />
                <Route path="/poll/:id" element={<PollView />} />
                <Route path="/poll/:id/results" element={<PollResults />} />
              </Routes>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
