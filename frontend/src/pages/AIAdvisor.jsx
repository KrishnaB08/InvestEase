import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, BrainCircuit, ShieldCheck, Timer, AlertCircle,
  ThumbsUp, ThumbsDown, ArrowRight, TrendingUp, Zap,
  Settings, CheckCircle2, XCircle, BarChart3, Newspaper, LineChart, Database, ExternalLink, HeartPulse, Target, Calculator
} from 'lucide-react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import axios from 'axios';
import { fetchAIAdviceDynamic, fetchChartData, fetchNews, searchStock, getStockDetails, fetchFieldLeader } from '../utils/api';

const AICandlestickChart = ({ data, entryPoints }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;
    const container = chartContainerRef.current;
    container.innerHTML = '';

    const chart = createChart(container, {
      layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(0, 0, 0, 0.05)' }, horzLines: { color: 'rgba(0, 0, 0, 0.05)' } },
      crosshair: { mode: 0, vertLine: { color: '#10b981' }, horzLine: { color: '#10b981' } },
      rightPriceScale: { borderColor: 'rgba(0, 0, 0, 0.05)' },
      timeScale: { borderColor: 'rgba(0, 0, 0, 0.05)' },
      width: container.clientWidth,
      height: 350,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', downColor: '#f43f5e', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#f43f5e',
    });

    series.setData(data);

    if (entryPoints) {
      series.createPriceLine({ price: entryPoints.target, color: '#10b981', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'GOAL TARGET' });
      series.createPriceLine({ price: entryPoints.entryZone, color: '#3b82f6', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'STRATEGIC ENTRY' });
      series.createPriceLine({ price: entryPoints.stopLoss, color: '#f43f5e', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'RISK FLOOR' });
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

const AIAdvisor = () => {
  const [ticker, setTicker] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [realNews, setRealNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0: Idle, 1: Fetching Details, 2: Ingesting News, 3: Architecting Advice, 4: Complete
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fieldLeader, setFieldLeader] = useState(null);
  const searchTimeout = useRef(null);

  // Handle deep-linking from Home page buckets
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbolParam = params.get('symbol');
    if (symbolParam) {
      getAdviceForSymbol(symbolParam.toUpperCase());
    }
  }, []);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setTicker(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const quotes = await searchStock(query);
        setSearchResults(quotes.filter(q => q.symbol && (q.shortname || q.longname)));
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 300);
  };

  const getAdviceForSymbol = async (selectedSymbol) => {
    if (!selectedSymbol) return;
    setTicker(selectedSymbol);
    setShowDropdown(false);
    setLoading(true);
    setAnalysisStep(1); // Fetching Details

    try {
      const details = await getStockDetails(selectedSymbol);
      if (!details) {
        alert("Stock details not available for this symbol.");
        setLoading(false);
        setAnalysisStep(0);
        return;
      }

      setAnalysisStep(2); // Ingesting News
      const name = details.shortName || selectedSymbol;
      const price = details.regularMarketPrice || 0;
      const change = details.regularMarketChangePercent || 0;
      const trend = change > 0 ? "Uptrend" : "Market Cycle";
      const risk = Math.abs(change) > 2 ? "Active Management" : "Stable Foundation";

      // 1. Fetch News First to provide context to Gemini
      let newsContext = "";
      try {
        const newsData = await fetchNews(selectedSymbol);
        const headlines = (newsData.news || []).map(n => n.headline).join(". ");
        newsContext = headlines;
        setRealNews(newsData.news || []);
      } catch (err) {
        setRealNews([]);
      }

      setAnalysisStep(3); // Architecting Advice
      // 2. Fetch AI Advice with News Context
      const analysisData = await fetchAIAdviceDynamic({
        symbol: selectedSymbol,
        name,
        price,
        change,
        trend,
        risk,
        currency: details.currency || 'INR',
        news_context: newsContext
      });

      try {
        const chartData = await fetchChartData(selectedSymbol);
        analysisData.chart = {
          data: chartData,
          entryPoints: analysisData.entryPoints
        };
      } catch (err) {
        analysisData.chart = { data: [], entryPoints: analysisData.entryPoints };
      }

      setAnalysis(analysisData);

      // 3. Fetch Field Leader (Sector Champion)
      if (analysisData.sector) {
        try {
          const res = await fetchFieldLeader(analysisData.sector);
          if (res.leader) {
            setFieldLeader(res.leader);
          }
        } catch (err) {
          console.error("Leader fetch error", err);
        }
      }
      setAnalysisStep(4);
    } catch (err) {
      console.error("Fetch Error", err);
      setAnalysisStep(0);
    }
    setLoading(false);
  };

  // Stability Class helper
  const getStabilityColor = (score) => {
    if (score > 80) return 'text-emerald-500';
    if (score > 60) return 'text-blue-500';
    return 'text-amber-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="space-y-12 max-w-[1400px] mx-auto pb-32"
    >
      <header className="text-center space-y-4 pt-4">
        <motion.div
          initial={{ y: -20 }} animate={{ y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-[0.2em]"
        >
          <BrainCircuit size={16} /> Financial Strategy Architect
        </motion.div>
        <h2 className="text-5xl font-black italic tracking-tighter text-slate-900">Wealth <span className="text-emerald-600">Roadmap</span> System</h2>
        <p className="text-slate-600 max-w-2xl mx-auto font-medium">Build your family's future with goal-first analysis. Move from decision paralysis to confident action by understanding fundamental stability.</p>
      </header>

      <div className="relative max-w-2xl mx-auto z-50">
        <div className="glass-card flex items-center p-2 shadow-[0_30px_60px_rgba(16,185,129,0.08)] border-emerald-500/30">
          <div className="pl-4 text-emerald-500"><Search size={24} /></div>
          <input
            type="text"
            placeholder="What stock are we building for? (e.g. RELIANCE)..."
            value={ticker}
            onChange={handleSearchInput}
            onKeyPress={(e) => e.key === 'Enter' && getAdviceForSymbol(ticker.toUpperCase())}
            className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold p-4 uppercase placeholder:text-slate-400 outline-none text-slate-900 relative z-50"
          />
          <button
            onClick={() => getAdviceForSymbol(ticker.toUpperCase())}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-tighter px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 relative z-50"
          >
            {loading ? "Architecting..." : "Analyze Health"} <ArrowRight size={18} />
          </button>
        </div>

        {showDropdown && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[100]"
          >
            {searchResults.map((res, i) => (
              <div
                key={i}
                onClick={() => getAdviceForSymbol(res.symbol)}
                className="px-6 py-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900">{res.symbol}</div>
                  <div className="text-xs text-slate-500 font-medium">{res.shortname || res.longname}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto glass-card p-10 bg-slate-900 border-none shadow-2xl shadow-emerald-500/10 text-center space-y-8 mt-4"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 animate-pulse border border-emerald-500/30 flex items-center justify-center">
                  <BrainCircuit size={32} className="text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-emerald-400 italic tracking-tighter uppercase">Architecting Wealth Roadmap</h3>

              <div className="space-y-3 px-4">
                {[
                  { step: 1, label: 'Fetching Market Data & Fundamentals' },
                  { step: 2, label: 'Ingesting Institutional News Headlines' },
                  { step: 3, label: 'Generating Architect Recommendation' }
                ].map((log) => (
                  <div key={log.step} className="flex items-center gap-4 text-left">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${analysisStep > log.step ? 'bg-emerald-500 border-emerald-500 text-slate-900' : analysisStep === log.step ? 'bg-slate-800 border-emerald-500/50 text-emerald-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                      {analysisStep > log.step ? <CheckCircle2 size={12} /> : log.step}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${analysisStep === log.step ? 'text-white' : analysisStep > log.step ? 'text-slate-400' : 'text-slate-600'}`}>
                      {log.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px] font-medium text-slate-500 italic">"Good things happen to those who Wait—but better things happen to those who Invest with Data."</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/[0.03] to-blue-500/[0.03] flex flex-col justify-center border-slate-200">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{analysis.sector || 'Strategic Asset'}</p>
                <h2 className="text-4xl font-black italic mb-2 text-slate-900 tracking-tighter">{analysis.ticker}</h2>
                <p className="text-xs font-bold text-slate-500 mb-6">{analysis.name}</p>
                <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 w-fit text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14} /> Goal-First Analysis
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Asset Valuation</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{analysis.currencySymbol || '₹'}{analysis.price?.toLocaleString()}</p>
                </div>
              </div>

              {/* SECTOR CHAMPION CARD */}
              {fieldLeader && fieldLeader.symbol !== analysis.ticker && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-bl-xl">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Sector Champion</p>
                    <h4 className="text-xl font-black text-slate-900 tracking-tighter">{fieldLeader.symbol}</h4>
                    <p className="text-[10px] font-bold text-slate-500 mb-4">{fieldLeader.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Decision Insight</p>
                    <p className="text-[10px] font-medium text-slate-600 leading-tight">
                      This asset has a <span className="text-emerald-600 font-black">Health Score of {fieldLeader.composite_score}</span>, making it the top-ranked performer in the {analysis.sector} sector.
                    </p>
                    <button
                      onClick={() => getAdviceForSymbol(fieldLeader.symbol)}
                      className="mt-2 text-[9px] font-black uppercase text-emerald-600 flex items-center gap-1 hover:underline"
                    >
                      Switch to Leader <ArrowRight size={10} />
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="glass-card p-8 border-slate-200 lg:col-span-1 text-center flex flex-col items-center justify-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Health Rating</p>
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <motion.circle
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * (analysis.stabilityScore || 75)) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={getStabilityColor(analysis.stabilityScore)}
                    />
                  </svg>
                  <span className={`absolute text-2xl font-black italic ${getStabilityColor(analysis.stabilityScore)}`}>
                    {analysis.stabilityScore || 75}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Stability Score</p>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic px-4">"Built on fundamental health and long-term earnings potential."</p>
              </div>

              <div className="glass-card p-6 lg:col-span-1 border-slate-200">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2 tracking-[0.2em]"><Settings size={14} /> Market Engine</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Market Cycle</span>
                    <span className="text-xs font-black text-emerald-600 uppercase italic">Uptrend Candidate</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Stability</span>
                    <span className="text-xs font-black text-slate-600 uppercase italic">Goal-Ready</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Momentum</span>
                    <span className="text-xs font-black text-blue-600 uppercase italic">Steady Accrual</span>
                  </div>
                </div>
              </div>

              <div className={`glass-card p-8 flex flex-col justify-center items-center text-center border-2 border-dashed ${analysis.decisionInfo?.action === 'Invest' || analysis.decisionInfo?.action === 'Accumulate' ? 'border-emerald-500/30 glow-green' :
                  'border-blue-500/30 glow-blue'
                }`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">The Architect's Verdict</p>
                <div className={`w-16 h-16 rounded-3xl mb-4 flex items-center justify-center ${analysis.decisionInfo?.action === 'Invest' || analysis.decisionInfo?.action === 'Accumulate' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                  {analysis.decisionInfo?.action === 'Invest' || analysis.decisionInfo?.action === 'Accumulate' ? <CheckCircle2 size={32} /> :
                    <Timer size={32} />}
                </div>
                <h3 className={`text-3xl font-black italic tracking-tighter ${analysis.decisionInfo?.action === 'Invest' || analysis.decisionInfo?.action === 'Accumulate' ? 'text-emerald-600' :
                    'text-blue-600'
                  }`}>{analysis.decisionInfo?.action}</h3>

                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Strategic Confidence</span>
                    <span>{analysis.decisionInfo?.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.decisionInfo?.confidence}%` }} className="h-full bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
              {/* INSTITUTIONAL NEWS DIGEST (The "Short, Clear Summary") */}
            {analysis?.newsReport && (
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-1 pb-1 border-slate-100 bg-white shadow-2xl relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Summary Header/Highlights */}
                  <div className="lg:col-span-4 p-8 bg-slate-900 text-white space-y-8 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
                        <Database size={16} /> Institutional Digest
                      </h4>
                      <h3 className="text-3xl font-black italic tracking-tighter leading-[0.9] mb-4">
                        Market Intelligence <br /> Report
                      </h3>
                      <p className="text-slate-400 text-xs font-medium italic">"Compressing 50+ pages of structural data into high-value beginner insights."</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-black uppercase text-slate-400">Structural Sentiment</span>
                        <span className={`text-xs font-black uppercase ${analysis.newsReport.sentiment === 'Positive' ? 'text-emerald-400' : analysis.newsReport.sentiment === 'Negative' ? 'text-rose-400' : 'text-blue-400'}`}>
                          {analysis.newsReport.sentiment || 'Neutral'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-black uppercase text-slate-400">Risk Level</span>
                        <span className="text-xs font-black text-white uppercase">{analysis.newsReport.riskLevel || 'Moderate'}</span>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic underline">Final Catalyst Action</p>
                        <p className="text-[11px] font-black text-white italic">"{analysis.newsReport.verdict || 'Monitor for structural changes.'}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="lg:col-span-8 p-10 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Array.isArray(analysis?.newsReport?.insights) ? analysis.newsReport.insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-4 items-start"
                      >
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <p className="text-[11px] font-medium text-slate-600 leading-snug">
                          {insight}
                        </p>
                      </motion.div>
                    )) : (
                      <p className="text-[11px] text-slate-400 italic">Structural data ingest complete. No specific insights available for this period.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-6 border-slate-200 flex flex-col">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 tracking-[0.2em]"><LineChart size={14} /> Goal Progress Visualization</h4>
                <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100">
                  <AICandlestickChart data={analysis?.chart?.data} entryPoints={analysis?.chart?.entryPoints} />
                </div>
              </div>

              <div className="glass-card p-8 border-slate-200 flex flex-col gap-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 tracking-[0.2em]"><HeartPulse size={14} /> Visionary Analysis</h4>
                <div className="flex-1 p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-4">
                  <h5 className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 mb-2 tracking-widest"><ThumbsUp size={14} /> Wealth Foundation (BULL)</h5>
                  <ul className="space-y-3">
                    {analysis?.debate?.bull?.map((arg, i) => (
                      <li key={i} className="text-[11px] text-slate-600 font-medium border-l-2 border-emerald-500/50 pl-4 py-0.5 leading-relaxed">{arg}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 p-5 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] space-y-4">
                  <h5 className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 mb-2 tracking-widest"><Timer size={14} /> Strategic Patience (BEAR)</h5>
                  <ul className="space-y-3">
                    {analysis?.debate?.bear?.map((arg, i) => (
                      <li key={i} className="text-[11px] text-slate-600 font-medium border-l-2 border-blue-500/50 pl-4 py-0.5 leading-relaxed">{arg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 border-slate-200 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 tracking-[0.2em]"><Newspaper size={14} /> Market Cycles & Catalysts</h4>
                {analysis.news?.map((item, i) => (
                  <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                    <h5 className="font-black text-sm text-slate-900 leading-tight italic">"{item.headline}"</h5>
                    <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact Chain</p>
                      <p className="text-[10px] font-bold text-emerald-600 leading-relaxed italic">{item.impactChain}</p>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-60">
                      <span>Outcome: {item.effect}</span>
                      <span>Intensity: {item.impactLevel}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 border-slate-200 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 tracking-[0.2em]"><Target size={14} /> Family Roadmap Pillars</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Trend Alignment', pass: analysis.framework?.trend, icon: <TrendingUp size={14} /> },
                    { label: 'Fundamental Health', pass: analysis.framework?.risk, icon: <HeartPulse size={14} /> },
                    { label: 'Growth Catalyst', pass: analysis.framework?.news, icon: <Zap size={14} /> },
                    { label: 'Strategic Entry', pass: analysis.framework?.entry, icon: <Calculator size={14} /> },
                    { label: 'Goal Exit Plan', pass: analysis.framework?.exit, icon: <Target size={14} /> }
                  ].map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">{check.icon}</span>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{check.label}</span>
                      </div>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 border-slate-200 flex flex-col justify-center items-center text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Future Foundation</p>
                  <p className="text-[11px] font-medium text-slate-500 italic">"Patience is the architect of compounding."</p>
                </div>

                <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 w-full">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Architect's Suggestion</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter italic">"{analysis.suggestion?.amountRange}"</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Allocation Percentage: {analysis.suggestion?.percentage}</p>
                </div>

                <Link to="/simulate" className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">
                  Rehearse Market Cycle
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <Target size={64} className="text-slate-500 mb-6" />
          <p className="text-sm font-black italic uppercase tracking-widest text-slate-400 leading-relaxed">System Ready for Goal Discovery Input</p>
        </div>
      )}
    </motion.div>
  );
};

export default AIAdvisor;
