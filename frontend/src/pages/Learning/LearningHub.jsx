import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Layout, LineChart, Globe, BrainCircuit, Activity, 
  ChevronRight, ArrowLeft, Trophy, Search, ChevronDown
} from 'lucide-react';

// Sub-components
import MarketStructure from './components/MarketStructure';
import PatternAcademy from './components/PatternAcademy';
import MacroImpactEngine from './components/MacroImpactEngine';
import PsychologySim from './components/PsychologySim';
import RiskCenter from './components/RiskCenter';
import DecisionChecklist from './components/DecisionChecklist';

const LearningHub = () => {
  const [activeModule, setActiveModule] = useState('structure');

  const modules = [
    { id: 'structure', name: 'Market Structure', icon: Layout, desc: 'Players, Orders, and Flow' },
    { id: 'patterns', name: 'Price Patterns', icon: LineChart, desc: 'Candlestick Analysis Pro' },
    { id: 'macro', name: 'Macro Engine', icon: Globe, desc: 'Global Economy & News' },
    { id: 'psych', name: 'Psychology Simulator', icon: BrainCircuit, desc: 'Fear, Greed & Discipline' },
    { id: 'risk', name: 'Risk & Strategy', icon: Activity, desc: 'Capital Preservation Math' }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'structure': return <MarketStructure />;
      case 'patterns': return <PatternAcademy />;
      case 'macro': return <MacroImpactEngine />;
      case 'psych': return <PsychologySim />;
      case 'risk': return <RiskCenter />;
      default: return <MarketStructure />;
    }
  };

  const currentModule = modules.find(m => m.id === activeModule);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen"
    >
      {/* Top Breadcrumb / Stage Indicator */}
      <div className="flex flex-wrap items-center gap-4 mb-12 border-b border-white/5 pb-8">
         <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
            <Compass className="text-blue-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Pro Academy Phase I</span>
         </div>
         <ChevronRight className="text-slate-700" size={16} />
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Module:</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">{currentModule.name}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Sidebar Navigation */}
        <aside className="xl:col-span-1 space-y-8">
           <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tighter italic">Invest <span className="text-blue-500">Ease</span></h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enterprise Trading Education</p>
           </div>

           <nav className="space-y-3">
              {modules.map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={`w-full group text-left px-6 py-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      isActive 
                      ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                       isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-600 group-hover:text-slate-400'
                    }`}>
                       <Icon size={20} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>{m.name}</p>
                      <p className="text-[10px] opacity-60 uppercase font-mono">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
           </nav>

           <div className="pt-8 space-y-6">
              <DecisionChecklist />
              
              <div className="glass-card bg-gradient-to-br from-yellow-500/10 to-transparent p-6 text-center">
                 <Trophy className="text-yellow-500 mx-auto mb-3" size={32} />
                 <h5 className="text-xs font-black uppercase mb-1">Academy Level</h5>
                 <p className="text-xl font-black text-yellow-500">BRONZE II</p>
                 <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="w-1/3 h-full bg-yellow-500" />
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Content Stage */}
        <main className="xl:col-span-3 space-y-12">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeModule}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
                {renderModule()}
             </motion.div>
           </AnimatePresence>

           {/* Module Navigation Footer */}
           <div className="flex justify-between items-center pt-12 border-t border-white/5">
              <button 
                onClick={() => {}} 
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                disabled
              >
                 <ArrowLeft size={14} /> PREVIOUS MODULE
              </button>
              <button 
                onClick={() => {
                  const idx = modules.findIndex(m => m.id === activeModule);
                  if (idx < modules.length - 1) setActiveModule(modules[idx+1].id);
                }}
                className="neo-btn-primary flex items-center gap-2"
              >
                 NEXT MODULE <ChevronRight size={16} />
              </button>
           </div>
        </main>
      </div>
    </motion.div>
  );
};

export default LearningHub;
