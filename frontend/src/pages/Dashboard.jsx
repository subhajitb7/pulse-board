import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import {
  Plus, BarChart2, Calendar, Link as LinkIcon, Users, Check, Eye,
  Clock, Shield, Globe, TrendingUp, HelpCircle, Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, expired

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data } = await api.get('/polls/my-polls');
      setPolls(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/poll/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Stats
  const totalPolls = polls.length;
  const activePolls = polls.filter(p => !p.expiresAt || new Date() <= new Date(p.expiresAt)).length;
  const totalResponses = polls.reduce((sum, p) => sum + (p.responseCount || 0), 0);

  // Filtered polls
  const filteredPolls = polls.filter(poll => {
    const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">Here's an overview of your polls</p>
        </div>
        <Link
          to="/create-poll"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        >
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New Poll
          </span>
        </Link>
      </div>

      {/* Stats row */}
      {totalPolls > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={<BarChart2 size={16} />} color="text-cyan-400 bg-cyan-500/[0.08]" label="Total Polls" value={totalPolls} />
          <StatCard icon={<Zap size={16} />} color="text-emerald-400 bg-emerald-500/[0.08]" label="Active" value={activePolls} />
          <StatCard icon={<Users size={16} />} color="text-violet-400 bg-violet-500/[0.08]" label="Responses" value={totalResponses} />
          <StatCard icon={<TrendingUp size={16} />} color="text-amber-400 bg-amber-500/[0.08]" label="Avg / Poll" value={totalPolls > 0 ? Math.round(totalResponses / totalPolls) : 0} />
        </div>
      )}

      {polls.length === 0 ? (
        /* Empty state */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="accent-line"></div>
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-5 border border-white/[0.04]">
              <BarChart2 className="text-gray-600 w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5 tracking-tight">No polls yet</h3>
            <p className="text-gray-600 mb-8 max-w-sm text-sm leading-relaxed">
              Create your first poll to start collecting real-time feedback from your audience.
            </p>
            <Link to="/create-poll" className="btn-primary px-6 py-2.5 rounded-xl text-sm">
              <span className="flex items-center gap-2"><Plus size={15} /> Create your first poll</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-5 p-1 bg-white/[0.02] rounded-xl w-fit border border-white/[0.04]">
            {['all', 'active', 'expired'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-white/[0.07] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {f}
                {f === 'all' && ` (${polls.length})`}
                {f === 'active' && ` (${activePolls})`}
                {f === 'expired' && ` (${polls.length - activePolls})`}
              </button>
            ))}
          </div>

          {/* Poll grid */}
          {filteredPolls.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <p className="text-gray-600 text-sm">No {filter} polls found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {filteredPolls.map(poll => {
                const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
                const responses = poll.responseCount || 0;

                return (
                  <div key={poll._id} className="glass-panel rounded-2xl flex flex-col group overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
                    {/* Status bar */}
                    <div className={`h-[2px] w-full ${isExpired ? 'bg-gradient-to-r from-red-500/40 to-transparent' : 'bg-gradient-to-r from-cyan-500/40 to-transparent'}`}></div>

                    <div className="p-5 flex flex-col flex-grow">
                      {/* Title & status */}
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-[15px] font-semibold text-white leading-snug break-words pr-3 tracking-tight group-hover:text-cyan-100 transition-colors">{poll.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${isExpired ? 'pill-expired' : 'pill-active'}`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-[13px] mb-4 line-clamp-2 flex-grow leading-relaxed">
                        {poll.description || "No description provided"}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {responses} response{responses !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle size={11} />
                          {poll.questions?.length || 0} Q
                        </span>
                        <span className="flex items-center gap-1">
                          {poll.isAnonymous ? <Globe size={11} /> : <Shield size={11} />}
                          {poll.isAnonymous ? 'Open' : 'Auth'}
                        </span>
                        {poll.expiresAt && !isExpired && (
                          <span className="flex items-center gap-1 text-amber-500/70">
                            <Clock size={11} />
                            {formatTimeLeft(poll.expiresAt)}
                          </span>
                        )}
                      </div>

                      {/* Response bar (mini visual) */}
                      {responses > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] text-gray-700 mb-1 uppercase tracking-widest font-medium">
                            <span>Responses</span>
                            <span>{responses}</span>
                          </div>
                          <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500/60 to-violet-500/60 transition-all duration-500"
                              style={{ width: `${Math.min(responses * 5, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-3 border-t border-white/[0.04]">
                        <Link
                          to={`/poll/${poll._id}/analytics`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.03] hover:bg-cyan-500/[0.08] hover:text-cyan-400 text-gray-500 transition-all text-[12px] font-medium"
                        >
                          <BarChart2 size={13} />
                          Analytics
                        </Link>
                        <Link
                          to={`/poll/${poll._id}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors"
                          title="Preview poll"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => copyToClipboard(poll._id)}
                          className={`p-2 rounded-lg transition-all ${copied === poll._id ? 'bg-emerald-500/[0.08] text-emerald-400' : 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 hover:text-white'}`}
                          title="Copy share link"
                        >
                          {copied === poll._id ? <Check size={13} /> : <LinkIcon size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* Stat card component */
const StatCard = ({ icon, color, label, value }) => (
  <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest">{label}</p>
      <p className="text-lg font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

/* Helper: format time remaining */
function formatTimeLeft(expiresAt) {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diff = exp - now;
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default Dashboard;
