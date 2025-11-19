
import { GoogleGenAI, Type } from "@google/genai";
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
  // We use the item type to guess the customer class (e.g. Sword -> Warrior)
  
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

  // Pick one of the 5 presets or generate a random one if needed
  const seedBase = randomArrayItem(seeds[category]);
  // Add random suffix to ensure slight variations if we wanted, but user asked for 5 specific visuals.
  // To keep it exactly 5 per type, we strictly use the seedBase.
  // Adding a random number to make it unique per customer instance even if they look same.
  const uniqueSeed = `${seedBase}-${Math.floor(Math.random() * 1000)}`;

  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${uniqueSeed}`;
}

const TIMEOUT_MS = 1500; // 1.5 seconds max wait for AI

// Generate a local customer instantly (Fallback)
const getLocalCustomer = (reputation: number, availableMaterials: Material[]) => {
  const isBoss = Math.random() > 0.9 && reputation > 200;
  const itemType = randomEnum(ItemType);
  return {
    name: randomArrayItem(STATIC_CUSTOMER_NAMES),
    dialogue: randomArrayItem(STATIC_DIALOGUES),
    type: itemType,
    isBoss: isBoss,
    avatarUrl: getAvatarUrl(itemType, isBoss)
  };
};

export const generateCustomerRequest = async (
  reputation: number,
  availableMaterials: Material[]
): Promise<{ name: string; dialogue: string; type: ItemType; isBoss: boolean; avatarUrl: string }> => {
  const apiKey = process.env.API_KEY;
  const fallbackData = getLocalCustomer(reputation, availableMaterials);

  // If no API key, return local immediately
  if (!apiKey) {
    // Add small artificial delay for "feeling"
    await new Promise(r => setTimeout(r, 400));
    return fallbackData;
  }

  const ai = new GoogleGenAI({ apiKey });
  const isBoss = Math.random() > 0.8 && reputation > 200;
  const itemType = randomEnum(ItemType);
  
  const prompt = `
    Sen bir orta çağ fantezi dünyasında bir RPG karakterisin.
    Bir demirci dükkanına giriyorsun.
    İstediğin eşya: ${itemType}.
    Karakter Tipi: ${isBoss ? 'Efsanevi bir Kahraman veya Kötü Adam (Boss)' : 'Sıradan bir maceracı veya köylü'}.
    
    Lütfen JSON formatında yanıt ver:
    {
      "name": "Karakterin Adı",
      "dialogue": "Demirciye söylediğin tek cümlelik, karakterine uygun, bazen komik veya epik istek cümlesi. (Türkçe)"
    }
  `;

  // Create the AI Promise
  const aiPromise = ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dialogue: { type: Type.STRING }
        }
      }
    }
  }).then(response => {
    const text = response.text;
    if (!text) throw new Error("Empty response");
    const data = JSON.parse(text);
    return {
      name: data.name || fallbackData.name,
      dialogue: data.dialogue || fallbackData.dialogue,
      type: itemType,
      isBoss: isBoss,
      avatarUrl: getAvatarUrl(itemType, isBoss)
    };
  });

  // Create a Timeout Promise
  const timeoutPromise = new Promise<{ name: string; dialogue: string; type: ItemType; isBoss: boolean; avatarUrl: string }>((resolve) => {
    setTimeout(() => {
      resolve(fallbackData);
    }, TIMEOUT_MS);
  });

  try {
    // Race them! Whichever finishes first wins.
    return await Promise.race([aiPromise, timeoutPromise]);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackData;
  }
};
