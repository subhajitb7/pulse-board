import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Trash2, Settings, HelpCircle, GripVertical, Check, Lock, UserX } from 'lucide-react';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [questions, setQuestions] = useState([
    { id: Date.now(), text: '', options: ['', ''], isMandatory: true }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', options: ['', ''], isMandatory: true }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, options: [...q.options, ''] } : q));
  };

  const removeOption = (questionId, index) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = [...q.options];
        newOptions.splice(index, 1);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const updateOption = (questionId, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formattedQuestions = questions.map(q => ({
      text: q.text,
      options: q.options.filter(opt => opt.trim() !== ''),
      isMandatory: q.isMandatory
    })).filter(q => q.text.trim() !== '' && q.options.length >= 2);

    if (formattedQuestions.length === 0) {
      setError('Add at least one question with 2+ options.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, description, questions: formattedQuestions, isAnonymous };
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      await api.post('/polls', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating poll');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 pb-28 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-0.5">Create Poll</h1>
        <p className="text-gray-600 text-sm">Design your questions and configure settings</p>
      </div>

      {error && (
        <div className="bg-red-500/[0.06] border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="glass-panel p-7 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 text-amber-400 border-b border-white/[0.04] pb-4">
            <Settings size={16} />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">General</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
            <input type="text" required className="input-field w-full px-4 py-3 rounded-xl text-base font-medium" placeholder="e.g., Product Feedback Survey" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Description <span className="text-gray-700">(optional)</span></label>
            <textarea className="input-field w-full px-4 py-3 rounded-xl min-h-[90px] resize-y" placeholder="What is this poll about..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-white/[0.03]">
            {/* Who can respond */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wider">Who can respond?</label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${isAnonymous ? 'border-amber-500/30 bg-amber-500/[0.05]' : 'border-white/[0.05] hover:border-white/[0.1]'}`}>
                  <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isAnonymous ? 'border-amber-500 bg-amber-500' : 'border-gray-700'}`}>
                    {isAnonymous && <Check size={9} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                      <UserX size={13} className="text-gray-500" /> Anyone
                    </span>
                    <p className="text-[11px] text-gray-600 mt-0.5">No sign-in needed</p>
                  </div>
                  <input type="radio" checked={isAnonymous} onChange={() => setIsAnonymous(true)} className="sr-only" />
                </label>
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${!isAnonymous ? 'border-amber-500/30 bg-amber-500/[0.05]' : 'border-white/[0.05] hover:border-white/[0.1]'}`}>
                  <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!isAnonymous ? 'border-amber-500 bg-amber-500' : 'border-gray-700'}`}>
                    {!isAnonymous && <Check size={9} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                      <Lock size={13} className="text-rose-400" /> Signed-in only
                    </span>
                    <p className="text-[11px] text-gray-600 mt-0.5">One response per user</p>
                  </div>
                  <input type="radio" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} className="sr-only" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wider">Expiry <span className="text-gray-700">(optional)</span></label>
              <input type="datetime-local" className="input-field w-full px-4 py-3 rounded-xl" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Questions</h2>
            <span className="text-[11px] text-gray-600 ml-1">{questions.length}</span>
          </div>

          {questions.map((q, qIndex) => (
            <div key={q.id} className="glass-panel p-5 rounded-2xl relative group">
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(q.id)} className="absolute top-3.5 right-3.5 p-1 text-gray-700 hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              )}

              <div className="flex items-center gap-1.5 mb-3">
                <GripVertical size={14} className="text-gray-700" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Q{qIndex + 1}</span>
              </div>

              <div className="mb-4 pr-8">
                <input type="text" required className="input-field w-full px-4 py-2.5 rounded-xl text-sm" placeholder="What would you like to ask?" value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} />
              </div>

              <div className="space-y-2 mb-4">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Options</label>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex gap-2 items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex-shrink-0"></div>
                    <input type="text" required className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => updateOption(q.id, oIndex, e.target.value)} />
                    {q.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(q.id, oIndex)} className="p-1 text-gray-700 hover:text-red-400 rounded transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addOption(q.id)} className="text-amber-400 hover:text-amber-300 text-[12px] font-medium flex items-center gap-1 mt-2 ml-6">
                  <Plus size={13} /> Add option
                </button>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.03]">
                <label className="flex items-center gap-2 cursor-pointer text-[12px] text-gray-500 hover:text-gray-400 transition-colors">
                  <div className={`w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center transition-all ${q.isMandatory ? 'border-amber-500 bg-amber-500' : 'border-gray-700'}`}>
                    {q.isMandatory && <Check size={9} className="text-white" />}
                  </div>
                  Required
                  <input type="checkbox" checked={q.isMandatory} onChange={(e) => updateQuestion(q.id, 'isMandatory', e.target.checked)} className="sr-only" />
                </label>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="w-full py-3.5 border border-dashed border-white/[0.08] rounded-2xl text-gray-600 hover:text-amber-400 hover:border-amber-500/20 transition-all flex justify-center items-center gap-2 font-medium text-[13px]">
            <Plus size={16} /> Add question
          </button>
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 w-full bg-[#06070a]/95 backdrop-blur-xl border-t border-white/[0.04] p-4 z-40">
          <div className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center">
            <p className="text-[11px] text-gray-700 hidden sm:block tracking-wider uppercase">
              {questions.length} question{questions.length !== 1 ? 's' : ''} · {isAnonymous ? 'Open to anyone' : 'Sign-in required'}
            </p>
            <button type="submit" disabled={submitting} className="btn-primary px-8 py-2.5 rounded-xl text-sm disabled:opacity-50">
              <span className="flex items-center gap-2">
                {submitting ? <div className="spinner !w-4 !h-4 !border-2 !border-white/20 !border-t-white"></div> : 'Create Poll'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;
