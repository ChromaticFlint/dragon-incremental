import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { formatNumber } from '../../utils/formatNumber';
import { DragonService } from '../../services/dragonService';
import type { DragonConfig } from '../../types/game';

interface DragonCardProps {
  dragon: DragonConfig;
  className?: string;
}

export const DragonCard: React.FC<DragonCardProps> = ({ dragon, className = '' }) => {
  const { dragons, canAfford, settings, purchaseDragon, purchaseDragonBulk, calculateMaxAffordable } = useGameStore();
  const owned = dragons[dragon.id] || 0;

  // Calculate current cost based on owned count
  const currentCost = DragonService.calculateCurrentCost(dragon, owned);

  const canPurchase = canAfford({ [dragon.costResource]: currentCost });

  // Calculate max affordable for bulk purchases
  const maxAffordable = calculateMaxAffordable(dragon.id, {
    baseCost: dragon.baseCost,
    costResource: dragon.costResource,
    costMultiplier: dragon.costMultiplier,
  });

  const handlePurchase = () => {
    if (canPurchase) {
      const success = purchaseDragon(dragon.id, {
        baseCost: dragon.baseCost,
        costResource: dragon.costResource,
        costMultiplier: dragon.costMultiplier,
      });

      if (!success) {
        console.error(`Failed to purchase ${dragon.name}`);
      }
    }
  };

  const handlePurchaseHalf = () => {
    const halfAmount = Math.max(1, Math.floor(maxAffordable / 2));
    if (halfAmount > 0) {
      purchaseDragonBulk(dragon.id, {
        baseCost: dragon.baseCost,
        costResource: dragon.costResource,
        costMultiplier: dragon.costMultiplier,
      }, halfAmount);
    }
  };

  const handlePurchaseMax = () => {
    if (maxAffordable > 0) {
      purchaseDragonBulk(dragon.id, {
        baseCost: dragon.baseCost,
        costResource: dragon.costResource,
        costMultiplier: dragon.costMultiplier,
      }, maxAffordable);
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-dragon font-semibold text-dragon-300">
            {dragon.name}
          </h3>
          <p className="text-sm text-lair-400 mt-1">{dragon.description}</p>
        </div>
        <div className="text-right">
          <div className="dragon-count">
            {owned}
          </div>
          <div className="text-xs text-lair-400">owned</div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-lair-300">
          Produces: {formatNumber(dragon.production.baseRate, settings.numberFormat)} {dragon.production.resource}/sec
        </div>
        {owned > 0 && (
          <div className="text-sm text-dragon-400">
            Total: {formatNumber(DragonService.calculateTotalProduction(dragon, owned), settings.numberFormat)} {dragon.production.resource}/sec
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-lair-300">Cost: </span>
            <span className={canPurchase ? 'text-green-400' : 'text-red-400'}>
              {formatNumber(currentCost, settings.numberFormat)} {dragon.costResource}
            </span>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!canPurchase}
            className="btn-primary text-sm px-3 py-1"
          >
            Buy
          </button>
        </div>

        {maxAffordable > 1 && (
          <div className="flex gap-2">
            <button
              onClick={handlePurchaseHalf}
              className="flex-1 px-2 py-1 rounded text-xs font-medium bg-dragon-700 hover:bg-dragon-800 text-white transition-colors duration-200"
            >
              Buy Half ({Math.max(1, Math.floor(maxAffordable / 2))})
            </button>
            <button
              onClick={handlePurchaseMax}
              className="flex-1 px-2 py-1 rounded text-xs font-medium bg-dragon-800 hover:bg-dragon-900 text-white transition-colors duration-200"
            >
              Buy Max ({maxAffordable})
            </button>
          </div>
        )}
      </div>
      
      {dragon.category !== 'basic' && (
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
            dragon.category === 'legendary' ? 'bg-yellow-900 text-yellow-300' :
            dragon.category === 'mythical' ? 'bg-purple-900 text-purple-300' :
            'bg-blue-900 text-blue-300'
          }`}>
            {dragon.category}
          </span>
        </div>
      )}
    </div>
  );
};

interface DragonPanelProps {
  className?: string;
}

export const DragonPanel: React.FC<DragonPanelProps> = ({ className = '' }) => {
  const gameState = useGameStore();
  const availableDragons = DragonService.getAvailableDragons(gameState);

  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-dragon font-semibold mb-4 text-dragon-400">
        Dragons
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableDragons.map((dragon) => (
          <DragonCard key={dragon.id} dragon={dragon} />
        ))}
      </div>
    </div>
  );
};
