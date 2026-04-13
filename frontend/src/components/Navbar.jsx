import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, BrainCircuit, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Simulator', path: '/simulate', icon: Gamepad2 },
    { name: 'AI Advisor', path: '/ai-advisor', icon: BrainCircuit },
    { name: 'Currency Lab', path: '/currency-lab', icon: Coins },
  ];

  return (
    <nav className="glass-nav flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative px-4 py-2 flex items-center gap-2 rounded-full transition-all duration-300 group ${
              isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={18} className={`z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="z-10 text-sm font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
