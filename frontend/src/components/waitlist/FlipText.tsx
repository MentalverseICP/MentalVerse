import { useState } from "react";
import { motion } from "framer-motion";

export const FlipText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className="block"
        animate={{
          rotateX: isHovered ? [0, 90, 0] : 0,
        }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.span>
    </div>
  );
};