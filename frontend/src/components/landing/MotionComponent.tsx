import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

export const Enhanced3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Blockchain-inspired floating particles
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
      type: 'block' | 'node' | 'connection';
    }> = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 2,
        color: ['#3db910', '#05960c', '#047827', '#065f2e'][Math.floor(Math.random() * 4)],
        type: ['block', 'node', 'connection'][Math.floor(Math.random() * 3)] as 'block' | 'node' | 'connection'
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Calculate size based on z-position
        const scale = Math.max(0.01, (1000 - particle.z) / 1000);
        const size = Math.max(0.1, particle.size * scale);
        const opacity = scale * 0.8;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = particle.color;
        
        // Draw different shapes based on type
        if (particle.type === 'block') {
          ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
        } else if (particle.type === 'node') {
          ctx.beginPath();
          const radius = Math.max(0.1, size/2);
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw connection lines
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x - size, particle.y);
          ctx.lineTo(particle.x + size, particle.y);
          ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw connections between nearby particles
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.save();
              ctx.globalAlpha = (100 - distance) / 100 * 0.2;
              ctx.strokeStyle = '#2fb910';
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-30" 
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#112722ad] to-black opacity-90"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

// Animation wrapper components
export const FadeInSection: React.FC<{ children: ReactNode; className?: string; delay?: number }> = ({ 
  children, 
  className = "", 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          // Reset animation when section is scrolled out of view and back in
          const handleScroll = () => {
            const rect = ref.current?.getBoundingClientRect();
            if (rect && (rect.top > window.innerHeight || rect.bottom < 0)) {
              setIsVisible(false);
            }
          };
          
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [delay]);
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const SlideInSection: React.FC<{ children: ReactNode; direction?: 'left' | 'right'; className?: string }> = ({ 
  children, 
  direction = 'left',
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Reset animation when section is scrolled out of view and back in
          const handleScroll = () => {
            const rect = ref.current?.getBoundingClientRect();
            if (rect && (rect.top > window.innerHeight || rect.bottom < 0)) {
              setIsVisible(false);
            }
          };
          
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : `opacity-0 ${direction === 'left' ? '-translate-x-20' : 'translate-x-20'}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

type MotionDivProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;
export const MotionDiv: React.FC<MotionDivProps> = ({ children, className = '', style, ...props }) => (
  <div
    className={`${className} transition-all ease-out duration-500 hover:scale-105 hover:shadow-2xl hover:border hover:border-[#3b923a]`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

// Utility function for smooth scrolling
export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};