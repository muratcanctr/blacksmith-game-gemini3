import { ItemType, Material } from "../types";
import { STATIC_CUSTOMER_NAMES, STATIC_DIALOGUES } from "../constants";

// Helper to get a random enum value
function randomEnum<T extends object>(anEnum: T): T[keyof T] {
  const values = Object.values(anEnum);
  return values[Math.floor(Math.random() * values.length)] as T[keyof T];
}

// Helper to get random array item
function randomArrayItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a pixel art avatar URL based on item type (class) and random seed
function getAvatarUrl(itemType: ItemType, isBoss: boolean): string {
  // Define seeds for different archetypes to simulate "5 visuals per type" logic
  const seeds: Record<string, string[]> = {
    warrior: ['warrior1', 'knight2', 'paladin3', 'barbarian4', 'soldier5'],
    rogue: ['thief1', 'assassin2', 'scout3', 'bandit4', 'ninja5'],
    tank: ['guard1', 'defender2', 'ironclad3', 'wall4', 'hero5'],
    villager: ['peasant1', 'smith2', 'farmer3', 'trader4', 'citizen5'],
    boss: ['demon1', 'dragonborn2', 'king3', 'darklord4', 'giant5']
  };

  let category = 'villager';
  
  if (isBoss) {
    category = 'boss';
  } else {
    switch (itemType) {
      case ItemType.SWORD:
      case ItemType.AXE:
        category = 'warrior';
        break;
      case ItemType.DAGGER:
        category = 'rogue';
        break;
      case ItemType.SHIELD:
      case ItemType.HELMET:
        category = 'tank';
        break;
    }
  }

  // Pick one of the 5 presets
  const seedBase = randomArrayItem(seeds[category]);
  // Add random suffix to ensure slight variations unique per customer instance
  const uniqueSeed = `${seedBase}-${Math.floor(Math.random() * 1000)}`;

  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${uniqueSeed}`;
}

export const generateCustomerRequest = async (
  reputation: number,
  availableMaterials: Material[]
): Promise<{ name: string; dialogue: string; type: ItemType; isBoss: boolean; avatarUrl: string }> => {
  
  // Simulate a short "thinking" delay for better UX flow
  await new Promise(resolve => setTimeout(resolve, 400));

  const isBoss = Math.random() > 0.9 && reputation > 200;
  const itemType = randomEnum(ItemType);
  const name = randomArrayItem(STATIC_CUSTOMER_NAMES);
  const dialogue = randomArrayItem(STATIC_DIALOGUES);

  return {
    name: name,
    dialogue: dialogue,
    type: itemType,
    isBoss: isBoss,
    avatarUrl: getAvatarUrl(itemType, isBoss)
  };
};