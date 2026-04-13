import time
from datetime import date, timedelta
from typing import Dict, List

import yfinance as yf

_cache: Dict[str, tuple] = {}
CACHE_TTL_SECONDS = 300

# Static fallback for offline mode only.
FALLBACK_INR_RATES = {
    "USD": 83.2,
    "EUR": 90.3,
    "GBP": 105.6,
    "INR": 1.0,
    "JPY": 0.55,
    "AED": 22.65,
}

# USD value of 1 unit of currency from Yahoo Finance symbols.
USD_PER_CURRENCY_SYMBOLS = {
    "EUR": "EURUSD=X",  # 1 EUR in USD
    "GBP": "GBPUSD=X",  # 1 GBP in USD
    "INR": "USDINR=X",  # INR per USD -> inverted
    "JPY": "USDJPY=X",  # JPY per USD -> inverted
    "AED": "USDAED=X",  # AED per USD -> inverted
}


def _cache_get(key: str):
    if key not in _cache:
        return None
    value, ts = _cache[key]
    if time.time() - ts > CACHE_TTL_SECONDS:
        return None
    return value


def _cache_set(key: str, value):
    _cache[key] = (value, time.time())


def _fallback_rate(from_currency: str, to_currency: str) -> float:
    from_inr = FALLBACK_INR_RATES.get(from_currency, 1.0)
    to_inr = FALLBACK_INR_RATES.get(to_currency, 1.0)
    return from_inr / to_inr


def _latest_close(symbol: str) -> float:
    df = yf.Ticker(symbol).history(period="7d", interval="1d")
    if df.empty:
        raise ValueError(f"No FX data for {symbol}")
    close = df["Close"].dropna()
    if close.empty:
        raise ValueError(f"No close FX data for {symbol}")
    return float(close.iloc[-1])


def _usd_per_currency(currency: str) -> float:
    currency = currency.upper()
    if currency == "USD":
        return 1.0
    symbol = USD_PER_CURRENCY_SYMBOLS.get(currency)
    if not symbol:
        raise ValueError(f"Unsupported currency: {currency}")

    price = _latest_close(symbol)
    if currency in {"INR", "JPY", "AED"}:
        if price <= 0:
            raise ValueError(f"Invalid FX price for {currency}")
        return 1.0 / price
    return price


def convert_currency(amount: float, from_currency: str, to_currency: str) -> dict:
    from_currency = from_currency.upper().strip()
    to_currency = to_currency.upper().strip()
    key = f"convert:{amount}:{from_currency}:{to_currency}"
    cached = _cache_get(key)
    if cached:
        return cached

    source = "yfinance"
    response_date = date.today().isoformat()
    try:
        usd_per_from = _usd_per_currency(from_currency)
        usd_per_to = _usd_per_currency(to_currency)
        if usd_per_to <= 0:
            raise ValueError("Invalid conversion denominator")
        rate = usd_per_from / usd_per_to
    except Exception:
        rate = _fallback_rate(from_currency, to_currency)
        source = "fallback"

    result = {
        "amount": amount,
        "from": from_currency,
        "to": to_currency,
        "exchange_rate": rate,
        "converted_amount": round(amount * rate, 4),
        "date": response_date,
        "source": source,
    }
    _cache_set(key, result)
    return result


def get_trend(base: str = "USD", quote: str = "INR", days: int = 7) -> dict:
    base = base.upper().strip()
    quote = quote.upper().strip()
    days = max(3, min(days, 14))
    key = f"trend:{base}:{quote}:{days}"
    cached = _cache_get(key)
    if cached:
        return cached

    points: List[dict] = []
    source = "yfinance"
    try:
        # Prefer direct FX pair when available.
        direct_symbol = f"{base}{quote}=X"
        direct_df = yf.Ticker(direct_symbol).history(period="21d", interval="1d")
        if not direct_df.empty:
            for idx, row in direct_df.tail(days).iterrows():
                points.append({"date": idx.date().isoformat(), "value": float(row["Close"])})
        else:
            # Cross-rate via USD if direct pair is unavailable.
            cross_days = max(14, days + 7)
            base_usd_series = _usd_history_series(base, cross_days)
            quote_usd_series = _usd_history_series(quote, cross_days)
            common_dates = sorted(set(base_usd_series.keys()) & set(quote_usd_series.keys()))
            for day in common_dates[-days:]:
                value = base_usd_series[day] / quote_usd_series[day]
                points.append({"date": day, "value": float(value)})
    except Exception:
        end = date.today()
        fallback_rate = _fallback_rate(base, quote)
        points = [
            {"date": (end - timedelta(days=6)).isoformat(), "value": fallback_rate * 0.994},
            {"date": (end - timedelta(days=5)).isoformat(), "value": fallback_rate * 0.998},
            {"date": (end - timedelta(days=4)).isoformat(), "value": fallback_rate * 0.997},
            {"date": (end - timedelta(days=3)).isoformat(), "value": fallback_rate * 1.001},
            {"date": (end - timedelta(days=2)).isoformat(), "value": fallback_rate * 1.003},
            {"date": (end - timedelta(days=1)).isoformat(), "value": fallback_rate * 1.002},
            {"date": end.isoformat(), "value": fallback_rate},
        ]
        source = "fallback"

    if len(points) < 2:
        fallback_rate = _fallback_rate(base, quote)
        points = [
            {"date": (end - timedelta(days=1)).isoformat(), "value": fallback_rate * 0.998},
            {"date": end.isoformat(), "value": fallback_rate},
        ]
        source = "fallback"

    first = points[0]["value"]
    last = points[-1]["value"]
    change_pct = ((last - first) / first) * 100 if first else 0

    result = {
        "base": base,
        "quote": quote,
        "direction": "up" if change_pct >= 0 else "down",
        "change_pct": round(change_pct, 4),
        "points": points[-days:],
        "latest": last,
        "source": source,
    }
    _cache_set(key, result)
    return result


def _usd_history_series(currency: str, lookback_days: int) -> Dict[str, float]:
    currency = currency.upper()
    if currency == "USD":
        today = date.today()
        return {
            (today - timedelta(days=i)).isoformat(): 1.0 for i in range(lookback_days, -1, -1)
        }

    symbol = USD_PER_CURRENCY_SYMBOLS.get(currency)
    if not symbol:
        raise ValueError(f"Unsupported currency: {currency}")

    df = yf.Ticker(symbol).history(period=f"{max(lookback_days, 7)}d", interval="1d")
    if df.empty:
        raise ValueError(f"No history for {currency}")

    series: Dict[str, float] = {}
    for idx, row in df.iterrows():
        close = float(row["Close"])
        day = idx.date().isoformat()
        if currency in {"INR", "JPY", "AED"}:
            if close <= 0:
                continue
            series[day] = 1.0 / close
        else:
            series[day] = close
    return series
