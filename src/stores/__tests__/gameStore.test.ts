import { describe, it, expect, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { useGameStore } from '../gameStore';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.getState().resetGame();
  });

  describe('Resource Management', () => {
    it('should initialize with default resources as Decimal objects', () => {
      const state = useGameStore.getState();

      expect(state.resources.meat).toEqual(new Decimal(10));
      expect(state.resources.eggs).toEqual(new Decimal(0));
      expect(state.resources.energy).toEqual(new Decimal(100));
      expect(state.resources.gold).toEqual(new Decimal(0));

      // Ensure they are actually Decimal instances
      expect(state.resources.meat).toBeInstanceOf(Decimal);
      expect(state.resources.eggs).toBeInstanceOf(Decimal);
      expect(state.resources.energy).toBeInstanceOf(Decimal);
      expect(state.resources.gold).toBeInstanceOf(Decimal);
    });

    it('should add resources correctly', () => {
      const { addResource } = useGameStore.getState();
      
      addResource('meat', new Decimal(5));
      
      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(new Decimal(15));
    });

    it('should track total resources earned in statistics', () => {
      const { addResource } = useGameStore.getState();
      
      addResource('meat', new Decimal(5));
      addResource('eggs', new Decimal(3));
      
      const state = useGameStore.getState();
      expect(state.statistics.totalResourcesEarned.meat).toEqual(new Decimal(5));
      expect(state.statistics.totalResourcesEarned.eggs).toEqual(new Decimal(3));
    });

    it('should spend resources when available', () => {
      const { spendResource } = useGameStore.getState();
      
      const success = spendResource('meat', new Decimal(5));
      
      expect(success).toBe(true);
      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(new Decimal(5));
    });

    it('should not spend resources when insufficient', () => {
      const { spendResource } = useGameStore.getState();

      const success = spendResource('meat', new Decimal(20));

      expect(success).toBe(false);
      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(new Decimal(10)); // Should remain unchanged
    });

    it('should handle non-Decimal resource values in addResource', () => {
      const state = useGameStore.getState();

      // Manually corrupt the state to simulate the bug
      state.resources.meat = 10 as unknown as Decimal; // Force non-Decimal value

      // This should not throw an error
      expect(() => {
        state.addResource('meat', new Decimal(5));
      }).not.toThrow();

      // Should result in correct Decimal value
      const newState = useGameStore.getState();
      expect(newState.resources.meat).toEqual(new Decimal(15));
      expect(newState.resources.meat).toBeInstanceOf(Decimal);
    });

    it('should handle non-Decimal resource values in spendResource', () => {
      const state = useGameStore.getState();

      // Manually corrupt the state to simulate the bug
      state.resources.meat = 10 as unknown as Decimal; // Force non-Decimal value

      // This should not throw an error
      expect(() => {
        state.spendResource('meat', new Decimal(5));
      }).not.toThrow();

      // Should result in correct Decimal value
      const newState = useGameStore.getState();
      expect(newState.resources.meat).toEqual(new Decimal(5));
      expect(newState.resources.meat).toBeInstanceOf(Decimal);
    });

    it('should maintain Decimal instances after multiple operations', () => {
      const { addResource, spendResource } = useGameStore.getState();

      // Perform multiple operations
      addResource('meat', new Decimal(100));
      spendResource('meat', new Decimal(50));
      addResource('meat', new Decimal(25));

      const state = useGameStore.getState();
      expect(state.resources.meat).toBeInstanceOf(Decimal);
      expect(state.resources.meat).toEqual(new Decimal(85)); // 10 + 100 - 50 + 25
    });
  });

  describe('Affordability Checks', () => {
    it('should return true when resources are sufficient', () => {
      const { canAfford } = useGameStore.getState();
      
      const result = canAfford({ meat: 5, energy: 50 });
      
      expect(result).toBe(true);
    });

    it('should return false when resources are insufficient', () => {
      const { canAfford } = useGameStore.getState();
      
      const result = canAfford({ meat: 20 });
      
      expect(result).toBe(false);
    });

    it('should return false when resource does not exist', () => {
      const { canAfford } = useGameStore.getState();
      
      const result = canAfford({ nonexistentResource: 1 });
      
      expect(result).toBe(false);
    });

    it('should handle multiple resource requirements', () => {
      const { canAfford } = useGameStore.getState();
      
      const result1 = canAfford({ meat: 5, energy: 50 });
      const result2 = canAfford({ meat: 5, energy: 150 });
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('Settings Management', () => {
    it('should update settings correctly', () => {
      const { updateSettings } = useGameStore.getState();
      
      updateSettings({ autoSave: false, theme: 'light-dragon' });
      
      const state = useGameStore.getState();
      expect(state.settings.autoSave).toBe(false);
      expect(state.settings.theme).toBe('light-dragon');
      expect(state.settings.soundEnabled).toBe(true); // Should remain unchanged
    });
  });

  describe('Statistics Tracking', () => {
    it('should update statistics correctly', () => {
      const { updateStatistics } = useGameStore.getState();
      
      updateStatistics({ totalClicks: 10, dragonsHatched: 5 });
      
      const state = useGameStore.getState();
      expect(state.statistics.totalClicks).toBe(10);
      expect(state.statistics.dragonsHatched).toBe(5);
    });

    it('should increment total time on tick', () => {
      const { tick } = useGameStore.getState();
      const initialTime = useGameStore.getState().statistics.totalTime;
      
      tick();
      
      const state = useGameStore.getState();
      expect(state.statistics.totalTime).toBe(initialTime + 1);
    });
  });

  describe('Save/Load Functionality', () => {
    it('should save game state to localStorage', () => {
      const { saveGame, addResource } = useGameStore.getState();
      
      // Modify state
      addResource('meat', new Decimal(100));
      
      saveGame();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dragon-incremental-save',
        expect.any(String)
      );
    });

    it('should load game state from valid save data', () => {
      const { loadGame, addResource } = useGameStore.getState();
      
      // Create a save state
      addResource('meat', new Decimal(100));
      const saveData = JSON.stringify({
        resources: {
          meat: { __decimal: '110' },
          eggs: { __decimal: '0' },
          energy: { __decimal: '100' },
          gold: { __decimal: '0' },
        },
        dragons: {},
        upgrades: [],
        achievements: [],
        version: '0.1.0'
      });
      
      const success = loadGame(saveData);
      
      expect(success).toBe(true);
      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(new Decimal(110));
    });

    it('should handle invalid save data gracefully', () => {
      const { loadGame } = useGameStore.getState();

      const success = loadGame('invalid json');

      expect(success).toBe(false);
    });

    it('should ensure loaded resources are Decimal objects', () => {
      const { loadGame } = useGameStore.getState();

      // Create save data with non-Decimal values (simulating corrupted save)
      const saveData = JSON.stringify({
        resources: {
          meat: 150, // Plain number instead of Decimal
          eggs: "25", // String instead of Decimal
          energy: { __decimal: '200' }, // Proper Decimal format
        },
        statistics: {
          totalResourcesEarned: {
            meat: 100, // Plain number
            eggs: "50", // String
          }
        }
      });

      const success = loadGame(saveData);
      expect(success).toBe(true);

      const state = useGameStore.getState();

      // All resources should be Decimal objects
      expect(state.resources.meat).toBeInstanceOf(Decimal);
      expect(state.resources.eggs).toBeInstanceOf(Decimal);
      expect(state.resources.energy).toBeInstanceOf(Decimal);

      // Values should be correct
      expect(state.resources.meat).toEqual(new Decimal(150));
      expect(state.resources.eggs).toEqual(new Decimal(25));
      expect(state.resources.energy).toEqual(new Decimal(200));

      // Statistics should also be Decimal objects
      expect(state.statistics.totalResourcesEarned.meat).toBeInstanceOf(Decimal);
      expect(state.statistics.totalResourcesEarned.eggs).toBeInstanceOf(Decimal);
    });

    it('should preserve Decimal precision through save/load cycle', () => {
      const { addResource, loadGame } = useGameStore.getState();

      // Add a resource with high precision
      addResource('meat', new Decimal('123.456789012345'));

      // Create save data manually since localStorage is mocked
      const currentState = useGameStore.getState();
      const saveData = JSON.stringify(currentState, (_key, value) => {
        if (value instanceof Decimal) {
          return { __decimal: value.toString() };
        }
        return value;
      });

      // Reset and load
      useGameStore.getState().resetGame();
      const success = loadGame(saveData);
      expect(success).toBe(true);

      // Check precision is preserved
      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(new Decimal('133.456789012345')); // 10 + 123.456789012345
      expect(state.resources.meat).toBeInstanceOf(Decimal);
    });
  });

  describe('Dragon Purchasing', () => {
    const mockDragonConfig = {
      baseCost: 12,
      costResource: 'meat',
      costMultiplier: 1.15,
    };

    it('should purchase dragon when resources are sufficient', () => {
      const { purchaseDragon, addResource } = useGameStore.getState();

      // Add enough resources to afford the dragon
      addResource('meat', new Decimal(5)); // Now we have 15 meat total

      const success = purchaseDragon('hatchling', mockDragonConfig);

      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.dragons.hatchling).toBe(1);
      expect(state.resources.meat).toEqual(new Decimal(3)); // 15 - 12 = 3
      expect(state.statistics.dragonsHatched).toBe(1);
    });

    it('should not purchase dragon when resources are insufficient', () => {
      const { purchaseDragon, spendResource } = useGameStore.getState();

      // Spend most of the meat
      spendResource('meat', new Decimal(8));

      const success = purchaseDragon('hatchling', mockDragonConfig);

      expect(success).toBe(false);

      const state = useGameStore.getState();
      expect(state.dragons.hatchling).toBeUndefined();
      expect(state.resources.meat).toEqual(new Decimal(2)); // Should remain unchanged
    });

    it('should calculate increasing costs for multiple purchases', () => {
      const { purchaseDragon, addResource } = useGameStore.getState();

      // Add enough resources for multiple purchases
      addResource('meat', new Decimal(1000));

      // First purchase should cost 12
      const success1 = purchaseDragon('hatchling', mockDragonConfig);
      expect(success1).toBe(true);

      // Second purchase should cost 12 * 1.15 = 13.8
      const success2 = purchaseDragon('hatchling', mockDragonConfig);
      expect(success2).toBe(true);

      const state = useGameStore.getState();
      expect(state.dragons.hatchling).toBe(2);
      expect(state.statistics.dragonsHatched).toBe(2);
    });

    it('should update max dragons owned statistic', () => {
      const { purchaseDragon, addResource } = useGameStore.getState();

      addResource('meat', new Decimal(100));

      purchaseDragon('hatchling', mockDragonConfig);
      purchaseDragon('hatchling', mockDragonConfig);

      const state = useGameStore.getState();
      expect(state.statistics.maxDragonsOwned.hatchling).toBe(2);
    });
  });

  describe('Dragon Production', () => {
    const mockDragonConfigs = [
      {
        id: 'hatchling',
        production: { resource: 'meat', baseRate: 0.2 },
      },
      {
        id: 'egg_layer',
        production: { resource: 'eggs', baseRate: 1.0 },
      },
    ];

    it('should calculate and apply dragon production', () => {
      const { calculateDragonProduction } = useGameStore.getState();

      // Add some dragons manually
      useGameStore.setState((state) => ({
        dragons: { ...state.dragons, hatchling: 3, egg_layer: 2 },
      }));

      const initialMeat = useGameStore.getState().resources.meat;
      const initialEggs = useGameStore.getState().resources.eggs;

      calculateDragonProduction(mockDragonConfigs);

      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(initialMeat.add(0.6)); // 3 * 0.2
      expect(state.resources.eggs).toEqual(initialEggs.add(2.0)); // 2 * 1.0
    });

    it('should not produce resources when no dragons are owned', () => {
      const { calculateDragonProduction } = useGameStore.getState();

      const initialMeat = useGameStore.getState().resources.meat;
      const initialEggs = useGameStore.getState().resources.eggs;

      calculateDragonProduction(mockDragonConfigs);

      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(initialMeat);
      expect(state.resources.eggs).toEqual(initialEggs);
    });
  });

  describe('Initial Game State', () => {
    it('should start with a Dragon Egg for bootstrapping', () => {
      const state = useGameStore.getState();

      expect(state.dragons.dragon_egg).toBe(1);
    });

    it('should allow Dragon Egg to produce meat immediately', () => {
      const { calculateDragonProduction } = useGameStore.getState();

      const dragonConfigs = [
        {
          id: 'dragon_egg',
          production: { resource: 'meat', baseRate: 0.2 },
        },
      ];

      const initialMeat = useGameStore.getState().resources.meat;

      calculateDragonProduction(dragonConfigs);

      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(initialMeat.add(0.2)); // 1 egg * 0.2 rate
    });
  });

  describe('Game Reset', () => {
    it('should reset game to initial state', () => {
      const { resetGame, addResource, updateSettings } = useGameStore.getState();

      // Modify state
      addResource('meat', new Decimal(100));
      updateSettings({ autoSave: false });

      resetGame();

      const state = useGameStore.getState();
      expect(state.resources.meat).toEqual(new Decimal(10));
      expect(state.settings.autoSave).toBe(true);
      expect(state.dragons.dragon_egg).toBe(1); // Should still have the starter egg
    });
  });
});
