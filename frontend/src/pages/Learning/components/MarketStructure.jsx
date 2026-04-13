import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, Droplets, ShoppingCart, ArrowRightLeft, Landmark } from 'lucide-react';

const StructureCard = ({ title, desc, icon: Icon, children }) => (
  <div className="glass-card flex flex-col items-center text-center p-8 space-y-6">
    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 glow-box">
       <Icon size={32} />
    </div>
    <div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
    <div className="w-full pt-6 border-t border-white/5 space-y-4">
       {children}
    </div>
  </div>
);

const MarketStructure = () => {
  return (
    <section className="space-y-12">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Landmark className="text-blue-500" /> Advanced Market Structure
          </h3>
          <p className="text-slate-500 text-sm mt-2">Go deeper than just "ticker symbols". Understand the pipes and players of global finance.</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Structure 01/01</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Module 1: Market Types */}
        <StructureCard 
          title="Market Hierarchy" 
          desc="The difference between where companies raise money and where we trade."
          icon={Layers}
        >
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
              <p className="text-[10px] font-bold text-blue-400 uppercase">Primary Market</p>
              <p className="text-xs text-slate-300">IPO: Company sells directly to institutions to raise capital.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
              <p className="text-[10px] font-bold text-blue-400 uppercase">Secondary Market</p>
              <p className="text-xs text-slate-300">Stock Exchange: We trade with other investors. Company is not involved.</p>
            </div>
          </div>
        </StructureCard>

        {/* Module 2: The Players */}
        <StructureCard 
          title="The Players" 
          desc="Who is moving the money?"
          icon={Users}
        >
           <div className="flex flex-col gap-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-left">
              <p className="text-[10px] font-bold text-emerald-400 uppercase">Institutional (FII/DII)</p>
              <p className="text-xs text-slate-300">Banks, Hedge Funds. They move millions. They are 'The Smart Money'.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-left">
              <p className="text-[10px] font-bold text-blue-400 uppercase">Retail (You & Me)</p>
              <p className="text-xs text-slate-300">Individual investors. We bring liquidity but often follow trends.</p>
            </div>
          </div>
        </StructureCard>

        {/* Module 3: Order Types */}
        <StructureCard 
          title="Execution & Flow" 
          desc="How your order actually reaches the market."
          icon={ArrowRightLeft}
        >
           <div className="flex flex-col gap-2">
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 text-left">
              <p className="text-[10px] font-bold text-blue-400 uppercase">Market Order</p>
              <p className="text-xs text-slate-300">Buy NOW at current price. Fast but no price control.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
              <p className="text-[10px] font-bold text-blue-400 uppercase">Limit Order</p>
              <p className="text-xs text-slate-300">Buy ONLY at specific price. You control price, but may not execute.</p>
            </div>
          </div>
        </StructureCard>
      </div>

      <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
         <div className="w-full md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 text-blue-400">
               <Droplets size={24} />
               <h4 className="text-2xl font-bold">Concept: Liquidity & Order Flow</h4>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
               Liquidity is the lifeblood of the market. High liquidity means you can buy/sell easily 
               without moving the price (like RELIANCE). Low liquidity means your own order might 
               "slip" and execute at a bad price (like a small unknown company).
            </p>
            <div className="flex gap-4">
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase">Depth of Book</div>
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase">Slippage Control</div>
            </div>
         </div>
         <div className="w-full md:w-1/3 p-4 glass-card bg-black/40 flex items-center justify-center min-h-[160px]">
             {/* Visual representation of Price/Liquidity flow */}
             <div className="w-full space-y-2">
                {[80, 45, 90, 60, 20].map((width, i) => (
                    <motion.div 
                        key={i}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${width}%` }}
                        className={`h-2 rounded-full ${i < 2 ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}
                    />
                ))}
             </div>
         </div>
      </div>
    </section>
  );
};

export default MarketStructure;
