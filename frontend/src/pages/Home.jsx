import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, Shield, TrendingUp, TrendingDown,
  BrainCircuit, Gamepad2, Target, Calculator, Rocket, 
  Layers, ChevronRight, Sparkles, Building2, Wallet,
  Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import { fetchStockStats, fetchStockCAGR } from '../utils/api';

const Home = ({ stocks = [] }) => {
  const [tickerData, setTickerData] = useState([]);
  const [tickerLoading, setTickerLoading] = useState(true);
  const [activeHover, setActiveHover] = useState(null);

  // Dream Calculator State
  const [goalName, setGoalName] = useState("Home for my Parents");
  const [seedAmount, setSeedAmount] = useState(50000);
  const [years, setYears] = useState(15);
  const [growthType, setGrowthType] = useState('Balanced');

  const growthRates = {
    'Conservative': 0.08,
    'Balanced': 0.12,
    'Visionary': 0.18
  };

  const [bucketRates, setBucketRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(false);

  // Curated Buckets Data (Template)
  const buckets = useMemo(() => ({
    'Conservative': [
      { name: 'Nippon India Gold ETF', symbol: 'GOLDBEES', type: 'ETF', weight: 0.30, risk: 'Low', color: '#f59e0b' },
      { name: 'Nifty 50 ETF', symbol: 'NIFTYBEES', type: 'ETF', weight: 0.20, risk: 'Low', color: '#10b981' },
      { name: 'HDFC Corporate Debt', symbol: 'DEBT_MF', type: 'Mutual Fund', weight: 0.20, risk: 'Low', color: '#6366f1' },
      { name: 'HDFC Bank', symbol: 'HDFCBANK', type: 'Stock', weight: 0.15, risk: 'Stable', color: '#3b82f6' },
      { name: 'TCS', symbol: 'TCS', type: 'Stock', weight: 0.15, risk: 'Stable', color: '#a855f7' },
    ],
    'Balanced': [
      { name: 'Parag Parikh Flexi Cap', symbol: 'FLEXI_MF', type: 'Mutual Fund', weight: 0.25, risk: 'Moderate', color: '#a855f7' },
      { name: 'Nifty 50 ETF', symbol: 'NIFTYBEES', type: 'ETF', weight: 0.25, risk: 'Low', color: '#10b981' },
      { name: 'Reliance Industries', symbol: 'RELIANCE', type: 'Stock', weight: 0.20, risk: 'Moderate', color: '#3b82f6' },
      { name: 'ICICI Bank', symbol: 'ICICIBANK', type: 'Stock', weight: 0.15, risk: 'Moderate', color: '#6366f1' },
      { name: 'Mirae Asset Large Cap', symbol: 'LARGE_MF', type: 'Mutual Fund', weight: 0.15, risk: 'Low', color: '#f59e0b' },
    ],
    'Visionary': [
      { name: 'Quant Small Cap Fund', symbol: 'SMALL_MF', type: 'Mutual Fund', weight: 0.30, risk: 'High Return', color: '#f43f5e' },
      { name: 'Tata Motors', symbol: 'TATAMOTORS', type: 'Stock', weight: 0.20, risk: 'High Return', color: '#3b82f6' },
      { name: 'Zomato', symbol: 'ZOMATO', type: 'Stock', weight: 0.20, risk: 'High Return', color: '#f59e0b' },
      { name: 'Nifty Alpha 50 ETF', symbol: 'ALPHA_ETF', type: 'ETF', weight: 0.15, risk: 'High Return', color: '#10b981' },
      { name: 'HAL', symbol: 'HAL', type: 'Stock', weight: 0.15, risk: 'High Return', color: '#a855f7' },
    ]
  }), []);

  // Fetch Live CAGR for the current bucket
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      const currentSymbols = buckets[growthType].map(a => a.symbol);
      const newRates = { ...bucketRates };
      
      for (const symbol of currentSymbols) {
        if (!newRates[symbol]) {
          try {
            const data = await fetchStockCAGR(symbol);
            newRates[symbol] = data.cagr;
          } catch (err) {
            newRates[symbol] = 0.12; // Fallback
          }
        }
      }
      setBucketRates(newRates);
      setRatesLoading(false);
    };
    fetchRates();
  }, [growthType, buckets]);

  // Projected Growth Data for Multi-Line Chart
  const chartData = useMemo(() => {
    const data = [];
    const currentBucket = buckets[growthType];
    
    for (let i = 0; i <= years; i++) {
      const yearPoint = { year: `Y${i}` };
      let total = 0;
      
      currentBucket.forEach(asset => {
        const principal = seedAmount * asset.weight;
        const rate = bucketRates[asset.symbol] || 0.12;
        const balance = principal * Math.pow(1 + rate, i);
        yearPoint[asset.symbol] = Math.round(balance);
        total += balance;
      });
      
      yearPoint.Total = Math.round(total);
      data.push(yearPoint);
    }
    return data;
  }, [seedAmount, years, growthType, buckets, bucketRates]);

  const totalFutureValue = chartData[chartData.length - 1].Total;

  // Fetch live prices for ticker
  useEffect(() => {
    if (stocks.length === 0) {
      setTickerLoading(false);
      return;
    }

    const fetchPrices = async () => {
      try {
        const subset = stocks.slice(0, 8);
        const results = [];
        for (const symbol of subset) {
          try {
            const stats = await fetchStockStats(symbol);
            results.push({
              symbol: symbol,
              price: stats.current_price,
              change: stats.avg_daily_return
            });
          } catch (e) { }
        }
        setTickerData(results);
      } catch (err) {
        console.error("Ticker fetch error:", err);
      }
      setTickerLoading(false);
    };

    fetchPrices();
  }, [stocks]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-16"
    >
      {/* HERO SECTION */}
      <div className="space-y-6 pt-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-fit px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest"
        >
          <Rocket size={14} /> The Financial Strategy Architect
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
          Design your <br />
          <span className="gradient-text italic">Wealth Roadmap</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Move from decision paralysis to confident action. 
          Visualize exactly how each asset builds the foundation for your family's dreams.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/ai-advisor" className="neo-btn-primary flex items-center gap-2 text-lg">
            Consult AI Architect <ArrowRight size={20} />
          </Link>
          <Link to="/simulate" className="neo-btn-outline flex items-center gap-2 text-lg">
            Practice Market Cycles <TrendingUp size={20} />
          </Link>
        </div>
      </div>

      {/* THE GRANULAR PROGRESS HORIZON SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="w-full max-w-7xl mx-auto glass-card p-1 pb-1 shadow-[0_40px_100px_rgba(16,185,129,0.05)] overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Inputs side */}
          <div className="lg:col-span-3 p-8 text-left space-y-8 bg-slate-50/50 border-r border-slate-100">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Calculator size={20} />
              <h3 className="text-lg font-black uppercase tracking-tighter">Goal Parameters</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Your Dream</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Seed Investment (₹)</label>
                <input
                  type="number"
                  value={seedAmount}
                  onChange={(e) => setSeedAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                />
                {seedAmount < 10000 && <p className="text-[9px] text-rose-500 font-bold mt-2 uppercase">Min. ₹10,000 for Granular Analysis</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Horizon (Years)</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Philosophy</label>
                <div className="flex gap-2">
                  {Object.keys(buckets).map(type => (
                    <button
                      key={type}
                      onClick={() => setGrowthType(type)}
                      className={`flex-1 py-3 px-1 rounded-xl text-[9px] font-black uppercase transition-all border ${growthType === type ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Projected Total Wealth</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">₹{totalFutureValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Multi-Line Chart Side */}
          <div className="lg:col-span-7 p-8 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <LineChart size={14} /> Granular Progress Horizon
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-1 bg-emerald-600 rounded-full" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Growth Paths</span>
                </div>
                <div className="px-2 py-1 bg-slate-50 rounded border border-slate-200 text-[8px] font-black text-slate-500 uppercase flex items-center gap-1">
                   <Info size={10}/> Hover items to highlight
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }}
                  />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(val, name) => [`₹${val.toLocaleString()}`, name]}
                  />
                  {/* Base Total Area for context */}
                  <Line 
                    type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={4} strokeOpacity={0.1} dot={false} 
                  />
                  
                  {/* Individual Active Lines */}
                  {buckets[growthType].map((asset, idx) => (
                    <Line
                      key={asset.symbol}
                      type="monotone"
                      dataKey={asset.symbol}
                      stroke={asset.color}
                      strokeWidth={activeHover === asset.symbol ? 4 : 2}
                      strokeOpacity={activeHover ? (activeHover === asset.symbol ? 1 : 0.15) : 0.6}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      animationDuration={1000 + idx * 200}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 p-4 bg-emerald-50/50 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                     <TrendingUp size={20}/>
                  </div>
                  <div className="text-left">
                     <p className="text-[9px] font-black text-emerald-700 uppercase">Architecture Insight</p>
                     <p className="text-[11px] font-bold text-slate-600">Your visionary assets are currently outpacing the baseline by <span className="text-emerald-600">{(growthRates[growthType]*100).toFixed(0)}%</span> per annum.</p>
                  </div>
               </div>
               <Link to="/ai-advisor" className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1 hover:underline">
                  View Full Verdict <ChevronRight size={12}/>
               </Link>
            </div>
          </div>

          {/* Bucket details side (Legend) */}
          <div className="lg:col-span-2 p-6 bg-slate-50/50 border-l border-slate-100 flex flex-col space-y-4 max-h-[550px] overflow-y-auto">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                <Layers size={14} /> The Bucket
             </h4>
             
             {seedAmount >= 10000 ? (
               buckets[growthType].map((item, idx) => (
                 <Link 
                   to={`/ai-advisor?symbol=${item.symbol}`}
                   key={idx}
                   onMouseEnter={() => setActiveHover(item.symbol)}
                   onMouseLeave={() => setActiveHover(null)}
                   className={`p-4 rounded-2xl bg-white border transition-all flex flex-col justify-between text-left group ${activeHover === item.symbol ? 'border-emerald-500 shadow-md scale-[1.02] -translate-x-1' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                 >
                   <div className="mb-2">
                      <div className="flex justify-between items-start mb-2">
                         {item.type === 'Stock' ? <Building2 size={14} className="text-blue-500"/> : 
                          item.type === 'ETF' ? <TrendingUp size={14} className="text-emerald-500"/> : 
                          <Wallet size={14} className="text-purple-500"/>}
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      </div>
                      <h5 className="text-[9px] font-black text-slate-900 leading-tight truncate">{item.name}</h5>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{item.symbol}</p>
                   </div>
                   <div className="flex justify-between items-center text-[8px] font-black">
                      <span className="text-emerald-600">{item.weight * 100}%</span>
                      <span className="text-slate-400 uppercase">Rate: {(item.rate * 100).toFixed(0)}%</span>
                   </div>
                 </Link>
               ))
             ) : (
               <div className="flex-1 flex items-center justify-center text-center opacity-40">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Increase Seed for Bucket</p>
               </div>
             )}
          </div>
        </div>
      </motion.div>

      {/* FEATURES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pb-20">
        {[
          { icon: Shield, title: 'Health Scoring', desc: 'We assign a Stability Code (0-100) to every asset based on fundamental integrity.' },
          { icon: BrainCircuit, title: 'Architect AI', desc: 'Gemini analyzes news, earnings, and cycles to build your personal roadmap.' },
          { icon: Gamepad2, title: 'Market Simulator', desc: 'Rehearse market cycles in a risk-free environment. Learn the rhythm of growth.' }
        ].map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card flex flex-col items-center p-8 hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:rotate-12 transition-transform">
                <Icon size={28} />
              </div>
              <h3 className="text-lg font-black mb-3 text-slate-900 uppercase tracking-tighter">{feat.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{feat.desc}</p>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
};

export default Home;
