
export enum ItemType {
  SWORD = 'Kılıç',
  SHIELD = 'Kalkan',
  DAGGER = 'Hançer',
  AXE = 'Balta',
  HELMET = 'Miğfer'
}

export enum Material {
  IRON = 'Demir',
  STEEL = 'Çelik',
  MYTHRIL = 'Mithril',
  ADAMANTITE = 'Adamantit'
}

export interface Item {
  type: ItemType;
  material: Material;
  quality: number; // 0-100
  value: number;
}

export interface Customer {
  id: string;
  name: string;
  requestType: ItemType;
  dialogue: string;
  minQuality: number;
  budget: number;
  patience: number; // Time in seconds
  isBoss: boolean;
  avatarUrl: string; // URL for the pixel art image
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  multiplier: number; // Effect multiplier
}

export interface GameState {
  gold: number;
  reputation: number;
  day: number;
  materials: Record<Material, number>;
  upgrades: Record<string, Upgrade>;
}

export type GamePhase = 
  | 'DAY_START' 
  | 'IDLE' 
  | 'SHOP'
  | 'CRAFTING_SETUP' // Material Selection
  | 'COUNTDOWN'      // 3-2-1 before minigame
  | 'CUTTING' 
  | 'PHASE_SUMMARY'  // Score of the previous minigame
  | 'CRAFTING'       // Hammering
  | 'QUENCHING' 
  | 'RESULT' 
  | 'DAY_SUMMARY';
