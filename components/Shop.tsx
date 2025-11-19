
import React from 'react';
import { GameState, Upgrade, Material } from '../types';
import { MATERIAL_PACK_COSTS, MATERIAL_PACK_AMOUNT } from '../constants';
import RetroButton from './RetroButton';
import { soundManager } from '../services/soundService';

interface ShopProps {
  state: GameState;
  onBuyUpgrade: (upgradeId: string) => void;
  onBuyMaterial: (material: Material) => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ state, onBuyUpgrade, onBuyMaterial, onClose }) => {
  const upgradeList = Object.values(state.upgrades) as Upgrade[];
  const materials = Object.keys(MATERIAL_PACK_COSTS) as Material[];

  return (
    <div className="absolute inset-0 z-50 bg-stone-900/95 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-stone-800 border-4 border-yellow-600 retro-border p-6 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b-4 border-stone-900 pb-4">
          <h2 className="text-2xl text-yellow-500">Dükkan</h2>
          <div className="text-yellow-400 text-xl">
            💰 {state.gold}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
           {/* UPGRADES SECTION */}
           <div>
              <h3 className="text-xl text-green-400 mb-4 border-b border-stone-600 pb-2">Geliştirmeler</h3>
              <div className="space-y-4">
                {upgradeList.map((upgrade) => {
                    const isMaxed = upgrade.level >= upgrade.maxLevel;
                    const canAfford = state.gold >= upgrade.cost;

                    return (
                    <div key={upgrade.id} className="bg-stone-900 p-3 border-2 border-stone-600 flex justify-between items-center">
                        <div>
                            <div className="text-sm text-white font-bold">{upgrade.name} <span className="text-stone-500 text-xs">(Lvl {upgrade.level})</span></div>
                            <div className="text-[10px] text-stone-400">{upgrade.description}</div>
                        </div>
                        <div>
                        {isMaxed ? (
                            <span className="text-stone-500 text-xs font-bold">MAX</span>
                        ) : (
                            <RetroButton
                                variant="warning"
                                disabled={!canAfford}
                                onClick={() => onBuyUpgrade(upgrade.id)}
                                className="text-[10px] px-2 py-1"
                            >
                                {upgrade.cost} G
                            </RetroButton>
                        )}
                        </div>
                    </div>
                    );
                })}
              </div>
           </div>

           {/* MATERIALS SECTION */}
           <div>
              <h3 className="text-xl text-blue-400 mb-4 border-b border-stone-600 pb-2">Hammadde Pazarı</h3>
              <div className="grid grid-cols-2 gap-4">
                 {materials.map((mat) => {
                    const cost = MATERIAL_PACK_COSTS[mat];
                    const canAfford = state.gold >= cost;
                    const currentStock = state.materials[mat];

                    return (
                       <div key={mat} className="bg-stone-900 p-3 border-2 border-stone-600 flex flex-col items-center text-center">
                          <div className="text-white font-bold text-sm mb-1">{mat}</div>
                          <div className="text-xs text-stone-500 mb-2">Mevcut: {currentStock}</div>
                          <RetroButton
                             variant="primary"
                             fullWidth
                             disabled={!canAfford}
                             onClick={() => onBuyMaterial(mat)}
                             className="text-[10px]"
                          >
                             {MATERIAL_PACK_AMOUNT} Adet - {cost} G
                          </RetroButton>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div className="mt-auto">
          <RetroButton variant="danger" onClick={onClose} fullWidth>Dükkanı Kapat</RetroButton>
        </div>
      </div>
    </div>
  );
};

export default Shop;
