import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Flame, AlertCircle, TrendingUp, TrendingDown, Target, Zap, ShieldCheck } from 'lucide-react';
import ProCandlestickChart from './ProCandlestickChart';

const PatternAcademy = () => {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [userScore, setUserScore] = useState(0);

  const patterns = [
    {
      id: "doji",
      name: "The Doji",
      type: "Neutral / Reversal",
      psychology: "Buyers and sellers are in a dead heat. Uncertainty is at its peak. Usually indicates a trend change.",
      action: "Wait for next candle confirmation",
      data: [
        { time: '2024-01-01', open: 100, high: 105, low: 95, close: 100 },
        { time: '2024-01-02', open: 100, high: 110, low: 90, close: 100.2 }, // The Doji
        { time: '2024-01-03', open: 100.2, high: 108, low: 98, close: 105 }
      ],
      markers: [{ time: '2024-01-02', position: 'aboveBar', color: '#f59e0b', shape: 'arrowDown', text: 'DOJI' }]
    },
    {
      id: "hammer",
      name: "The Hammer",
      type: "Bullish Reversal",
      psychology: "Sellers tried to push price down, but buyers stepped in massive force to push it back up. Strong bottom signal.",
      action: "Buy at candle break high",
      data: [
        { time: '2024-01-01', open: 120, high: 125, low: 115, close: 118 },
        { time: '2024-01-02', open: 118, high: 120, low: 100, close: 117 }, // The Hammer
        { time: '2024-01-03', open: 117, high: 130, low: 115, close: 128 }
      ],
      markers: [{ time: '2024-01-02', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'HAMMER' }]
    },
    {
      id: "engulfing",
      name: "Bullish Engulfing",
      type: "Trend Continuation",
      psychology: "Total dominance. The green body completely swallows the previous red body, showing buyers have taken control.",
      action: "Aggressive Buy",
      data: [
        { time: '2024-01-01', open: 100, high: 102, low: 90, close: 92 },
        { time: '2024-01-02', open: 90, high: 115, low: 88, close: 112 }, // Engulfing
        { time: '2024-01-03', open: 112, high: 125, low: 110, close: 122 }
      ],
      markers: [{ time: '2024-01-02', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'ENGULFING' }]
    }
  ];

  const activePatternData = patterns.find(p => p.id === selectedPattern) || patterns[0];

  return (
    <section className="space-y-12">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <BarChart2 className="text-blue-500" /> Pattern Recognition Academy
          </h3>
          <p className="text-slate-500 text-sm mt-2">Charts are the footprint of money. Learn to read the symbols of market intent.</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Patterns 03/03</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <ProCandlestickChart 
             data={activePatternData.data} 
             markers={activePatternData.markers} 
           />
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 border-emerald-500/10 bg-emerald-500/[0.01]">
                 <div className="flex items-center gap-2 text-emerald-400 mb-4">
                    <ShieldCheck size={20} />
                    <h5 className="font-bold uppercase tracking-wide">Market Psychology</h5>
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed font-medium">
                   "{activePatternData.psychology}"
                 </p>
              </div>
              <div className="glass-card p-8 border-blue-500/10 bg-blue-500/[0.01]">
                 <div className="flex items-center gap-2 text-blue-400 mb-4">
                    <Zap size={20} />
                    <h5 className="font-bold uppercase tracking-wide">Suggested Action</h5>
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed font-medium">
                   "{activePatternData.action}"
                 </p>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-xs font-bold text-slate-500 uppercase px-2 mb-4 tracking-tighter">Select Pattern Module</h4>
           {patterns.map((pattern) => (
             <button
               key={pattern.id}
               onClick={() => setSelectedPattern(pattern.id)}
               className={`w-full text-left p-4 rounded-2xl transition-all border ${
                 selectedPattern === pattern.id 
                 ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' 
                 : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
               }`}
             >
               <div className="flex justify-between items-center mb-1">
                 <span className="font-bold">{pattern.name}</span>
                 <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                   pattern.type.includes('Bullish') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                 }`}>
                   {pattern.type.split(' ')[0]}
                 </span>
               </div>
               <p className="text-[10px] opacity-60 leading-tight">{pattern.type}</p>
             </button>
           ))}

           <div className="mt-8 glass-card bg-orange-500/10 border-orange-500/20 p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-4">
                 <AlertCircle size={20} />
              </div>
              <h5 className="text-xs font-bold text-orange-400 uppercase mb-2 tracking-widest">Training Quiz Mode</h5>
              <button 
                onClick={() => setUserScore(userScore + 1)}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all"
              >
                IDENTIFY IN REAL-TIME
              </button>
           </div>
        </div>
      </div>
    </section>
  );
};

export default PatternAcademy;
