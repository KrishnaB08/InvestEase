# InvestEase: Fear-Reduction Trading Simulator 🚀

**76% of young Indians (18–25) avoid investing due to the fear of losing money.** InvestEase doesn't just teach theory—it provides a safe "emotional training ground" where users survive market crashes before they ever risk a single Rupee.

## 🌟 The 3-Layer Solution

### 1. Learn (Visual Intuition)
Interactive chart lessons that teach "Buy the Dip" strategies through zero-text, clickable historical charts.

### 2. Simulate (The Emotional MVP)
- **Monte Carlo Engine**: Runs 1,000 real-world scenarios using historical volatility to show Worst/Average/Best case outcomes.
- **Panic Trainer**: A timed 90-second session that triggers a random **-18% Market Crash**. Users must choose to Sell, Hold, or Buy More, teaching them to stay calm when the screen goes red.

### 3. AI Decide (Jargon-Free Advice)
Powered by **Claude 3.5**, users can search any Indian ticker (RELIANCE, TCS, etc.) and get a 3-line investment decision written for an 18-year-old. No P/E ratios—just plain English logic.

### 4. Currency Lab (Global Money Intelligence)
- Live currency conversion (`USD/EUR/GBP/INR/...`) with FX trend context.
- Real ticker-based buying power: type a stock symbol and estimate shares from converted INR.
- FX-aware insights for Indian investors planning global allocations.

---

## 📈 The Winning Metric: Fear Score Tracker
We track user confidence Before and After every session. Our goal is to move the average confidence score from **2.1 → 4.3**, proving a measurable reduction in investing fear.

---

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python), YFinance, NumPy, Scikit-Learn.
- **Frontend**: React (Vite), Recharts, Tailwind CSS.
- **AI**: Claude AI (Anthropic API).
- **Database**: MongoDB Atlas.

---

## 🚀 Setup & Installation

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and add keys
4. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🔌 New API Endpoints
- `GET /fx/convert?amount=100&from_currency=USD&to_currency=INR`
- `GET /fx/trend?base=USD&quote=INR&days=7`

---

*Built for the Evolove Hackathon. Empowering the next generation of Indian investors.*
# InvestEase
# InvestEase
