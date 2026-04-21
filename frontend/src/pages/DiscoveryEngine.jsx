import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, Search, Filter, BarChart3, 
  ShieldAlert, Info, ArrowUpRight, Scale, Zap, Gem, BrainCircuit
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { fetchDiscovery, fetchDiscoveryAI, fetchPeers } from '../utils/api';

const DiscoveryEngine = () => {
    const [sector, setSector] = useState('All');
    const [data, setData] = useState(null);
    const [aiAdvice, setAiAdvice] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [peers, setPeers] = useState([]);

    const sectors = ['All', 'Banks', 'IT', 'Auto', 'Energy', 'Consumer'];

    useEffect(() => {
        handleFetchDiscovery();
    }, [sector]);

    const handleFetchDiscovery = async () => {
        setLoading(true);
        setAiAdvice(null);
        try {
            const resData = await fetchDiscovery(sector);
            setData(resData);
            
            // Get Strategic AI Advice for these 5
            setAiLoading(true);
            try {
                const aiData = await fetchDiscoveryAI({
                    top_five: resData.top_five,
                    news_context: `The top stocks in ${sector} sector currently include ${resData.top_five.map(s => s.symbol).join(', ')}.`
                });
                setAiAdvice(aiData);
            } catch (aiErr) {
                console.error("AI Analysis error", aiErr);
            }
            setAiLoading(false);
        } catch (err) {
            console.error("Discovery error", err);
        }
        setLoading(false);
    };

    const handleStockClick = async (stock) => {
        setSelectedStock(stock);
        try {
            const peerData = await fetchPeers(stock.symbol);
            setPeers(peerData.peers);
        } catch (err) {
            console.error("Peer fetch error", err);
        }
    };

    // Filtered list based on search bar
    const filteredStocks = data?.top_five.filter(s => 
        s.symbol.toLowerCase().includes(search.toLowerCase()) || 
        s.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    // Prepare chart data for multi-line growth
    const generateChartData = () => {
        if (!data) return [];
        const chart = [];
        for (let i = 0; i < 3; i++) {
            const point = { year: `Year ${i + 1}` };
            data.top_five.forEach(s => {
                point[s.symbol] = s.growth_3y[i];
            });
            chart.push(point);
        }
        return chart;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-12 pb-32"
        >
            <header className="text-center space-y-4">
                <motion.div 
                    initial={{ y: -20 }} animate={{ y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-widest"
                >
                    <Gem size={16} /> Decision Engine Alpha
                </motion.div>
                <h2 className="text-5xl font-black italic tracking-tighter text-slate-900">The Winner's <span className="text-emerald-600">Circle</span></h2>
                <p className="text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                    Institutional-grade scanning across 50+ assets. We use a 40/30/30 Weighted Composite Score to identify the true structural leaders of each sector.
                </p>
            </header>

            {/* SECTOR TABS & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl mx-auto bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {sectors.map(s => (
                        <button 
                            key={s}
                            onClick={() => setSector(s)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${sector === s ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter top results..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* TOP 5 DASHBOARD */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-7xl mx-auto">
                        {filteredStocks.map((stock, i) => (
                            <motion.div 
                                key={stock.symbol}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleStockClick(stock)}
                                className={`glass-card p-6 border-2 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all ${selectedStock?.symbol === stock.symbol ? 'border-emerald-500 bg-emerald-50/20' : (i === 0 ? 'border-emerald-500/30 bg-emerald-50/20' : 'border-slate-100')}`}
                            >
                                {i === 0 && (
                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-lg">
                                        <Trophy size={14} />
                                    </div>
                                )}
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stock.sector}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">{stock.symbol}</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Health Score</span>
                                        <span className="text-sm font-black text-emerald-600">{stock.composite_score}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${(stock.composite_score*10)}%` }} 
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">CAGR</p>
                                        <p className="text-xs font-black text-slate-900">{stock.cagr}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">PEG</p>
                                        <p className={`text-xs font-black ${stock.peg < 1 ? 'text-emerald-500' : 'text-slate-900'}`}>{stock.peg}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI STRATEGIC VERDICT LOADING or DATA */}
                    {aiLoading ? (
                        <div className="max-w-7xl mx-auto glass-card p-12 bg-slate-900 border-none animate-pulse flex flex-col items-center justify-center space-y-4">
                            <BrainCircuit size={48} className="text-emerald-500/50 mb-4" />
                            <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">Architect AI is calculating conviction...</p>
                        </div>
                    ) : aiAdvice && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-7xl mx-auto glass-card border-none bg-slate-900 text-white overflow-hidden shadow-2xl shadow-emerald-500/10"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                <div className="lg:col-span-5 p-10 bg-slate-800/50 space-y-8 flex flex-col justify-between border-r border-slate-700/50">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                                            <BrainCircuit size={14} /> Architect's Strategic Selection
                                        </div>
                                        <h3 className="text-4xl font-black italic tracking-tighter mb-4 text-emerald-400">
                                            {aiAdvice.winner}
                                        </h3>
                                        <p className="text-slate-400 font-medium leading-relaxed italic">
                                            "{aiAdvice.reason}"
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-slate-700/50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Strategic Conviction</span>
                                            <span className="text-sm font-black text-emerald-400">{aiAdvice.conviction}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${aiAdvice.conviction}%` }} 
                                                className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            Recommended Baseline: <span className="text-white">{aiAdvice.totalInvestmentSuggestion}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 p-10 space-y-8">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Scale size={16} /> Asset Allocation Strategy
                                    </h4>
                                    <div className="space-y-4">
                                        {aiAdvice.allocation?.map((alloc, i) => (
                                            <div key={alloc.symbol} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-emerald-400 border border-slate-700">
                                                    {alloc.symbol}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-black text-white">{alloc.percent}% Allocation</span>
                                                        <span className="text-[9px] font-medium text-slate-500 italic">"{alloc.logic}"</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500/50" style={{ width: `${alloc.percent}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium italic">
                                        *This strategy is optimized for structural growth within the current market cycle across the selected finalists.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PEER SHOWDOWN SECTION */}
                    {selectedStock && peers.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-7xl mx-auto glass-card border-emerald-500/20 bg-emerald-50/10 p-10"
                        >
                            <div className="flex justify-between items-center mb-8 border-b border-emerald-500/10 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <Scale size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Peer Showdown: <span className="text-emerald-600">{selectedStock.symbol}</span></h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparing against similar {selectedStock.sector} assets</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStock(null)} className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest ring-1 ring-slate-200 px-3 py-1 rounded-lg">Close Showdown</button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="p-6 rounded-3xl bg-slate-900 text-white border-2 border-emerald-500 shadow-xl">
                                    <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">Subject</p>
                                    <h4 className="text-2xl font-black mb-4">{selectedStock.symbol}</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Growth Score</span>
                                            <span className="text-xs font-black">{selectedStock.composite_score}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">ROCE</span>
                                            <span className="text-xs font-black">{selectedStock.roce}%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {peers.map(peer => (
                                    <div key={peer.symbol} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Competitor</p>
                                        <h4 className="text-2xl font-black text-slate-900 mb-4">{peer.symbol}</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Score Delta</span>
                                                <span className={`text-xs font-black ${peer.composite_score > selectedStock.composite_score ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                    {(peer.composite_score - selectedStock.composite_score).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Debt/Eq</span>
                                                <span className="text-xs font-black text-slate-600">{peer.debt_equity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* COMPARISON MATRIX & CHART */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        {/* THE WHY & RISK SUMMARY */}
                        <div className="space-y-6">
                            <div className="glass-card p-8 border-slate-100 bg-emerald-500/[0.02]">
                                <h4 className="text-xs font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2 mb-6">
                                    <Zap size={16} /> Why these 5?
                                </h4>
                                <p className="text-slate-600 font-medium leading-relaxed italic">
                                    "{data.comparison.why_these}"
                                </p>
                            </div>

                            <div className="glass-card p-8 border-rose-500/10 bg-rose-500/[0.01]">
                                <h4 className="text-xs font-black uppercase text-rose-600 tracking-widest flex items-center gap-2 mb-6">
                                    <ShieldAlert size={16} /> Strategic Risk Warnings
                                </h4>
                                <div className="space-y-4">
                                    {data.top_five.map(s => s.debt_equity > 1 && (
                                        <div key={s.symbol} className="flex gap-4 items-start p-3 rounded-2xl bg-white border border-rose-500/10">
                                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><Info size={14}/></div>
                                            <p className="text-[11px] font-bold text-slate-500 leading-tight">
                                                <span className="text-slate-900 font-black">{s.symbol}</span> has a Debt-to-Equity of {s.debt_equity}, which is higher than the sector average of 0.8.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* GROWTH TRAJECTORY CHART */}
                        <div className="glass-card p-8 border-slate-100 min-h-[400px] flex flex-col">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-8">
                                <BarChart3 size={16} /> Multi-Asset Trajectory
                            </h4>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={generateChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }} />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                        {data.top_five.map((s, idx) => (
                                            <Line 
                                                key={s.symbol}
                                                type="monotone"
                                                dataKey={s.symbol}
                                                stroke={['#10b981', '#3b82f6', '#6366f1', '#a855f7', '#f59e0b'][idx]}
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 0 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* COMPARISON MATRIX TABLE */}
                    <div className="max-w-7xl mx-auto glass-card border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Scale size={16} /> Side-by-Side Comparison Matrix
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Metric</th>
                                        {data.top_five.map(s => (
                                            <th key={s.symbol} className="px-8 py-5 text-center text-xs font-black text-slate-900">{s.symbol}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { label: 'P/E Ratio', key: 'pe', inverse: true },
                                        { label: 'ROCE (%)', key: 'roce' },
                                        { label: '3Y CAGR (%)', key: 'cagr' },
                                        { label: 'Debt/Equity', key: 'debt_equity', inverse: true },
                                        { label: 'PEG Ratio', key: 'peg', inverse: true }
                                    ].map(metric => (
                                        <tr key={metric.key} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase">{metric.label}</td>
                                            {data.top_five.map(s => {
                                                const values = data.top_five.map(x => x[metric.key]);
                                                const isWinner = metric.inverse ? s[metric.key] === Math.min(...values) : s[metric.key] === Math.max(...values);
                                                return (
                                                    <td key={s.symbol} className={`px-8 py-5 text-center text-xs font-bold ${isWinner ? 'text-emerald-600 bg-emerald-500/5' : 'text-slate-600'}`}>
                                                        {s[metric.key]} {isWinner && '👑'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default DiscoveryEngine;
