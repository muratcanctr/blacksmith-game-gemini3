
import { ItemType, Material, Upgrade } from './types';

export const INITIAL_MATERIALS = {
  [Material.IRON]: 5,
  [Material.STEEL]: 0,
  [Material.MYTHRIL]: 0,
  [Material.ADAMANTITE]: 0,
};

export const MATERIAL_COSTS: Record<Material, number> = {
  [Material.IRON]: 10, 
  [Material.STEEL]: 50,
  [Material.MYTHRIL]: 200,
  [Material.ADAMANTITE]: 1000,
};

// Cost to buy a pack of 5 in the shop
export const MATERIAL_PACK_COSTS: Record<Material, number> = {
  [Material.IRON]: 40, // Bulk discount
  [Material.STEEL]: 200,
  [Material.MYTHRIL]: 800,
  [Material.ADAMANTITE]: 4000,
};

export const MATERIAL_PACK_AMOUNT = 5;

export const MATERIAL_MULTIPLIERS: Record<Material, number> = {
  [Material.IRON]: 1,
  [Material.STEEL]: 2,
  [Material.MYTHRIL]: 5,
  [Material.ADAMANTITE]: 10,
};

export const BASE_ITEM_VALUES: Record<ItemType, number> = {
  [ItemType.DAGGER]: 10,
  [ItemType.SWORD]: 20,
  [ItemType.SHIELD]: 25,
  [ItemType.AXE]: 30,
  [ItemType.HELMET]: 35,
};

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'hammer',
    name: 'Altın Çekiç',
    description: 'Dövme gücünü artırır.',
    cost: 100,
    level: 1,
    maxLevel: 10,
    multiplier: 1, // Base power
  },
  {
    id: 'anvil',
    name: 'Elmas Örs',
    description: 'Mükemmel vuruş alanını genişletir.',
    cost: 250,
    level: 1,
    maxLevel: 5,
    multiplier: 1, // Zone size multiplier
  },
  {
    id: 'marketing',
    name: 'Çığırtkan',
    description: 'Daha zengin müşteriler gelir.',
    cost: 500,
    level: 1,
    maxLevel: 5,
    multiplier: 1, // Gold reward multiplier
  }
];

export const STATIC_CUSTOMER_NAMES = [
  "Köylü Ahmet", "Şövalye Lancelot", "Hırsız Garret", "Viking Ragnar", 
  "Büyücü Merlin", "Cüce Gimli", "Baron Harkonnen", "Gezgin Tuncay",
  "Prenses Zelda", "Komutan Shepard", "Cadı Yennefer", "Tüccar Marcus"
];

export const STATIC_DIALOGUES = [
  "Ejderha avlayacağım, sağlam bir şeye ihtiyacım var!",
  "Peynir kesmek için keskin bir şey ver.",
  "Savaşa gidiyorum, beni koruyacak bir şey yap.",
  "Eski kılıcım kırıldı, yenisini istiyorum.",
  "Sadece koleksiyonum için güzel bir parça arıyorum.",
  "Köyümü haydutlar bastı, acil silah lazım!",
  "Kralın turnuvasına katılacağım, en iyisini yap.",
  "Zombilere karşı hazırlık yapıyorum.",
  "Bu kalkanla ejderha ateşi durdurabilir miyim?",
  "Hafif ama ölümcül bir şeye ihtiyacım var."
];
