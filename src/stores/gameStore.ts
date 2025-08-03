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
  purchaseDragon: (dragonId: string, dragonConfig: { baseCost: number; costResource: string; costMultiplier: number }) => boolean;
  purchaseDragonBulk: (dragonId: string, dragonConfig: { baseCost: number; costResource: string; costMultiplier: number }, amount: number) => number;
  calculateMaxAffordable: (dragonId: string, dragonConfig: { baseCost: number; costResource: string; costMultiplier: number }) => number;
  hatchEgg: (targetDragonId: string, amount?: number) => boolean;
  calculateDragonProduction: (dragonConfigs: Array<{ id: string; production: { resource: string; baseRate: number } }>) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateStatistics: (stats: Partial<GameStatistics>) => void;
  saveGame: () => void;
  loadGame: (saveData: string) => boolean;
  resetGame: () => void;
  tick: (dragonConfigs?: Array<{ id: string; production: { resource: string; baseRate: number } }>) => void;
}

const initialGameState: GameState = {
  resources: {
    meat: new Decimal(0),
    eggs: new Decimal(3), // Start with 3 eggs to hatch into hatchlings
    hatchlings: new Decimal(0),
    young_dragons: new Decimal(0),
    adult_dragons: new Decimal(0),
    elder_dragons: new Decimal(0),
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

    purchaseDragon: (dragonId: string, dragonConfig: { baseCost: number; costResource: string; costMultiplier: number }) => {
      const state = get();
      const owned = state.dragons[dragonId] || 0;

      // Calculate current cost
      const currentCost = new Decimal(dragonConfig.baseCost).mul(
        new Decimal(dragonConfig.costMultiplier).pow(owned)
      );

      // Check if we can afford it
      if (!get().canAfford({ [dragonConfig.costResource]: currentCost.toNumber() })) {
        return false;
      }

      // Spend the resources
      if (!get().spendResource(dragonConfig.costResource, currentCost)) {
        return false;
      }

      // Add the dragon
      set((state) => ({
        dragons: {
          ...state.dragons,
          [dragonId]: (state.dragons[dragonId] || 0) + 1,
        },
        statistics: {
          ...state.statistics,
          dragonsHatched: state.statistics.dragonsHatched + 1,
          maxDragonsOwned: {
            ...state.statistics.maxDragonsOwned,
            [dragonId]: Math.max(state.statistics.maxDragonsOwned[dragonId] || 0, (state.dragons[dragonId] || 0) + 1),
          },
        },
      }));

      return true;
    },

    calculateMaxAffordable: (dragonId: string, dragonConfig: { baseCost: number; costResource: string; costMultiplier: number }) => {
      const state = get();
      const owned = state.dragons[dragonId] || 0;
      const availableResource = state.resources[dragonConfig.costResource] || new Decimal(0);

      // Handle cost multiplier of 1.0 (no scaling) - simple division
      if (dragonConfig.costMultiplier === 1.0) {
        const costPerDragon = new Decimal(dragonConfig.baseCost);
        return Math.floor(availableResource.div(costPerDragon).toNumber());
      }

      let maxAffordable = 0;
      let totalCost = new Decimal(0);
      let currentCost = new Decimal(dragonConfig.baseCost).mul(
        new Decimal(dragonConfig.costMultiplier).pow(owned)
      );

      // Calculate how many we can afford with geometric series
      // Add safety limit to prevent infinite loops
      const maxIterations = 1000;
      let iterations = 0;

      while (totalCost.add(currentCost).lte(availableResource) && iterations < maxIterations) {
        totalCost = totalCost.add(currentCost);
        maxAffordable++;
        currentCost = currentCost.mul(dragonConfig.costMultiplier);
        iterations++;
      }

      return maxAffordable;
    },

    purchaseDragonBulk: (dragonId: string, dragonConfig: { baseCost: number; costResource: string; costMultiplier: number }, amount: number) => {
      if (amount <= 0) return 0;

      const state = get();
      const owned = state.dragons[dragonId] || 0;

      // Calculate total cost for the amount requested
      let totalCost = new Decimal(0);
      for (let i = 0; i < amount; i++) {
        const cost = new Decimal(dragonConfig.baseCost).mul(
          new Decimal(dragonConfig.costMultiplier).pow(owned + i)
        );
        totalCost = totalCost.add(cost);
      }

      // Check if we can afford it
      if (!get().canAfford({ [dragonConfig.costResource]: totalCost.toNumber() })) {
        return 0;
      }

      // Spend the resources
      if (!get().spendResource(dragonConfig.costResource, totalCost)) {
        return 0;
      }

      // Add the dragons
      set((state) => ({
        dragons: {
          ...state.dragons,
          [dragonId]: (state.dragons[dragonId] || 0) + amount,
        },
        statistics: {
          ...state.statistics,
          dragonsHatched: state.statistics.dragonsHatched + amount,
          maxDragonsOwned: {
            ...state.statistics.maxDragonsOwned,
            [dragonId]: Math.max(
              state.statistics.maxDragonsOwned[dragonId] || 0,
              (state.dragons[dragonId] || 0) + amount
            ),
          },
        },
      }));

      return amount;
    },

    hatchEgg: (targetDragonId: string, amount: number = 1) => {
      const state = get();

      // Check if we have enough eggs
      const eggsAvailable = state.resources.eggs || new Decimal(0);
      if (eggsAvailable.lt(amount)) {
        return false;
      }

      // Spend the eggs
      if (!get().spendResource('eggs', new Decimal(amount))) {
        return false;
      }

      // Add the hatched dragons
      set((state) => ({
        dragons: {
          ...state.dragons,
          [targetDragonId]: (state.dragons[targetDragonId] || 0) + amount,
        },
        statistics: {
          ...state.statistics,
          dragonsHatched: state.statistics.dragonsHatched + amount,
          maxDragonsOwned: {
            ...state.statistics.maxDragonsOwned,
            [targetDragonId]: Math.max(
              state.statistics.maxDragonsOwned[targetDragonId] || 0,
              (state.dragons[targetDragonId] || 0) + amount
            ),
          },
        },
      }));

      return true;
    },

    calculateDragonProduction: (dragonConfigs: Array<{ id: string; production: { resource: string; baseRate: number } }>) => {
      const state = get();

      // Calculate total production for each resource
      const production: Record<string, Decimal> = {};
      const dragonProduction: Record<string, Decimal> = {};

      for (const config of dragonConfigs) {
        const owned = state.dragons[config.id] || 0;
        if (owned > 0) {
          const resourceProduced = config.production.resource;
          const totalProduction = new Decimal(config.production.baseRate).mul(owned);

          // Handle dragon-producing-dragon resources
          if (resourceProduced.endsWith('s') && resourceProduced !== 'eggs') {
            // This produces dragons (e.g., "hatchlings" -> add to "hatchling" dragon count)
            const dragonType = resourceProduced.slice(0, -1); // Remove 's'
            if (!dragonProduction[dragonType]) {
              dragonProduction[dragonType] = new Decimal(0);
            }
            dragonProduction[dragonType] = dragonProduction[dragonType].add(totalProduction);
          } else {
            // This produces regular resources
            if (!production[resourceProduced]) {
              production[resourceProduced] = new Decimal(0);
            }
            production[resourceProduced] = production[resourceProduced].add(totalProduction);
          }
        }
      }

      // Apply production to resources
      for (const [resource, amount] of Object.entries(production)) {
        if (amount.gt(0)) {
          get().addResource(resource, amount);
        }
      }

      // Apply dragon production
      if (Object.keys(dragonProduction).length > 0) {
        set((state) => {
          const newDragons = { ...state.dragons };
          Object.entries(dragonProduction).forEach(([dragonType, amount]) => {
            newDragons[dragonType] = (newDragons[dragonType] || 0) + amount.toNumber();
          });
          return {
            dragons: newDragons,
          };
        });
      }
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

    tick: (dragonConfigs?: Array<{ id: string; production: { resource: string; baseRate: number } }>) => {
      const state = get();

      // Apply dragon production if configs are provided
      if (dragonConfigs) {
        get().calculateDragonProduction(dragonConfigs);
      }

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
