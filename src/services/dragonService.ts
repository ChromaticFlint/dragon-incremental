import { Decimal } from 'decimal.js';
import type { DragonConfig, GameState } from '../types/game';
import dragonData from '../data/dragons.json';

export class DragonService {
  private static dragons: DragonConfig[] = dragonData.dragons as DragonConfig[];

  static getAllDragons(): DragonConfig[] {
    return this.dragons;
  }

  static getDragonById(id: string): DragonConfig | undefined {
    return this.dragons.find(dragon => dragon.id === id);
  }

  static getAvailableDragons(gameState: GameState): DragonConfig[] {
    return this.dragons.filter(dragon => this.isDragonUnlocked(dragon, gameState));
  }

  static isDragonUnlocked(dragon: DragonConfig, gameState: GameState): boolean {
    if (!dragon.unlockCondition) {
      return true; // No unlock condition means always available
    }

    const condition = dragon.unlockCondition;
    
    switch (condition.type) {
      case 'resource': {
        const resourceAmount = gameState.resources[condition.target];
        return resourceAmount ? resourceAmount.gte(condition.value) : false;
      }

      case 'dragon': {
        const dragonCount = gameState.dragons[condition.target] || 0;
        return dragonCount >= condition.value;
      }
        
      case 'achievement':
        return gameState.achievements.includes(condition.target);
        
      case 'territory':
        return gameState.territories.includes(condition.target);
        
      case 'research':
        return gameState.research.includes(condition.target);
        
      default:
        return false;
    }
  }

  static calculateCurrentCost(dragon: DragonConfig, owned: number): Decimal {
    // SwarmSim-style cost calculation with progressive scaling
    const baseCost = new Decimal(dragon.baseCost);
    const baseMultiplier = new Decimal(dragon.costMultiplier);

    // Implement tiered scaling like SwarmSim
    if (owned <= 100) {
      // First 100: Normal scaling
      return baseCost.mul(baseMultiplier.pow(owned));
    } else if (owned <= 1000) {
      // 101-1000: Slightly reduced scaling
      const first100Cost = this.calculateCurrentCost(dragon, 100);
      const excessOwned = owned - 100;
      const reducedMultiplier = baseMultiplier.pow(0.9); // 90% of original multiplier
      return first100Cost.mul(reducedMultiplier.pow(excessOwned));
    } else if (owned <= 10000) {
      // 1001-10000: More reduced scaling
      const first1000Cost = this.calculateCurrentCost(dragon, 1000);
      const excessOwned = owned - 1000;
      const reducedMultiplier = baseMultiplier.pow(0.7); // 70% of original multiplier
      return first1000Cost.mul(reducedMultiplier.pow(excessOwned));
    } else {
      // 10000+: Very gentle scaling to prevent runaway costs
      const first10000Cost = this.calculateCurrentCost(dragon, 10000);
      const excessOwned = owned - 10000;
      const gentleMultiplier = new Decimal(1.05); // Very gentle 5% increase
      return first10000Cost.mul(gentleMultiplier.pow(excessOwned));
    }
  }

  static calculateCost(baseCost: number, costMultiplier: number, owned: number): Decimal {
    // Use the same tiered scaling as calculateCurrentCost
    const baseCostDecimal = new Decimal(baseCost);
    const baseMultiplier = new Decimal(costMultiplier);

    // Implement tiered scaling like SwarmSim
    if (owned <= 100) {
      // First 100: Normal scaling
      return baseCostDecimal.mul(baseMultiplier.pow(owned));
    } else if (owned <= 1000) {
      // 101-1000: Slightly reduced scaling
      const first100Cost = this.calculateCost(baseCost, costMultiplier, 100);
      const excessOwned = owned - 100;
      const reducedMultiplier = baseMultiplier.pow(0.9); // 90% of original multiplier
      return first100Cost.mul(reducedMultiplier.pow(excessOwned));
    } else if (owned <= 10000) {
      // 1001-10000: More reduced scaling
      const first1000Cost = this.calculateCost(baseCost, costMultiplier, 1000);
      const excessOwned = owned - 1000;
      const reducedMultiplier = baseMultiplier.pow(0.7); // 70% of original multiplier
      return first1000Cost.mul(reducedMultiplier.pow(excessOwned));
    } else {
      // 10000+: Very gentle scaling to prevent runaway costs
      const first10000Cost = this.calculateCost(baseCost, costMultiplier, 10000);
      const excessOwned = owned - 10000;
      const gentleMultiplier = new Decimal(1.05); // Very gentle 5% increase
      return first10000Cost.mul(gentleMultiplier.pow(excessOwned));
    }
  }

  static calculateTotalProduction(dragon: DragonConfig, owned: number): number {
    return dragon.production.baseRate * owned;
  }

  static getProductionRate(gameState: GameState): Record<string, number> {
    const production: Record<string, number> = {};
    
    for (const dragon of this.dragons) {
      const owned = gameState.dragons[dragon.id] || 0;
      if (owned > 0) {
        const resource = dragon.production.resource;
        const rate = this.calculateTotalProduction(dragon, owned);
        
        if (!production[resource]) {
          production[resource] = 0;
        }
        production[resource] += rate;
      }
    }
    
    return production;
  }
}
