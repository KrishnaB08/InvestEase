import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Target, AlertTriangle, TrendingUp, TrendingDown, 
  Info, ChevronRight, PieChart, Briefcase, BarChart3, 
  ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, 
  XCircle, HelpCircle, Activity, ExternalLink, Flame, Search
} from 'lucide-react';

/* --- SUB-COMPONENTS --- */

const LearningCard = ({ icon: Icon, title, desc, expandedContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.02 }}
      className="glass-card overflow-hidden group border-white/5 hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex items-start gap-4 cursor-pointer p-1" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            {title}
            <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 mt-4 pt-4 border-t border-white/5 text-sm text-slate-500"
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ChartTypeVisual = ({ type, title, desc }) => {
  const renderPath = () => {
    switch(type) {
      case 'uptrend': return "M 0 80 Q 25 70, 50 50 T 100 20";
      case 'downtrend': return "M 0 20 Q 25 30, 50 50 T 100 80";
      case 'sideways': return "M 0 50 L 20 40 L 40 60 L 60 40 L 80 60 L 100 50";
      case 'volatile': return "M 0 50 L 10 10 L 30 90 L 50 30 L 70 70 L 90 20 L 100 60";
      default: return "";
    }
  };

  const color = type === 'uptrend' ? '#10b981' : type === 'downtrend' ? '#f43f5e' : '#3b82f6';

  return (
    <div className="glass-card p-4 flex flex-col items-center gap-4 group">
      <div className="w-full h-24 relative overflow-hidden bg-black/20 rounded-xl flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
          <motion.path 
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={renderPath()} 
            fill="none" 
            stroke={color} 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          {type === 'uptrend' && <motion.circle cx="100" cy="20" r="3" fill="#10b981" animate={{ r: [3, 5, 3] }} transition={{ repeat: Infinity, duration: 2 }} />}
        </svg>
      </div>
      <div className="text-center">
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
    </div>
  );
};

const MarketMoodIndicator = ({ value = 65 }) => {
  // value 0 (Fear) to 100 (Greed)
  const rotation = (value / 100) * 180 - 180;
  const mood = value < 40 ? 'Fearful' : value > 70 ? 'Greedy' : 'Neutral';
  const color = value < 40 ? 'text-rose-400' : value > 70 ? 'text-emerald-400' : 'text-blue-400';

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 font-mono">Market Sentiment Gauge</h4>
      <div className="relative w-40 h-20 overflow-hidden mb-4">
        <div className="absolute top-0 left-0 w-40 h-40 border-[10px] border-white/5 rounded-full" />
        <div className="absolute top-0 left-0 w-40 h-40 border-[10px] border-blue-500/20 border-t-transparent border-l-transparent rounded-full" />
        <motion.div 
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom bg-gradient-to-t from-blue-500 to-blue-200 rounded-full"
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', damping: 10 }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-2 border-slate-700 rounded-full z-10" />
      </div>
      <p className={`text-2xl font-black uppercase italic ${color}`}>{mood}</p>
      <p className="text-[10px] text-slate-500 mt-2">Institutional sentiment is currently {mood.toLowerCase()}.</p>
    </div>
  );
};

/* --- MAIN PAGE COMPONENT --- */

const Learning = () => {
  const [clickStats, setClickStats] = useState({ hits: 0, tries: 0 });
  const [activeScenario, setActiveScenario] = useState(0);
  const [scenarioFeedback, setScenarioFeedback] = useState(null);

  const fundamentals = [
    { 
      icon: Book, 
      title: 'What is a Stock?', 
      desc: 'Ownership in a company.', 
      expanded: 'Think of a pizza. Every slice is a stock. If the pizza parlor gets famous, your slice becomes more valuable because everyone wants it.' 
    },
    { 
      icon: PieChart, 
      title: 'Market Capitalization', 
      desc: 'The total value of a company.', 
      expanded: 'Calculated as: Total Shares × Current Share Price. It tells you if a company is a Giant (Large Cap) or a Startup (Small Cap).' 
    },
    { 
      icon: Target, 
      title: 'What is SIP?', 
      desc: 'Investing consistently.', 
      expanded: 'Standing for Systematic Investment Plan. Instead of waiting for a lot of money, you invest ₹500 every month. Time does the heavy lifting!' 
    },
    { 
      icon: AlertTriangle, 
      title: 'Risk vs Return', 
      desc: 'Higher reward = higher risk.', 
      expanded: 'Government bonds are like fixed-deposit—safe but slow. Small stocks are like racing cars—fast but can crash. Balance is key.' 
    },
    { 
      icon: Briefcase, 
      title: 'Portfolio', 
      desc: 'Your collection of assets.', 
      expanded: 'Your portfolio is your financial "bag". It can contain stocks, gold, bonds, and cash. A diverse bag is a safe bag.' 
    },
    { 
      icon: Activity, 
      title: 'Diversification', 
      desc: 'Don’t put eggs in one basket.', 
      expanded: 'Spread your money across different sectors (IT, Pharma, Auto). If one sector falls, the others keep your profile afloat.' 
    }
  ];

  const scenarios = [
    {
      title: "Market is Red 📉",
      text: "Portfolio dropped 10% because of a global news event. Your chosen stock is fundamentally strong. What to do?",
      options: [
        { label: "Panic Sell", type: "bad", note: "Fear-driven! Selling now locks in your loss." },
        { label: "Hold Tight", type: "neutral", note: "Resilience. If the company is good, it will recover." },
        { label: "Buy More", type: "good", note: "Pro Move. Buying the dip lowers your average cost!" }
      ]
    },
    {
       title: "Stock Hits All-Time High 🚀",
       text: "You have 30% profit. The stock is getting very expensive. What's the move?",
       options: [
         { label: "Book Profit", type: "good", note: "Smart. Never be ashamed to take your winnings home." },
         { label: "All In", type: "bad", note: "FOMO alert! Buying at peak is statistically dangerous." },
         { label: "Trailing SL", type: "good", note: "Master Move. Stay in but exit if it drops 5%." }
       ]
    }
  ];

  const handleScenarioChoice = (option) => {
    setScenarioFeedback(option);
    setTimeout(() => {
        if(activeScenario < scenarios.length - 1) {
            // Wait a bit before next
        }
    }, 2000);
  };

  const handleChartClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Golden Buy Zone: x: 40-50, y: 70-85
    const isHit = x >= 40 && x <= 50 && y >= 70 && y <= 85;
    
    setClickStats(prev => ({ 
      hits: isHit ? prev.hits + 1 : prev.hits, 
      tries: prev.tries + 1 
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-24"
    >
      {/* Hero Header */}
      <header className="text-center max-w-3xl mx-auto space-y-6 pt-12">
        <motion.div 
            initial={{ scale: 1.2, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-3xl bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center mx-auto mb-8"
        >
            <Book className="text-white" size={32} />
        </motion.div>
        <h2 className="text-5xl font-black italic tracking-tighter">Invest<span className="text-blue-500">Academy</span></h2>
        <p className="text-slate-400 text-lg leading-relaxed">
            The bridge between "I'm scared" and "I'm invested". Master the mechanics 
            of wealth through visual, interactive, and gamified logic.
        </p>
      </header>

      {/* 🧩 Fundamentals Section */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
                <h3 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="text-blue-500" /> Stock Fundamentals
                </h3>
                <p className="text-slate-500 text-sm mt-2">Core pillars every investor must master before starting.</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Section 01/06</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundamentals.map((item, i) => (
            <LearningCard key={i} icon={item.icon} title={item.title} desc={item.desc} expandedContent={item.expanded} />
          ))}
        </div>
      </section>

      {/* 📊 Visual Chart Learning */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
                <h3 className="text-3xl font-bold flex items-center gap-3">
                    <TrendingUp className="text-emerald-500" /> Visual Pattern Guide
                </h3>
                <p className="text-slate-500 text-sm mt-2">Identify market cycles at a glance. Visual intuition > Theory.</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50">Section 02/06</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ChartTypeVisual type="uptrend" title="Uptrend 📈" desc="Higher Highs, Higher Lows." />
            <ChartTypeVisual type="downtrend" title="Downtrend 📉" desc="Lower Highs, Lower Lows." />
            <ChartTypeVisual type="sideways" title="Sideways ⚖️" desc="Price is consolidating." />
            <ChartTypeVisual type="volatile" title="Volatile ⚡" desc="High uncertainty & swings." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-8">
            <div className="glass-card flex flex-col justify-between p-10 border-blue-500/20 bg-blue-500/[0.02]">
                <div>
                   <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                       <Zap className="text-blue-400" size={20} /> How to Read Charts
                   </h4>
                   <ul className="space-y-6">
                       <li className="flex gap-4">
                           <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs text-blue-400 font-bold">X</div>
                           <div><p className="font-bold text-sm">X-Axis = Time</p><p className="text-xs text-slate-500">Shows minutes, days, or years.</p></div>
                       </li>
                       <li className="flex gap-4">
                           <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs text-blue-400 font-bold">Y</div>
                           <div><p className="font-bold text-sm">Y-Axis = Price</p><p className="text-xs text-slate-500">Shows how much people are paying.</p></div>
                       </li>
                   </ul>
                </div>
                <div className="mt-12 p-4 bg-white/5 rounded-2xl flex items-center gap-4">
                    <div className="w-3 h-10 bg-emerald-500 rounded shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div><p className="text-xs font-bold uppercase">Pro Tip</p><p className="text-[10px] text-slate-400 leading-tight">Green candle = Price opened low, closed high.</p></div>
                </div>
            </div>

            <div className="glass-card relative overflow-hidden group">
                <div className="p-8 pb-4">
                    <h4 className="text-xl font-bold mb-2">The Winning Entry ✅</h4>
                    <p className="text-xs text-slate-500 italic">"Be greedy when others are fearful."</p>
                </div>
                <div className="p-4 relative">
                   <img src="https://images.unsplash.com/photo-1611974717482-5831ef24a16?auto=format&fit=crop&q=80&w=800&h=400" className="w-full h-48 object-cover rounded-xl brightness-50" alt="Entry Point" />
                   <div className="absolute top-[30%] left-[20%] w-6 h-6 border-2 border-rose-500 rounded-full flex items-center justify-center text-rose-500 font-bold bg-black/50">❌</div>
                   <div className="absolute bottom-[20%] left-[45%] w-10 h-10 border-4 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 font-bold bg-black/50 glow-green">✅</div>
                   <div className="absolute top-[20%] right-[10%] w-6 h-6 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500 font-bold bg-black/50">💰</div>
                </div>
                <div className="p-6 text-xs text-slate-500 text-center uppercase font-mono tracking-widest">Master Zone Identification</div>
            </div>
        </div>
      </section>

      {/* 🎮 Interactive Lab */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
                <h3 className="text-3xl font-bold flex items-center gap-3">
                    <Gamepad2 className="text-blue-500" /> Interactive Lab
                </h3>
                <p className="text-slate-500 text-sm mt-2">Hands-on testing. Every click counts toward your skill score.</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Section 03/06</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature 1: Where Buy? */}
            <div className="glass-card flex flex-col">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold">Challenge: Find the Dip</h4>
                        <p className="text-xs text-slate-500">Click exactly where the trend reverses.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-600">Accuracy</p>
                        <p className="text-xl font-black">{clickStats.tries > 0 ? Math.round((clickStats.hits/clickStats.tries)*100) : 0}%</p>
                    </div>
                </div>
                <div className="relative group p-4 bg-black/40">
                    <img 
                        src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800&h=400" 
                        className="w-full h-64 object-cover rounded-2xl cursor-crosshair opacity-60 group-hover:opacity-100 transition-opacity" 
                        alt="Interaction Chart" 
                        onClick={handleChartClick}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="text-xs font-bold bg-blue-600/20 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30">CLICK TO ANALYZE</div>
                    </div>
                </div>
                <div className="p-4 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={`w-8 h-1.5 rounded-full ${i < clickStats.hits ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{3-clickStats.hits} Challenges Remaining</p>
                </div>
            </div>

            {/* Feature 2: Decision Quiz */}
            <div className="glass-card flex flex-col justify-between">
                <div className="p-8 pb-4">
                  <h4 className="font-bold text-lg mb-2">{scenarios[activeScenario].title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{scenarios[activeScenario].text}</p>
                </div>
                
                <div className="p-8 pt-0 space-y-3">
                    <AnimatePresence mode="wait">
                        {!scenarioFeedback ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                                {scenarios[activeScenario].options.map((opt, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleScenarioChoice(opt)}
                                        className="w-full py-4 px-6 rounded-2xl text-left bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all font-bold group flex justify-between items-center"
                                    >
                                        {opt.label}
                                        <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                className={`p-6 rounded-2xl border-2 ${scenarioFeedback.type === 'good' ? 'border-emerald-500/20 bg-emerald-500/5' : scenarioFeedback.type === 'bad' ? 'border-rose-500/20 bg-rose-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    {scenarioFeedback.type === 'good' ? <CheckCircle2 className="text-emerald-400" /> : scenarioFeedback.type === 'bad' ? <XCircle className="text-rose-400" /> : <HelpCircle className="text-blue-400" />}
                                    <h5 className="font-black uppercase tracking-tight">{scenarioFeedback.type === 'good' ? "Genius Decision" : scenarioFeedback.type === 'bad' ? "Risky Move" : "Steady Hand"}</h5>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed italic">"{scenarioFeedback.note}"</p>
                                <button 
                                    onClick={() => { setScenarioFeedback(null); setActiveScenario((activeScenario + 1) % scenarios.length); }}
                                    className="mt-6 text-xs font-bold text-blue-400 hover:text-white transition-colors"
                                >
                                    NEXT CHALLENGE →
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="p-4 border-t border-white/5 text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">Scenario-Based Logic Tester</div>
            </div>
        </div>
      </section>

      {/* ⚠️ Common Mistakes Section */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
                <h3 className="text-3xl font-bold flex items-center gap-3">
                    <AlertTriangle className="text-rose-500" /> The Danger Zone
                </h3>
                <p className="text-slate-500 text-sm mt-2">70% of beginners lose money here. Learn their mistakes so you don't repeat them.</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-rose-500/50">Section 04/06</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card border-rose-500/10 bg-rose-500/[0.02] p-8">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6"><Flame size={20} /></div>
              <h4 className="font-bold mb-4">Buying At Peak (FOMO)</h4>
              <p className="text-xs text-slate-400">Buying just because the price is high and everyone is talking about it. This is usually when professionals are selling.</p>
           </div>
           <div className="glass-card border-rose-500/10 bg-rose-500/[0.02] p-8">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6"><TrendingDown size={20} /></div>
              <h4 className="font-bold mb-4">Panic Selling</h4>
              <p className="text-xs text-slate-400">Selling the moment the screen goes red. Remember: You only lose money when you click "Sell". Hold if fundamentals are strong.</p>
           </div>
           <div className="glass-card border-rose-500/10 bg-rose-500/[0.02] p-8">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6"><XCircle size={20} /></div>
              <h4 className="font-bold mb-4">Ignoring The Trend</h4>
              <p className="text-xs text-slate-400">Trying to fight the market. If the overall market is falling, wait for a reversal rather than trying to catch a falling knife.</p>
           </div>
        </div>
      </section>

      {/* 📰 Enhanced Market Awareness */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <div>
                <h3 className="text-3xl font-bold mb-2">Market Sentiment</h3>
                <p className="text-sm text-slate-500">Real-time awareness of global events.</p>
            </div>
            <MarketMoodIndicator value={68} />
            <div className="glass-card p-6 bg-gradient-to-r from-blue-500/10 to-transparent">
               <h5 className="font-bold mb-3 flex items-center gap-2 text-blue-400"><Info size={16} /> News Interpretation</h5>
               <p className="text-[11px] text-slate-400 leading-relaxed italic">"News is noise until you understand its impact on specific sectors. IT stocks love US projects, while Oil stocks fluctuate with global conflicts."</p>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xl font-bold px-1">Global Impact Feed</h4>
            <div className="grid grid-cols-1 gap-4">
                {[
                  { cat: "Economy", title: "Global Inflation Cools Down", what: "US Fed hint at potential rate cuts.", why: "Cheap money = High stock prices.", impact: "Bullish", action: "Invest" },
                  { cat: "Energy", title: "Middle-East Tensions Rise", what: "Crude oil supply chains at risk.", why: "Higher costs for manufacturing companies.", impact: "Bearish", action: "Wait" },
                  { cat: "IT Sector", title: "AI Projects Boom in India", what: "Increased hiring in specialized tech.", why: "Potential profit growth for IT giants.", impact: "Bullish", action: "Invest" }
                ].map((news, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold uppercase tracking-widest text-slate-500">{news.cat}</span>
                                <h5 className="font-extrabold text-lg transition-colors group-hover:text-blue-400">{news.title}</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div><p className="text-[10px] uppercase font-bold text-slate-600 mb-1">What happened</p><p className="text-xs text-slate-300">{news.what}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-slate-600 mb-1">Market Impact</p><p className="text-xs text-slate-400">{news.why}</p></div>
                            </div>
                        </div>
                        <div className="flex md:flex-col gap-3 items-center md:items-end border-l border-white/5 pl-6">
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${news.impact === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {news.impact}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">SUGGESTION: <span className="text-white">{news.action}</span></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 🏙️ Real-World Case Study */}
      <section className="glass-card p-12 bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03] border-blue-500/20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
               <h3 className="text-4xl font-black italic mb-4">Case Study: <span className="text-blue-500">RELIANCE</span></h3>
               <p className="text-slate-400 max-w-lg">How to analyze a multi-conglomerate giant. Look for the 'Support' floor and 'Resistance' ceiling.</p>
            </div>
            <div className="flex gap-4">
                <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Volatility</p>
                    <p className="text-xl font-black text-rose-400 underline decoration-rose-400/30">LOW</p>
                </div>
                <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Suitability</p>
                    <p className="text-xl font-black text-emerald-400 underline decoration-emerald-400/30">BEGINNER</p>
                </div>
            </div>
         </div>

         <div className="relative group">
            <div className="absolute -top-6 -left-6 px-4 py-2 bg-blue-600 rounded-full text-xs font-black shadow-2xl z-10 transition-transform group-hover:scale-110">RELIANCE.NS ANALYSIS</div>
            <div className="w-full h-80 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center p-8 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                       { price: 2100 }, { price: 2200 }, { price: 2150 }, { price: 2400 }, 
                       { price: 2350 }, { price: 2600 }, { price: 2550 }, { price: 2800 }
                   ]}>
                        <defs>
                            <linearGradient id="caseStudyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fill="url(#caseStudyGradient)" />
                        {/* Custom Labels for Case Study */}
                   </AreaChart>
                </ResponsiveContainer>
                {/* Visual Label Overlay */}
                <div className="absolute top-[20%] right-[15%] flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-rose-500 glow-red border-4 border-white" />
                    <div className="h-20 w-[1px] bg-rose-500/50 dashed" />
                    <div className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg mt-2 border border-rose-500/30">RESISTANCE (PEAK)</div>
                </div>
                <div className="absolute bottom-[20%] left-[25%] flex flex-col items-center">
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg mb-2 border border-emerald-500/30">SUPPORT (FLOOR)</div>
                    <div className="h-20 w-[1px] bg-emerald-500/50 dashed" />
                    <div className="w-4 h-4 rounded-full bg-emerald-500 glow-green border-4 border-white" />
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 pt-12 border-t border-white/5">
            <div className="space-y-4">
                <h4 className="text-xl font-bold flex items-center gap-2"><ArrowUpRight className="text-emerald-500" /> Key Growth Drivers</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Reliance is expanding into Green Energy and Retail. This diversification makes it a robust "Forever Stock" for long-term investors.</p>
            </div>
            <div className="space-y-4">
                <h4 className="text-xl font-bold flex items-center gap-2"><ArrowDownRight className="text-rose-500" /> Risks to Watch</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Heavy dependence on Government policies and global Oil prices can cause temporary sideways movement.</p>
            </div>
         </div>
      </section>

      {/* 🚀 Footer CTA */}
      <footer className="text-center py-24 glass-card bg-blue-600 shadow-[0_0_100px_rgba(59,130,246,0.2)]">
         <h3 className="text-4xl font-black mb-6">Class Complete! Ready to Trade?</h3>
         <p className="text-blue-100 max-w-xl mx-auto mb-12 opacity-80">You've mastered the fundamentals and read the charts. Now, go put ₹10,000 of virtual cash to work in the simulator.</p>
         <button className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl">
            OPEN SIMULATOR NOW 🚀
         </button>
      </footer>
    </motion.div>
  );
};

// Internal Import Fixes
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Gamepad2, BrainCircuit } from 'lucide-react';

export default Learning;
