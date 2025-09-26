import { motion } from "framer-motion";

const Background = () => {
  const FloatingParticles = () => {
    return (
      <div className="relative w-full h-full">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30 dark:bg-primary/30"
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

  const GradientBackground = () => (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0],
        background: [
          "radial-gradient(circle at 50% 50%, rgba(24, 230, 20, 0.02) 0%, rgba(34, 140, 32, 0.01) 50%, transparent 100%)",
          "radial-gradient(circle at 50% 50%, rgba(32, 200, 29, 0.047) 0%, rgba(33, 141, 31, 0.106) 50%, transparent 100%)",
          "radial-gradient(circle at 50% 50%, rgba(24, 230, 20, 0.02) 0%, rgba(28, 112, 27, 0.01) 50%, transparent 100%)",
        ],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      }}
      style={{
        backgroundBlendMode: "screen",
      }}
    />
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-white via-white to-background/5 dark:from-background dark:via-background dark:to-background/90">
      <GradientBackground />
      <FloatingParticles />
      <div className="absolute inset-0 bg-grid-small-white/[0.1] dark:bg-grid-small-dark/[0.1]" />
    </div>
  );
};

export default Background;
