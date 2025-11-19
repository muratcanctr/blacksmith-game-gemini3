import React, { useState, useEffect, useRef } from 'react';
import RetroButton from './RetroButton';
import { soundManager } from '../services/soundService';

interface QuenchingGameProps {
  onComplete: (score: number) => void;
}

const QuenchingGame: React.FC<QuenchingGameProps> = ({ onComplete }) => {
  const [temp, setTemp] = useState(100); // Starts hot (100)
  const [isRunning, setIsRunning] = useState(true);
  const [targetZone, setTargetZone] = useState({ min: 30, max: 50 });
  const [showSteam, setShowSteam] = useState(false);
  
  const requestRef = useRef<number>(0);

  // Randomize target zone on mount
  useEffect(() => {
    const min = 20 + Math.floor(Math.random() * 50); // Random position between 20% and 70%
    const size = 15 + Math.floor(Math.random() * 10); // Random size between 15% and 25%
    setTargetZone({ min, max: min + size });
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const update = () => {
      setTemp(prev => {
        if (prev <= 0) {
          handleStop(0); // Too cold
          return 0;
        }
        return prev - 0.6; // Cooling speed
      });
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  // Space Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRunning) {
        handleStop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, temp]); // Dependencies important for closure capture

  const handleStop = (finalTemp?: number) => {
    if (!isRunning) return;
    
    setIsRunning(false);
    const currentTemp = finalTemp !== undefined ? finalTemp : temp;
    soundManager.playSizzle();
    setShowSteam(true);

    // Calculate Score
    let score = 0;
    const targetCenter = targetZone.min + (targetZone.max - targetZone.min) / 2;
    
    if (currentTemp >= targetZone.min && currentTemp <= targetZone.max) {
      score = 100;
    } else {
      const dist = Math.abs(currentTemp - targetCenter);
      score = Math.max(10, 100 - (dist * 3));
    }

    setTimeout(() => {
      onComplete(Math.floor(score));
    }, 2000); // Wait for steam animation
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-stone-800 border-4 border-stone-600 retro-border overflow-hidden relative">
      <h2 className="text-2xl text-blue-300 mb-4 z-10">SU VERME</h2>
      <p className="text-stone-400 mb-8 text-xs text-center z-10">
        Sıcaklık göstergesini yeşil alanda durdur!
      </p>

      {/* Center Visual Animation (Water Tank) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full h-1/3 bg-blue-900 absolute bottom-0"></div>
          {/* Hot Item entering water */}
          <div className={`w-10 h-40 bg-orange-500 absolute transition-transform duration-500 ${isRunning ? '-translate-y-20' : 'translate-y-20'}`}></div>
      </div>

      {/* Steam Animation */}
      {showSteam && (
        <div className="absolute inset-0 pointer-events-none z-30 flex justify-center items-end">
           <div className="w-16 h-16 bg-white rounded-full blur-xl opacity-0 animate-steam delay-100 absolute bottom-1/4 left-1/2 -translate-x-10"></div>
           <div className="w-24 h-24 bg-white rounded-full blur-xl opacity-0 animate-steam absolute bottom-1/4 left-1/2 -translate-x-1/2"></div>
           <div className="w-20 h-20 bg-white rounded-full blur-xl opacity-0 animate-steam delay-300 absolute bottom-1/4 left-1/2 translate-x-10"></div>
        </div>
      )}

      <div className="relative w-64 h-full max-h-[400px] flex justify-center mb-8 z-20">
         
         {/* Side Indicators (Visible outside the tube) */}
         <div 
            className="absolute w-full border-y-4 border-green-500/50 pointer-events-none transition-all duration-300"
            style={{ 
                bottom: `${targetZone.min}%`, 
                height: `${targetZone.max - targetZone.min}%`,
                zIndex: 0
            }}
         >
            {/* Left Arrow */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-green-400 animate-bounce-x">➤</div>
            {/* Right Arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-green-400 rotate-180 animate-bounce-x-rev">➤</div>
         </div>

         {/* Main Thermometer Tube */}
         <div className="relative w-16 h-full bg-stone-900 border-4 border-stone-500 rounded-full overflow-hidden z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            
            {/* Thermometer Fill (Red Liquid) */}
            <div 
               className={`absolute bottom-0 w-full transition-none ${isRunning ? 'bg-red-600' : 'bg-stone-500'}`}
               style={{ height: `${temp}%` }}
            >
                <div className="absolute top-0 w-full h-2 bg-white/30"></div>
                <div className="w-full h-full opacity-20 bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[length:4px_4px]"></div>
            </div>

            {/* Target Zone Overlay */}
            <div 
               className="absolute w-full bg-green-500/40 border-y-2 border-green-300 backdrop-blur-[1px] z-20"
               style={{ 
                 bottom: `${targetZone.min}%`, 
                 height: `${targetZone.max - targetZone.min}%` 
               }}
            >
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md opacity-80">HEDEF</span>
                </div>
            </div>

         </div>

         {/* Temperature Text */}
         <div className="absolute -right-8 top-1/2 -translate-y-1/2 font-mono text-xl text-white drop-shadow-md">
            {Math.floor(temp)}°C
         </div>
      </div>

      <RetroButton 
        onClick={() => handleStop()} 
        disabled={!isRunning}
        fullWidth 
        variant="primary" 
        className="h-16 text-lg max-w-xs z-20"
      >
        SUYA BATIR!
      </RetroButton>
      
      <style>{`
        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateY(-40px) scale(1.5); }
          100% { opacity: 0; transform: translateY(-100px) scale(2); }
        }
        .animate-steam { animation: steam 2s ease-out forwards; }
        
        @keyframes bounceX {
          0%, 100% { transform: translate(0, -50%); }
          50% { transform: translate(5px, -50%); }
        }
        @keyframes bounceXRev {
          0%, 100% { transform: translate(0, -50%) rotate(180deg); }
          50% { transform: translate(-5px, -50%) rotate(180deg); }
        }
        .animate-bounce-x { animation: bounceX 1s infinite; }
        .animate-bounce-x-rev { animation: bounceXRev 1s infinite; }
      `}</style>
    </div>
  );
};

export default QuenchingGame;