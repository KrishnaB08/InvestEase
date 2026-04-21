import math

# Extensive Mock Dataset (50+ Stocks)
MOCK_MARKET_DATA = [
    {"symbol": "RELIANCE", "name": "Reliance Industries", "sector": "Energy", "pe": 28.5, "roce": 12.4, "cagr": 15.2, "debt_equity": 0.38, "peg": 1.88, "growth_3y": [100, 115, 132]},
    {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT", "pe": 31.2, "roce": 45.1, "cagr": 12.8, "debt_equity": 0.05, "peg": 2.45, "growth_3y": [100, 112, 126]},
    {"symbol": "HDFCBANK", "name": "HDFC Bank", "sector": "Banks", "pe": 19.8, "roce": 16.5, "cagr": 18.4, "debt_equity": 0.95, "peg": 1.08, "growth_3y": [100, 118, 140]},
    {"symbol": "INFOSYS", "name": "Infosys Ltd", "sector": "IT", "pe": 25.4, "roce": 35.8, "cagr": 14.2, "debt_equity": 0.08, "peg": 1.78, "growth_3y": [100, 114, 130]},
    {"symbol": "ICICIBANK", "name": "ICICI Bank", "sector": "Banks", "pe": 17.5, "roce": 15.2, "cagr": 22.1, "debt_equity": 0.88, "peg": 0.79, "growth_3y": [100, 122, 150]},
    {"symbol": "TATAMOTORS", "name": "Tata Motors", "sector": "Auto", "pe": 12.4, "roce": 18.2, "cagr": 25.5, "debt_equity": 1.15, "peg": 0.48, "growth_3y": [100, 135, 185]},
    {"symbol": "MARUTI", "name": "Maruti Suzuki", "sector": "Auto", "pe": 35.2, "roce": 14.5, "cagr": 11.2, "debt_equity": 0.02, "peg": 3.14, "growth_3y": [100, 110, 122]},
    {"symbol": "WIPRO", "name": "Wipro Ltd", "sector": "IT", "pe": 22.1, "roce": 20.4, "cagr": 8.5, "debt_equity": 0.15, "peg": 2.60, "growth_3y": [100, 108, 118]},
    {"symbol": "AXISBANK", "name": "Axis Bank", "sector": "Banks", "pe": 14.8, "roce": 13.8, "cagr": 20.2, "debt_equity": 0.92, "peg": 0.73, "growth_3y": [100, 120, 144]},
    {"symbol": "M&M", "name": "Mahindra & Mahindra", "sector": "Auto", "pe": 18.4, "roce": 16.8, "cagr": 18.5, "debt_equity": 0.85, "peg": 0.99, "growth_3y": [100, 118, 140]},
    {"symbol": "HCLTECH", "name": "HCL Technologies", "sector": "IT", "pe": 20.5, "roce": 28.2, "cagr": 13.5, "debt_equity": 0.12, "peg": 1.52, "growth_3y": [100, 113, 128]},
    {"symbol": "SUNPHARMA", "name": "Sun Pharma", "sector": "Pharma", "pe": 32.4, "roce": 14.8, "cagr": 10.4, "debt_equity": 0.08, "peg": 3.11, "growth_3y": [100, 110, 121]},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "sector": "Telecom", "pe": 45.2, "roce": 11.5, "cagr": 20.1, "debt_equity": 1.45, "peg": 2.25, "growth_3y": [100, 120, 144]},
    {"symbol": "TITAN", "name": "Titan Company", "sector": "Retail", "pe": 85.4, "roce": 25.1, "cagr": 18.2, "debt_equity": 0.35, "peg": 4.69, "growth_3y": [100, 118, 140]},
    {"symbol": "ASIANPAINT", "name": "Asian Paints", "sector": "Consumer", "pe": 72.1, "roce": 32.5, "cagr": 12.4, "debt_equity": 0.05, "peg": 5.81, "growth_3y": [100, 112, 125]},
    {"symbol": "KOTAKBANK", "name": "Kotak Bank", "sector": "Banks", "pe": 22.4, "roce": 14.5, "cagr": 16.5, "debt_equity": 0.82, "peg": 1.35, "growth_3y": [100, 116, 135]},
    {"symbol": "LTIM", "name": "LTIMindtree", "sector": "IT", "pe": 34.2, "roce": 30.1, "cagr": 15.5, "debt_equity": 0.10, "peg": 2.21, "growth_3y": [100, 115, 133]},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "sector": "Finance", "pe": 32.5, "roce": 18.2, "cagr": 25.4, "debt_equity": 3.45, "peg": 1.28, "growth_3y": [100, 125, 158]},
    {"symbol": "ITC", "name": "ITC Ltd", "sector": "Consumer", "pe": 25.4, "roce": 38.2, "cagr": 10.2, "debt_equity": 0.01, "peg": 2.49, "growth_3y": [100, 110, 121]},
    {"symbol": "ADANIENT", "name": "Adani Ent", "sector": "Energy", "pe": 110.5, "roce": 8.5, "cagr": 35.2, "debt_equity": 1.85, "peg": 3.14, "growth_3y": [100, 135, 182]},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banks", "pe": 9.5, "roce": 11.2, "cagr": 14.5, "debt_equity": 1.25, "peg": 0.65, "growth_3y": [100, 114, 131]},
    {"symbol": "LT", "name": "Larsen & Toubro", "sector": "Infrastructure", "pe": 35.2, "roce": 14.8, "cagr": 12.1, "debt_equity": 1.12, "peg": 2.91, "growth_3y": [100, 112, 125]},
    {"symbol": "HEROMOTOCO", "name": "Hero Moto", "sector": "Auto", "pe": 18.1, "roce": 22.4, "cagr": 10.5, "debt_equity": 0.05, "peg": 1.72, "growth_3y": [100, 110, 122]},
    {"symbol": "ONGC", "name": "ONGC", "sector": "Energy", "pe": 6.8, "roce": 15.2, "cagr": 8.4, "debt_equity": 0.45, "peg": 0.81, "growth_3y": [100, 108, 117]},
    {"symbol": "COALINDIA", "name": "Coal India", "sector": "Energy", "pe": 8.2, "roce": 48.5, "cagr": 12.1, "debt_equity": 0.12, "peg": 0.68, "growth_3y": [100, 112, 126]},
    # ... adding more to reach 50+ (omitting for brevity but will fill in logic)
]

# Helper to generate more data if needed
for i in range(len(MOCK_MARKET_DATA), 55):
    MOCK_MARKET_DATA.append({
        "symbol": f"MOCK{i}",
        "name": f"Mock Corp {i}",
        "sector": "Misc",
        "pe": 15 + (i % 20),
        "roce": 10 + (i % 30),
        "cagr": 5 + (i % 25),
        "debt_equity": 0.1 + (i % 10) / 10,
        "peg": 0.5 + (i % 15) / 10,
        "growth_3y": [100, 105 + (i % 10), 110 + (i % 20)]
    })

def calculate_score(stock):
    """
    Ranks stocks using a Weighted Composite Score.
    Weightings: 40% Growth (CAGR), 30% Profitability (ROCE), 30% Valuation (Normalized PE/PEG).
    """
    # Normalize values for fair comparison (Higher is better)
    growth_score = min(stock['cagr'] / 25, 1.0) * 40 # Max 25% CAGR
    profit_score = min(stock['roce'] / 40, 1.0) * 30 # Max 40% ROCE
    
    # Valuation: Lower PE/PEG is better. We invert it.
    valuation_score = (1 / max(stock['peg'], 0.1)) # Higher score for lower PEG
    valuation_score = min(valuation_score / 2, 1.0) * 30 # Normalized
    
    # Penalize high debt
    debt_penalty = min(stock['debt_equity'] / 3, 0.5) * 10 # Up to 10 points off
    
    return round(growth_score + profit_score + valuation_score - debt_penalty, 2)

def get_top_five_stocks(sector=None):
    """Filter and rank stocks to find the Top 5."""
    pool = MOCK_MARKET_DATA
    if sector and sector != "All":
        pool = [s for s in pool if s['sector'].lower() == sector.lower()]
    
    # Calculate scores
    ranked = []
    for stock in pool:
        score = calculate_score(stock)
        ranked.append({**stock, "composite_score": score})
    
    # Sort by score descending
    ranked.sort(key=lambda x: x['composite_score'], reverse=True)
    return ranked[:5]

def compare_top_five(stock_list):
    """Identifies Best in Class for different categories."""
    if not stock_list: return {}
    
    best_value = min(stock_list, key=lambda x: x['peg'])
    highest_momentum = max(stock_list, key=lambda x: x['cagr'])
    lowest_debt = min(stock_list, key=lambda x: x['debt_equity'])
    highest_roce = max(stock_list, key=lambda x: x['roce'])
    
    return {
        "best_value": best_value['symbol'],
        "highest_momentum": highest_momentum['symbol'],
        "lowest_debt": lowest_debt['symbol'],
        "highest_roce": highest_roce['symbol'],
        "why_these": f"These stocks were selected because they maintain a healthy balance between Growth (CAGR > {min(s['cagr'] for s in stock_list)}%) and Efficient Capital Use (ROCE > {min(s['roce'] for s in stock_list)}%)."
    }

def get_field_leader(sector: str):
    """Used for AI Advisor contextual recommendation. Returns top sector leader or overall lead if no sector match."""
    try:
        s_clean = sector.split("&")[0].strip() if "&" in sector else sector.strip()
        top = get_top_five_stocks(s_clean)
        
        if top: return top[0]
        
        # Fallback to the absolute best in the entire market if the sector is niche
        all_top = get_top_five_stocks("All")
        return all_top[0] if all_top else None
    except:
        return None

def get_peers(symbol):
    """Finds 2-3 stocks in the same sector with a similar composite score profile."""
    # Find the target stock
    target = next((s for s in MOCK_MARKET_DATA if s['symbol'].upper() == symbol.upper()), None)
    if not target: return []
    
    target_score = calculate_score(target)
    
    # Find all in same sector
    pool = [s for s in MOCK_MARKET_DATA if s['sector'] == target['sector'] and s['symbol'] != target['symbol']]
    
    # Rank them by closeness to target score
    pool_scored = []
    for s in pool:
        score = calculate_score(s)
        pool_scored.append({**s, "composite_score": score, "closeness": abs(score - target_score)})
        
    pool_scored.sort(key=lambda x: x['closeness'])
    return pool_scored[:3] # Return top 3 closest peers
