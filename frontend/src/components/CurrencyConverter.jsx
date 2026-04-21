import React, { useMemo } from 'react';
import { RefreshCcw, ArrowRightLeft } from 'lucide-react';

const CurrencyConverter = ({
  amount,
  onAmountChange,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  currencies,
  convertedAmount,
  onSwap
}) => {
  const financialTag = useMemo(() => {
    if (convertedAmount < 5000) return 'Starter Allocation';
    if (convertedAmount < 30000) return 'Small Investment';
    if (convertedAmount < 100000) return 'Growth Allocation';
    return 'High Capital Exposure';
  }, [convertedAmount]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-900">
          Currency Conversion Engine
        </h3>
        <RefreshCcw size={16} className="text-emerald-600" />
      </div>

      <div className="grid md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-[11px] uppercase text-emerald-700 font-bold block mb-2">Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-2xl font-black text-emerald-950 outline-none focus:border-emerald-500/40"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase text-emerald-700 font-bold block mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => onFromCurrencyChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500/40"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code} className="bg-white">
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSwap}
            className="w-12 h-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 flex items-center justify-center transition-colors"
            title="Swap currencies"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        <div>
          <label className="text-[11px] uppercase text-emerald-700 font-bold block mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => onToCurrencyChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500/40"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code} className="bg-white">
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/50">
        <p className="text-[11px] uppercase text-emerald-700 font-bold mb-1">Converted Value</p>
        <p className="text-4xl font-black tracking-tight text-emerald-900">
          {toCurrency} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-emerald-700/70 mt-2 font-medium">
          Financial context: <span className="text-emerald-900 font-bold">{financialTag}</span>
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;
