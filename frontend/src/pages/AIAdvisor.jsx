import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BrainCircuit, ShieldCheck, Timer, AlertCircle, 
  ThumbsUp, ThumbsDown, ArrowRight, Zap, TrendingUp,
  TrendingDown, Activity, Settings, CheckCircle2, XCircle, ChevronRight, BarChart3, Newspaper, LineChart, Database, ExternalLink
} from 'lucide-react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { fetchAIAdvice, fetchChartData, fetchNews } from '../utils/api';

/* --- SUB-COMPONENT: AI Candlestick Chart --- */
const AICandlestickChart = ({ data, entryPoints }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;
    const container = chartContainerRef.current;
    container.innerHTML = '';

    const chart = createChart(container, {
      layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.02)' }, horzLines: { color: 'rgba(255, 255, 255, 0.02)' } },
      crosshair: { mode: 0, vertLine: { color: '#3b82f6' }, horzLine: { color: '#3b82f6' } },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.05)' },
      timeScale: { borderColor: 'rgba(255, 255, 255, 0.05)' },
      width: container.clientWidth,
      height: 350,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', downColor: '#f43f5e', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#f43f5e',
    });

    series.setData(data);

    // Add Strategy Price Lines
    if (entryPoints) {
      series.createPriceLine({ price: entryPoints.target, color: '#10b981', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'TARGET' });
      series.createPriceLine({ price: entryPoints.entryZone, color: '#3b82f6', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'ENTRY' });
      series.createPriceLine({ price: entryPoints.stopLoss, color: '#f43f5e', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'STOP LOSS' });
    }

    const handleResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, entryPoints]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[350px]" />;
};

/* --- MAIN COMPONENT --- */
const AIAdvisor = () => {
  const [ticker, setTicker] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [realNews, setRealNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      // Fetch live AI Advice from Claude via FastAPI
      const analysisData = await fetchAIAdvice(ticker.toUpperCase());
      
      if (analysisData.error) {
         console.error("AI Error:", analysisData.error);
         setLoading(false);
         return;
      }
      
      // Fetch Live OHLC Data from yfinance via FastAPI
      try {
          const chartData = await fetchChartData(ticker.toUpperCase());
          analysisData.chart = {
              data: chartData,
              entryPoints: analysisData.entryPoints
          };
      } catch (err) {
          console.error("Failed to fetch YFinance chart", err);
          analysisData.chart = { data: [], entryPoints: analysisData.entryPoints };
      }

      // Fetch real news
      try {
          const newsData = await fetchNews(ticker.toUpperCase());
          setRealNews(newsData.news || []);
      } catch (err) {
          console.error("Failed to fetch news", err);
          setRealNews([]);
      }

      setAnalysis(analysisData);
    } catch (err) {
      console.error("Backend Connection Error", err);
      alert("Error connecting to Python backend. Is it running on port 8000?");
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="space-y-12 max-w-[1400px] mx-auto pb-32"
    >
      <header className="text-center space-y-4 pt-4">
        <motion.div 
          initial={{ y: -20 }} animate={{ y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em]"
        >
          <BrainCircuit size={16} /> Advanced Institutional AI
        </motion.div>
        <h2 className="text-5xl font-black italic tracking-tighter">Decision <span className="text-blue-500">Support</span> System</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Get objective, datadriven analysis on any asset. Understand exactly why you should invest, how much risk is involved, and where to set your exits.</p>
      </header>

      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <div className="glass-card flex items-center p-2 shadow-[0_0_40px_rgba(59,130,246,0.1)] border-blue-500/30">
          <div className="pl-4 text-slate-500"><Search size={24} /></div>
          <input 
            type="text" 
            placeholder="Search Stock (e.g. RELIANCE, TCS, AAPL)..." 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && getAdvice()}
            className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold p-4 uppercase placeholder:text-slate-600 outline-none text-white"
          />
          <button 
            onClick={getAdvice}
            disabled={loading}
            className="neo-btn-primary px-8 py-4 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? "Computing..." : "Run Analysis"} <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analysis && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Top Analysis Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               <div className="glass-card p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 flex flex-col justify-center border-blue-500/20">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{analysis.sector}</p>
                   <h2 className="text-4xl font-black italic mb-2">{analysis.ticker}</h2>
                   <p className="text-sm font-bold text-slate-400 mb-6">{analysis.name}</p>
                   <div>
                       <p className="text-[10px] uppercase text-slate-500 font-bold">Current Valuation</p>
                       <p className="text-2xl font-bold text-white">₹{analysis.price?.toLocaleString()}</p>
                   </div>
               </div>

               <div className="glass-card p-6 lg:col-span-2 border-white/5 space-y-6">
                   <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest"><Settings size={14} /> Technical Engine</h4>
                   <div className="grid grid-cols-3 gap-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Trend</p>
                           <p className={`text-sm font-black uppercase ${analysis.technical?.trend === 'Uptrend' ? 'text-emerald-400' : analysis.technical?.trend === 'Downtrend' ? 'text-rose-400' : 'text-blue-400'}`}>{analysis.technical?.trend}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Volatility</p>
                           <p className={`text-sm font-black uppercase ${analysis.technical?.volatility === 'Low' ? 'text-emerald-400' : analysis.technical?.volatility === 'High' ? 'text-rose-400' : 'text-slate-300'}`}>{analysis.technical?.volatility}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Momentum</p>
                           <p className={`text-sm font-black uppercase ${analysis.technical?.momentum === 'Strong' ? 'text-blue-400' : 'text-slate-400'}`}>{analysis.technical?.momentum}</p>
                       </div>
                   </div>
                   <div className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-blue-500">
                       <p className="text-[11px] text-slate-400 italic font-medium leading-relaxed">"{analysis.explanation}"</p>
                   </div>
               </div>

               <div className={`glass-card p-8 flex flex-col justify-center items-center text-center border-2 border-dashed ${
                    analysis.decisionInfo?.action === 'Invest' ? 'border-emerald-500/30 glow-green' : 
                    analysis.decisionInfo?.action === 'Wait' ? 'border-blue-500/30 glow-blue' : 
                    'border-rose-500/30 glow-red'
               }`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Final Verdict</p>
                    <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center ${
                         analysis.decisionInfo?.action === 'Invest' ? 'bg-emerald-500/20 text-emerald-400' : 
                         analysis.decisionInfo?.action === 'Wait' ? 'bg-blue-500/20 text-blue-400' : 
                         'bg-rose-500/20 text-rose-400'
                    }`}>
                         {analysis.decisionInfo?.action === 'Invest' ? <ShieldCheck size={32} /> : 
                          analysis.decisionInfo?.action === 'Wait' ? <Timer size={32} /> : 
                          <AlertCircle size={32} />}
                    </div>
                    <h3 className={`text-3xl font-black uppercase tracking-widest ${
                         analysis.decisionInfo?.action === 'Invest' ? 'text-emerald-400' : 
                         analysis.decisionInfo?.action === 'Wait' ? 'text-blue-400' : 
                         'text-rose-400'
                    }`}>{analysis.decisionInfo?.action}</h3>
                    
                    <div className="w-full mt-6 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>Confidence</span>
                            <span>{analysis.decisionInfo?.confidence}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.decisionInfo?.confidence}%` }} className="h-full bg-slate-300" />
                        </div>
                    </div>
               </div>
            </div>

            {/* Middle Section: Chart & Debate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 glass-card p-6 border-white/5 flex flex-col">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><LineChart size={14}/> Trade Map Visualization</h4>
                  <div className="flex-1 bg-black/40 rounded-2xl overflow-hidden border border-white/5">
                     <AICandlestickChart data={analysis.chart?.data} entryPoints={analysis.chart?.entryPoints} />
                  </div>
                  <div className="flex justify-between items-center mt-4 px-2">
                      <div className="flex gap-4 text-[10px] font-bold uppercase">
                          <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full border-t-2 border-emerald-500 border-dashed" /> Target</span>
                          <span className="text-blue-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full border-t-2 border-blue-500 border-dashed" /> Entry</span>
                          <span className="text-rose-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full border-t-2 border-rose-500 border-dashed" /> Stop Loss</span>
                      </div>
                  </div>
               </div>

               <div className="space-y-6 flex flex-col">
                  {/* Debate Panel */}
                  <div className="flex-1 glass-card p-6 flex flex-col gap-6">
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><BrainCircuit size={14}/> AI Debate Mode</h4>
                     <div className="flex-1 p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02]">
                         <h5 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-2 mb-3"><ThumbsUp size={14}/> Bull Case</h5>
                         <ul className="space-y-2">
                             {analysis.debate?.bull?.map((arg, i) => (
                                <li key={i} className="text-[11px] text-emerald-100/70 border-l border-emerald-500/30 pl-3 py-0.5">{arg}</li>
                             ))}
                         </ul>
                     </div>
                     <div className="flex-1 p-4 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02]">
                         <h5 className="text-xs font-black text-rose-400 uppercase flex items-center gap-2 mb-3"><ThumbsDown size={14}/> Bear Case</h5>
                         <ul className="space-y-2">
                             {analysis.debate?.bear?.map((arg, i) => (
                                <li key={i} className="text-[11px] text-rose-100/70 border-l border-rose-500/30 pl-3 py-0.5">{arg}</li>
                             ))}
                         </ul>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Horizon: News, Framework, Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* News Engine — Now with REAL news */}
               <div className="glass-card p-6 border-white/5 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Newspaper size={14}/> Live News Feed</h4>
                  
                  {/* Real News from NewsAPI */}
                  {realNews.length > 0 ? (
                    realNews.map((item, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                          <h5 className="font-bold text-sm text-white leading-tight">{item.headline}</h5>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                          )}
                          <div className="flex justify-between items-center pt-2">
                              <span className="text-[10px] font-bold uppercase text-blue-400">{item.source}</span>
                              {item.url && (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-1">
                                  Read <ExternalLink size={8} />
                                </a>
                              )}
                          </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback to AI-generated news */
                    analysis.news?.map((item, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                          <h5 className="font-bold text-sm text-white">{item.headline}</h5>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                              <TrendingUp size={12}/> Impact Chain:
                          </div>
                          <p className="text-[11px] italic font-medium text-blue-400 px-3 py-2 border-l-2 border-blue-500 bg-blue-500/[0.02]">
                              {item.impactChain}
                          </p>
                          <div className="flex justify-between items-center pt-2">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Effect: {item.effect}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${item.impactLevel === 'High' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-500/20 text-slate-400'}`}>{item.impactLevel} Impact</span>
                          </div>
                      </div>
                    ))
                  )}
               </div>

               {/* Framework Checklist */}
               <div className="glass-card p-6 border-white/5 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><ShieldCheck size={14}/> Decision Framework</h4>
                  <div className="space-y-3">
                      {[
                          { label: 'Trend Alignment', pass: analysis.framework?.trend },
                          { label: 'Risk Management', pass: analysis.framework?.risk },
                          { label: 'News Catalyst', pass: analysis.framework?.news },
                          { label: 'Optimal Entry', pass: analysis.framework?.entry },
                          { label: 'Clear Exit Plan', pass: analysis.framework?.exit }
                      ].map((check, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-xs font-bold text-slate-300 uppercase">{check.label}</span>
                              {check.pass ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-600" />}
                          </div>
                      ))}
                  </div>
                  <div className="w-full text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                     <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">{analysis.framework?.summary}</p>
                  </div>
               </div>

               {/* Scenarios */}
               <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><BarChart3 size={14}/> Scenario Matrix</h4>
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                      <div>
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Worst Case Mitigation</span>
                              <span className="text-sm font-black text-rose-500">{analysis.scenarios?.worst}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.abs(analysis.scenarios?.worst || 0)}%` }} className="h-full bg-rose-500" />
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Expected Outcome</span>
                              <span className="text-sm font-black text-blue-400">+{analysis.scenarios?.expected}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.abs(analysis.scenarios?.expected || 0)*2}%` }} className="h-full bg-blue-500" />
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Bullish Target</span>
                              <span className="text-sm font-black text-emerald-500">+{analysis.scenarios?.best}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.abs(analysis.scenarios?.best || 0)*2}%` }} className="h-full bg-emerald-500" />
                          </div>
                      </div>
                  </div>
                  <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Suggested Allocation</p>
                      <p className="text-sm font-black text-white">{analysis.suggestion?.amountRange} <span className="text-slate-500">({analysis.suggestion?.percentage} Cap)</span></p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <Database size={64} className="text-slate-500 mb-6" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">System Ready for Ticker Input</p>
        </div>
      )}
    </motion.div>
  );
};

export default AIAdvisor;
