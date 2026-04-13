import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { postFearScore, fetchFearHistory } from '../utils/api';

const ImpactTracker = () => {
  const [history, setHistory] = useState([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyType, setSurveyType] = useState('pre'); // 'pre' or 'post'
  const [scores, setScores] = useState({ q1: 3, q2: 3, q3: 3 });

  const fetchHistory = async () => {
    try {
      const data = await fetchFearHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Fear history fetch error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const submitSurvey = async () => {
    const avg = (scores.q1 + scores.q2 + scores.q3) / 3;
    const sessionData = {
      timestamp: new Date().toISOString(),
      type: surveyType,
      score: avg
    };
    
    try {
      await postFearScore(sessionData);
      setShowSurvey(false);
      fetchHistory();
    } catch (err) {
      console.error("Save fear score error:", err);
    }
  };

  const chartData = history.slice(-10).map((h, i) => ({
    name: `Session ${i + 1}`,
    score: parseFloat((h.score || 0).toFixed(1)),
    type: h.type
  }));

  return (
    <div className="glass-card mt-12 p-8 border-t-2 border-t-blue-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Your Fear Score Tracker</h2>
          <p className="text-slate-400">Watch your confidence grow with every simulation.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setShowSurvey(true); setSurveyType('pre'); }}
            className="px-4 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700"
          >
            Pre-Session Survey
          </button>
          <button 
            onClick={() => { setShowSurvey(true); setSurveyType('post'); }}
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold"
          >
            Post-Session Results
          </button>
        </div>
      </div>

      <div className="h-64 mt-8">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#94a3b8" />
              <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'pre' ? '#334155' : '#00d2ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm">
            No fear score data yet. Take a pre-session survey to start tracking!
          </div>
        )}
      </div>

      {showSurvey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 border-blue-500">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {surveyType === 'pre' ? 'Pre-Simulation Check' : 'How was that crash?'}
            </h3>
            
            {[
              { id: 'q1', label: surveyType === 'pre' ? "How confident do you feel about investing?" : "How confident do you feel after surviving?" },
              { id: 'q2', label: surveyType === 'pre' ? "How afraid are you of losing money?" : "Are you still afraid of the crash?" },
              { id: 'q3', label: surveyType === 'pre' ? "Would you invest ₹1,000 today?" : "Would you invest real money now?" },
            ].map(q => (
              <div key={q.id} className="mb-6">
                <p className="text-sm text-slate-300 mb-3">{q.label}</p>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button 
                      key={v}
                      onClick={() => setScores(prev => ({ ...prev, [q.id]: v }))}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                        scores[q.id] === v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowSurvey(false)}
                className="flex-1 px-4 py-3 bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={submitSurvey}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-xl font-bold"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactTracker;
