import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { BarChart3, Users, Globe, Clock, Check, Copy, TrendingUp } from 'lucide-react';

const PollAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const [poll, setPoll] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchAnalytics(); }, [id]);

  useEffect(() => {
    if (socket && poll) {
      socket.emit('join-poll', id);
      socket.on('new-response', (newAnalytics) => setAnalytics(newAnalytics));
      return () => socket.off('new-response');
    }
  }, [socket, poll, id]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/polls/${id}/analytics`);
      setPoll(data.poll);
      setAnalytics(data.analytics);
    } catch (error) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async () => {
    if (window.confirm('Publish results publicly?')) {
      try {
        await api.patch(`/polls/${id}/publish`);
        setPoll({ ...poll, isPublished: true });
      } catch (error) {
        alert(error.response?.data?.message || 'Error publishing');
      }
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/poll/${poll._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner"></div></div>;

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  return (
    <div className="max-w-5xl mx-auto py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{poll.title}</h1>
            {poll.isPublished && <span className="pill-published px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">Published</span>}
            {isExpired && <span className="pill-expired px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Expired</span>}
          </div>
          <p className="text-gray-600 text-xs tracking-wider uppercase">Live analytics · WebSocket</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLink} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all border ${copied ? 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15' : 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 hover:text-white border-white/[0.05]'}`}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button onClick={() => window.open(`/poll/${poll._id}`, '_blank')} className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 hover:text-white border border-white/[0.05] flex items-center gap-1.5 text-[12px] font-medium transition-all">
            <Globe size={13} /> Preview
          </button>
          {!poll.isPublished && (
            <button onClick={publishResults} className="btn-primary px-4 py-1.5 rounded-lg text-[12px]">
              <span>Publish</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <StatCard icon={<Users size={18} />} color="bg-cyan-500/[0.08] text-cyan-400" label="Responses" value={analytics.totalResponses} />
        <StatCard icon={<BarChart3 size={18} />} color="bg-violet-500/[0.08] text-violet-400" label="Questions" value={poll.questions.length} />
        <StatCard icon={<TrendingUp size={18} />} color="bg-emerald-500/[0.08] text-emerald-400" label="Status" value={isExpired ? 'Closed' : 'Live'} />
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {poll.questions.map((q, index) => {
          const totalAnswersForQ = q.options.reduce((sum, opt) => sum + (analytics.optionCounts[q._id]?.[opt] || 0), 0);
          let maxCount = 0;
          q.options.forEach(opt => { const c = analytics.optionCounts[q._id]?.[opt] || 0; if (c > maxCount) maxCount = c; });

          return (
            <div key={q._id} className="glass-panel p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-5">
                <h3 className="text-[15px] font-semibold text-white tracking-tight">
                  <span className="text-cyan-400 mr-1.5 font-bold">Q{index + 1}.</span>{q.text}
                </h3>
                <span className="text-[10px] text-gray-700 flex-shrink-0 ml-3 uppercase tracking-wider font-medium">{totalAnswersForQ} answer{totalAnswersForQ !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                {q.options.map(opt => {
                  const count = analytics.optionCounts[q._id]?.[opt] || 0;
                  const percentage = totalAnswersForQ === 0 ? 0 : Math.round((count / totalAnswersForQ) * 100);
                  const isLeading = count > 0 && count === maxCount;

                  return (
                    <div key={opt}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[13px] ${isLeading ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {opt}
                          {isLeading && totalAnswersForQ > 0 && <span className="ml-2 text-[9px] text-cyan-400 font-semibold uppercase tracking-widest">Leading</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-bold ${isLeading ? 'text-cyan-300' : 'text-gray-600'}`}>{percentage}%</span>
                          <span className="text-gray-700 text-[11px] w-8 text-right">({count})</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 animate-bar ${isLeading ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-white/[0.06]'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }) => (
  <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

export default PollAnalytics;
