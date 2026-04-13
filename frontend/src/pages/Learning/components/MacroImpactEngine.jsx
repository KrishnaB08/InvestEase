import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, DollarSign, Activity, Zap } from 'lucide-react';

const ImpactChain = ({ title, steps }) => (
  <div className="glass-card p-6 border-blue-500/10 bg-blue-500/[0.02]">
    <h4 className="text-sm font-bold text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-2">
      <Zap size={14} /> {title}
    </h4>
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3 ${i === steps.length - 1 ? 'border-blue-500/30 glow-box' : ''}`}
          >
            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">
               0{i+1}
            </div>
            <span className="text-sm font-medium">{step}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <div className="flex justify-center py-1">
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: 16 }}
                className="w-[2px] bg-gradient-to-b from-blue-500/50 to-transparent" 
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const MacroImpactEngine = () => {
  const chains = [
    {
      title: "Interest Rate Hike",
      steps: ["Central Bank raises Rate", "Borrowing becomes expensive", "Companies reduce expansion", "Corporate profits decline", "Stock Market falls 📉"]
    },
    {
      title: "Crude Oil Price Surge",
      steps: ["Global Supply shrinks", "Fuel & Transport costs rise", "Manufacturing gets costly", "Inflation increases", "Consumer spending drops 🛒"]
    },
    {
       title: "Currency Weakness (INR ↓)",
       steps: ["Rupee loses value vs Dollar", "Imports (Oil, Tech) cost more", "IT Export earnings increase", "Inflationary pressure rises", "Market becomes Volatile ⚡"]
    }
  ];

  return (
    <section className="space-y-12">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-blue-500" /> Macro Economic Engine
          </h3>
          <p className="text-slate-500 text-sm mt-2">Professional traders watch the "Why" behind the "What". Master the impact chains.</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Macro 01/03</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chains.map((chain, index) => (
          <ImpactChain key={index} title={chain.title} steps={chain.steps} />
        ))}
      </div>

      <div className="glass-card bg-gradient-to-br from-indigo-500/10 to-transparent p-10 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="max-w-xl">
            <h4 className="text-2xl font-bold mb-4">Market Mood: The Fear & Greed Cycle</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              When interest rates are low and news is good, "Greed" takes over and markets rise. 
              When inflation jumps and rates rise, "Fear" drives people to sell. Pro traders 
              control their emotions by understanding these cycles.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center">
                <TrendingUp size={24} className="text-emerald-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Bullish Mood</p>
                <p className="text-lg font-black text-emerald-400">GREED</p>
            </div>
            <div className="px-6 py-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center flex flex-col items-center">
                <TrendingDown size={24} className="text-rose-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Bearish Mood</p>
                <p className="text-lg font-black text-rose-400">FEAR</p>
            </div>
         </div>
      </div>
    </section>
  );
};

export default MacroImpactEngine;
