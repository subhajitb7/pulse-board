import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#06070a]/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
            <Activity size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gradient tracking-tight">
            PulseBoard
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-1 items-center">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${isActive('/dashboard') ? 'bg-white/[0.06] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Dashboard
              </Link>
              <Link
                to="/create-poll"
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${isActive('/create-poll') ? 'bg-white/[0.06] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Create
              </Link>
              <div className="w-px h-5 bg-white/[0.06] mx-3"></div>
              <span className="text-[13px] text-gray-600 mr-3">{user.name?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-[13px] text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all font-medium"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="btn-primary px-5 py-2 rounded-lg text-[13px]"
            >
              <span>Get Started</span>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-500 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.04] px-4 py-3 space-y-1 animate-fade-in bg-[#06070a]/95 backdrop-blur-xl">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/[0.04] hover:text-white text-sm transition-all">Dashboard</Link>
              <Link to="/create-poll" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/[0.04] hover:text-white text-sm transition-all">Create Poll</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg text-red-400/80 hover:bg-red-500/[0.06] text-sm transition-all">Log out</button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg btn-primary text-center text-sm"><span>Get Started</span></Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
