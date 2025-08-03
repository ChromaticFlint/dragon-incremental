import { describe, it, expect, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { DragonService } from '../dragonService';
import type { GameState } from '../../types/game';

describe('DragonService', () => {
  let mockGameState: GameState;

  beforeEach(() => {
    mockGameState = {
      resources: {
        meat: new Decimal(100),
        eggs: new Decimal(10),
        energy: new Decimal(50),
        gold: new Decimal(0),
        dragonSouls: new Decimal(0),
        ancientPower: new Decimal(0),
        cosmicEssence: new Decimal(0),
      },
      dragons: {
        hatchling: 3,
        egg_layer: 1,
      },
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
        totalResourcesEarned: {},
        maxDragonsOwned: {},
      },
      lastSave: Date.now(),
      version: '0.1.0',
    };
  });

  describe('getAllDragons', () => {
    it('should return all available dragon configurations', () => {
      const dragons = DragonService.getAllDragons();
      
      expect(dragons).toBeDefined();
      expect(dragons.length).toBeGreaterThan(0);
      expect(dragons[0]).toHaveProperty('id');
      expect(dragons[0]).toHaveProperty('name');
      expect(dragons[0]).toHaveProperty('production');
    });
  });

  describe('getDragonById', () => {
    it('should return dragon configuration by id', () => {
      const dragon = DragonService.getDragonById('hatchling');

      expect(dragon).toBeDefined();
      expect(dragon?.id).toBe('hatchling');
      expect(dragon?.name).toBe('Dragon Hatchling');
    });

    it('should return undefined for non-existent dragon', () => {
      const dragon = DragonService.getDragonById('nonexistent');
      
      expect(dragon).toBeUndefined();
    });
  });

  describe('isDragonUnlocked', () => {
    it('should return true for dragons with no unlock condition', () => {
      const hatchling = DragonService.getDragonById('hatchling')!;

      const isUnlocked = DragonService.isDragonUnlocked(hatchling, mockGameState);

      expect(isUnlocked).toBe(true);
    });

    it('should check resource unlock conditions', () => {
      const energyDrake = DragonService.getDragonById('energy_drake')!;

      // Should be unlocked with 50 energy
      const isUnlocked = DragonService.isDragonUnlocked(energyDrake, mockGameState);
      expect(isUnlocked).toBe(true);

      // Should not be unlocked with insufficient energy
      mockGameState.resources.energy = new Decimal(30);
      const isNotUnlocked = DragonService.isDragonUnlocked(energyDrake, mockGameState);
      expect(isNotUnlocked).toBe(false);
    });

    it('should check dragon count unlock conditions', () => {
      const eggLayer = DragonService.getDragonById('egg_layer')!;

      // Should be unlocked with 3 hatchlings (requirement is 3)
      mockGameState.dragons.hatchling = 3;
      const isUnlocked = DragonService.isDragonUnlocked(eggLayer, mockGameState);
      expect(isUnlocked).toBe(true);

      // Should not be unlocked with insufficient hatchlings
      mockGameState.dragons.hatchling = 2;
      const isNotUnlocked = DragonService.isDragonUnlocked(eggLayer, mockGameState);
      expect(isNotUnlocked).toBe(false);
    });
  });

  describe('getAvailableDragons', () => {
    it('should return only unlocked dragons', () => {
      const availableDragons = DragonService.getAvailableDragons(mockGameState);
      
      expect(availableDragons.length).toBeGreaterThan(0);
      
      // All returned dragons should be unlocked
      for (const dragon of availableDragons) {
        expect(DragonService.isDragonUnlocked(dragon, mockGameState)).toBe(true);
      }
    });
  });

  describe('calculateCurrentCost', () => {
    it('should calculate cost based on owned count', () => {
      const eggLayer = DragonService.getDragonById('egg_layer')!;

      const cost0 = DragonService.calculateCurrentCost(eggLayer, 0);
      const cost1 = DragonService.calculateCurrentCost(eggLayer, 1);
      const cost2 = DragonService.calculateCurrentCost(eggLayer, 2);

      expect(cost0).toBe(20); // Base cost
      expect(cost1).toBe(20 * 1.2); // Base cost * multiplier^1
      expect(cost2).toBe(20 * Math.pow(1.2, 2)); // Base cost * multiplier^2
    });
  });

  describe('calculateTotalProduction', () => {
    it('should calculate total production for owned dragons', () => {
      const hatchling = DragonService.getDragonById('hatchling')!;

      const production0 = DragonService.calculateTotalProduction(hatchling, 0);
      const production3 = DragonService.calculateTotalProduction(hatchling, 3);

      expect(production0).toBe(0);
      expect(production3).toBe(0.4 * 3); // Base rate * count
    });
  });

  describe('getProductionRate', () => {
    it('should calculate total production rates for all owned dragons', () => {
      const productionRates = DragonService.getProductionRate(mockGameState);

      expect(productionRates.meat).toBe(0.4 * 3); // 3 hatchlings * 0.4 rate each
      expect(productionRates.eggs).toBe(0.5 * 1); // 1 egg layer * 0.5 rate
    });

    it('should return empty object when no dragons are owned', () => {
      mockGameState.dragons = {};
      
      const productionRates = DragonService.getProductionRate(mockGameState);
      
      expect(Object.keys(productionRates)).toHaveLength(0);
    });
  });
});
