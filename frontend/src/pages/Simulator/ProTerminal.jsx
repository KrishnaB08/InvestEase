import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, LineChart, PieChart, Activity, Zap, 
  ShieldCheck, AlertCircle, ShoppingCart, Target, 
  TrendingUp, TrendingDown, Layers, History, Settings,
  BarChart2, Info, ChevronRight, Scale, CheckCircle2
} from 'lucide-react';
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import { fetchChartData, fetchRisk, postTrade } from '../../utils/api';

/* --- CONFIG --- */
const INITIAL_BALANCE = 10000;
const STOCKS_CONFIG = [
  { id: 'rel', symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', volatility: 1.2, trend: 0.1 },
  { id: 'tcs', symbol: 'TCS', name: 'Tata Consultancy', sector: 'IT', volatility: 0.8, trend: 0.05 },
  { id: 'infy', symbol: 'INFOSYS', name: 'Infosys Ltd', sector: 'IT', volatility: 1.5, trend: 0.2 },
  { id: 'hdfc', symbol: 'HDFC BANK', name: 'HDFC Bank', sector: 'Banking', volatility: 1.0, trend: -0.05 },
  { id: 'titan', symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', volatility: 1.3, trend: 0.15 }
];

/* --- SUB-COMPONENT: PRO CHART --- */

const ProTradingChart = ({ data, markers = [], indicators = {} }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const markersPluginRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;
    container.innerHTML = '';

    const chart = createChart(container, {
      layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.02)' }, horzLines: { color: 'rgba(255, 255, 255, 0.02)' } },
      crosshair: { mode: 0, vertLine: { color: '#3b82f6' }, horzLine: { color: '#3b82f6' } },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.05)' },
      timeScale: { borderColor: 'rgba(255, 255, 255, 0.05)' },
      width: container.clientWidth,
      height: 450,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', downColor: '#f43f5e', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#f43f5e',
    });

    if (data && data.length > 0) candlestickSeries.setData(data);
    
    const markersPlugin = createSeriesMarkers(candlestickSeries);
    if (markers && markers.length > 0) markersPlugin.setMarkers(markers);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    markersPluginRef.current = markersPlugin;

    const handleResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data[0]?.id]); // Only re-create if stock changes

  // Update data & markers without re-creating chart
  useEffect(() => {
    if (seriesRef.current && data) {
       seriesRef.current.setData(data);
    }
  }, [data]);

  useEffect(() => {
    if (markersPluginRef.current && markers) {
       markersPluginRef.current.setMarkers(markers);
    }
  }, [markers]);

  return (
    <div className="w-full relative glass-card p-4 overflow-hidden border-blue-500/10 bg-black/40">
      <div className="absolute top-6 left-6 z-10 flex gap-4">
         <div className="px-3 py-1 bg-blue-500 rounded text-[10px] font-black italic tracking-widest">LIVE TERMINAL</div>
         <div className="px-3 py-1 bg-emerald-500/10 rounded text-[10px] font-bold text-emerald-400">YFINANCE CONNECTED</div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};

/* --- MAIN COMPONENT: PRO TERMINAL --- */

const ProTerminal = () => {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('pro_balance')) || INITIAL_BALANCE);
  const [portfolio, setPortfolio] = useState(() => JSON.parse(localStorage.getItem('pro_portfolio')) || {});
  const [ledger, setLedger] = useState(() => JSON.parse(localStorage.getItem('pro_ledger')) || []);
  const [activeStockId, setActiveStockId] = useState(STOCKS_CONFIG[0].id);
  const [stocksData, setStocksData] = useState({});
  const [order, setOrder] = useState({ qty: 1, sl: 0, target: 0 });
  const [feedback, setFeedback] = useState(null);
  const [riskData, setRiskData] = useState(null);

  // Initialize stocks with live yfinance data
  useEffect(() => {
    const fetchLiveHistory = async () => {
      try {
        const liveData = {};
        for (const s of STOCKS_CONFIG) {
           const data = await fetchChartData(s.symbol);
           // Use the last 50 data points from yfinance
           liveData[s.id] = data.slice(-50);
        }
        setStocksData(liveData);
      } catch (err) {
        console.warn("Backend uncontactable. Falling back to Mock Generator.", err);
        const initialData = {};
        STOCKS_CONFIG.forEach(s => {
          let lastPrice = 2000 + Math.random() * 2000;
          const history = [];
          for (let i = 0; i < 50; i++) {
            const open = lastPrice;
            const close = open + (Math.random() - 0.5) * 20;
            const high = Math.max(open, close) + Math.random() * 5;
            const low = Math.min(open, close) - Math.random() * 5;
            history.push({ time: Math.floor(Date.now() / 1000) - (50 - i) * 60, open, high, low, close });
            lastPrice = close;
          }
          initialData[s.id] = history;
        });
        setStocksData(initialData);
      }
    };
    
    fetchLiveHistory();
  }, []);

  // Fetch risk data when stock changes
  useEffect(() => {
    const activeStock = STOCKS_CONFIG.find(s => s.id === activeStockId);
    if (!activeStock) return;

    fetchRisk(activeStock.symbol)
      .then(data => setRiskData(data))
      .catch(err => {
        console.warn("Risk fetch failed:", err);
        setRiskData(null);
      });
  }, [activeStockId]);

  // Tick Engine
  useEffect(() => {
    const interval = setInterval(() => {
      setStocksData(prev => {
        const next = { ...prev };
        STOCKS_CONFIG.forEach(s => {
          const history = [...(next[s.id] || [])];
          if (history.length === 0) return;
          const last = history[history.length - 1];
          
          const open = last.close;
          const close = open + (Math.random() - 0.5) * 15 + s.trend;
          const high = Math.max(open, close) + Math.random() * 4;
          const low = Math.min(open, close) - Math.random() * 4;
          
          next[s.id] = [...history.slice(-100), {
            time: Math.floor(Date.now() / 1000),
            open, high, low, close
          }];
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pro_balance', balance);
    localStorage.setItem('pro_portfolio', JSON.stringify(portfolio));
    localStorage.setItem('pro_ledger', JSON.stringify(ledger));
  }, [balance, portfolio, ledger]);

  const activeStock = STOCKS_CONFIG.find(s => s.id === activeStockId);
  const activeHistory = stocksData[activeStockId] || [];
  const currentPrice = activeHistory[activeHistory.length - 1]?.close || 0;

  const handleTrade = (type) => {
    if (!order.qty || order.qty <= 0) {
       setFeedback({ type: 'error', text: 'Please enter a valid quantity.' });
       setTimeout(() => setFeedback(null), 3000);
       return;
    }

    try {
      const cost = currentPrice * order.qty;
      if (type === 'buy') {
        if (cost > balance) {
          setFeedback({ type: 'error', text: 'Insufficient Capital' });
          setTimeout(() => setFeedback(null), 3000);
          return;
        }
        setBalance(b => b - cost);
        setPortfolio(p => ({
          ...p,
          [activeStockId]: {
            qty: (p[activeStockId]?.qty || 0) + order.qty,
            avg: ((p[activeStockId]?.avg || 0) * (p[activeStockId]?.qty || 0) + cost) / ((p[activeStockId]?.qty || 0) + order.qty)
          }
        }));
        const tradeEntry = { date: new Date().toLocaleTimeString(), symbol: activeStock.symbol, type: 'BUY', price: currentPrice, qty: order.qty, total: -cost };
        setLedger(l => [tradeEntry, ...l]);
        setFeedback({ type: 'success', text: `Order Executed: Bought ${order.qty} ${activeStock.symbol}` });
        
        // Save to backend (MongoDB)
        postTrade({ symbol: activeStock.symbol, type: 'BUY', price: currentPrice, qty: order.qty, total: cost })
          .catch(err => console.warn("Trade save to backend failed:", err));
      } else {
        const owned = portfolio[activeStockId]?.qty || 0;
        if (owned < order.qty) {
          setFeedback({ type: 'error', text: 'Insufficient Shares' });
          setTimeout(() => setFeedback(null), 3000);
          return;
        }
        setBalance(b => b + cost);
        const profit = (currentPrice - (portfolio[activeStockId]?.avg || 0)) * order.qty;
        setPortfolio(p => {
          const next = { ...p, [activeStockId]: { ...p[activeStockId], qty: p[activeStockId].qty - order.qty } };
          if (next[activeStockId].qty <= 0) delete next[activeStockId];
          return next;
        });
        const tradeEntry = { date: new Date().toLocaleTimeString(), symbol: activeStock.symbol, type: 'SELL', price: currentPrice, qty: order.qty, total: cost, profit };
        setLedger(l => [tradeEntry, ...l]);
        setFeedback({ type: 'success', text: `Order Executed: Sold ${order.qty} ${activeStock.symbol}` });
        
        // Save to backend (MongoDB)
        postTrade({ symbol: activeStock.symbol, type: 'SELL', price: currentPrice, qty: order.qty, total: cost, profit })
          .catch(err => console.warn("Trade save to backend failed:", err));
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', text: 'System Error Processing Trade' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const portfolioValue = Object.entries(portfolio).reduce((acc, [id, data]) => {
     const price = stocksData[id]?.slice(-1)[0]?.close || 0;
     return acc + price * data.qty;
  }, 0);

  const totalValue = balance + portfolioValue;
  const totalPL = totalValue - INITIAL_BALANCE;

  return (
    <div className="space-y-8 pb-32">
      {/* 🚀 Terminal Header */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 bg-blue-500/5 group">
           <div className="flex justify-between items-center mb-1">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-1">Buying Power</p>
              <Zap size={12} className="text-blue-400 group-hover:animate-pulse" />
           </div>
           <h3 className="text-2xl font-black italic">₹{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="glass-card p-6 bg-white/[0.02]">
           <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 px-1">Portfolio Valuation</p>
           <h3 className="text-2xl font-black italic">₹{portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
        </div>
        <div className={`glass-card p-6 border-2 flex items-center justify-between ${totalPL >= 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
           <div className="space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-1">Session P/L</p>
              <h3 className={`text-2xl font-black italic ${totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPL >= 0 ? '+' : ''}₹{totalPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h3>
           </div>
           <Activity size={24} className={totalPL >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
        </div>
        <div className="glass-card p-6 flex flex-col justify-center gap-1 border-dashed border-2 border-white/5 bg-transparent">
           <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-1">Decision Score</p>
           <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-400 w-3/4" />
              </div>
              <span className="text-xs font-black text-blue-400 italic">PRO</span>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Module 1: Market Watch & Indicators */}
        <aside className="xl:col-span-1 space-y-6">
           <div className="glass-card p-6 space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-tighter flex items-center gap-2"><Layers size={14} /> Market Watch</h4>
              <nav className="space-y-2">
                 {STOCKS_CONFIG.map(s => {
                    const price = stocksData[s.id]?.slice(-1)[0]?.close || 0;
                    return (
                       <button 
                         key={s.id} onClick={() => setActiveStockId(s.id)}
                         className={`w-full p-4 rounded-xl border transition-all flex justify-between items-center ${
                           activeStockId === s.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
                         }`}
                       >
                          <div className="text-left">
                             <p className="font-bold text-sm tracking-tighter">{s.symbol}</p>
                             <p className="text-[9px] text-slate-500 uppercase">{s.sector}</p>
                          </div>
                          <p className={`text-xs font-black italic ${activeStockId === s.id ? 'text-blue-400' : 'text-slate-200'}`}>₹{price.toFixed(2)}</p>
                       </button>
                    );
                 })}
              </nav>
           </div>

           {/* Live Risk Analyzer */}
           <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-tighter mb-4 flex items-center gap-2"><Scale size={14} /> Risk Analyzer</h4>
              <div className="space-y-4">
                 {riskData ? (
                   <>
                     <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase">Risk Level</span>
                        <span className={`${riskData.risk_level === 'High' ? 'text-rose-400' : riskData.risk_level === 'Medium' ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {riskData.risk_level}
                        </span>
                     </div>
                     <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase">Loss Probability</span>
                        <span className="text-slate-300">{riskData.loss_probability}%</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase">RSI</span>
                        <span className={`${riskData.current_rsi > 70 ? 'text-rose-400' : riskData.current_rsi < 30 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {riskData.current_rsi}
                        </span>
                     </div>
                     <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase">Annual Volatility</span>
                        <span className="text-slate-300">{(riskData.volatility_annual * 100).toFixed(1)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${riskData.risk_level === 'High' ? 'bg-rose-500' : riskData.risk_level === 'Medium' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(riskData.loss_probability, 100)}%` }}
                        />
                     </div>
                   </>
                 ) : (
                   <div className="p-3 bg-black/20 rounded-lg text-[10px] text-slate-400 leading-relaxed italic">
                     Loading risk analysis from backend...
                   </div>
                 )}
              </div>
           </div>
        </aside>

        {/* Module 2: High-Fidelity Chart */}
        <div className="xl:col-span-3 space-y-8">
           <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tighter italic flex items-center gap-3">
                  {activeStock.symbol} <span className="text-xs font-bold text-slate-500 translate-y-1">{activeStock.name}</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                 <Settings size={18} className="text-slate-600 cursor-pointer hover:text-white transition-colors" />
                 {riskData && (
                   <div className={`px-4 py-2 border rounded-full text-[10px] font-black tracking-tighter uppercase ${
                     riskData.current_rsi > 50 
                       ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                       : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                   }`}>
                     RSI: {riskData.current_rsi} • {riskData.current_rsi > 70 ? 'Overbought' : riskData.current_rsi < 30 ? 'Oversold' : riskData.current_rsi > 50 ? 'Bullish' : 'Bearish'}
                   </div>
                 )}
              </div>
           </div>
           
           <ProTradingChart data={activeHistory} />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Executive Panel */}
              <div className="glass-card p-10 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
                 <h4 className="text-lg font-bold mb-8 flex items-center gap-3"><ShoppingCart className="text-blue-500" /> Executive Order Panel</h4>
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Quantity</label>
                          <input 
                            type="number" value={order.qty} onChange={(e) => setOrder({...order, qty: Number(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black"
                          />
                       </div>
                       <div className="space-y-1 opacity-50">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Stop Loss (SL)</label>
                          <div className="relative">
                            <input type="number" disabled placeholder="AUTO" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-rose-500 font-bold" />
                            <Target size={14} className="absolute right-4 top-1/2 -translate-y-1/2" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 bg-black/40 rounded-2xl flex justify-between items-center">
                       <div>
                          <p className="text-[10px] text-slate-600 font-bold uppercase">Estimated Cost</p>
                          <p className="text-xl font-black text-blue-400">₹{(currentPrice * order.qty).toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] text-slate-700 font-bold uppercase">Risk Per Trade</p>
                          <p className="text-xs font-bold text-slate-400">1.2% OF TOTAL</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => handleTrade('buy')} className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/10 transition-all uppercase tracking-widest">Execute Buy</button>
                       <button onClick={() => handleTrade('sell')} className="py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/10 transition-all uppercase tracking-widest">Execute Sell</button>
                    </div>
                 </div>
              </div>

              {/* Trade History Ledger */}
              <div className="glass-card p-10 flex flex-col h-full bg-black/20">
                 <h4 className="text-lg font-bold mb-8 flex items-center gap-3"><History className="text-slate-500" /> Transaction Ledger</h4>
                 <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/5">
                    {ledger.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full opacity-20 py-12">
                          <History size={48} className="mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest">No Transactions Found</p>
                       </div>
                    ) : (
                       ledger.map((t, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{t.type}</span>
                                   <span className="text-[10px] font-bold text-white">{t.symbol}</span>
                                </div>
                                <p className="text-[9px] text-slate-600 font-mono">{t.date} • {t.qty} Shares</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-black text-white italic">₹{Math.abs(t.total).toFixed(2)}</p>
                                {t.profit !== undefined && (
                                   <p className={`text-[9px] font-bold ${t.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {t.profit >= 0 ? '+' : '-'}₹{Math.abs(t.profit).toFixed(2)}
                                   </p>
                                )}
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 💬 Global Executive Feedback */}
      <AnimatePresence>
        {feedback && (
            <motion.div 
               initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
               className={`fixed top-24 right-8 px-8 py-5 rounded-2xl border-2 shadow-2xl z-[200] flex items-center gap-4 backdrop-blur-xl ${feedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'}`}
            >
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedback.type === 'success' ? 'bg-emerald-400/20' : 'bg-rose-400/20'}`}>
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
               </div>
               <div>
                  <h5 className="font-extrabold text-xs uppercase tracking-tighter mb-1">{feedback.type === 'success' ? 'Terminal Message' : 'Critical Warning'}</h5>
                  <p className="text-sm font-medium">{feedback.text}</p>
               </div>
               <button onClick={() => setFeedback(null)} className="ml-4 opacity-50 hover:opacity-100"><Zap size={14} /></button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProTerminal;
