import { Decimal } from 'decimal.js';
import type { GameState } from '../types/game';

/**
 * Service for managing Dragon Soul generation and evolution mechanics
 */
export class DragonSoulService {
  /**
   * Dragon Soul generation rates for different dragon types
   * Higher tier dragons generate more Dragon Souls
   */
  private static readonly DRAGON_SOUL_RATES: Record<string, number> = {
    elder_dragon: 0.1,       // 0.1 Dragon Souls per second per Elder Dragon
    dragon_lord: 0.5,        // 0.5 Dragon Souls per second per Dragon Lord
    ancient_dragon: 1.0,     // 1.0 Dragon Souls per second per Ancient Dragon
    primordial_dragon: 2.5,  // 2.5 Dragon Souls per second per Primordial Dragon
    cosmic_dragon: 5.0,      // 5.0 Dragon Souls per second per Cosmic Dragon
    void_dragon: 10.0,       // 10.0 Dragon Souls per second per Void Dragon
    dragon_god: 20.0,        // 20.0 Dragon Souls per second per Dragon God
  };

  /**
   * Calculate total Dragon Soul production per second
   */
  static calculateDragonSoulProduction(gameState: GameState): Decimal {
    let totalProduction = new Decimal(0);

    for (const [dragonType, rate] of Object.entries(this.DRAGON_SOUL_RATES)) {
      const dragonCount = gameState.dragons[dragonType] || 0;
      if (dragonCount > 0) {
        const production = new Decimal(rate).mul(dragonCount);
        totalProduction = totalProduction.add(production);
      }
    }

    return totalProduction;
  }

  /**
   * Get Dragon Soul production breakdown by dragon type
   */
  static getDragonSoulBreakdown(gameState: GameState): Record<string, Decimal> {
    const breakdown: Record<string, Decimal> = {};

    for (const [dragonType, rate] of Object.entries(this.DRAGON_SOUL_RATES)) {
      const dragonCount = gameState.dragons[dragonType] || 0;
      if (dragonCount > 0) {
        breakdown[dragonType] = new Decimal(rate).mul(dragonCount);
      }
    }

    return breakdown;
  }

  /**
   * Check if evolution is available based on Dragon Soul count and other requirements
   */
  static canEvolve(gameState: GameState): boolean {
    const dragonSouls = gameState.resources.dragonSouls || new Decimal(0);
    const hasHighTierDragons = gameState.dragons.dragon_lord && gameState.dragons.dragon_lord >= 1;
    
    // Require at least 25 Dragon Souls and at least 1 Dragon Lord to evolve
    return dragonSouls.gte(25) && hasHighTierDragons;
  }

  /**
   * Calculate the cost of evolution (energy cost that decreases with spending)
   * Based on SwarmSim's ascension formula
   */
  static calculateEvolutionCost(gameState: GameState): Decimal {
    const evolutionCount = gameState.statistics?.prestigeCount || 0;
    const energySpent = gameState.resources.energy ?
      new Decimal(1000).sub(gameState.resources.energy) : new Decimal(0);

    // Base cost: 1,000,000 energy
    // Increases by 1.15x per evolution
    // Decreases by 2^(-energySpent/10000)
    const baseCost = new Decimal(1000000);
    const evolutionMultiplier = new Decimal(1.15).pow(evolutionCount);
    const energyReduction = new Decimal(2).pow(energySpent.div(-10000));

    return baseCost.mul(evolutionMultiplier).mul(energyReduction);
  }

  /**
   * Get the optimal energy spending point for evolution
   * Based on SwarmSim's breakpoint calculation
   */
  static getOptimalEvolutionPoint(gameState: GameState): Decimal {
    const evolutionCount = gameState.statistics?.prestigeCount || 0;
    
    // Simplified breakpoint calculation
    // Spend energy until the cost reduction equals the energy spent
    return new Decimal(69314).add(new Decimal(1386).mul(evolutionCount));
  }

  /**
   * Perform evolution (reset with Dragon Soul bonuses)
   */
  static performEvolution(gameState: GameState): GameState {
    // This will be implemented when we create the evolution interface
    // For now, just return the current state
    return gameState;
  }

  /**
   * Get available evolution upgrades based on Dragon Soul count
   */
  static getAvailableEvolutions(dragonSouls: Decimal): string[] {
    const evolutions: string[] = [];
    
    if (dragonSouls.gte(10)) evolutions.push('draconic_efficiency_1');
    if (dragonSouls.gte(50)) evolutions.push('ancient_bloodline_1');
    if (dragonSouls.gte(100)) evolutions.push('primordial_power_1');
    if (dragonSouls.gte(250)) evolutions.push('cosmic_wisdom_1');
    if (dragonSouls.gte(500)) evolutions.push('void_mastery_1');
    
    return evolutions;
  }
}
