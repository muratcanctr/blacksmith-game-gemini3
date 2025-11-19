
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RetroButton from './RetroButton';
import { soundManager } from '../services/soundService';

interface CuttingGameProps {
  onComplete: (score: number) => void;
}

const CuttingGame: React.FC<CuttingGameProps> = ({ onComplete }) => {
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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-stone-800 border-4 border-stone-600 retro-border">
       <h2 className="text-2xl text-stone-300 mb-4">MALZEMEYİ KES</h2>
       <p className="text-stone-500 mb-8">Kalan Kesim: {cutsLeft}</p>

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
