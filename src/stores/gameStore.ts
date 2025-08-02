import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Decimal } from 'decimal.js';
import type { GameState, GameSettings, GameStatistics } from '../types/game';

// Utility function to ensure all resources are Decimal objects
const ensureDecimalResources = (resources: Record<string, unknown>): Record<string, Decimal> => {
  const result: Record<string, Decimal> = {};
  for (const [key, value] of Object.entries(resources)) {
    if (value instanceof Decimal) {
      result[key] = value;
    } else {
      result[key] = new Decimal(typeof value === 'number' || typeof value === 'string' ? value : 0);
    }
  }
  return result;
};

interface GameStore extends GameState {
  // Actions
  addResource: (resource: string, amount: Decimal) => void;
  spendResource: (resource: string, amount: Decimal) => boolean;
  canAfford: (costs: Record<string, number>) => boolean;
  purchaseDragon: (dragonId: string) => boolean;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateStatistics: (stats: Partial<GameStatistics>) => void;
  saveGame: () => void;
  loadGame: (saveData: string) => boolean;
  resetGame: () => void;
  tick: () => void;
}

const initialGameState: GameState = {
  resources: {
    meat: new Decimal(10),
    eggs: new Decimal(0),
    energy: new Decimal(100),
    gold: new Decimal(0),
    dragonSouls: new Decimal(0),
    ancientPower: new Decimal(0),
    cosmicEssence: new Decimal(0),
  },
  dragons: {},
  upgrades: [],
  achievements: [],
  evolutions: [],
  research: [],
  lairs: {},
  territories: [],
  settings: {
    autoSave: true,
    theme: 'dark-dragon',
    numberFormat: 'suffix',
    soundEnabled: true,
    musicEnabled: true,
    autoUpgrade: false,
    showNotifications: true,
  },
  statistics: {
    totalClicks: 0,
    totalTime: 0,
    prestigeCount: 0,
    dragonsHatched: 0,
    territoriesConquered: 0,
    evolutionsUnlocked: 0,
    totalResourcesEarned: {
      meat: new Decimal(0),
      eggs: new Decimal(0),
      energy: new Decimal(0),
      gold: new Decimal(0),
      dragonSouls: new Decimal(0),
      ancientPower: new Decimal(0),
      cosmicEssence: new Decimal(0),
    },
    maxDragonsOwned: {},
  },
  lastSave: Date.now(),
  version: '0.1.0',
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialGameState,

    addResource: (resource: string, amount: Decimal) => {
      set((state) => {
        // Ensure current resource value is a Decimal object
        const currentAmount = state.resources[resource];
        const currentDecimal = currentAmount instanceof Decimal ? currentAmount : new Decimal(currentAmount || 0);

        // Ensure statistics value is a Decimal object
        const currentStatsAmount = state.statistics.totalResourcesEarned[resource];
        const currentStatsDecimal = currentStatsAmount instanceof Decimal ? currentStatsAmount : new Decimal(currentStatsAmount || 0);

        return {
          resources: {
            ...state.resources,
            [resource]: currentDecimal.add(amount),
          },
          statistics: {
            ...state.statistics,
            totalResourcesEarned: {
              ...state.statistics.totalResourcesEarned,
              [resource]: currentStatsDecimal.add(amount),
            },
          },
        };
      });
    },

    spendResource: (resource: string, amount: Decimal) => {
      const state = get();
      const currentAmount = state.resources[resource];
      const currentDecimal = currentAmount instanceof Decimal ? currentAmount : new Decimal(currentAmount || 0);

      if (currentDecimal.gte(amount)) {
        set((state) => ({
          resources: {
            ...state.resources,
            [resource]: currentDecimal.sub(amount),
          },
        }));
        return true;
      }
      return false;
    },

    canAfford: (costs: Record<string, number>) => {
      const state = get();
      return Object.entries(costs).every(([resource, cost]) => {
        const currentAmount = state.resources[resource];
        if (!currentAmount) return false;
        // Ensure currentAmount is a Decimal object
        const decimalAmount = currentAmount instanceof Decimal ? currentAmount : new Decimal(currentAmount);
        return decimalAmount.gte(cost);
      });
    },

    purchaseDragon: (dragonId: string) => {
      // This will be implemented when we add dragon configurations
      console.log(`Purchasing dragon: ${dragonId}`);
      return false;
    },

    updateSettings: (newSettings: Partial<GameSettings>) => {
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    },

    updateStatistics: (newStats: Partial<GameStatistics>) => {
      set((state) => ({
        statistics: {
          ...state.statistics,
          ...newStats,
        },
      }));
    },

    saveGame: () => {
      const state = get();
      const saveData = {
        ...state,
        lastSave: Date.now(),
      };
      localStorage.setItem('dragon-incremental-save', JSON.stringify(saveData, (_key, value) => {
        if (value instanceof Decimal) {
          return { __decimal: value.toString() };
        }
        return value;
      }));
    },

    loadGame: (saveData: string) => {
      try {
        const parsed = JSON.parse(saveData, (_key, value) => {
          if (value && typeof value === 'object' && value.__decimal) {
            return new Decimal(value.__decimal);
          }
          return value;
        });
        
        // Ensure all resources are Decimal objects after loading
        const loadedState = {
          ...initialGameState,
          ...parsed,
        };

        if (loadedState.resources) {
          loadedState.resources = ensureDecimalResources(loadedState.resources);
        }

        if (loadedState.statistics?.totalResourcesEarned) {
          loadedState.statistics.totalResourcesEarned = ensureDecimalResources(loadedState.statistics.totalResourcesEarned);
        }

        set(loadedState);
        return true;
      } catch (error) {
        console.error('Failed to load save data:', error);
        return false;
      }
    },

    resetGame: () => {
      const resetState = {
        ...initialGameState,
        resources: ensureDecimalResources(initialGameState.resources),
        statistics: {
          ...initialGameState.statistics,
          totalResourcesEarned: ensureDecimalResources(initialGameState.statistics.totalResourcesEarned),
        },
      };
      set(resetState);
      localStorage.removeItem('dragon-incremental-save');
    },

    tick: () => {
      // Game loop logic will be implemented here
      const state = get();
      
      // Update total time
      set((state) => ({
        statistics: {
          ...state.statistics,
          totalTime: state.statistics.totalTime + 1,
        },
      }));

      // Auto-save every 30 seconds
      if (state.settings.autoSave && Date.now() - state.lastSave > 30000) {
        get().saveGame();
      }
    },
  }))
);

// Auto-load game on initialization
const savedGame = localStorage.getItem('dragon-incremental-save');
if (savedGame) {
  useGameStore.getState().loadGame(savedGame);
}
