import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Zap, Shield, Clock, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative">
        {/* Background — warm diagonal glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[30%] -left-[10%] w-[700px] h-[700px] rounded-full opacity-100" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)' }}></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full opacity-100" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.035) 0%, transparent 70%)' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="flex items-center gap-2 text-amber-400/80 text-[11px] font-semibold uppercase tracking-[0.15em] mb-8 animate-fade-in">
            <div className="w-6 h-px bg-amber-400/30"></div>
            PulseBoard
            <div className="w-6 h-px bg-amber-400/30"></div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-5 leading-[1.1] animate-fade-in max-w-3xl">
            <span className="text-white">Polls that update </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">as people vote</span>
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mb-10 max-w-md leading-relaxed animate-fade-in">
            Create a poll, share the link, and watch responses flow in live on your dashboard. Simple as that.
          </p>

          {/* CTA */}
          <div className="flex gap-3 animate-fade-in">
            <Link
              to={user ? '/create-poll' : '/auth'}
              className="px-7 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-sm transition-all shadow-[0_4px_24px_-6px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_32px_-6px_rgba(251,191,36,0.45)] flex items-center gap-2 group"
            >
              {user ? 'Create a Poll' : 'Get Started'}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {user && (
              <Link to="/dashboard" className="px-7 py-3 rounded-lg border border-white/[0.08] hover:bg-white/[0.03] text-gray-400 hover:text-white font-medium text-sm transition-all">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl w-full px-4 pb-10 stagger-children">
        <FeatureCard icon={<Zap />} title="Real-time WebSocket" desc="Responses appear on your analytics page the instant they're submitted." color="text-amber-400" border="border-amber-500/10 hover:border-amber-500/20" />
        <FeatureCard icon={<Shield />} title="Access Control" desc="Open it to everyone or require sign-in for verified, one-per-user responses." color="text-emerald-400" border="border-emerald-500/10 hover:border-emerald-500/20" />
        <FeatureCard icon={<BarChart3 />} title="Live Analytics" desc="Per-question breakdowns with vote counts, percentages, and leading indicators." color="text-sky-400" border="border-sky-500/10 hover:border-sky-500/20" />
        <FeatureCard icon={<Clock />} title="Auto Expiry" desc="Set a deadline and the poll stops accepting responses on its own." color="text-orange-400" border="border-orange-500/10 hover:border-orange-500/20" />
        <FeatureCard icon={<Eye />} title="Publish Results" desc="Share the final outcome publicly so anyone with the link can view it." color="text-violet-400" border="border-violet-500/10 hover:border-violet-500/20" />
        <FeatureCard icon={<CheckCircle2 />} title="Full Validation" desc="Mandatory and optional questions validated on both frontend and backend." color="text-rose-400" border="border-rose-500/10 hover:border-rose-500/20" />
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-10 border-t border-white/[0.03] mt-16">
        <p className="text-gray-800 text-[11px] tracking-[0.15em] uppercase">
          React · Express · MongoDB · Socket.io
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color, border }) => (
  <div className={`rounded-xl border ${border} bg-transparent p-5 transition-all duration-300 hover:-translate-y-0.5 group`}>
    <div className={`${color} mb-3 opacity-70 group-hover:opacity-100 transition-opacity`}>
      {icon}
    </div>
    <h3 className="text-[14px] font-semibold text-white mb-1 tracking-tight">{title}</h3>
    <p className="text-gray-600 text-[13px] leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
