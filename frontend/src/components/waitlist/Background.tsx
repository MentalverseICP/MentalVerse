import { motion } from "framer-motion";

const Background = () => {
  const FloatingParticles = () => {
    return (
      <div className="relative w-full h-full">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/30 dark:bg-white/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-black via-black to-black ">
      <FloatingParticles />
      <div className="absolute inset-0 bg-grid-small-white/[0.1] dark:bg-grid-small-dark/[0.1]" />
    </div>
  );
};

export default Background;
