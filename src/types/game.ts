import { Decimal } from 'decimal.js';

export interface GameSettings {
  autoSave: boolean;
  theme: string;
  numberFormat: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoUpgrade: boolean;
  showNotifications: boolean;
}

export interface GameStatistics {
  totalClicks: number;
  totalTime: number;
  prestigeCount: number;
  dragonsHatched: number;
  territoriesConquered: number;
  evolutionsUnlocked: number;
  totalResourcesEarned: Record<string, Decimal>;
  maxDragonsOwned: Record<string, number>;
}

export interface GameState {
  resources: Record<string, Decimal>;
  dragons: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  evolutions: string[];
  research: string[];
  lairs: Record<string, LairData>;
  territories: string[];
  settings: GameSettings;
  statistics: GameStatistics;
  lastSave: number;
  version: string;
}

export interface DragonConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costResource: string;
  costMultiplier: number;
  production: {
    resource: string;
    baseRate: number;
  };
  unlockCondition?: UnlockCondition;
  evolutionPath?: string[];
  category: 'basic' | 'advanced' | 'legendary' | 'mythical';
  rarity: number;
}

export interface DragonEvolution {
  id: string;
  name: string;
  description: string;
  baseType: string;
  requirements: {
    resources?: Record<string, number>;
    achievements?: string[];
    dragonCount?: number;
    research?: string[];
  };
  bonuses: {
    productionMultiplier?: number;
    specialAbility?: string;
    newResource?: string;
    costReduction?: number;
  };
}

export interface LairConfig {
  id: string;
  name: string;
  description: string;
  capacity: number;
  productionBonus: number;
  specialization?: string;
  upgrades: string[];
  unlockCondition?: UnlockCondition;
}

export interface LairData {
  level: number;
  capacity: number;
  productionBonus: number;
  specialization?: string;
  upgrades: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (gameState: GameState) => boolean;
  reward?: {
    type: 'multiplier' | 'unlock' | 'resource' | 'evolution' | 'research';
    value: number;
    target?: string;
  };
  category: 'production' | 'evolution' | 'territory' | 'prestige' | 'special';
  hidden?: boolean;
  unlocked?: boolean;
  completed?: boolean;
}

export interface UnlockCondition {
  type: 'resource' | 'dragon' | 'achievement' | 'territory' | 'research';
  target: string;
  value: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
  effect: {
    type: 'multiplier' | 'additive' | 'unlock' | 'special';
    target: string;
    value: number;
  };
  unlockCondition?: UnlockCondition;
  category: 'production' | 'efficiency' | 'capacity' | 'special';
}

export interface ResearchConfig {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
  researchTime: number;
  prerequisites?: string[];
  unlocks: string[];
  category: 'genetics' | 'territory' | 'efficiency' | 'special';
}

export interface TerritoryConfig {
  id: string;
  name: string;
  description: string;
  conquestCost: Record<string, number>;
  resourceBonus: Record<string, number>;
  specialFeatures?: string[];
  unlockCondition?: UnlockCondition;
}

export type ResourceType = 'meat' | 'eggs' | 'energy' | 'gold' | 'dragonSouls' | 'ancientPower' | 'cosmicEssence';

export interface GameConfig {
  dragons: DragonConfig[];
  evolutions: DragonEvolution[];
  lairs: LairConfig[];
  achievements: Achievement[];
  upgrades: UpgradeConfig[];
  research: ResearchConfig[];
  territories: TerritoryConfig[];
  resources: {
    [key in ResourceType]: {
      name: string;
      description: string;
      icon: string;
      color: string;
    };
  };
}
