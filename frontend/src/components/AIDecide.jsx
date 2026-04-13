import React, { useState } from 'react';
import axios from 'axios';

const AIDecide = ({ API_BASE }) => {
  const [ticker, setTicker] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ai-advice/${ticker.toUpperCase()}`);
      setAdvice(res.data);
    } catch (err) {
      console.error(err);
      setAdvice({ 
        error: "Couldn't fetch stock data. Make sure the ticker is correct (e.g., RELIANCE)." 
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">AI Stock Analyzer</h2>
        <p className="text-slate-400">Powered by Claude 3.5. Instant, jargon-free investing decisions.</p>
      </div>

      <div className="glass-card flex gap-4 p-4">
        <input 
          type="text" 
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter stock name (e.g. RELIANCE, TCS)"
          className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-mono uppercase"
          onKeyPress={(e) => e.key === 'Enter' && getAdvice()}
        />
        <button 
          onClick={getAdvice}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Analyzing...' : 'Get AI Advice'}
        </button>
      </div>

      {advice && !advice.error && (
        <div className="glass-card space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold flex items-center gap-3">
                {ticker.toUpperCase()}
                <span className={`text-sm px-3 py-1 rounded-full ${
                  advice.decision === 'Invest' ? 'bg-emerald-500/20 text-emerald-400' : 
                  advice.decision === 'Wait' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {advice.decision}
                </span>
              </h3>
              <p className="text-slate-400 mt-1">Confidence Score: {advice.confidence}%</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center font-bold text-xl">
              {advice.confidence}
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <p className="text-xl leading-relaxed italic">"{advice.explanation}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Sentiment: Generally Positive
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Volatility: Consistent with sector
            </div>
          </div>
        </div>
      )}

      {advice?.error && (
        <div className="glass-card border-rose-500 bg-rose-500/10 text-rose-400 text-center">
          {advice.error}
        </div>
      )}

      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
        <p className="text-xs text-slate-500 text-center uppercase tracking-widest">
          Disclaimer: This AI is for educational simulation only. Investing involves risk.
        </p>
      </div>
    </div>
  );
};

export default AIDecide;
