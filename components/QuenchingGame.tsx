
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

  const handleStop = (finalTemp?: number) => {
    if (!isRunning) return;
    
    setIsRunning(false);
    const currentTemp = finalTemp !== undefined ? finalTemp : temp;
    soundManager.playSizzle();

    // Calculate Score
    let score = 0;
    // Calculate center of the target zone
    const targetCenter = targetZone.min + (targetZone.max - targetZone.min) / 2;
    
    if (currentTemp >= targetZone.min && currentTemp <= targetZone.max) {
      // Perfect zone
      score = 100;
    } else {
      // Distance from center
      const dist = Math.abs(currentTemp - targetCenter);
      // More forgiving scoring: Max score 100, decrease based on distance
      score = Math.max(10, 100 - (dist * 3));
    }

    setTimeout(() => {
      onComplete(Math.floor(score));
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-stone-800 border-4 border-stone-600 retro-border">
      <h2 className="text-2xl text-blue-300 mb-4">SU VERME</h2>
      <p className="text-stone-400 mb-12 text-xs text-center">
        Sıcaklık göstergesini yeşil alanda durdur!
      </p>

      <div className="relative w-64 h-64 flex justify-center mb-8">
         
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
                {/* Bubbles / Texture */}
                <div className="absolute top-0 w-full h-2 bg-white/30"></div>
                <div className="w-full h-full opacity-20 bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[length:4px_4px]"></div>
            </div>

            {/* Target Zone Overlay (On Top of Fill) */}
            {/* z-index ensures this sits ON TOP of the red liquid */}
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
        className="h-16 text-lg max-w-xs"
      >
        SUYA BATIR!
      </RetroButton>
      
      <style>{`
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
