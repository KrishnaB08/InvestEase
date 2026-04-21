import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, DollarSign, BarChart3, Search } from 'lucide-react';
import CurrencyConverter from '../components/CurrencyConverter';
import ExchangeRateCard from '../components/ExchangeRateCard';
import CurrencyTrend from '../components/CurrencyTrend';
import GlobalInsightCard from '../components/GlobalInsightCard';
import { fetchFxConversion, fetchFxTrend, fetchStockStats } from '../utils/api';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AED', name: 'UAE Dirham' }
];

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CurrencyLab = () => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [lastUpdated] = useState(new Date());
  const [shareSymbol, setShareSymbol] = useState('TCS');
  const [liveSharePrice, setLiveSharePrice] = useState(3800);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const [fxState, setFxState] = useState({
    exchangeRate: 83.2,
    convertedAmount: 8320,
    convertedInr: 8320,
    usInvestmentInr: 41600,
    updatedAt: new Date(),
    loading: false,
    error: ''
  });
  const [trendState, setTrendState] = useState({
    direction: 'up',
    changePct: 0.4,
    sparkline: [40, 45, 49, 52, 56, 61, 64]
  });

  const exchangeRate = fxState.exchangeRate;
  const convertedAmount = fxState.convertedAmount;
  const convertedInr = fxState.convertedInr;
  const usInvestmentInr = fxState.usInvestmentInr;

  const estimatedShares = useMemo(() => {
    const safePrice = liveSharePrice > 0 ? liveSharePrice : 1;
    return Math.max(0, Math.floor(convertedInr / safePrice));
  }, [convertedInr, liveSharePrice]);

  const aiExplanation = useMemo(() => {
    return 'Currency fluctuations can amplify or reduce your real returns when investing globally. Track forex before placing cross-border allocations.';
  }, []);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  useEffect(() => {
    let cancelled = false;

    const loadSharePrice = async () => {
      if (!shareSymbol.trim()) return;
      setShareLoading(true);
      setShareError('');
      try {
        const stats = await fetchStockStats(shareSymbol.trim().toUpperCase());
        if (!cancelled && stats?.current_price) {
          setLiveSharePrice(Number(stats.current_price));
        }
      } catch (error) {
        if (!cancelled) {
          setShareError('Unable to fetch real-time share value for this symbol.');
        }
      } finally {
        if (!cancelled) {
          setShareLoading(false);
        }
      }
    };

    loadSharePrice();
    return () => {
      cancelled = true;
    };
  }, [shareSymbol]);

  useEffect(() => {
    let cancelled = false;
    const loadFxData = async () => {
      setFxState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const [pair, inrPair, usdToInr] = await Promise.all([
          fetchFxConversion(amount, fromCurrency, toCurrency),
          fetchFxConversion(amount, fromCurrency, 'INR'),
          fetchFxConversion(500, 'USD', 'INR')
        ]);

        if (!cancelled) {
          setFxState({
            exchangeRate: Number(pair.exchange_rate || 1),
            convertedAmount: Number(pair.converted_amount || 0),
            convertedInr: Number(inrPair.converted_amount || 0),
            usInvestmentInr: Number(usdToInr.converted_amount || 0),
            updatedAt: new Date(),
            loading: false,
            error: ''
          });
        }
      } catch (error) {
        if (!cancelled) {
          setFxState((prev) => ({
            ...prev,
            loading: false,
            error: 'Live FX service unavailable. Showing last known values.'
          }));
        }
      }
    };

    loadFxData();
    return () => {
      cancelled = true;
    };
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    let cancelled = false;
    const loadTrend = async () => {
      try {
        const trend = await fetchFxTrend('USD', 'INR', 7);
        const values = (trend.points || []).map((p) => Number(p.value));
        const max = Math.max(...values, 1);
        const sparkline = values.map((v) => Math.max(20, Math.round((v / max) * 100)));
        if (!cancelled && sparkline.length > 1) {
          setTrendState({
            direction: trend.direction || 'up',
            changePct: Number(trend.change_pct || 0),
            sparkline
          });
        }
      } catch (error) {
        // Keep previous trend visualization on failure.
      }
    };
    loadTrend();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-[1400px] mx-auto pb-24"
    >
      <header className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-[0.2em]">
          <DollarSign size={15} />
          Global Currency Intelligence
        </div>
        <h2 className="text-5xl font-black italic tracking-tighter">
          Currency Conversion & <span className="text-purple-400">Financial Impact Lab</span>
        </h2>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Convert currencies, understand INR purchasing power, and evaluate how forex movement affects your global investment decisions.
        </p>
      </header>

      <CurrencyConverter
        amount={amount}
        onAmountChange={setAmount}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        onFromCurrencyChange={setFromCurrency}
        onToCurrencyChange={setToCurrency}
        currencies={CURRENCIES}
        convertedAmount={convertedAmount}
        onSwap={swapCurrencies}
      />

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 shrink-0">
            <Search size={18} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase text-slate-500 font-bold mb-2">Live Share Lookup</p>
            <input
              type="text"
              value={shareSymbol}
              onChange={(e) => setShareSymbol(e.target.value.toUpperCase())}
              placeholder="Type ticker like TCS, RELIANCE, INFOSYS"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-bold uppercase text-slate-900 outline-none focus:border-blue-500/40"
            />
            <p className="text-xs text-slate-400 mt-2">
              Real price now: Rs. {liveSharePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            {shareError && (
              <p className="text-xs text-rose-400 mt-1">{shareError}</p>
            )}
            {fxState.error && (
              <p className="text-xs text-amber-400 mt-1">{fxState.error}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ExchangeRateCard
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          exchangeRate={exchangeRate}
          lastUpdated={formatTime(fxState.updatedAt || lastUpdated)}
        />
        <GlobalInsightCard
          amount={amount}
          fromCurrency={fromCurrency}
          convertedINR={convertedInr}
          usInvestmentInr={usInvestmentInr}
          estimatedShares={estimatedShares}
          shareSymbol={shareSymbol || 'TICKER'}
          sharePrice={liveSharePrice}
          shareLoading={shareLoading}
          shareError={shareError}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CurrencyTrend trend={trendState} />
        </div>
        <div className="glass-card border-white/10 bg-gradient-to-b from-blue-500/[0.04] to-transparent space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 inline-flex items-center gap-2">
            <BrainCircuit size={16} className="text-blue-400" />
            AI Currency Explanation
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {aiExplanation}
          </p>
          <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <p className="text-[11px] uppercase font-bold text-blue-300 mb-2 inline-flex items-center gap-2">
              <BarChart3 size={14} />
              Smart Use Case Integration
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                If you invest <span className="font-bold text-slate-900">$500</span> in US stocks, reserve roughly{' '}
                <span className="font-bold text-slate-900">Rs. {usInvestmentInr.toLocaleString('en-IN')}</span> from your capital.
              </li>
              <li>
                Add forex impact into AI Advisor confidence when USD trend is rising.
              </li>
              <li>
                Use converted INR values inside simulator position sizing for realistic planning.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CurrencyLab;
