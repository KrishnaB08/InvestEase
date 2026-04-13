import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const DecisionChecklist = () => {
  const [items, setItems] = useState([
    { id: 1, text: "Is the overall market trend identified? (HH/HL or LH/LL)", check: false },
    { id: 2, text: "Is the stock at a valid Support or Resistance zone?", check: false },
    { id: 3, text: "Is there a clear Candlestick Pattern confirmation?", check: false },
    { id: 4, text: "Have you checked the Macro Sentiment (News/Interest Rates)?", check: false },
    { id: 5, text: "Is the Risk/Reward ratio at least 1:2?", check: false }
  ]);

  const toggleItem = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, check: !item.check } : item));
  };

  const completedCount = items.filter(i => i.check).length;
  const isReady = completedCount === items.length;

  return (
    <div className="glass-card p-8 border-blue-500/20 bg-blue-500/[0.02] flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-8">
           <h4 className="text-xl font-bold">Decision Readiness</h4>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Score</span>
              <span className="text-xl font-black text-blue-400">{completedCount}/{items.length}</span>
           </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <button 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center gap-4 text-left group p-1 transition-colors"
            >
              {item.check ? 
                <CheckCircle className="text-emerald-500 shrink-0" size={24} /> : 
                <Circle className="text-slate-600 group-hover:text-slate-400 shrink-0" size={24} />
              }
              <span className={`text-sm ${item.check ? 'text-slate-200 line-through' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12">
        {isReady ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3"
          >
             <ShieldCheck className="text-emerald-400 mx-auto" size={32} />
             <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Strategy Validated</p>
             <h5 className="text-lg font-bold">Safe to Invest</h5>
          </motion.div>
        ) : (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
             <AlertCircle className="text-slate-500 mx-auto" size={32} />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting Confirmation</p>
             <h5 className="text-lg font-bold text-slate-400">Incomplete Checklist</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionChecklist;
