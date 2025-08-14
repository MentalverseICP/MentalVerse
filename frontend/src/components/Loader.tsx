import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

function Loader() {
  const [dots, setDots] = useState(0);
  const [breathe, setBreathe] = useState(false);
  
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 600);
    
    const breatheTimer = setInterval(() => {
      setBreathe(prev => !prev);
    }, 2000);

    return () => {
      clearInterval(dotTimer);
      clearInterval(breatheTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#112719] to-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Main breathing circle */}
        <div className="relative mb-8">
          <div 
            className={`w-32 h-32 rounded-full border-2 border-[#1e5c1d8b] flex items-center justify-center mx-auto transition-all duration-2000 ease-in-out ${
              breathe ? 'scale-110 border-emerald-300/70' : 'scale-100 border-[#18E614a1]'
            }`}
          >
            {/* Inner circle with brain */}
            <div 
              className={`w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm flex items-center justify-center transition-all duration-2000 ${
                breathe ? 'scale-105' : 'scale-100'
              }`}
            >
              <Brain 
                className={`text-emerald-400 transition-all duration-2000 ${
                  breathe ? 'scale-110' : 'scale-100'
                }`} 
                size={36} 
              />
            </div>
          </div>
          
          {/* Ripple effects */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border border-emerald-400/20 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border border-emerald-400/10 rounded-full animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          </div>
        </div>

        {/* Brand text */}
        <div className="mb-6">
          <h2 className="text-3xl font-light text-white mb-2 tracking-wide">
            Mental<span className="text-emerald-400 font-medium">Verse</span>
          </h2>
          <p className="text-gray-400 text-sm font-light">
            Connecting minds, securing wellness
          </p>
        </div>

        {/* Minimalist loading indicator */}
        <div className="flex justify-center items-center space-x-1">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < dots ? 'bg-[#18E614a1]' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-3 font-light">
            {dots === 0 && "Initializing"}
            {dots === 1 && "Connecting"}
            {dots === 2 && "Securing"}
            {dots === 3 && "Ready"}
          </span>
        </div>

        {/* Blockchain network visualization */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            {/* Network nodes */}
            <div className="flex space-x-8 items-center opacity-40">
              <div className="w-2 h-2 bg-[#18E614a1] rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-[#18E614a1] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-[#18E614a1] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="w-1 h-1 bg-[#18E614a1] rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
              <div className="w-2 h-2 bg-[#18E614a1] rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            {/* Connecting lines */}
            <div className="absolute top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;