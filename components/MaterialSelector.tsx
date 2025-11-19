
import React from 'react';
import { Material } from '../types';
import { MATERIAL_COSTS, MATERIAL_MULTIPLIERS } from '../constants';
import RetroButton from './RetroButton';

interface MaterialSelectorProps {
  gold: number;
  materials: Record<Material, number>;
  onSelect: (material: Material, cost: number) => void;
  onBack: () => void;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({ gold, materials, onSelect, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
      <h2 className="text-xl text-yellow-500 mb-4">Malzeme Seç</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {(Object.keys(MATERIAL_COSTS) as Material[]).map((mat) => {
          const count = materials[mat];
          const hasStock = count > 0;
          // Black market cost is 2x base cost
          const blackMarketCost = MATERIAL_COSTS[mat] * 2;
          const canAffordBlackMarket = gold >= blackMarketCost;
          
          let colorClass = "text-stone-300";
          if (mat === Material.MYTHRIL) colorClass = "text-cyan-300";
          if (mat === Material.ADAMANTITE) colorClass = "text-red-400";

          return (
            <button
              key={mat}
              onClick={() => {
                 if (hasStock) onSelect(mat, 0);
                 else if (canAffordBlackMarket) onSelect(mat, blackMarketCost);
              }}
              disabled={!hasStock && !canAffordBlackMarket}
              className={`
                relative p-4 border-4 retro-border flex flex-col items-center justify-between
                bg-stone-800 hover:bg-stone-700 transition-colors
                ${(!hasStock && !canAffordBlackMarket) ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
            >
              {/* Stock Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold border border-black ${hasStock ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                 Stok: {count}
              </div>

              <span className={`text-lg font-bold ${colorClass} mb-2 mt-2`}>{mat}</span>
              
              <div className="text-xs text-stone-400 mb-2">
                Kalite Çarpanı: x{MATERIAL_MULTIPLIERS[mat]}
              </div>

              <div className="mt-2 w-full">
                 {hasStock ? (
                    <div className="bg-stone-700 py-1 text-white text-xs w-full text-center">
                       KULLAN
                    </div>
                 ) : (
                    <div className="bg-black py-1 text-red-500 text-xs w-full text-center border border-red-900">
                       KARABORSA: {blackMarketCost} G
                    </div>
                 )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <RetroButton variant="danger" onClick={onBack}>Vazgeç</RetroButton>
      </div>
    </div>
  );
};

export default MaterialSelector;
