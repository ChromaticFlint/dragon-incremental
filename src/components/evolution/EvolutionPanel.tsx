import React, { useState } from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from '../../stores/gameStore';
import { DragonSoulService } from '../../services/dragonSoulService';
import { formatNumber } from '../../utils/formatNumber';

export const EvolutionPanel: React.FC = () => {
  const gameState = useGameStore();
  const { resources, settings } = gameState;
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canEvolve = DragonSoulService.canEvolve(gameState);
  const dragonSouls = resources.dragonSouls || new Decimal(0);
  const evolutionCost = DragonSoulService.calculateEvolutionCost(gameState);
  const optimalPoint = DragonSoulService.getOptimalEvolutionPoint(gameState);
  const currentEnergy = resources.energy || new Decimal(0);
  const energySpent = new Decimal(1000).sub(currentEnergy);

  // Don't show panel if evolution isn't close to being available
  if (dragonSouls.lt(10)) {
    return null;
  }

  const handleEvolution = () => {
    if (canEvolve && showConfirmation) {
      // TODO: Implement actual evolution logic
      console.log('Evolution triggered!');
      setShowConfirmation(false);
    } else if (canEvolve) {
      setShowConfirmation(true);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="card bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white font-bold">⚡</span>
        </div>
        <h2 className="text-xl font-dragon font-semibold text-purple-300">
          Dragon Evolution
        </h2>
      </div>

      <div className="space-y-4">
        {/* Dragon Soul Status */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-medium">Dragon Souls</span>
            <span className="text-purple-100 font-bold">
              {formatNumber(dragonSouls, settings.numberFormat)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, dragonSouls.div(25).mul(100).toNumber())}%` }}
            />
          </div>
          <div className="text-xs text-purple-400 mt-1">
            {dragonSouls.gte(25) ? 'Ready for Evolution!' : `${formatNumber(new Decimal(25).sub(dragonSouls), settings.numberFormat)} more needed`}
          </div>
        </div>

        {/* Evolution Cost */}
        {canEvolve && (
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300 font-medium">Evolution Cost</span>
              <span className="text-red-300 font-bold">
                {formatNumber(evolutionCost, settings.numberFormat)} Energy
              </span>
            </div>
            <div className="text-xs text-purple-400">
              Energy Spent: {formatNumber(energySpent, settings.numberFormat)} / {formatNumber(optimalPoint, settings.numberFormat)} (optimal)
            </div>
            {energySpent.lt(optimalPoint) && (
              <div className="text-xs text-yellow-400 mt-1">
                💡 Spend more energy to reduce evolution cost
              </div>
            )}
          </div>
        )}

        {/* Evolution Benefits Preview */}
        <div className="bg-black/20 rounded-lg p-3">
          <h3 className="text-purple-300 font-medium mb-2">Evolution Benefits</h3>
          <ul className="text-xs text-purple-200 space-y-1">
            <li>• Reset all progress but keep Dragon Souls</li>
            <li>• Unlock Dragon Evolution upgrades</li>
            <li>• Permanent bonuses for future runs</li>
            <li>• Access to advanced evolution paths</li>
          </ul>
        </div>

        {/* Evolution Button */}
        {!showConfirmation ? (
          <button
            onClick={handleEvolution}
            disabled={!canEvolve}
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 ${
              canEvolve
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canEvolve ? 'Begin Evolution' : 'Evolution Locked'}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
              <h4 className="text-red-300 font-bold mb-2">⚠️ Confirm Evolution</h4>
              <p className="text-red-200 text-sm mb-3">
                This will reset ALL your dragons and resources! You will keep your Dragon Souls and unlock evolution upgrades.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleEvolution}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold transition-colors"
                >
                  Confirm Evolution
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black/20 rounded-lg p-2 text-xs">
            <div className="text-purple-400">Debug Info:</div>
            <div className="text-purple-300">
              Dragon Lords: {gameState.dragons.dragon_lord || 0}<br/>
              Can Evolve: {canEvolve ? 'Yes' : 'No'}<br/>
              Dragon Soul Rate: {formatNumber(DragonSoulService.calculateDragonSoulProduction(gameState), settings.numberFormat)}/sec
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
