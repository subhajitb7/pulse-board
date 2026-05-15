import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const PollView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!authLoading) fetchPoll();
  }, [id, authLoading]);

  const fetchPoll = async () => {
    try {
      const { data } = await api.get(`/polls/${id}`);
      setPoll(data);
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.requiresAuth) {
        navigate('/auth', { state: { returnUrl: `/poll/${id}` } });
      } else {
        setError(error.response?.data?.message || 'Poll not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
    if (validationErrors[questionId]) {
      const newErrors = { ...validationErrors };
      delete newErrors[questionId];
      setValidationErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const errors = {};
    for (const q of poll.questions) {
      if (q.isMandatory && !answers[q._id]) errors[q._id] = true;
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please answer all required questions');
      return;
    }

    const formattedAnswers = Object.keys(answers).map(qId => ({ questionId: qId, selectedOption: answers[qId] }));

    setSubmitting(true);
    try {
      await api.post(`/polls/${id}/respond`, { answers: formattedAnswers });
      setSubmitted(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner"></div></div>;

  if (error && !poll) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-fade-in">
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center">
          <div className="w-14 h-14 bg-red-500/[0.08] rounded-full flex items-center justify-center text-red-400 mb-5">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Not Found</h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!poll) return null;
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-fade-in">
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-400/50"></div>
          <div className="w-16 h-16 bg-emerald-500/[0.1] rounded-full flex items-center justify-center text-emerald-400 mb-5 border border-emerald-500/15">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Response recorded</h2>
          <p className="text-gray-500 mb-6 text-sm">Thank you for participating.</p>
          {poll.isPublished && (
            <button onClick={() => navigate(`/poll/${id}/results`)} className="btn-primary px-6 py-2.5 rounded-xl text-sm">
              <span>View Results</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-8 text-center glass-panel p-8 sm:p-10 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full accent-line"></div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">{poll.title}</h1>
        {poll.description && <p className="text-gray-500 text-sm max-w-lg mx-auto">{poll.description}</p>}
        {isExpired && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 pill-expired rounded-lg text-xs font-medium">
            <Clock size={14} /> This poll has expired
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/[0.06] border border-red-500/20 text-red-400 p-3 rounded-xl mb-5 text-sm animate-fade-in flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {poll.questions.map((q, index) => (
          <div key={q._id} className={`glass-panel p-6 rounded-2xl transition-all ${validationErrors[q._id] ? 'ring-1 ring-red-500/30' : ''}`}>
            <h3 className="text-[15px] font-semibold text-white mb-4 tracking-tight">
              <span className="text-amber-400 mr-1.5 font-bold">{index + 1}.</span>
              {q.text}
              {q.isMandatory && <span className="text-red-400 ml-1">*</span>}
            </h3>

            <div className="space-y-2">
              {q.options.map(opt => (
                <label
                  key={opt}
                  className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                    answers[q._id] === opt
                      ? 'border-amber-500/40 bg-amber-500/[0.05]'
                      : 'border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02]'
                  } ${isExpired ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mr-3.5 flex items-center justify-center flex-shrink-0 transition-all ${
                    answers[q._id] === opt ? 'border-amber-500 bg-amber-500' : 'border-gray-700'
                  }`}>
                    {answers[q._id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-sm ${answers[q._id] === opt ? 'text-white font-medium' : 'text-gray-400'}`}>{opt}</span>
                  <input type="radio" name={`q-${q._id}`} value={opt} checked={answers[q._id] === opt} onChange={() => handleOptionSelect(q._id, opt)} className="sr-only" disabled={isExpired} />
                </label>
              ))}
            </div>

            {validationErrors[q._id] && <p className="text-red-400 text-[11px] mt-2.5 animate-fade-in">Required</p>}
          </div>
        ))}

        {!isExpired && (
          <div className="pt-4">
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 rounded-xl text-sm disabled:opacity-50">
              <span className="flex items-center justify-center gap-2">
                {submitting ? <div className="spinner !w-4 !h-4 !border-2 !border-white/20 !border-t-white"></div> : 'Submit Response'}
              </span>
            </button>
          </div>
        )}

        {isExpired && poll.isPublished && (
          <div className="pt-4 text-center">
            <button type="button" onClick={() => navigate(`/poll/${id}/results`)} className="px-8 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-gray-300 transition-colors font-medium text-sm border border-white/[0.06]">
              View Final Results
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PollView;
