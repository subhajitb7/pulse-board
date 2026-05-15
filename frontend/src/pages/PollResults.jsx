import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { BarChart3, Users, CheckCircle2, AlertCircle } from 'lucide-react';

const PollResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchResults(); }, [id]);

  const fetchResults = async () => {
    try {
      const { data } = await api.get(`/polls/${id}/results`);
      setPoll(data.poll);
      setAnalytics(data.analytics);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner"></div></div>;

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-fade-in">
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center">
          <div className="w-14 h-14 bg-white/[0.03] rounded-full flex items-center justify-center text-gray-500 mb-5">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Unavailable</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button onClick={() => navigate(`/poll/${id}`)} className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors">&larr; Back to poll</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 pill-published rounded-full text-xs font-medium mb-5">
          <CheckCircle2 size={14} /> Results Published
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{poll.title}</h1>
        {poll.description && <p className="text-gray-600 text-sm max-w-lg mx-auto">{poll.description}</p>}
      </div>

      {/* Summary */}
      <div className="flex justify-center gap-3 mb-10">
        <div className="glass-panel px-5 py-3.5 rounded-2xl flex items-center gap-3.5">
          <div className="w-9 h-9 bg-cyan-500/[0.08] rounded-xl flex items-center justify-center text-cyan-400">
            <Users size={18} />
          </div>
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-medium">Participants</p>
            <p className="text-xl font-bold text-white">{analytics.totalResponses}</p>
          </div>
        </div>
        <div className="glass-panel px-5 py-3.5 rounded-2xl flex items-center gap-3.5">
          <div className="w-9 h-9 bg-violet-500/[0.08] rounded-xl flex items-center justify-center text-violet-400">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-medium">Questions</p>
            <p className="text-xl font-bold text-white">{poll.questions.length}</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {poll.questions.map((q, index) => {
          const totalAnswersForQ = q.options.reduce((sum, opt) => sum + (analytics.optionCounts[q._id]?.[opt] || 0), 0);
          let maxCount = 0;
          q.options.forEach(opt => { const c = analytics.optionCounts[q._id]?.[opt] || 0; if (c > maxCount) maxCount = c; });

          return (
            <div key={q._id} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/[0.02] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

              <h3 className="text-[15px] font-semibold text-white mb-6 relative z-10 tracking-tight">
                <span className="text-cyan-400 mr-1.5 font-bold">Q{index + 1}.</span>{q.text}
              </h3>

              <div className="space-y-3.5 relative z-10">
                {q.options.map(opt => {
                  const count = analytics.optionCounts[q._id]?.[opt] || 0;
                  const percentage = totalAnswersForQ === 0 ? 0 : Math.round((count / totalAnswersForQ) * 100);
                  const isLeading = count > 0 && count === maxCount;

                  return (
                    <div key={opt}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[13px] ${isLeading ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {opt}
                          {isLeading && totalAnswersForQ > 0 && (
                            <span className="ml-2 text-[9px] text-emerald-400 font-semibold bg-emerald-500/[0.08] px-1.5 py-0.5 rounded-full uppercase tracking-widest">Winner</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLeading ? 'text-cyan-300 text-base' : 'text-gray-600 text-[13px]'}`}>{percentage}%</span>
                          <span className="text-gray-700 text-[11px] w-12 text-right">{count} vote{count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                        <div className={`h-full rounded-full animate-bar ${isLeading ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-white/[0.06]'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-800 text-[11px] uppercase tracking-widest">
          Powered by <span className="text-gradient font-semibold">PulseBoard</span>
        </p>
      </div>
    </div>
  );
};

export default PollResults;
