import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Info, GraduationCap, Zap } from 'lucide-react';
import ProTerminal from './Simulator/ProTerminal';
import ImpactTracker from '../components/ImpactTracker';

const SimulatorPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12 pb-24"
    >
      {/* 🎮 Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-400 mb-2">
                <Terminal size={24} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Strategy Terminal 2.0</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic">Pro <span className="text-blue-500">Trading</span> Simulator</h1>
            <p className="text-slate-500 max-w-xl">
                Experience real-world market volatility without the risk. Manage ₹10,000, 
                identify trends, and survive market crashes to build your resilience.
            </p>
        </div>
        <div className="flex items-center gap-4">
             <div className="px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <GraduationCap size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Learning Mode</p>
                    <p className="text-sm font-bold text-blue-600">ACTIVE</p>
                 </div>
             </div>
        </div>
      </header>

      {/* 🚀 Main Game Engine */}
      <ProTerminal />

      {/* 📊 Fear Score Impact Tracker */}
      <ImpactTracker />

      {/* 🕯️ Educational Footnote */}
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          <div className="glass-card p-8 border-dashed border-2 border-slate-200 bg-transparent flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Info size={24} />
              </div>
              <div>
                  <h4 className="font-bold mb-2 text-slate-900">About Simulated Trading</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                      All prices are simulated based on realistic market trends and random event generators. 
                      Your progress is saved locally. Use this environment to test your "SIP" vs "Lump Sum" 
                      strategies before moving to real markets.
                  </p>
              </div>
          </div>
          <div className="glass-card p-8 bg-gradient-to-r from-blue-500/10 to-transparent flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Zap size={24} />
              </div>
              <div>
                  <h4 className="font-bold mb-2 text-slate-900">Pro Tip: Survive the Crash</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                      "Market Crashes" are randomly injected. If a crash happens, watch the expert 
                      suggestions. Most beginner investors lose money by panic-selling during these 
                      temporary dips.
                  </p>
              </div>
          </div>
      </footer>
    </motion.div>
  );
};

export default SimulatorPage;
