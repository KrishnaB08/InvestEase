import React from 'react';
import { MessageSquare, Mail, Globe, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--royal-green)] text-white py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-extrabold tracking-tighter italic mb-4">
            Invest <span className="text-emerald-400">Ease</span>
          </h2>
          <p className="text-white/70 max-w-md leading-relaxed text-sm">
            Empowering the next generation of investors through fear-free, 
            AI-guided financial education and risk-free simulation.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest text-emerald-400">Platform</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="/learn" className="hover:text-white transition-colors">Academy</a></li>
            <li><a href="/simulate" className="hover:text-white transition-colors">Simulator</a></li>
            <li><a href="/ai-advisor" className="hover:text-white transition-colors">AI Advisor</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest text-emerald-400">Connect</h4>
          <div className="flex gap-4">
            <MessageSquare size={20} className="text-white/60 hover:text-white cursor-pointer" />
            <Mail size={20} className="text-white/60 hover:text-white cursor-pointer" />
            <Globe size={20} className="text-white/60 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/10 flex flex-col md:row items-center justify-between gap-4 text-xs text-white/40 uppercase tracking-widest font-bold">
        <span>© 2026 INVESTEASE. ALL RIGHTS RESERVED.</span>
        <span className="flex items-center gap-1">MADE WITH <Heart size={12} className="text-rose-500 fill-rose-500" /> FOR THE HACKATHON</span>
      </div>
    </footer>
  );
};

export default Footer;
