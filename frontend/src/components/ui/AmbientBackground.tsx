import { motion } from "framer-motion";
import { useTheme } from "@/components/shared/theme-provider";

const AmbientBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-black via-[#0B0B0C] to-black' 
          : 'bg-gradient-to-br from-white via-[#F7F7F7] to-white'
      }`} />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle, rgba(24,230,20,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(24,230,20,0.1) 0%, transparent 70%)'
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle, rgba(13,177,106,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(13,177,106,0.1) 0%, transparent 70%)'
        }}
      />
      
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle, rgba(254,202,87,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(254,202,87,0.08) 0%, transparent 70%)'
        }}
      />
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: theme === 'dark'
            ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Radial gradient vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)'
            : 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.05) 100%)'
        }}
      />
    </div>
  );
};

export default AmbientBackground;