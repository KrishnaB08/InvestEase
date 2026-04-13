import React from 'react';
import { Globe2, Landmark, WalletCards, Sparkles } from 'lucide-react';

const GlobalInsightCard = ({
  amount,
  fromCurrency,
  convertedINR,
  usInvestmentInr,
  estimatedShares,
  shareSymbol,
  sharePrice,
  shareLoading,
  shareError
}) => {
  return (
    <div className="glass-card border-purple-500/20 bg-gradient-to-br from-purple-500/[0.06] to-blue-500/[0.03] space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          Global Investment Insight
        </h3>
        <Globe2 size={16} className="text-purple-400" />
      </div>

      <div className="grid gap-3">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
          <p className="text-[11px] uppercase text-slate-500 font-bold">Real Value Interpretation</p>
          <p className="text-lg font-black text-white">
            {fromCurrency} {amount.toLocaleString()} ≈ Rs. {convertedINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Equivalent to a small capital bucket for trial allocations in your simulator.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <p className="text-[11px] uppercase text-blue-300 font-bold inline-flex items-center gap-2">
              <Landmark size={14} />
              US Allocation Equivalent
            </p>
            <p className="text-lg font-black text-white mt-1">
              Rs. {usInvestmentInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <p className="text-[11px] uppercase text-emerald-300 font-bold inline-flex items-center gap-2">
              <WalletCards size={14} />
              Buying Power Estimate
            </p>
            <p className="text-lg font-black text-white mt-1">
              {shareLoading ? 'Loading...' : `~${estimatedShares} shares`}
            </p>
            <p className="text-[11px] text-emerald-100/80 mt-1">
              {shareError
                ? 'Unable to fetch live share price'
                : `Based on ${shareSymbol} live price: Rs. ${sharePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-purple-500/25 bg-purple-500/10">
        <p className="text-xs text-slate-200 inline-flex items-center gap-2">
          <Sparkles size={14} className="text-purple-300" />
          Strong USD can make US stocks expensive for Indian investors; stagger entries to reduce forex timing risk.
        </p>
      </div>
    </div>
  );
};

export default GlobalInsightCard;
