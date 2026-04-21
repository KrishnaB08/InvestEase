import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def _build_fallback_response(
    symbol: str,
    price: float,
    volatility: float,
    reason: str,
    company_name: str = None,
    sector: str = "Unknown",
    currency: str = "INR"
) -> dict:
    """Return a UI-safe response shape when AI provider is unavailable."""
    action = "Invest" if volatility < 1.8 else "Wait" if volatility < 3.0 else "Avoid"
    confidence = 78 if action == "Invest" else 62 if action == "Wait" else 48
    risk_level = "Low" if volatility < 1.2 else "Medium" if volatility < 2.8 else "High"
    trend = "Uptrend" if action == "Invest" else "Sideways" if action == "Wait" else "Downtrend"
    company = company_name or symbol.upper()
    entry_zone = round(price * 0.985, 2)
    target = round(price * (1.12 if action == "Invest" else 1.06), 2)
    stop_loss = round(price * (0.95 if action == "Invest" else 0.92), 2)
    currency_symbol = "₹" if currency.upper() == "INR" else "$" if currency.upper() == "USD" else f"{currency} "
    
    return {
        "is_fallback": True,
        "ticker": symbol.upper(),
        "name": company,
        "sector": sector,
        "price": price,
        "currencySymbol": currency_symbol,
        "marketCap": f"{currency_symbol}125k Cr",
        "stabilityScore": 85 if risk_level == "Low" else 65 if risk_level == "Medium" else 45,
        "technical": {"trend": trend, "volatility": risk_level, "momentum": "Strong" if action == "Invest" else "Weak"},
        "decisionInfo": {"action": action, "confidence": confidence, "riskLevel": risk_level},
        "explanation": f"The foundation for your long-term wealth is built on fundamental health. This analysis focuses on market cycles and strategic position management. Reason: {reason}",
        "debate": {
            "bull": [
                f"{company} shows resilient fundamental health for long-term growth.",
                "Your capital is working effectively within this market cycle.",
                "Strategic entry zones provide a foundation for future compounding."
            ],
            "bear": [
                "Market cycles may require patience during consolidation.",
                "Disciplined risk management is key to navigating shorter horizons.",
                "Diversification ensures your family roadmap remains on track."
            ]
        },
        "news": [{
            "headline": f"Fundamental indicators for {company} align with strategic growth milestones",
            "impactChain": "Stable Earnings -> Continued Reinvestment -> Long-term Value Accrual",
            "effect": "Positive Outlook",
            "impactLevel": "Medium",
            "sectorAffected": "No"
        }],
        "newsReport": {
            "insights": [
                f"{company} maintains a strong position in the current market cycle.",
                "Long-term value creation remains the core focus of the leadership.",
                "Historical data suggests resilience during consolidation phases.",
                "Diversification across the sector provides a safety net for investors.",
                "Strategic reinvestment of capital is driving future innovation.",
                "Consistent dividend payouts reflect the company's financial health.",
                "Market sentiment for {company} is primarily driven by fundamental value.",
                "The current price zone offers a constructive entry for goal-seekers.",
                "Debt-to-equity ratios are well-managed compared to sector peers.",
                "Global economic trends favor the company's core business model.",
                "Your wealth roadmap benefits from this asset's compounding potential.",
                "A patient approach aligns with the Architect's long-term vision."
            ],
            "sentiment": "Positive",
            "riskLevel": "Low",
            "affectedSectors": [sector],
            "verdict": f"Invest in {company} for long-term compounding and family goal building."
        },
        "scenarios": {"worst": -12, "expected": 9, "best": 18},
        "suggestion": {"amountRange": f"{currency_symbol}2,000 - {currency_symbol}5,000", "percentage": "10%"},
        "timeframe": "Goal-Driven Horizon",
        "framework": {"trend": True, "risk": True, "news": False, "entry": True, "exit": True, "summary": "Strategic roadmap active with fundamental inputs."},
        "entryPoints": {"entryZone": entry_zone, "target": target, "stopLoss": stop_loss}
    }

def get_ai_advice(
    symbol: str,
    name: str,
    price: float,
    change: float,
    trend: str,
    risk: str,
    currency: str = "INR",
    news_context: str = ""
):
    """
    Calls Google Gemini AI to get advanced, optimistic, and goal-oriented investment advice.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return _build_fallback_response(
            symbol=symbol,
            price=price,
            volatility=abs(change),
            reason="No valid GEMINI_API_KEY found.",
            company_name=name,
            sector="Equity",
            currency=currency
        )

    currency_symbol = "₹" if currency.upper() == "INR" else "$" if currency.upper() == "USD" else f"{currency} "
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest")

    trend_bool = "true" if trend.lower() == "uptrend" else "false"
    risk_bool = "false" if risk.lower() == "high" else "true"
    
    prompt = f"""
    Role: You are an optimistic and highly analytical Financial Strategy Architect & Summarization Engine.
    Your goal is to help users bridge the gap between their current savings and their long-term family dreams using a "Goal-First" investment philosophy.

    Core Philosophy: The stock market is not a casino; it is a tool for long-term wealth creation. 
    Focus on the power of compounding and the clarity of fundamental analysis to replace "decision paralysis" with "confident action."

    Tone Guidelines:
    - NO FEAR: Never mention "market crashes," "losing everything," or "doom." 
    - OPTIMISM: Use terms like "market cycles," "risk management," "growth stages," and "wealth roadmap."
    - EMPOWERMENT: Use "Your capital is working for you" and "Building your family foundation."

    Analyze this stock:
    Name: {name} ({symbol})
    Price: {currency_symbol}{price}
    Change: {change}%
    Trend: {trend}
    Risk Level: {risk}
    
    Recent Market Context (Summarize this for the newsReport):
    {news_context}

    Return ONLY a JSON object with this EXACT structure:
    {{
      "ticker": "{symbol}",
      "name": "{name}",
      "sector": "Identify the sector from name",
      "price": {price},
      "currencySymbol": "{currency_symbol}",
      "marketCap": "Estimate Market Cap starting with {currency_symbol}",
      "stabilityScore": <integer 0-100 based on fundamental health and low volatility>,
      "technical": {{
        "trend": "{trend.capitalize()}",
        "volatility": "Stability Level",
        "momentum": "Strong OR Balanced"
      }},
      "decisionInfo": {{
        "action": "Invest OR Wait OR Accumulate",
        "confidence": <integer 0-100 logic score>,
        "riskLevel": "Strategic Risk Management"
      }},
      "explanation": "A high-quality 2-3 sentence optimistic explanation focusing on long-term wealth and compounding.",
      "debate": {{
        "bull": ["3 short bullet points about fundamental strength and future potential"],
        "bear": ["3 short bullet points about market cycles and patience required"]
      }},
      "newsReport": {{
        "insights": [
          "Exactly 10-12 short bullet points summarizing the provided Market Context",
          "Each bullet point must be UNDER 20 words",
          "Use simple, beginner-friendly language",
          "Focus on market impact, risks, and opportunities"
        ],
        "sentiment": "Positive OR Negative OR Neutral",
        "riskLevel": "Low OR Medium OR High",
        "affectedSectors": ["List 1-3 sectors affected"],
        "verdict": "One single-line beginner-friendly suggestion (Invest / Wait / Avoid + reason)"
      }},
      "news": [
        {{
          "headline": "A positive headline focusing on value creation",
          "impactChain": "Strategy -> Implementation -> Long-term Benefit",
          "effect": "Constructive Outlook",
          "impactLevel": "High OR Medium OR Low",
          "sectorAffected": "Yes/No"
        }}
      ],
      "scenarios": {{
        "worst": <integer negative percentage, e.g., -5>,
        "expected": <integer positive percentage>,
        "best": <integer positive percentage>
      }},
      "suggestion": {{
         "amountRange": "Standard position size range e.g. {currency_symbol}5,000 - {currency_symbol}10,000",
         "percentage": "e.g. 5-10% of goal capital"
      }},
      "timeframe": "Target Horizon (Medium-term OR Long-term)",
      "framework": {{
        "trend": {trend_bool},
        "risk": {risk_bool},
        "news": true,
        "entry": true,
        "exit": true,
        "summary": "1 short empoweringly conclusive sentence."
      }},
      "entryPoints": {{
         "entryZone": <optimal entry price close to {price}>,
         "target": <take profit target based on growth phase>,
         "stopLoss": <risk management floor>
      }}
    }}
    """

    try:
        generation_config = { "response_mime_type": "application/json" }
        response = model.generate_content(prompt, generation_config=generation_config)
        
        data = json.loads(response.text)
        data["is_fallback"] = False
        return data

    except Exception as e:
        print(f"ERROR: Gemini Advice failed: {e}")
        return _build_fallback_response(
            symbol=symbol,
            price=price,
            volatility=abs(change),
            reason=str(e),
            company_name=name,
            sector="Equity",
            currency=currency
        )

def get_discovery_ai_advice(top_five: list, news_context: str = ""):
    """
    Analyzes the Top 5 stock finalists from the Discovery Engine.
    Picks 1 'Grand Winner' and creates a wealth allocation strategy.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "winner": top_five[0]['symbol'] if top_five else "None",
            "reason": "AI Strategy unavailable. Defaulting to technical leader.",
            "allocation": [{"symbol": s['symbol'], "percent": 20} for s in top_five]
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest")
    
    # Format candidates for the prompt
    candidates = "\n".join([
        f"- {s['symbol']}: ROCE {s['roce']}%, CAGR {s['cagr']}%, PE {s['pe']}, PEG {s['peg']}"
        for s in top_five
    ])

    prompt = f"""
    Role: Financial Strategy Architect.
    Task: Analyze these 5 stock finalists and pick the ONE best-of-the-best 'Grand Winner' for the current market cycle.
    
    Candidates:
    {candidates}
    
    Recent Market Context:
    {news_context}
    
    Return ONLY a JSON object with this structure:
    {{
      "winner": "SYMBOL of the best stock",
      "reason": "1-2 sentence peak-performance justification",
      "conviction": <integer 0-100>,
      "allocation": [
        {{ "symbol": "...", "percent": <integer percent of investment capital>, "logic": "Short reason" }},
        ... (for all 5)
      ],
      "totalInvestmentSuggestion": "e.g. ₹1,00,000 for a structural foundation"
    }}
    """

    try:
        generation_config = { "response_mime_type": "application/json" }
        response = model.generate_content(prompt, generation_config=generation_config)
        return json.loads(response.text)
    except Exception as e:
        print(f"Discovery AI Error: {e}")
        return { "winner": top_five[0]['symbol'], "reason": "Structural leader.", "allocation": [] }
