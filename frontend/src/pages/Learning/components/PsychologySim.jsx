import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Skull, Zap, AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react';

const PsychologySim = () => {
  const [activeScenario, setActiveScenario] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const scenarios = [
    {
      id: "panic",
      title: "The Panic Drop",
      context: "Your portfolio is down 15% in 2 hours. News says 'The worst is yet to come'. Your heartbeat is racing.",
      metric: "Stress Level: 88%",
      color: "rose",
      options: [
        { label: "Close all positions now", type: "fear", feedback: "Panic selling is the #1 way retail investors lose wealth. You just locked in a loss that likely would have recovered in 48 hours." },
        { label: "Analyze fundamentals & Hold", type: "discipline", feedback: "Discipline Won. Markets are volatile, but your strategy is long-term. By staying calm, you avoided a permanent loss of capital." }
      ]
    },
    {
       id: "fomo",
       title: "The FOMO Moon",
       context: "A risky AI stock just rose 40% in one day. Everyone on Twitter is making money. You haven't bought yet.",
       metric: "Greed Level: 92%",
       color: "emerald",
       options: [
         { label: "Buy at market price immediately", type: "greed", feedback: "FOMO Trap. You bought at the absolute peak. Professional sellers use your 'late entry' liquidity to exit their own positions." },
         { label: "Wait for a retracement/pullback", type: "discipline", feedback: "Patience Won. Never chase a vertical line. By waiting, you get a better entry or avoid a massive correction." }
       ]
    }
  ];

  return (
    <section className="space-y-12">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="text-rose-500" /> Market Psychology Engine
          </h3>
          <p className="text-slate-500 text-sm mt-2">Trading is 20% strategy and 80% psychology. Master your own mind.</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-rose-500/50">Psychology 03/03</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="glass-card overflow-hidden flex flex-col">
             <div className="p-8 space-y-4">
                <div className="flex justify-between items-center">
                   <h4 className="text-xl font-bold">{scenario.title}</h4>
                   <span className={`text-[10px] font-black px-3 py-1 rounded bg-${scenario.color}-500/10 text-${scenario.color}-400 border border-${scenario.color}-500/20`}>
                      {scenario.metric}
                   </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed italic">"{scenario.context}"</p>
             </div>
             
             <div className="p-8 pt-0 space-y-3">
                <AnimatePresence mode="wait">
                  {feedback && activeScenario === scenario.id ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-6 rounded-2xl border-2 ${feedback.type === 'discipline' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}
                    >
                       <p className="text-sm font-medium leading-relaxed">{feedback.text}</p>
                       <button onClick={() => {setFeedback(null); setActiveScenario(null);}} className="mt-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Retry Simulation</button>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-3">
                       {scenario.options.map((opt, i) => (
                         <button 
                           key={i} 
                           onClick={() => {setActiveScenario(scenario.id); setFeedback({type: opt.type, text: opt.feedback});}}
                           className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 text-xs font-bold transition-all text-left px-6 flex justify-between items-center group"
                         >
                           {opt.label}
                           <Zap size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                         </button>
                       ))}
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-10 bg-gradient-to-r from-rose-500/5 to-emerald-500/5 border-dashed border-2 border-white/5">
         <div className="flex items-start gap-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
               <Skull size={32} />
            </div>
            <div className="space-y-4">
               <h4 className="text-xl font-bold">The Silent Portfolio Killer</h4>
               <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                 Most traders do not fail because they are "wrong"—they fail because they cannot 
                 handle the emotional surge when they are "losing". Mastering psychology means 
                 detaching your self-worth from your trade P/L.
               </p>
               <div className="flex gap-4">
                  <div className="text-[10px] font-mono text-rose-500">FEAR: DON'T SELL THE BOTTOM</div>
                  <div className="text-[10px] font-mono text-emerald-500">GREED: DON'T BUY THE TOP</div>
               </div>
            </div>
         </div>
      </div>
    </section>
  );
};

export default PsychologySim;
