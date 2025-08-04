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
    // Use Decimal.js to handle large numbers without overflow
    const baseCost = new Decimal(dragon.baseCost);
    const multiplier = new Decimal(dragon.costMultiplier);
    const ownedDecimal = new Decimal(owned);

    return baseCost.mul(multiplier.pow(ownedDecimal));
  }

  static calculateCost(baseCost: number, costMultiplier: number, owned: number): Decimal {
    // Simplified cost calculation for use in stores
    const baseCostDecimal = new Decimal(baseCost);
    const multiplier = new Decimal(costMultiplier);
    const ownedDecimal = new Decimal(owned);

    return baseCostDecimal.mul(multiplier.pow(ownedDecimal));
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
