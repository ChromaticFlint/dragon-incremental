import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Decimal } from 'decimal.js';
import type { GameState, GameSettings, GameStatistics } from '../types/game';

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
      set((state) => ({
        resources: {
          ...state.resources,
          [resource]: state.resources[resource]?.add(amount) || amount,
        },
        statistics: {
          ...state.statistics,
          totalResourcesEarned: {
            ...state.statistics.totalResourcesEarned,
            [resource]: state.statistics.totalResourcesEarned[resource]?.add(amount) || amount,
          },
        },
      }));
    },

    spendResource: (resource: string, amount: Decimal) => {
      const state = get();
      const currentAmount = state.resources[resource] || new Decimal(0);
      
      if (currentAmount.gte(amount)) {
        set((state) => ({
          resources: {
            ...state.resources,
            [resource]: currentAmount.sub(amount),
          },
        }));
        return true;
      }
      return false;
    },

    canAfford: (costs: Record<string, number>) => {
      const state = get();
      return Object.entries(costs).every(([resource, cost]) => {
        const currentAmount = state.resources[resource] || new Decimal(0);
        return currentAmount.gte(cost);
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
        
        set({
          ...initialGameState,
          ...parsed,
        });
        return true;
      } catch (error) {
        console.error('Failed to load save data:', error);
        return false;
      }
    },

    resetGame: () => {
      set(initialGameState);
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
