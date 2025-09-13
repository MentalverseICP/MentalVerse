import { Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { scrollToSection } from "./MotionComponent";
import { useContext } from 'react';
import { AuthContext } from '../../App';
import { ThemeToggle } from '../shared/theme-toggle';
import { motion } from 'framer-motion';
import MentalIcon from "@/images/mental_mobile.svg";

// Simple connect button component
const SimpleConnectButton = () => {
  const { user, login, logout } = useContext(AuthContext);
  
  if (user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
      >
        Disconnect
      </motion.button>
    );
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={login}
      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-all duration-300 font-medium"
    >
      Connect Wallet
    </motion.button>
  );
};

export const Header: React.FC<{ onWalletDisconnect?: () => void }> = ({ onWalletDisconnect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigationItems = [
    { label: 'Home', id: 'home' },
    { label: 'Services', id: 'services' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Resources', id: 'resources' },
    { label: 'About', id: 'about' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <img src={MentalIcon} alt="MentalVerse" className="w-6 h-6" />
            </div>
            <span className="text-foreground text-xl font-bold">MentalVerse</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 relative group flex items-center space-x-1"
                onClick={() => scrollToSection(item.id)}
                type="button"
              >
                <span>{item.label}</span>
                <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </motion.button>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />
            <SimpleConnectButton />
          </div>
          
          {/* Mobile Menu Button */}
          <motion.button 
            type='button'
            className="lg:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-4 pb-4 bg-card/95 backdrop-blur-lg rounded-lg shadow-lg border border-border"
          >
            <nav className="flex flex-col space-y-4 p-4">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  className="text-muted-foreground hover:text-foreground text-left transition-colors flex items-center justify-between"
                  onClick={() => { scrollToSection(item.id); setIsMenuOpen(false); }}
                  type="button"
                >
                  <span>{item.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              ))}
              <div className="pt-4 border-t border-border flex flex-col space-y-4">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <div className="flex justify-center">
                  <SimpleConnectButton />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};
