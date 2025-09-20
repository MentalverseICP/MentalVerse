import { Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "./MotionComponent";
import { ThemeToggle } from '../shared/theme-toggle';
import { motion } from 'framer-motion';
import MentalIcon from "@/images/mental_mobile.svg";
import { useAuth } from "../../contexts/AuthContext";

const AuthButtons = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/app')}
          className="bg-[#18E614] hover:bg-[#18E614]/90 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
        >
          Go to Dashboard
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="bg-destructive hover:bg-destructive/90 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
        >
          Disconnect
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={login}
      className="bg-[#18E614] hover:bg-[#18E614]/90 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
    >
      Connect Wallet
    </motion.button>
  );
};

export const Header: React.FC<{ onWalletDisconnect?: () => void }> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigationItems = [
    { label: 'Home', id: 'home' },
    { label: 'Services', id: 'services' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Health Guidance', id: 'health-guidance' },
    { label: 'Book Appointment', id: 'appointment' }

  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/90 backdrop-blur-lg border-b border-border shadow-lg' 
          : 'bg-background/95'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-15 h-15 flex items-center justify-center">
              <img src={MentalIcon} alt="MentalVerse" className="w-12 h-12" />
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
            <AuthButtons />
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
            className="lg:hidden mt-4 pb-4"
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
                  <AuthButtons />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};
