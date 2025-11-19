
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RetroButton from './RetroButton';
import { soundManager } from '../services/soundService';
import { ItemType } from '../types';

interface CuttingGameProps {
  targetItem: ItemType;
  onComplete: (score: number) => void;
}

const CuttingGame: React.FC<CuttingGameProps> = ({ targetItem, onComplete }) => {
  const [cutsLeft, setCutsLeft] = useState(4);
  const [cursorPos, setCursorPos] = useState(0);
  const [direction, setDirection] = useState(1);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Random target zone for each cut
  const [targetPos, setTargetPos] = useState(50);
  const targetWidth = 20;

  const requestRef = useRef<number>(0);
  const speed = 2; // Constant speed

  // Randomize target after each successful cut
  useEffect(() => {
    setTargetPos(20 + Math.floor(Math.random() * 60));
  }, [cutsLeft]);

  const animate = useCallback(() => {
    setCursorPos(prev => {
      let next = prev + speed * direction;
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleCut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleCut = () => {
    if (cutsLeft <= 0) return;

    soundManager.playSaw();

    const distance = Math.abs(cursorPos - targetPos);
    const isHit = distance < (targetWidth / 2);
    
    let cutScore = 0;
    if (isHit) {
      // Closer to center = higher score (max 100)
      const accuracy = 1 - (distance / (targetWidth / 2));
      cutScore = 50 + (accuracy * 50); 
      setFeedback("GÜZEL KESİM!");
    } else {
      cutScore = 10;
      setFeedback("YAMUK OLDU!");
    }

    setScoreTotal(prev => prev + cutScore);
    
    if (cutsLeft - 1 <= 0) {
       // Finish
       setTimeout(() => {
         onComplete((scoreTotal + cutScore) / 4); // Average
       }, 500);
    } else {
       setCutsLeft(prev => prev - 1);
       setTimeout(() => setFeedback(null), 500);
    }
  };

  // Render item shape based on type
  const renderItemVisual = () => {
    let path = "";
    switch (targetItem) {
      case ItemType.SWORD:
        path = "M40,80 L50,20 L60,80 M30,70 L70,70 M50,80 L50,95";
        break;
      case ItemType.DAGGER:
        path = "M45,70 L50,30 L55,70 M40,70 L60,70 M50,70 L50,90";
        break;
      case ItemType.AXE:
        path = "M48,90 L48,20 M48,30 L20,30 L20,50 L48,50";
        break;
      case ItemType.SHIELD:
        path = "M30,30 L70,30 L70,60 Q50,90 30,60 Z";
        break;
      case ItemType.HELMET:
        path = "M30,50 Q50,10 70,50 L70,80 L30,80 Z";
        break;
      default:
        path = "M30,30 L70,30 L70,70 L30,70 Z"; // Square block
    }

    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-lg mx-auto">
        <path d={path} stroke="white" strokeWidth="4" fill="none" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
        {/* Spark effect at cursor pos projected to 0-100 */}
        <circle cx={cursorPos} cy="50" r="2" fill="yellow" className="animate-ping opacity-50" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-stone-800 border-4 border-stone-600 retro-border">
       <h2 className="text-2xl text-stone-300 mb-4">MALZEMEYİ KES</h2>
       <div className="text-stone-500 mb-4 flex items-center gap-2">
         <span>Kalan Kesim: {cutsLeft}</span>
         <span className="text-xs text-yellow-500">({targetItem})</span>
       </div>

       <div className="mb-8 opacity-80">
         {renderItemVisual()}
       </div>

       <div className="w-full max-w-lg h-16 bg-stone-900 border-4 border-stone-500 relative mb-12 overflow-hidden">
          {/* Metal Bar Visual */}
          <div className="absolute top-4 bottom-4 left-0 right-0 bg-stone-600"></div>
          
          {/* Target Zone */}
          <div 
            className="absolute top-0 bottom-0 border-x-2 border-dashed border-yellow-400 bg-yellow-400/20"
            style={{ left: `${targetPos - (targetWidth/2)}%`, width: `${targetWidth}%` }}
          >
             <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 text-[10px]">KES</span>
          </div>

          {/* Saw Cursor */}
          <div 
             className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
             style={{ left: `${cursorPos}%` }}
          >
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">🪚</div>
          </div>
       </div>

       {feedback && (
         <div className={`text-xl mb-4 font-bold ${feedback.includes('GÜZEL') ? 'text-green-400' : 'text-red-400'}`}>
           {feedback}
         </div>
       )}

       <RetroButton onClick={handleCut} fullWidth variant="warning" className="h-16 text-lg">
         KES (BOŞLUK)
       </RetroButton>
    </div>
  );
};

export default CuttingGame;
