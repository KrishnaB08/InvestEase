import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout & Navigation
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Learning from './pages/Learning/LearningHub';
import SimulatorPage from './pages/SimulatorPage';
import AIAdvisor from './pages/AIAdvisor';
import CurrencyLab from './pages/CurrencyLab';
import DiscoveryEngine from './pages/DiscoveryEngine';

// API
import { fetchStocks } from './utils/api';

const App = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetchStocks()
      .then(stockList => setStocks(stockList))
      .catch(err => console.error("Error fetching stocks:", err));
  }, []);

  return (
    <Router>
      <div className="relative min-h-screen">
        <Navbar />
        
        {/* Page Switcher with Animations */}
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home stocks={stocks} />} />
              <Route path="/learn" element={<Learning />} />
              <Route path="/simulate" element={<SimulatorPage />} />
              <Route path="/ai-advisor" element={<AIAdvisor />} />
              <Route path="/currency-lab" element={<CurrencyLab />} />
              <Route path="/discovery" element={<DiscoveryEngine />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />

        {/* Global UI Glow */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>
      </div>
    </Router>
  );
};

export default App;
