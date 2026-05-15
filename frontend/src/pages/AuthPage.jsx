import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="flex items-center justify-center min-h-[88vh] px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full accent-line"></div>

          {/* Ambient glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500 rounded-full blur-[100px] opacity-[0.07] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isLogin ? 'Sign in to manage your polls' : 'Start creating polls in seconds'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input
                      type="text"
                      required
                      className="input-field w-full pl-10 pr-4 py-3 rounded-xl"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input
                    type="email"
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="input-field w-full pl-10 pr-11 py-3 rounded-xl"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-[11px] text-gray-700 mt-1.5">Minimum 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-2 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="spinner !w-4 !h-4 !border-2 !border-white/20 !border-t-white"></div>
                  ) : (
                    isLogin ? 'Sign in' : 'Create account'
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-gray-600 text-sm">
                {isLogin ? "No account? " : "Already registered? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
