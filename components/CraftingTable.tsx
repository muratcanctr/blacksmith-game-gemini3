
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ItemType, Material, Upgrade } from '../types';
import RetroButton from './RetroButton';
import { soundManager } from '../services/soundService';

interface CraftingTableProps {
  targetItem: ItemType;
  material: Material;
  upgrades: Record<string, Upgrade>;
  onComplete: (quality: number) => void;
  onCancel: () => void;
}

const CraftingTable: React.FC<CraftingTableProps> = ({ 
  targetItem, 
  material, 
  upgrades, 
  onComplete,
  onCancel
}) => {
  const [progress, setProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHit, setIsHit] = useState(false);
  const [hitFeedback, setHitFeedback] = useState<string | null>(null);
  
  const requestRef = useRef<number>(0);
  const speedRef = useRef(1.5); // Base speed
  
  // Upgrade effects
  const hitPower = 10 + (upgrades['hammer'].level * 2); // Progress per hit
  const sweetSpotWidth = 15 + (upgrades['anvil'].level * 3); // Width of the green zone
  const sweetSpotCenter = 50; // Center of the bar

  // Animation loop for the cursor
  const animate = useCallback(() => {
    setCursorPos(prev => {
      let next = prev + speedRef.current * direction;
      if (next >= 100 || next <= 0) {
        setDirection(d => -d);
        next = next >= 100 ? 100 : 0;
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  }, [direction]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Keyboard listener for Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isHit) {
        handleHit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHit, progress, cursorPos, direction]); // Dependencies needed for correct state in closure

  const handleHit = () => {
    if (progress >= 100) return;

    const distance = Math.abs(cursorPos - sweetSpotCenter);
    const isSweetSpot = distance < (sweetSpotWidth / 2);
    const isGoodSpot = distance < sweetSpotWidth;
    
    let progressGain = hitPower;
    let feedback = "ISKA!";
    let color = "text-red-500";

    if (isSweetSpot) {
      progressGain *= 1.5;
      feedback = "MÜKEMMEL!";
      color = "text-yellow-400 animate-pulse";
      speedRef.current += 0.2;
      soundManager.playHammerHit('perfect');
    } else if (isGoodSpot) {
      feedback = "İYİ";
      color = "text-green-400";
      soundManager.playHammerHit('good');
    } else {
      progressGain *= 0.5;
      speedRef.current = Math.max(1, speedRef.current - 0.1);
      soundManager.playHammerHit('bad');
    }

    setHitFeedback(feedback);
    setIsHit(true);
    setTimeout(() => setIsHit(false), 200);
    setTimeout(() => setHitFeedback(null), 800);

    const newProgress = Math.min(100, progress + progressGain);
    setProgress(newProgress);

    if (newProgress >= 100) {
      soundManager.playSuccess();
      // Determine final quality
      const baseQuality = Math.floor(Math.random() * 30) + 50; 
      const bonus = isSweetSpot ? 20 : 0;
      const finalQuality = Math.min(100, baseQuality + bonus + (upgrades['anvil'].level * 2));
      
      setTimeout(() => onComplete(finalQuality), 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-stone-800 border-4 border-stone-600 retro-border">
      <div className="mb-6 text-center">
        <h2 className="text-2xl text-white mb-2 animate-bounce">DÖVME İŞLEMİ</h2>
        <p className="text-xs text-stone-400">{material} {targetItem}</p>
      </div>

      {/* Visualization of the Anvil/Item */}
      <div className={`relative w-32 h-32 mb-8 transition-transform ${isHit ? 'scale-90 rotate-3' : 'scale-100'}`}>
        <div className="absolute inset-0 bg-stone-700 border-4 border-black flex items-center justify-center">
           <span className="text-4xl">⚒️</span>
        </div>
        {hitFeedback && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xl font-bold whitespace-nowrap drop-shadow-md z-10">
             <span className={hitFeedback === "MÜKEMMEL!" ? "text-yellow-400" : hitFeedback === "İYİ" ? "text-green-400" : "text-red-400"}>
               {hitFeedback}
             </span>
          </div>
        )}
      </div>

      {/* Progress Bar (Overall Completion) */}
      <div className="w-full max-w-md mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>İlerleme</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="h-6 bg-stone-900 border-2 border-stone-600 relative">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Rhythm/Timing Bar */}
      <div className="w-full max-w-md mb-8 relative">
        <div className="h-8 bg-black border-2 border-stone-500 relative overflow-hidden">
           {/* Sweet Spot */}
           <div 
             className="absolute top-0 bottom-0 bg-green-600 opacity-60 border-x-2 border-green-400"
             style={{ 
               left: `${sweetSpotCenter - (sweetSpotWidth / 2)}%`, 
               width: `${sweetSpotWidth}%` 
             }}
           />
           {/* Center Line */}
           <div className="absolute top-0 bottom-0 w-1 bg-white left-1/2 -translate-x-1/2 opacity-30"></div>

           {/* Cursor */}
           <div 
             className="absolute top-0 bottom-0 w-2 bg-red-500 border-x border-white shadow-[0_0_5px_rgba(255,0,0,0.8)]"
             style={{ left: `${cursorPos}%`, transform: 'translateX(-50%)' }}
           />
        </div>
        <p className="text-[10px] text-center mt-2 text-stone-500">Yeşil alanda vur!</p>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <RetroButton 
          variant="danger" 
          onClick={onCancel}
          className="flex-1"
        >
          İPTAL
        </RetroButton>
        <RetroButton 
          variant="success" 
          fullWidth 
          onClick={handleHit}
          className="flex-[2] h-16 text-lg"
        >
          VUR! (BOŞLUK)
        </RetroButton>
      </div>
    </div>
  );
};

export default CraftingTable;
