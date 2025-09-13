import { motion } from 'framer-motion';
import { ArrowRight, Star, Download, Play } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../App';
import { scrollToSection } from './MotionComponent';

// Simple connect button component
const SimpleConnectButton = () => {
  const { user, login, logout } = useContext(AuthContext);
  
  if (user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-md font-semibold transition-all duration-300 flex items-center space-x-2"
      >
        <span>Disconnect</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    );
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={login}
      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-md font-semibold transition-all duration-300 flex items-center space-x-2"
    >
      <span>Book Appointment</span>
      <ArrowRight className="w-4 h-4" />
    </motion.button>
  );
};

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Therapy session" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 pt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-4 py-2 rounded-full text-sm mb-6"
            >
              <Star className="w-4 h-4" />
              <span>24K Happy Customers</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Revitalize Your Thoughts & Enrich Your Soul Each Day
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-8 max-w-lg"
            >
              Our mission is to drive progress and enhance the lives of our customers by delivering superior products and services that exceed expectations.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SimpleConnectButton />
            </motion.div>
          </motion.div>

          {/* Right Content - App Download Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-end"
          >
            <div className="relative">
              {/* App Download Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 max-w-sm shadow-2xl"
              >
                <div className="text-center mb-6">
                  <h3 className="text-foreground font-semibold text-lg mb-2">Get Our App</h3>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-24 h-24 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-primary text-xs">QR</span>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download on the App Store</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Get it on Google Play</span>
                    </motion.button>
                  </div>
                </div>

                {/* Phone Image */}
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                    alt="Woman using phone" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
              >
                <Play className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};