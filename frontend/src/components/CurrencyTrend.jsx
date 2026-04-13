import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const CurrencyTrend = ({ trend }) => {
  const isUp = trend.direction === 'up';

  return (
    <div className="glass-card border-white/10 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          USD to INR Trend Indicator
        </h3>
        <Activity size={16} className="text-blue-400" />
      </div>

      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase text-slate-500 font-bold">Trend Signal</p>
            <p className={`text-xl font-black ${isUp ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isUp ? 'USD Strengthening' : 'INR Strengthening'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUp ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Last move: {trend.changePct > 0 ? '+' : ''}{trend.changePct.toFixed(2)}%
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-white/10 bg-black/20">
        <div className="flex h-24 items-end gap-2">
          {trend.sparkline.map((point, idx) => (
            <div
              key={idx}
              className={`w-full rounded-t-md ${isUp ? 'bg-rose-400/70' : 'bg-emerald-400/70'}`}
              style={{ height: `${point}%` }}
            />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500 uppercase font-bold">
          Mock 7-session momentum graph
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <p className="text-xs text-slate-300 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          INR weakening means imports become expensive and inflation pressure can rise.
        </p>
        <p className="text-xs text-slate-300 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          USD strengthening makes US assets costlier for Indian investors.
        </p>
      </div>
    </div>
  );
};

export default CurrencyTrend;
