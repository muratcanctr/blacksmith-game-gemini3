
import React, { useState, useEffect } from 'react';
import RetroButton from './RetroButton';
import { soundManager } from '../services/soundService';

interface PhaseTransitionProps {
  mode: 'COUNTDOWN' | 'SUMMARY';
  title: string;
  score?: number; // Only for summary
  nextPhaseName?: string;
  onComplete: () => void;
}

const PhaseTransition: React.FC<PhaseTransitionProps> = ({ 
  mode, 
  title, 
  score, 
  nextPhaseName, 
  onComplete 
}) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (mode === 'COUNTDOWN') {
      soundManager.playClick(); // Tick sound
      const timer = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          soundManager.playClick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, onComplete]);

  if (mode === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-stone-900/90 absolute inset-0 z-50">
        <h2 className="text-yellow-500 text-xl mb-8">{title} BAŞLIYOR</h2>
        <div className="text-9xl font-bold text-white animate-pulse">
          {count > 0 ? count : 'BAŞLA!'}
        </div>
      </div>
    );
  }

  // SUMMARY MODE
  const getFeedback = (s: number) => {
    if (s >= 90) return { text: "EFSANEVİ!", color: "text-yellow-400" };
    if (s >= 70) return { text: "ÇOK İYİ", color: "text-green-400" };
    if (s >= 50) return { text: "İDARE EDER", color: "text-blue-400" };
    return { text: "KÖTÜ...", color: "text-red-500" };
  };

  const feedback = score !== undefined ? getFeedback(score) : { text: "", color: "" };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-stone-800 border-4 border-stone-600 retro-border p-8 animate-[popIn_0.3s_ease-out]">
      <h2 className="text-2xl text-stone-300 mb-2">{title} TAMAMLANDI</h2>
      
      {score !== undefined && (
        <div className="my-8 text-center">
          <div className="text-6xl font-bold text-white mb-2">{Math.floor(score)}</div>
          <div className={`text-2xl ${feedback.color} animate-bounce`}>{feedback.text}</div>
        </div>
      )}

      <p className="text-stone-500 text-xs mb-8">
        Sıradaki Aşama: <span className="text-white">{nextPhaseName}</span>
      </p>

      <RetroButton variant="success" onClick={onComplete} fullWidth className="h-16 text-lg">
        DEVAM ET
      </RetroButton>
    </div>
  );
};

export default PhaseTransition;
