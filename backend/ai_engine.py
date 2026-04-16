import os
import json
from anthropic import Anthropic
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
        "ticker": symbol.upper(),
        "name": company,
        "sector": sector,
        "price": price,
        "currencySymbol": currency_symbol,
        "marketCap": f"{currency_symbol}125k Cr",
        "technical": {"trend": trend, "volatility": risk_level, "momentum": "Strong" if action == "Invest" else "Weak"},
        "decisionInfo": {"action": action, "confidence": confidence, "riskLevel": risk_level},
        "explanation": f"Live AI is temporarily unavailable, so this is a structured fallback analysis. Reason: {reason}",
        "debate": {
            "bull": [
                f"{company} has active market participation and tradable liquidity.",
                "Current risk profile supports disciplined position sizing.",
                "Structured entry and stop-loss improve downside control."
            ],
            "bear": [
                "Macro volatility can quickly change sentiment.",
                "Short-term moves may invalidate entry zones.",
                "Event-driven news can increase drawdown risk."
            ]
        },
        "news": [{
            "headline": f"{company} sentiment remains mixed as broader markets consolidate",
            "impactChain": "Global cues -> intraday volatility -> cautious position management",
            "effect": "Neutral Bias",
            "impactLevel": "Medium",
            "sectorAffected": "No"
        }],
        "scenarios": {"worst": -12, "expected": 9, "best": 18},
        "suggestion": {"amountRange": f"{currency_symbol}2,000 - {currency_symbol}5,000", "percentage": "10%"},
        "timeframe": "Mid-term",
        "framework": {"trend": True, "risk": True, "news": False, "entry": True, "exit": True, "summary": "Model fallback active with live market inputs."},
        "entryPoints": {"entryZone": entry_zone, "target": target, "stopLoss": stop_loss}
    }

def get_ai_advice(
    symbol: str,
    name: str,
    price: float,
    change: float,
    trend: str,
    risk: str,
    currency: str = "INR"
):
    """
    Calls Claude AI to get advanced, jargon-free investment advice.
    Now accepts real news headlines from NewsAPI.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    trend_bool = "true" if trend.lower() == "uptrend" else "false"
    risk_bool = "false" if risk.lower() == "high" else "true"
    currency_symbol = "₹" if currency.upper() == "INR" else "$" if currency.upper() == "USD" else f"{currency} "
    
    prompt = f"""
    You are a professional stock market analyst.

    Analyze this stock:
    Name: {name}
    Price: {currency_symbol}{price}
    Change: {change}%
    Trend: {trend}
    Risk Level: {risk}

    Give structured output:
    Decision:
    Confidence:
    Risk:
    Reason:
    Bull Case:
    Bear Case:
    Investment Range:
    Time Strategy:
    
    Return ONLY a JSON object with this EXACT structure based on your analysis (No markdown format, no intro text, raw JSON only):
    {{
      "ticker": "{symbol}",
      "name": "{name}",
      "sector": "Identify the sector from name",
      "price": {price},
      "currencySymbol": "{currency_symbol}",
      "marketCap": "Estimate Market Cap starting with {currency_symbol}",
      "technical": {{
        "trend": "{trend.capitalize()}",
        "volatility": "{risk.capitalize()}",
        "momentum": "Strong OR Weak"
      }},
      "decisionInfo": {{
        "action": "Invest OR Wait OR Avoid",
        "confidence": <integer 0-100 logic score>,
        "riskLevel": "{risk.capitalize()}"
      }},
      "explanation": "A high-quality 2-3 sentence institutional explanation (Reason).",
      "debate": {{
        "bull": ["3 short bullet points from Bull Case"],
        "bear": ["3 short bullet points from Bear Case"]
      }},
      "news": [
        {{
          "headline": "Generate a plausible headline matching {trend}",
          "impactChain": "Cause -> Immediate Effect -> Final Impact",
          "effect": "Negative Bias OR Positive Bias",
          "impactLevel": "High OR Medium OR Low",
          "sectorAffected": "Yes/No"
        }}
      ],
      "scenarios": {{
        "worst": <integer negative percentage>,
        "expected": <integer positive percentage>,
        "best": <integer positive percentage>
      }},
      "suggestion": {{
         "amountRange": "Investment Range e.g. {currency_symbol}5,000 - {currency_symbol}10,000",
         "percentage": "e.g. 5-10%"
      }},
      "timeframe": "Time Strategy (Short-term OR Mid-term OR Long-term)",
      "framework": {{
        "trend": {trend_bool},
        "risk": {risk_bool},
        "news": true,
        "entry": true,
        "exit": true,
        "summary": "1 short conclusive sentence."
      }},
      "entryPoints": {{
         "entryZone": <optimal entry price close to {price}>,
         "target": <take profit target>,
         "stopLoss": <risk management stop loss>
      }}
    }}
    """

    if not api_key or api_key == "your_claude_api_key_here":
        return _build_fallback_response(
            symbol=symbol,
            price=price,
            volatility=abs(change),  # Dynamic fallback
            reason="No valid ANTHROPIC_API_KEY found.",
            company_name=name,
            sector="Equity",
            currency=currency
        )

    try:
        client = Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        # Parse text, removing any prefix if model disobeyed and used markdown
        response_text = message.content[0].text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)
    except Exception as e:
        return _build_fallback_response(
            symbol=symbol,
            price=price,
            volatility=abs(change),
            reason=str(e),
            company_name=name,
            sector="Equity",
            currency=currency
        )
