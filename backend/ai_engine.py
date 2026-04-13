import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

def _build_fallback_response(symbol: str, price: float, volatility: float, reason: str) -> dict:
    """Return a UI-safe response shape when AI provider is unavailable."""
    action = "Invest" if volatility < 2.5 else "Wait"
    return {
        "ticker": symbol.upper(),
        "name": f"{symbol.upper()} Analytics",
        "sector": "Industrial",
        "price": price,
        "marketCap": "₹125k Cr",
        "technical": {"trend": "Uptrend", "volatility": "Medium", "momentum": "Strong"},
        "decisionInfo": {"action": action, "confidence": 68, "riskLevel": "Medium"},
        "explanation": f"Live AI is temporarily unavailable, so this is a structured fallback analysis. Reason: {reason}",
        "debate": {
            "bull": ["Strong historical base", "Sector momentum", "Stable demand profile"],
            "bear": ["High PE ratio", "Macro risks", "Short-term volatility possible"]
        },
        "news": [{
            "headline": "Fallback News Placeholder",
            "impactChain": "Provider unavailable -> Local fallback -> Analysis remains usable",
            "effect": "Neutral Bias",
            "impactLevel": "Medium",
            "sectorAffected": "No"
        }],
        "scenarios": {"worst": -10, "expected": 12, "best": 25},
        "suggestion": {"amountRange": "₹2,000 - ₹5,000", "percentage": "10%"},
        "timeframe": "Mid-term",
        "framework": {"trend": True, "risk": True, "news": False, "entry": True, "exit": True, "summary": "Fallback mode active, use with caution."},
        "entryPoints": {"entryZone": round(price * 0.98, 2), "target": round(price * 1.15, 2), "stopLoss": round(price * 0.92, 2)}
    }

def get_ai_advice(symbol: str, price: float, volatility: float, news_headlines: str = None):
    """
    Calls Claude AI to get advanced, jargon-free investment advice.
    Now accepts real news headlines from NewsAPI.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Use real news if provided, otherwise fallback
    news_context = news_headlines or "No major news today."
    
    prompt = f"""
    You are InvestEase AI, an elite institutional financial advisor explaining complex concepts clearly.
    Analyze this stock: {symbol}
    Current Price: ₹{price}
    Volatility: {volatility}%
    Latest News Headlines:
    {news_context}
    
    Return ONLY a JSON object with this EXACT structure (No markdown format, no intro text, raw JSON only):
    {{
      "ticker": "{symbol}",
      "name": "Analyze the symbol and guess company name",
      "sector": "Identify the sector",
      "price": {price},
      "marketCap": "Estimate or mock realistic Market Cap (e.g. ₹500k Cr)",
      "technical": {{
        "trend": "Uptrend OR Downtrend OR Sideways",
        "volatility": "Low OR Medium OR High",
        "momentum": "Strong OR Weak"
      }},
      "decisionInfo": {{
        "action": "Invest OR Wait OR Avoid",
        "confidence": <integer 0-100 logic score based on risk>,
        "riskLevel": "Low OR Medium OR High"
      }},
      "explanation": "A high-quality 2-3 sentence institutional explanation of why the action is recommended.",
      "debate": {{
        "bull": ["3 short logical bullet points for buying"],
        "bear": ["3 short logical bullet points against buying"]
      }},
      "news": [
        {{
          "headline": "Use the REAL news headline provided above if available, otherwise generate a plausible one",
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
         "amountRange": "e.g. ₹5,000 - ₹10,000",
         "percentage": "e.g. 5-10%"
      }},
      "timeframe": "Short-term OR Mid-term OR Long-term",
      "framework": {{
        "trend": true/false,
        "risk": true/false,
        "news": true/false,
        "entry": true/false,
        "exit": true/false,
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
            volatility=volatility,
            reason="No valid ANTHROPIC_API_KEY found."
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
            volatility=volatility,
            reason=str(e)
        )
