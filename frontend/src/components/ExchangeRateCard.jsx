import React from 'react';
import { RefreshCcw, Clock3, ArrowLeftRight } from 'lucide-react';

const ExchangeRateCard = ({ fromCurrency, toCurrency, exchangeRate, lastUpdated }) => {
  return (
    <div className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          Live Conversion Basis
        </h3>
        <ArrowLeftRight size={16} className="text-blue-400" />
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <p className="text-[11px] uppercase text-slate-500 font-bold">Current Exchange Rate</p>
          <p className="text-2xl font-black text-white">
            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <RefreshCcw size={14} className="text-emerald-400" />
            Market Snapshot
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} />
            Updated: {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
