import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';

const Simulator = ({ API_BASE, stock }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isCrashed, setIsCrashed] = useState(false);
  const [userAction, setUserAction] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [initialValue] = useState(10000);

  const startSim = async () => {
    setLoading(true);
    setIsCrashed(false);
    setTimeLeft(90);
    setUserAction(null);
    setPortfolioValue(10000);
    
    try {
      const res = await axios.post(`${API_BASE}/simulate`, {
        symbol: stock,
        investment: 10000
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (data && timeLeft > 0 && !isCrashed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (data && timeLeft === 0 && !isCrashed) {
      triggerCrash();
    }
  }, [timeLeft, data, isCrashed]);

  const triggerCrash = () => {
    setIsCrashed(true);
    setPortfolioValue(prev => prev * 0.82);
    // Add temporary shake effect to root
    const root = document.getElementById('root');
    root.classList.add('animate-shake');
    setTimeout(() => root.classList.remove('animate-shake'), 1000);
  };

  const handleAction = (action) => {
    setUserAction(action);
  };

  const currentProfit = portfolioValue - initialValue;
  const isProfit = currentProfit >= 0;

  if (!data && !loading) return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card text-center py-24 flex flex-col items-center border-dashed border-2 border-white/5"
    >
      <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-8 border border-blue-500/30">
        <TrendingUp size={40} />
      </div>
      <h2 className="text-3xl font-bold mb-4">Start Your Exposure Session</h2>
      <p className="text-slate-400 mb-10 max-w-sm">Experience 90 days of market movement in 90 seconds. Survive the crash to build resilience.</p>
      <button onClick={startSim} className="neo-btn-primary px-12 py-4 text-lg">Initialize Simulation</button>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Simulation Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card h-[450px] relative overflow-hidden">
          <div className="absolute top-6 left-6 z-10">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              Live Price Path: {stock}
            </h3>
          </div>
          <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
             <div className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter">
                Session Progress: <span className={timeLeft < 10 ? 'text-rose-500' : 'text-blue-400'}>{timeLeft}s Left</span>
             </div>
          </div>
          
          <div className="w-full h-full pt-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.paths[0]?.map((val, i) => ({ day: i, price: val }))}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  strokeWidth={3}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`glass-card p-8 border-2 transition-all duration-500 ${isProfit ? 'border-emerald-500/20 glow-green' : 'border-rose-500/20 glow-red'}`}>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Estimated {isProfit ? 'Profit' : 'Loss'}</p>
             <motion.h4 
               key={portfolioValue}
               initial={{ scale: 1.2, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={`text-4xl font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}
             >
               {isProfit ? '+' : ''}₹{currentProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </motion.h4>
             <p className="text-slate-500 text-[10px] mt-4 font-mono">Current Valuation: ₹{portfolioValue.toLocaleString()}</p>
          </div>

          <div className="glass-card flex flex-col justify-between items-start gap-4 p-8">
             <div>
               <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Statistical Worst Case</p>
               <h5 className="text-xl font-bold text-rose-500">₹{data?.stats.worst.toLocaleString()}</h5>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '100%' }} 
                  transition={{ duration: 90, ease: 'linear' }}
                  className="h-full bg-blue-500" 
                />
             </div>
             <button onClick={startSim} className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                <RefreshCw size={14} /> Restart Session
             </button>
          </div>
        </div>
      </div>

      {/* Emotion Training Popup */}
      <AnimatePresence>
        {isCrashed && !userAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card max-w-lg w-full p-10 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center space-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mx-auto glow-red animate-pulse">
                <ShieldAlert size={48} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-rose-500 mb-2 italic">MARKET CRASH!</h2>
                <p className="text-slate-400 text-lg">The screen is red. News channels are yelling 'Recession'. You are down 18% in seconds. This is where fear takes over.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('sell')} 
                  className="py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all"
                >
                  PANIC SELL
                </button>
                <button 
                  onClick={() => handleAction('hold')} 
                  className="py-4 rounded-2xl border border-white/20 hover:bg-white/5 text-white font-bold transition-all"
                >
                  HOLD STEADY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <AnimatePresence>
        {userAction && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-10 border-2 ${userAction === 'hold' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}
          >
            <h3 className="text-2xl font-bold mb-4">{userAction === 'hold' ? '🎉 Psychological Win!' : '🛡️ Safety Priority'}</h3>
            <p className="text-slate-300 leading-relaxed max-w-3xl">
              {userAction === 'hold' ? 
                'History shows that most massive gains happen in the 6 months following a crash. By holding steady, your portfolio eventually recovered and outpaced those who panic-sold.' : 
                'Protecting your capital is important, but panic-selling locked in your losses. A seasoned investor uses crashes to "Buy the Dip" rather than exiting in fear.'}
            </p>
            <button onClick={startSim} className="mt-8 neo-btn-outline">New Session</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Simulator;
