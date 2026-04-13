import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, TrendingUp, TrendingDown, BrainCircuit, Gamepad2 } from 'lucide-react';
import { fetchStockStats } from '../utils/api';

const Home = ({ stocks = [] }) => {
  const [tickerData, setTickerData] = useState([]);
  const [tickerLoading, setTickerLoading] = useState(true);

  // Fetch live prices for ticker
  useEffect(() => {
    if (stocks.length === 0) {
      setTickerLoading(false);
      return;
    }

    const fetchPrices = async () => {
      try {
        // Fetch stats for a subset of stocks (to avoid too many requests)
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
          } catch (e) {
            // Skip failed stocks
          }
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mb-6 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-semibold flex items-center gap-2"
      >
        <Zap size={16} /> The Future of Financial Training
      </motion.div>

      <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter">
        Learn, Practice & <br />
        <span className="gradient-text">Invest with Confidence</span>
      </h1>

      <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
        Turn fear into smart investing decisions. Experience the market, 
        survive the crashes, and master your emotions in a safe, AI-guided ecosystem.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link to="/learn" className="neo-btn-primary flex items-center gap-2 text-lg">
          Start Learning <ArrowRight size={20} />
        </Link>
        <Link to="/simulate" className="neo-btn-outline flex items-center gap-2 text-lg">
          Try Simulator <TrendingUp size={20} />
        </Link>
      </div>

      {/* Live Stock Ticker */}
      {tickerData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 w-full overflow-hidden relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a1a] to-transparent z-10" />
          
          <div className="flex gap-6 animate-scroll">
            {[...tickerData, ...tickerData].map((stock, i) => {
              const isUp = stock.change >= 0;
              return (
                <div 
                  key={`${stock.symbol}-${i}`} 
                  className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5 whitespace-nowrap shrink-0"
                >
                  <span className="text-sm font-black text-white">{stock.symbol}</span>
                  <span className="text-sm font-bold text-slate-300">₹{stock.price?.toLocaleString()}</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(stock.change).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Loading state for ticker */}
      {tickerLoading && stocks.length > 0 && (
        <div className="mt-16 flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Loading live market data...
        </div>
      )}

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {[
          { icon: Shield, title: 'Risk-Free', desc: 'Practice with ₹10,000 virtual cash' },
          { icon: BrainCircuit, title: 'AI Guided', desc: 'Real-time analysis from Claude AI' },
          { icon: Gamepad2, title: 'Gamified', desc: 'Learn complex charts through play' }
        ].map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card flex flex-col items-center p-8 hover:border-blue-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm">{feat.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Home;
