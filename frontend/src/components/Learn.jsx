import React, { useState } from 'react';

const Learn = () => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const lessons = [
    {
      title: "Spotting the Dip",
      description: "When a stock price falls below its usual trend, it's called a 'dip'. Look at the chart below. Where would you buy?",
      chartImg: "https://images.unsplash.com/photo-1611974717482-5831ef24a16?auto=format&fit=crop&q=80&w=400&h=200", // placeholder logic or SVG
      targetZone: { x: 40, y: 70 }, // % from top-left
      explanation: "Buying at the bottom of a V-shape is the classic 'Buy the Dip' strategy."
    },
    {
      title: "Riding the Trend",
      description: "An 'uptrend' is like a staircase moving up. Click on the next expected step up.",
      chartImg: "https://images.unsplash.com/photo-1624996379697-f01d168b1a52?auto=format&fit=crop&q=80&w=400&h=200",
      targetZone: { x: 70, y: 30 },
      explanation: "Higher highs and higher lows confirm a strong uptrend."
    }
  ];

  const handleChartClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const target = lessons[currentLesson].targetZone;
    const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
    
    if (distance < 15) {
      setFeedback({ type: 'success', text: "Perfect! You've spotted the value zone." });
    } else {
      setFeedback({ type: 'hint', text: "Not quite. Look for where the price stopped falling and started to stabilize." });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Interactive Chart Lessons</h2>
        <p className="text-slate-400">Stop reading theory. Master the charts by doing.</p>
      </div>

      <div className="glass-card">
        <div className="flex justify-between mb-4">
          <span className="text-blue-400 font-mono">Module {currentLesson + 1} of {lessons.length}</span>
          <span className="text-slate-500">{lessons[currentLesson].title}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-4">{lessons[currentLesson].title}</h3>
        <p className="text-slate-300 mb-8">{lessons[currentLesson].description}</p>

        <div className="relative cursor-crosshair group">
          <img 
            src={lessons[currentLesson].chartImg} 
            alt="Stock chart lesson" 
            className="w-full rounded-xl border border-slate-700 brightness-75 group-hover:brightness-100 transition"
            onClick={handleChartClick}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition">
            <span className="bg-blue-500/80 text-white px-4 py-2 rounded-full text-sm font-bold">CLICK TO BUY</span>
          </div>
        </div>

        {feedback && (
          <div className={`mt-6 p-4 rounded-xl border ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-blue-500/10 border-blue-500 text-blue-300'}`}>
            <p className="font-bold">{feedback.type === 'success' ? '✓ Correct' : '💡 Hint'}</p>
            <p>{feedback.text}</p>
            {feedback.type === 'success' && currentLesson < lessons.length - 1 && (
              <button 
                onClick={() => { setCurrentLesson(prev => prev+1); setFeedback(null); }}
                className="mt-4 text-emerald-400 font-bold hover:underline"
              >
                Next Lesson →
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <h4 className="font-bold mb-2">Rule #1: Buy Low</h4>
          <p className="text-sm text-slate-400">Fear makes people sell at the bottom. That is exactly when professional investors are buying.</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <h4 className="font-bold mb-2">Rule #2: Observe Volume</h4>
          <p className="text-sm text-slate-400">Large price drops with small volumes are often temporary panics. Huge volumes indicate a real shift.</p>
        </div>
      </div>
    </div>
  );
};

export default Learn;
