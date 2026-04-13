import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, IndianRupee, PieChart, Info, Scale } from 'lucide-react';

const RiskCenter = () => {
  const [capital, setCapital] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(2500);
  const [stopLoss, setStopLoss] = useState(2400);

  const riskPerTrade = (capital * riskPercent) / 100;
  const priceDifference = entryPrice - stopLoss;
  const suggestedQuantity = priceDifference > 0 ? Math.floor(riskPerTrade / priceDifference) : 0;
  const totalInvestment = suggestedQuantity * entryPrice;

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="text-blue-500" /> Risk Management Center
          </h3>
          <p className="text-slate-500 text-sm mt-2">The math of staying alive. Beginners focus on Profit; Pros focus on Risk.</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Risk 02/03</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card space-y-8 p-8">
           <h4 className="text-xl font-bold mb-6">Simulation Input</h4>
           
           <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Total Capital (₹)</label>
             <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <IndianRupee size={16} className="text-blue-400" />
                <input 
                  type="number" 
                  value={capital} 
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="bg-transparent border-none focus:ring-0 text-white font-bold w-full"
                />
             </div>
           </div>

           <div className="space-y-3">
             <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Risk per Trade (%)</label>
                <span className="text-blue-400 font-bold">{riskPercent}%</span>
             </div>
             <input 
               type="range" 
               min="1" 
               max="5" 
               step="0.5"
               value={riskPercent} 
               onChange={(e) => setRiskPercent(Number(e.target.value))}
               className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-full cursor-pointer"
             />
             <p className="text-[10px] text-slate-600 italic">Professional standard is 1-2% max.</p>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase">Entry (₹)</label>
               <input 
                 type="number" 
                 value={entryPrice} 
                 onChange={(e) => setEntryPrice(Number(e.target.value))}
                 className="bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold w-full text-sm"
               />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase">Stop Loss (₹)</label>
               <input 
                 type="number" 
                 value={stopLoss} 
                 onChange={(e) => setStopLoss(Number(e.target.value))}
                 className="bg-white/5 border border-white/10 rounded-xl p-3 text-rose-400 font-bold w-full text-sm"
               />
             </div>
           </div>
        </div>

        <div className="lg:col-span-2 glass-card p-10 flex flex-col justify-between bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03]">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div className="space-y-2">
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Calculated Risk per Trade</p>
                 <h2 className="text-5xl font-black text-rose-500">₹{riskPerTrade.toLocaleString()}</h2>
                 <p className="text-xs text-slate-400">If your Stop Loss hits, you only lose {riskPercent}% of total bankroll.</p>
              </div>
              <div className="w-full md:w-auto px-10 py-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center flex flex-col items-center">
                 <h3 className="text-sm font-bold text-blue-400 mb-1">SUGGESTED QUANTITY</h3>
                 <p className="text-5xl font-black">{suggestedQuantity}</p>
                 <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase">Capital Allocation: ₹{totalInvestment.toLocaleString()}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-blue-400 mb-2">
                    <ShieldAlert size={20} />
                    <h5 className="font-bold">Survival Logic</h5>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed italic">
                   "If you lose ₹5,000 on a ₹10,000 portfolio, you need 100% profit to get back to even. 
                   If you lose only ₹200 (2%), you can play the game 50 more times."
                 </p>
              </div>
              
              <div className="glass-card bg-orange-500/5 border-orange-500/20 p-5 flex items-start gap-4">
                 <Info className="text-orange-400 shrink-0" size={18} />
                 <div>
                    <h5 className="text-orange-400 font-bold text-xs uppercase mb-1">Risk Warning</h5>
                    <p className="text-[10px] text-slate-400">Current allocation is {Math.round((totalInvestment/capital)*100)}% of total capital. High concentration can lead to rapid account drawdown if diversification is low.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default RiskCenter;
