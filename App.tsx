
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  GameState, 
  Customer, 
  GamePhase, 
  Material, 
  Item,
  Upgrade
} from './types';
import { 
  INITIAL_MATERIALS, 
  INITIAL_UPGRADES, 
  MATERIAL_PACK_COSTS,
  MATERIAL_PACK_AMOUNT,
  MATERIAL_MULTIPLIERS,
  BASE_ITEM_VALUES 
} from './constants';
// Updated import to local service
import { generateCustomerRequest } from './services/customerService';
import { soundManager } from './services/soundService';
import CraftingTable from './components/CraftingTable';
import CuttingGame from './components/CuttingGame';
import QuenchingGame from './components/QuenchingGame';
import MaterialSelector from './components/MaterialSelector';
import Shop from './components/Shop';
import RetroButton from './components/RetroButton';
import PhaseTransition from './components/PhaseTransition';

// Initial Game State
const initialState: GameState = {
  gold: 500, 
  reputation: 0,
  day: 1,
  materials: { ...INITIAL_MATERIALS },
  upgrades: INITIAL_UPGRADES.reduce((acc, up) => ({ ...acc, [up.id]: up }), {} as Record<string, Upgrade>),
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [phase, setPhase] = useState<GamePhase>('DAY_START');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [showShop, setShowShop] = useState(false);
  
  // Daily Progress State
  const [customersServed, setCustomersServed] = useState(0);
  const [dailyStats, setDailyStats] = useState({ gold: 0, rep: 0 });
  
  // Crafting State
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [craftedItem, setCraftedItem] = useState<Item | null>(null);
  
  // Transition State
  const [nextPhase, setNextPhase] = useState<GamePhase | null>(null);
  const [lastPhaseScore, setLastPhaseScore] = useState<number>(0);
  const [lastPhaseTitle, setLastPhaseTitle] = useState<string>('');
  
  // Minigame Scores
  const scoresRef = useRef<{cutting: number, forging: number, quenching: number}>({ cutting: 0, forging: 0, quenching: 0 });
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const maxCustomers = useMemo(() => {
    const bonus = Math.floor(gameState.reputation / 50);
    return Math.min(10, 3 + bonus);
  }, [gameState.reputation]);

  useEffect(() => {
    if (currentCustomer) {
      soundManager.playCustomerEnter();
    }
  }, [currentCustomer]);

  // Global Keyboard Shortcuts for PC Experience
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // F Key for Fullscreen
      if (e.code === 'KeyF') {
        toggleFullscreen();
      }
      // ESC Key to Close Shop or Pause (Conceptually)
      if (e.code === 'Escape') {
        if (showShop) setShowShop(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [showShop]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const fetchCustomer = useCallback(async () => {
    setLoadingCustomer(true);
    try {
      const availableMats = Object.keys(gameState.materials) as Material[];
      const data = await generateCustomerRequest(gameState.reputation, availableMats);
      
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: data.name,
        dialogue: data.dialogue,
        requestType: data.type,
        isBoss: data.isBoss,
        avatarUrl: data.avatarUrl,
        minQuality: 50 + Math.floor(gameState.reputation / 10), 
        budget: 0,
        patience: 30
      };
      
      setCurrentCustomer(newCustomer);
      setPhase('IDLE');
    } catch (e) {
      console.error("Failed to fetch customer", e);
    } finally {
      setLoadingCustomer(false);
    }
  }, [gameState.reputation, gameState.materials]);

  const handleStartDay = () => {
    soundManager.playDayStart();
    setCustomersServed(0);
    setDailyStats({ gold: 0, rep: 0 });
    fetchCustomer();
  };

  const handleNextDay = () => {
    setGameState(prev => ({
      ...prev,
      day: prev.day + 1
    }));
    setPhase('DAY_START');
  };

  // --- CRAFTING FLOW ---
  const startCraftingProcess = () => {
    setPhase('CRAFTING_SETUP'); 
    setSelectedMaterial(null);
    scoresRef.current = { cutting: 0, forging: 0, quenching: 0 };
  };

  const handleMaterialSelect = (mat: Material, cost: number) => {
    setGameState(prev => ({
        ...prev,
        gold: prev.gold - cost,
        materials: {
            ...prev.materials,
            [mat]: prev.materials[mat] > 0 ? prev.materials[mat] - 1 : 0 
        }
    }));
    setSelectedMaterial(mat);
    
    setLastPhaseTitle("KESİM İŞLEMİ"); 
    setNextPhase('CUTTING');
    setPhase('COUNTDOWN');
  };

  const handleCuttingComplete = (score: number) => {
    scoresRef.current.cutting = score;
    setLastPhaseTitle("KESİM");
    setLastPhaseScore(score);
    setNextPhase('CRAFTING'); 
    setPhase('PHASE_SUMMARY');
  };

  const handleForgingComplete = (score: number) => {
    scoresRef.current.forging = score;
    setLastPhaseTitle("DÖVME");
    setLastPhaseScore(score);
    setNextPhase('QUENCHING');
    setPhase('PHASE_SUMMARY');
  };

  const handleQuenchingComplete = (score: number) => {
    scoresRef.current.quenching = score;
    finishItem();
  };

  const handleTransitionComplete = () => {
    if (phase === 'COUNTDOWN' && nextPhase) {
      setPhase(nextPhase);
    } else if (phase === 'PHASE_SUMMARY' && nextPhase) {
      let nextTitle = "";
      if (nextPhase === 'CRAFTING') nextTitle = "DÖVME İŞLEMİ";
      if (nextPhase === 'QUENCHING') nextTitle = "SU VERME";
      
      setLastPhaseTitle(nextTitle);
      setPhase('COUNTDOWN');
    }
  };

  const finishItem = () => {
    if (!selectedMaterial || !currentCustomer) return;

    const avgQuality = Math.floor(
        (scoresRef.current.cutting + scoresRef.current.forging + scoresRef.current.quenching) / 3
    );

    const matMult = MATERIAL_MULTIPLIERS[selectedMaterial];
    const baseValue = BASE_ITEM_VALUES[currentCustomer.requestType];
    const marketingMult = gameState.upgrades['marketing'].multiplier || 1;
    
    let finalValue = Math.floor((baseValue * matMult * (avgQuality / 40)) * marketingMult);
    if (currentCustomer.isBoss) finalValue *= 3;

    const repGain = avgQuality > 70 ? 5 : 1;

    const newItem: Item = {
      type: currentCustomer.requestType,
      material: selectedMaterial,
      quality: avgQuality,
      value: finalValue
    };

    setCraftedItem(newItem);
    setPhase('RESULT');
    setTimeout(() => soundManager.playCash(), 500);

    setGameState(prev => ({
      ...prev,
      gold: prev.gold + finalValue,
      reputation: prev.reputation + repGain,
    }));

    setDailyStats(prev => ({
      gold: prev.gold + finalValue,
      rep: prev.rep + repGain
    }));
  };

  const handleNextCustomer = () => {
    setCraftedItem(null);
    setSelectedMaterial(null);
    setCurrentCustomer(null);
    
    const nextCount = customersServed + 1;
    setCustomersServed(nextCount);

    if (nextCount >= maxCustomers) {
      setPhase('DAY_SUMMARY');
      soundManager.playSuccess();
    } else {
      fetchCustomer();
    }
  };

  const handleBuyUpgrade = (id: string) => {
    const upgrade = gameState.upgrades[id];
    if (gameState.gold >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
      soundManager.playCash();
      setGameState(prev => ({
        ...prev,
        gold: prev.gold - upgrade.cost,
        upgrades: {
          ...prev.upgrades,
          [id]: {
            ...upgrade,
            level: upgrade.level + 1,
            cost: Math.floor(upgrade.cost * 1.5),
            multiplier: upgrade.multiplier + 0.5
          }
        }
      }));
    }
  };

  const handleBuyMaterial = (mat: Material) => {
      const cost = MATERIAL_PACK_COSTS[mat];
      if (gameState.gold >= cost) {
          soundManager.playCash();
          setGameState(prev => ({
              ...prev,
              gold: prev.gold - cost,
              materials: {
                  ...prev.materials,
                  [mat]: prev.materials[mat] + MATERIAL_PACK_AMOUNT
              }
          }));
      }
  };

  const isCraftingPhase = [
      'CRAFTING_SETUP', 'COUNTDOWN', 'CUTTING', 'PHASE_SUMMARY', 'CRAFTING', 'QUENCHING', 'RESULT'
  ].includes(phase);

  // --- RENDER ---
  return (
    // PC GAME CONTAINER: Black background (Letterbox), centered content
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden font-['Press_Start_2P'] select-none">
      
      {/* GAME WINDOW: Fixed Aspect Ratio (16:9) */}
      <div 
        ref={gameContainerRef}
        className="relative w-full max-w-[1600px] aspect-video bg-stone-900 text-stone-200 shadow-2xl overflow-hidden flex flex-col"
      >
        
        {/* Header */}
        <header className="h-20 bg-stone-800 border-b-4 border-black flex items-center justify-between px-8 shrink-0 z-30 shadow-md">
          <div className="text-yellow-500 text-lg flex flex-col">
            <span className="mb-2 tracking-widest text-shadow">RETRO DEMİRCİ</span>
            <span className="text-stone-400 text-xs">GÜN: {gameState.day}</span>
          </div>
          
          <div className="flex gap-6 items-center">
            {phase !== 'DAY_START' && phase !== 'DAY_SUMMARY' && (
               <div className="text-sm text-stone-400 mr-4 border-r-2 border-stone-600 pr-6">
                  Müşteri: {customersServed + 1}/{maxCustomers}
               </div>
            )}
            <div className="bg-black px-4 py-2 border-2 border-stone-600 text-yellow-400 text-sm shadow-inner min-w-[120px] text-center">
              <span>💰 {gameState.gold}</span>
            </div>
            <div className="bg-black px-4 py-2 border-2 border-stone-600 text-blue-400 text-sm shadow-inner min-w-[100px] text-center">
              <span>⭐ {gameState.reputation}</span>
            </div>
            
            {/* PC Control Hint */}
            <div className="hidden lg:flex flex-col items-end text-[10px] text-stone-500 ml-4">
               <span>[F] Tam Ekran</span>
               <span>[ESC] Menü/Çıkış</span>
            </div>
            
            <button onClick={toggleFullscreen} className="lg:hidden bg-stone-700 p-2 border-2 border-stone-500 text-[10px]">
               [ ]
            </button>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-grow relative flex flex-col items-center justify-center p-8 bg-[url('https://picsum.photos/1600/900?grayscale&blur=2')] bg-cover bg-center">
          <div className="absolute inset-0 bg-stone-900/85 backdrop-blur-sm"></div>

          {/* Shop Overlay */}
          {showShop && (
            <Shop 
              state={gameState} 
              onBuyUpgrade={handleBuyUpgrade} 
              onBuyMaterial={handleBuyMaterial}
              onClose={() => setShowShop(false)} 
            />
          )}

          {/* PHASE: DAY START */}
          {phase === 'DAY_START' && !showShop && (
             <div className="relative z-10 w-full max-w-2xl bg-stone-800 border-4 border-green-700 retro-border p-12 text-center animate-[fadeIn_0.5s_ease-out] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
               <h1 className="text-5xl text-yellow-500 mb-4 text-shadow-lg">GÜN {gameState.day}</h1>
               <p className="text-stone-400 text-sm mb-12">Dükkan hazırlıklarını tamamla.</p>
               <div className="flex gap-8 justify-center">
                 <div className="w-1/2">
                    <RetroButton variant="warning" fullWidth onClick={() => setShowShop(true)} className="h-16 text-lg">
                      DÜKKAN (MARKET)
                    </RetroButton>
                 </div>
                 <div className="w-1/2">
                    <RetroButton variant="success" fullWidth onClick={handleStartDay} className="h-16 text-lg animate-pulse">
                      KEPENKLERİ AÇ
                    </RetroButton>
                 </div>
               </div>
             </div>
          )}

          {/* PHASE: DAY SUMMARY */}
          {phase === 'DAY_SUMMARY' && (
             <div className="relative z-10 w-full max-w-xl bg-stone-800 border-4 border-blue-600 retro-border p-12 text-center animate-[fadeIn_0.5s_ease-out]">
                <h2 className="text-3xl text-blue-400 mb-8 border-b-4 border-stone-600 pb-4">GÜN ÖZETİ</h2>
                <div className="space-y-6 mb-12 text-left px-8 text-lg">
                   <div className="flex justify-between items-center"><span className="text-stone-400">Hizmet Verilen:</span><span className="text-white text-xl">{customersServed}</span></div>
                   <div className="flex justify-between items-center"><span className="text-stone-400">Kazanılan Altın:</span><span className="text-yellow-400 text-xl">+{dailyStats.gold}</span></div>
                   <div className="flex justify-between items-center"><span className="text-stone-400">Kazanılan İtibar:</span><span className="text-blue-400 text-xl">+{dailyStats.rep}</span></div>
                </div>
                <RetroButton variant="primary" fullWidth onClick={handleNextDay} className="h-16 text-xl">SONRAKİ GÜN &gt;&gt;</RetroButton>
             </div>
          )}

          {/* PHASE: IDLE (Waiting for Customer) */}
          {phase === 'IDLE' && (
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
              {loadingCustomer ? (
                <div className="text-center animate-pulse"><p className="text-2xl text-stone-400">Müşteri Yaklaşıyor...</p></div>
              ) : currentCustomer ? (
                <div className="w-full bg-stone-800 border-4 border-stone-600 retro-border p-10 flex gap-8 animate-[fadeIn_0.5s_ease-out] shadow-2xl items-start">
                    {/* Left: Avatar */}
                    <div className={`w-48 h-48 ${currentCustomer.isBoss ? 'bg-red-900 border-red-500' : 'bg-stone-700 border-stone-500'} border-4 shrink-0 overflow-hidden retro-border`}>
                      <img 
                        src={currentCustomer.avatarUrl} 
                        alt={currentCustomer.name}
                        className="w-full h-full object-cover pixelated"
                      />
                    </div>
                    
                    {/* Right: Info */}
                    <div className="flex-grow flex flex-col gap-4 h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className={`text-2xl mb-2 ${currentCustomer.isBoss ? 'text-red-500' : 'text-green-400'}`}>{currentCustomer.name}</h2>
                                    <div className="flex gap-2">
                                        <span className="bg-stone-900 text-stone-300 px-2 py-1 text-xs border border-stone-600">{currentCustomer.requestType}</span>
                                        {currentCustomer.isBoss && <span className="bg-red-600 text-white px-2 py-1 text-xs border border-red-800 animate-pulse">BOSS</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 bg-black/40 p-6 border-l-4 border-stone-500 italic text-stone-300 text-lg min-h-[100px]">
                                "{currentCustomer.dialogue}"
                            </div>
                        </div>
                        <RetroButton variant="success" fullWidth className="h-16 text-xl mt-4" onClick={startCraftingProcess}>SİPARİŞİ AL</RetroButton>
                    </div>
                </div>
              ) : null}
            </div>
          )}

          {/* CRAFTING FLOW CONTAINER */}
          {isCraftingPhase && (
              <div className="relative z-10 w-full max-w-4xl h-full max-h-[600px] flex flex-col items-center justify-center">
                  
                  {/* 1. Material Selection */}
                  {phase === 'CRAFTING_SETUP' && !selectedMaterial && (
                      <MaterialSelector 
                          gold={gameState.gold}
                          materials={gameState.materials} 
                          onSelect={handleMaterialSelect} 
                          onBack={() => setPhase('IDLE')} 
                      />
                  )}

                  {/* INTERSTITIALS: Countdown & Summaries */}
                  {(phase === 'COUNTDOWN' || phase === 'PHASE_SUMMARY') && (
                      <PhaseTransition 
                         mode={phase === 'COUNTDOWN' ? 'COUNTDOWN' : 'SUMMARY'}
                         title={lastPhaseTitle}
                         score={phase === 'PHASE_SUMMARY' ? lastPhaseScore : undefined}
                         nextPhaseName={phase === 'PHASE_SUMMARY' ? (nextPhase === 'CRAFTING' ? 'DÖVME' : 'SU VERME') : undefined}
                         onComplete={handleTransitionComplete}
                      />
                  )}

                  {/* 2. Cutting Minigame */}
                  {phase === 'CUTTING' && (
                      <CuttingGame onComplete={handleCuttingComplete} />
                  )}

                  {/* 3. Hammering Minigame */}
                  {phase === 'CRAFTING' && selectedMaterial && (
                      <CraftingTable 
                          targetItem={currentCustomer!.requestType}
                          material={selectedMaterial}
                          upgrades={gameState.upgrades}
                          onComplete={handleForgingComplete}
                          onCancel={() => setPhase('IDLE')}
                      />
                  )}

                  {/* 4. Quenching Minigame */}
                  {phase === 'QUENCHING' && (
                      <QuenchingGame onComplete={handleQuenchingComplete} />
                  )}

                  {/* 5. Result */}
                  {phase === 'RESULT' && craftedItem && (
                  <div className="w-full max-w-md mx-auto bg-stone-800 border-4 border-yellow-600 retro-border p-12 text-center animate-[popIn_0.3s_ease-out] shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                      <h2 className="text-3xl text-yellow-400 mb-6">ÜRETİM BAŞARILI</h2>
                      <div className="text-8xl mb-8 drop-shadow-lg">⚔️</div>
                      <div className="text-4xl text-yellow-400 font-bold mb-4 text-shadow">+{craftedItem.value} G</div>
                      <div className="text-stone-400 mb-8 text-lg">KALİTE: <span className="text-white">{craftedItem.quality}/100</span></div>
                      <RetroButton variant="primary" fullWidth onClick={handleNextCustomer} className="h-16 text-xl">MÜŞTERİYİ GÖNDER</RetroButton>
                  </div>
                  )}
              </div>
          )}

        </main>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .pixelated { image-rendering: pixelated; }
        .text-shadow { text-shadow: 2px 2px 0px #000; }
        .text-shadow-lg { text-shadow: 4px 4px 0px #000; }
      `}</style>
    </div>
  );
}

export default App;
