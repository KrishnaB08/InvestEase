import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Briefcase, 
  Activity, Zap, ShieldAlert, BarChart3, PieChart, 
  RefreshCcw, ShoppingCart, HelpCircle, CheckCircle2, 
  XCircle, ChevronRight, Scale
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/* --- MOCK DATA --- */
const INITIAL_STOCKS = [
  { id: 'rel', symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450, change: 0, trend: 'up', risk: 'Low', history: [2400, 2420, 2410, 2430, 2450] },
  { id: 'tcs', symbol: 'TCS', name: 'Tata Consultancy', price: 3800, change: 0, trend: 'sideways', risk: 'Low', history: [3850, 3820, 3810, 3805, 3800] },
  { id: 'infy', symbol: 'INFOSYS', name: 'Infosys Ltd', price: 1620, change: 0, trend: 'up', risk: 'Medium', history: [1580, 1590, 1600, 1610, 1620] },
  { id: 'zom', symbol: 'ZOMATO', name: 'Zomato Ltd', price: 155, change: 0, trend: 'volatile', risk: 'High', history: [140, 160, 145, 158, 155] },
  { id: 'hdfc', symbol: 'HDFC', name: 'HDFC Bank', price: 1420, change: 0, trend: 'down', risk: 'Low', history: [1480, 1460, 1450, 1440, 1420] }
];

/* --- SUB-COMPONENTS --- */

const StockCard = ({ stock, onBuy, onSell, ownedQuantity }) => {
  const isUp = stock.change >= 0;
  
  const getSuggestion = () => {
    if (stock.trend === 'up' && stock.change < 1) return { text: "Good Buy / Accumulate", color: "text-emerald-400" };
    if (stock.change > 4) return { text: "Profit Booking Zone", color: "text-rose-400" };
    if (stock.risk === 'High' && stock.trend === 'volatile') return { text: "High Volatility - Wait", color: "text-blue-400" };
    return { text: "Hold / Observed", color: "text-slate-500" };
  };

  const suggestion = getSuggestion();

  return (
    <motion.div 
      layout
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col justify-between border-white/5 hover:border-blue-500/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{stock.symbol}</h4>
          <p className="text-[10px] text-slate-500 uppercase font-mono">{stock.name}</p>
        </div>
        <div className={`text-right ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          <p className="text-xl font-black italic">₹{stock.price.toFixed(2)}</p>
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(stock.change).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-16 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stock.history.map((h, i) => ({ val: h }))}>
            <defs>
              <linearGradient id={`grad-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={isUp ? "#10b981" : "#f43f5e"} 
              fill={`url(#grad-${stock.id})`} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div>
           <p className="text-[9px] font-bold text-slate-600 uppercase">Risk Level</p>
           <p className={`text-xs font-black ${stock.risk === 'High' ? 'text-rose-500' : stock.risk === 'Medium' ? 'text-blue-400' : 'text-emerald-500'}`}>{stock.risk}</p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-bold text-slate-600 uppercase">Expert Advice</p>
           <p className={`text-xs font-bold italic ${suggestion.color}`}>{suggestion.text}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onBuy(stock)}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={14} /> BUY
        </button>
        {ownedQuantity > 0 && (
          <button 
            onClick={() => onSell(stock)}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs transition-all"
          >
            SELL ({ownedQuantity})
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* --- MAIN INTERACTIVE SIMULATOR --- */

const InteractiveSimulator = () => {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('sim_balance')) || 10000);
  const [portfolio, setPortfolio] = useState(() => JSON.parse(localStorage.getItem('sim_portfolio')) || {});
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [trades, setTrades] = useState(0);
  const [activeModal, setActiveModal] = useState(null); // { type, stock }
  const [amount, setAmount] = useState(1);
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sim_balance', balance);
    localStorage.setItem('sim_portfolio', JSON.stringify(portfolio));
  }, [balance, portfolio]);

  // Real-time Simulation Engine
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        let drift = 0;
        if (stock.trend === 'up') drift = 0.5;
        if (stock.trend === 'down') drift = -0.5;
        if (event?.type === 'crash') drift = -5;
        if (event?.type === 'boom' && stock.risk === 'High') drift = 8;

        const variation = (Math.random() - 0.5) * (stock.risk === 'High' ? 4 : 1.5) + drift;
        const newPrice = Math.max(1, stock.price * (1 + variation / 100));
        const newHistory = [...stock.history.slice(-20), newPrice];

        return {
          ...stock,
          price: newPrice,
          change: ((newPrice - stock.history[0]) / stock.history[0]) * 100,
          history: newHistory
        };
      }));

      // Random Market Event Trigger (5% chance every tick)
      if (Math.random() < 0.05 && !event) {
        const types = [
            { id: 'crash', title: 'MARKET CRASH!', desc: 'Inflation data is worse than expected. Investors are panicking.', color: 'rose' },
            { id: 'boom', title: 'SECTOR BOOM!', desc: 'New global tech policy announced. High-risk stocks are manual-mooning.', color: 'emerald' }
        ];
        const selected = types[Math.floor(Math.random() * types.length)];
        setEvent(selected);
        setTimeout(() => setEvent(null), 10000);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [event]);

  const handleBuy = (stock) => {
    const cost = stock.price * amount;
    if (cost > balance) {
        setFeedback({ type: 'error', text: 'Insufficient resources! Try SIP (smaller regular amounts).' });
        return;
    }
    
    setBalance(prev => prev - cost);
    setPortfolio(prev => ({
        ...prev,
        [stock.id]: (prev[stock.id] || 0) + amount
    }));
    setTrades(t => t + 1);
    setFeedback({ type: 'success', text: `Purchased ${amount} shares of ${stock.symbol}. Smart accumulation!` });
    setActiveModal(null);
  };

  const handleSell = (stock) => {
    const owned = portfolio[stock.id] || 0;
    if (owned < amount) {
        setFeedback({ type: 'error', text: "You don't own enough shares to sell this much." });
        return;
    }

    const proceeds = stock.price * amount;
    setBalance(prev => prev + proceeds);
    setPortfolio(prev => {
        const next = { ...prev, [stock.id]: prev[stock.id] - amount };
        if (next[stock.id] <= 0) delete next[stock.id];
        return next;
    });
    setFeedback({ type: 'success', text: `Sold ${amount} shares. Profits locked! 💰` });
    setActiveModal(null);
  };

  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((acc, [id, qty]) => {
        const stock = stocks.find(s => s.id === id);
        return acc + (stock?.price || 0) * qty;
    }, 0);
  };

  const portfolioValue = calculatePortfolioValue();
  const totalValue = balance + portfolioValue;
  const totalProfit = totalValue - 10000;
  const isProfit = totalProfit >= 0;

  return (
    <div className="space-y-12">
      {/* 🏛️ Top Portfolio Bar */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-transparent">
           <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">CASH BALANCE</p>
           <h3 className="text-3xl font-black italic">₹{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="glass-card p-6 border-blue-500/20">
           <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">PORTFOLIO VALUATION</p>
           <h3 className="text-3xl font-black italic">₹{portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
        </div>
        <div className={`glass-card p-6 border-2 flex items-center justify-between ${isProfit ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
           <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">TOTAL P/L</p>
              <h3 className={`text-3xl font-black italic ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? '+' : ''}₹{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h3>
           </div>
           {isProfit ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
        </div>
        <div className="glass-card p-6 flex items-center justify-between bg-white/[0.02]">
           <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">SKILL LEVEL</p>
              <h3 className="text-xl font-bold uppercase tracking-tighter">
                {trades < 5 ? 'Beginner' : trades < 15 ? 'Intermediate' : 'Advanced'}
              </h3>
           </div>
           <Award className="text-blue-400" />
        </div>
      </section>

      {/* 📰 Live Market Event */}
      <AnimatePresence>
        {event && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`p-6 rounded-3xl border-2 flex items-center gap-6 ${event.color === 'rose' ? 'bg-rose-500/10 border-rose-500/30 glow-red' : 'bg-emerald-500/10 border-emerald-500/30 glow-green'}`}
          >
             <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${event.color === 'rose' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {event.color === 'rose' ? <ShieldAlert size={28} /> : <Zap size={28} />}
             </div>
             <div>
                <h4 className="font-extrabold text-xl">{event.title}</h4>
                <p className="text-slate-400 text-sm leading-tight italic">"{event.desc}"</p>
             </div>
             <div className="ml-auto text-[10px] font-mono font-bold uppercase tracking-widest opacity-50">Event Active</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 Stock Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map(stock => (
          <StockCard 
            key={stock.id} 
            stock={stock} 
            ownedQuantity={portfolio[stock.id] || 0}
            onBuy={() => { setActiveModal({ type: 'buy', stock }); setAmount(1); }}
            onSell={() => { setActiveModal({ type: 'sell', stock }); setAmount(1); }}
          />
        ))}
      </section>

      {/* 💎 Portfolio Analysis Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03]">
           <div className="flex justify-between items-center mb-10">
              <h4 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="text-blue-500" /> Strategic Analysis</h4>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{trades} TRADES EXECUTED</div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 px-1">Winning Probability</p>
                    <div className="flex items-center gap-4">
                       <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: isProfit ? '72%' : '44%' }} 
                            className={`h-full ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          />
                       </div>
                       <span className="text-lg font-black">{isProfit ? '72%' : '44%'}</span>
                    </div>
                 </div>
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                    <h5 className="font-bold text-xs flex items-center gap-2"><Zap size={14} className="text-blue-400" /> Game Feedback</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        {totalProfit > 2000 ? "You're demonstrating exit discipline. Booking profits during rises is an advanced skill." : 
                         totalProfit < -1000 ? "Caution: Chasing 'High Risk' stocks during volatility is hurting your bankroll." : 
                         portfolioValue === 0 ? "You are 100% in cash. Consider a 'SIP' model by investing small amounts into Low Risk stocks." : 
                         "Steady performance. Try diversifying into more sectors to reduce impact from single events."}
                    </p>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-4 text-slate-400">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Activity size={20} /></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-widest">Decision Accuracy</p><p className="text-xl font-bold text-white">92.5%</p></div>
                 </div>
                 <button className="w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-xs font-bold transition-all text-slate-500" onClick={() => { setBalance(10000); setPortfolio({}); setTrades(0); }}>
                    RESET SIMULATION ENGINE
                 </button>
              </div>
           </div>
        </div>

        <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 border-white/5 bg-transparent">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><Scale size={32} /></div>
            <h4 className="text-xl font-bold">Emotional Resilience Trainer</h4>
            <p className="text-slate-500 text-xs leading-relaxed">The simulator tracks how you react to "Market Crashes". Surviving a 15% drop without panic-selling is the goal.</p>
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <p className="text-[10px] font-mono text-slate-600 uppercase">2 of 3 Crashes Survived</p>
        </div>
      </section>

      {/* 🏷️ Trade Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-card max-w-sm w-full p-10 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            >
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">
                {activeModal.type === 'buy' ? 'Initialize Buy' : 'Confirm Sale'}
              </h3>
              <p className="text-slate-500 text-sm mb-8 font-mono">{activeModal.stock.symbol} • Entry Price: ₹{activeModal.stock.price.toFixed(2)}</p>
              
              <div className="space-y-6 mb-10">
                 <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity of Shares</label>
                       <span className="text-white font-bold">{amount}</span>
                    </div>
                    <input 
                      type="range" min="1" max="50" step="1" 
                      value={amount} 
                      onChange={(e) => setAmount(Number(e.target.value))} 
                      className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-full cursor-pointer"
                    />
                 </div>
                 
                 <div className="p-4 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Order Value:</span>
                        <span className="text-white font-bold">₹{(activeModal.stock.price * amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Post-Trade Balance:</span>
                        <span className="text-blue-400 font-bold">
                            ₹{(activeModal.type === 'buy' ? balance - (activeModal.stock.price * amount) : balance + (activeModal.stock.price * amount)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setActiveModal(null)} className="py-4 text-xs font-bold text-slate-500 hover:text-white transition-all uppercase">Cancel</button>
                 <button 
                   onClick={() => activeModal.type === 'buy' ? handleBuy(activeModal.stock) : handleSell(activeModal.stock)} 
                   className={`py-4 rounded-2xl font-black text-xs transition-all shadow-xl ${activeModal.type === 'buy' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'} text-white uppercase tracking-widest`}
                 >
                   Confirm Order
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💬 Global Feedback Toast */}
      <AnimatePresence>
        {feedback && (
            <motion.div 
               initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
               className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full border-2 shadow-2xl z-[200] flex items-center gap-3 backdrop-blur-xl ${feedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'}`}
            >
               {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
               <span className="text-sm font-bold">{feedback.text}</span>
               <button onClick={() => setFeedback(null)} className="ml-4 opacity-50 hover:opacity-100"><Zap size={14} /></button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal Import Fixes
import { Award, Gamepad2 } from 'lucide-react';

export default InteractiveSimulator;
