import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# Simple in-memory cache to avoid burning API quota
_cache = {}
CACHE_TTL = 900  # 15 minutes

# Map stock symbols to searchable company names
SYMBOL_TO_COMPANY = {
    "RELIANCE": "Reliance Industries",
    "TCS": "Tata Consultancy Services",
    "INFY": "Infosys",
    "INFOSYS": "Infosys",
    "WIPRO": "Wipro",
    "HCLTECH": "HCL Technologies",
    "HCL TECH": "HCL Technologies",
    "LTIMINDTREE": "LTI Mindtree",
    "HDFCBANK": "HDFC Bank",
    "HDFC BANK": "HDFC Bank",
    "ICICIBANK": "ICICI Bank",
    "ICICI BANK": "ICICI Bank",
    "SBI": "State Bank of India",
    "SBIN": "State Bank of India",
    "AXISBANK": "Axis Bank",
    "AXIS BANK": "Axis Bank",
    "BAJFINANCE": "Bajaj Finance",
    "BAJAJ FIN": "Bajaj Finance",
    "TATAMOTORS": "Tata Motors",
    "TATA MOTORS": "Tata Motors",
    "MAHINDRA": "Mahindra",
    "MARUTI": "Maruti Suzuki",
    "ADANIENT": "Adani Enterprises",
    "ADANI ENT": "Adani Enterprises",
    "ADANIGREEN": "Adani Green Energy",
    "ADANI GREEN": "Adani Green Energy",
    "NTPC": "NTPC Limited",
    "TATAPOWER": "Tata Power",
    "TATA POWER": "Tata Power",
    "ITC": "ITC Limited",
    "HINDUNILVR": "Hindustan Unilever",
    "HUL": "Hindustan Unilever",
    "ZOMATO": "Zomato",
    "JIOFIN": "Jio Financial Services",
    "JIO FIN": "Jio Financial Services",
    "TITAN": "Titan Company",
    "HDFC": "HDFC Bank",
}


def get_stock_news(symbol: str, limit: int = 5) -> list:
    """
    Fetch recent news for a stock using NewsAPI.
    Returns list of { headline, source, url, publishedAt, description }.
    Falls back to empty list if API key is missing or request fails.
    """
    api_key = os.getenv("NEWS_API_KEY")

    if not api_key or api_key == "your_news_api_key_here":
        return _get_fallback_news(symbol)

    # Check cache first
    cache_key = symbol.upper()
    if cache_key in _cache:
        cached_data, cached_time = _cache[cache_key]
        if time.time() - cached_time < CACHE_TTL:
            return cached_data

    # Map symbol to company name for better search results
    search_query = SYMBOL_TO_COMPANY.get(symbol.upper(), symbol)

    try:
        response = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": f"{search_query} stock market",
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": limit,
                "apiKey": api_key
            },
            timeout=10
        )

        if response.status_code != 200:
            print(f"NewsAPI Error: {response.status_code} - {response.text}")
            return _get_fallback_news(symbol)

        data = response.json()
        articles = data.get("articles", [])

        result = []
        for article in articles:
            result.append({
                "headline": article.get("title", "No title"),
                "source": article.get("source", {}).get("name", "Unknown"),
                "url": article.get("url", ""),
                "publishedAt": article.get("publishedAt", ""),
                "description": article.get("description", "")
            })

        # Cache the results
        _cache[cache_key] = (result, time.time())
        return result

    except Exception as e:
        print(f"NewsAPI fetch error: {e}")
        return _get_fallback_news(symbol)


def get_news_headlines_for_ai(symbol: str, limit: int = 3) -> str:
    """
    Get formatted news headlines string for the AI prompt.
    Returns a concise string of headlines for Claude to analyze.
    """
    news = get_stock_news(symbol, limit)

    if not news:
        return "No major news today."

    headlines = []
    for item in news:
        source = item.get("source", "")
        headline = item.get("headline", "")
        if headline and headline != "No title":
            headlines.append(f"- {headline} ({source})")

    if not headlines:
        return "No major news today."

    return "\n".join(headlines)


def _get_fallback_news(symbol: str) -> list:
    """Provide mock news when API is unavailable."""
    company = SYMBOL_TO_COMPANY.get(symbol.upper(), symbol.upper())
    return [
        {
            "headline": f"{company} shows steady performance amid market volatility",
            "source": "InvestEase Mock",
            "url": "",
            "publishedAt": "",
            "description": f"Mock news for {company}. Add a real NEWS_API_KEY to get live headlines."
        },
        {
            "headline": f"Analysts maintain outlook on {company} stock",
            "source": "InvestEase Mock",
            "url": "",
            "publishedAt": "",
            "description": "This is fallback data. Connect NewsAPI for real results."
        }
    ]
