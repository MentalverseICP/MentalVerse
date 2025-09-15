import { motion } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
        

// Simple connect button component
const SimpleConnectButton = () => {
  const { isAuthenticated, login, logout } = useAuth();

  
  if (isAuthenticated) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className="bg-destructive hover:bg-destructive/90 text-white px-8 py-3 rounded-2xl text-md font-semibold transition-all duration-300 flex items-center space-x-2"
      >
        <span>Disconnect</span>
        <ArrowUpRight className="w-4 h-4" />
      </motion.button>
    );
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={login}
      className="bg-[#18E614] hover:bg-[#18E614]/90 text-white px-8 py-3 rounded-2xl text-md font-semibold transition-all duration-300 flex items-center space-x-2"
    >
      <span>Book Appointment</span>
      <ArrowUpRight className="w-5 h-5" />
    </motion.button>
  );
};

export const Hero = () => {
  return (
    <section id="home" className="relative md:min-h-screen bg-transparent">
      <div className="mx-auto px-6 pt-24 pb-12">
        {/* Main Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-card rounded-3xl shadow-2xl overflow-hidden max-w-[90rem] mx-auto min-h-[600px]"
        >
          {/* Full Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Mental wellness and meditation" 
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 p-8 lg:p-12 w-full lg:w-3/5 xl:w-1/2 flex flex-col justify-center min-h-[600px]">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-fit flex items-center space-x-2 bg-[#18E614]/10 border border-[#18E614]/30 text-[#3aa03f] px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <Star className="w-4 h-4 fill-current" />
              <span>24K Happy Customers</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Revitalize Your Thoughts & Enrich Your Soul Each Day
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg"
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};