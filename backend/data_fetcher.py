import yfinance as yf
import pandas as pd
import numpy as np

STOCK_LIST = {
    # Tech & IT
    "RELIANCE":  "RELIANCE.NS",
    "TCS":       "TCS.NS",
    "INFOSYS":   "INFY.NS",
    "WIPRO":     "WIPRO.NS",
    "HCL TECH":  "HCLTECH.NS",
    "LTIMINDTREE": "LTIM.NS",
    
    # Banking & Finance
    "HDFC BANK": "HDFCBANK.NS",
    "ICICI BANK": "ICICIBANK.NS",
    "SBI":       "SBIN.NS",
    "AXIS BANK": "AXISBANK.NS",
    "BAJAJ FIN": "BAJFINANCE.NS",
    
    # Auto & Manufacturing
    "TATA MOTORS": "TATAMOTORS.NS",
    "MAHINDRA":  "M&M.NS",
    "MARUTI":    "MARUTI.NS",
    
    # Energy & Adani
    "ADANI ENT": "ADANIENT.NS",
    "ADANI GREEN": "ADANIGREEN.NS",
    "NTPC":      "NTPC.NS",
    "TATA POWER": "TATAPOWER.NS",
    
    # Consumer & Others
    "ITC":       "ITC.NS",
    "HUL":       "HINDUNILVR.NS",
    "ZOMATO":    "ZOMATO.NS",
    "JIO FIN":   "JIOFIN.NS",
    
    # Commodities (Using popular Indian ETFs or Global Futures)
    "GOLD":      "GOLDBEES.NS",
    "SILVER":    "SILVER.NS",
    "COPPER":    "HG=F",
    "PLATINUM":  "PL=F",
    "CRUDE OIL": "CL=F"
}

def _symbol_candidates(symbol: str) -> list:
    """Return possible Yahoo Finance symbols for flexible lookup."""
    raw = (symbol or "").strip().upper()
    if not raw:
        raise ValueError("Symbol is required")

    if raw in STOCK_LIST:
        return [STOCK_LIST[raw]]

    # If user already passed an exchange suffix/futures format, trust it.
    if any(token in raw for token in [".", "=", "-"]):
        return [raw]

    # Try global symbol first, then common Indian exchanges.
    return [raw, f"{raw}.NS", f"{raw}.BO"]


def sanitize_symbol(symbol: str) -> str:
    """Map common names to tickers and ensure exchange suffix."""
    s = symbol.upper().strip()
    if s in STOCK_LIST:
        return STOCK_LIST[s]
    if "." not in s:
        # Default to NSE for major Indian stocks
        return f"{s}.NS"
    return s

def get_stock_history(symbol: str, period: str = "1y") -> pd.DataFrame:
    """Fetch history using yfinance with intelligent symbol sanitization."""
    ticker_symbol = sanitize_symbol(symbol)
    ticker = yf.Ticker(ticker_symbol)
    df = ticker.history(period=period)
    df["daily_return"] = df["Close"].pct_change()
    df.attrs["resolved_symbol"] = ticker_symbol
    return df


def _fetch_first_history(candidates: list, period: str):
    for candidate in candidates:
        ticker = yf.Ticker(candidate)
        df = ticker.history(period=period)
        if not df.empty:
            return candidate, df
    raise ValueError(f"No data found for symbol candidates: {', '.join(candidates)}")


def _fetch_first_price(candidates: list) -> tuple:
    for candidate in candidates:
        ticker = yf.Ticker(candidate)
        try:
            fast = getattr(ticker, "fast_info", {}) or {}
            price = fast.get("lastPrice") or fast.get("regularMarketPrice")
            if price:
                return candidate, float(price)
        except Exception:
            pass
        try:
            info = ticker.info or {}
            price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose")
            if price:
                return candidate, float(price)
        except Exception:
            pass
    raise ValueError(f"Unable to fetch current price for: {', '.join(candidates)}")


def get_stock_history(symbol: str, period: str = "2y"):
    """Fetch historical price data from Yahoo Finance."""
    candidates = _symbol_candidates(symbol)
    resolved_symbol, df = _fetch_first_history(candidates, period)

    df["daily_return"] = df["Close"].pct_change()
    df.attrs["resolved_symbol"] = resolved_symbol
    return df

def get_current_price(symbol: str) -> float:
    """Get the latest price of a stock."""
    candidates = _symbol_candidates(symbol)
    _, price = _fetch_first_price(candidates)
    return price

def get_stock_stats(symbol: str) -> dict:
    """Get summarized statistics for a stock."""
    df = get_stock_history(symbol)
    current_price = get_current_price(symbol)
    daily_returns = df["daily_return"].dropna()
    resolved_symbol = df.attrs.get("resolved_symbol", symbol)

    return {
        "symbol":          symbol.upper(),
        "resolved_symbol": resolved_symbol,
        "name":            resolved_symbol.replace(".NS", "").replace(".BO", ""),
        "current_price":   round(current_price, 2),
        "volatility_pct":  round(float(daily_returns.std()) * 100, 3),
        "avg_daily_return":round(float(daily_returns.mean()) * 100, 4),
        "week52_high":     round(float(df["High"].max()), 2),
        "week52_low":      round(float(df["Low"].min()), 2),
        "data_days":       len(df)
    }

def get_frontend_chart_data(symbol: str, period: str = "6mo") -> list:
    """Fetch history and map precisely to Lightweight Charts {time, open, high, low, close}."""
    df = get_stock_history(symbol, period)
    chart_data = []
    for index, row in df.iterrows():
        unix_time = int(index.timestamp())
        chart_data.append({
            "time": unix_time,
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2)
        })
    return chart_data

def get_stock_cagr(symbol: str, period: str = "5y") -> float:
    """Calculates the Compound Annual Growth Rate over the given period."""
    try:
        df = get_stock_history(symbol, period)
        if len(df) < 20: return 0.12 # Fallback
        start_price = df["Close"].iloc[0]
        end_price = df["Close"].iloc[-1]
        years = len(df) / 252 
        if start_price <= 0 or years <= 0: return 0.12
        cagr = (end_price / start_price) ** (1 / years) - 1
        return round(float(cagr), 4)
    except Exception:
        return 0.12

def get_historical_yield(symbol: str) -> float:
    """Simple 1-year yield for quicker snapshots."""
    try:
        df = get_stock_history(symbol, "1y")
        if len(df) < 2: return 0.12
        start = df["Close"].iloc[0]
        end = df["Close"].iloc[-1]
        return round((end - start) / start, 4)
    except:
        return 0.12
