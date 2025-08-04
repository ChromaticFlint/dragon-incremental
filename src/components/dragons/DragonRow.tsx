import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { formatNumber } from '../../utils/formatNumber';
import { DragonService } from '../../services/dragonService';
import type { DragonConfig } from '../../types/game';

interface DragonRowProps {
  dragon: DragonConfig;
  className?: string;
}

export const DragonRow: React.FC<DragonRowProps> = ({ dragon, className = '' }) => {
  const { dragons, canAfford, settings, purchaseDragon, purchaseDragonBulk, calculateMaxAffordable } = useGameStore();
  const owned = dragons[dragon.id] || 0;

  // Calculate current cost
  const currentCost = DragonService.calculateCurrentCost(dragon, owned);
  const canPurchase = canAfford({ [dragon.costResource]: currentCost });

  // Calculate max affordable for bulk purchases
  const maxAffordable = calculateMaxAffordable(dragon.id, {
    baseCost: dragon.baseCost,
    costResource: dragon.costResource,
    costMultiplier: dragon.costMultiplier,
  });

  // Calculate total production
  const totalProduction = DragonService.calculateTotalProduction(dragon, owned);

  const handlePurchase = () => {
    if (canPurchase) {
      purchaseDragon(dragon.id, {
        baseCost: dragon.baseCost,
        costResource: dragon.costResource,
        costMultiplier: dragon.costMultiplier,
      });
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
    <div className={`
      py-3 px-4 border-b border-lair-700
      hover:bg-lair-800 transition-colors duration-200 ${className}
    `}>
      {/* Top row - Name, owned count, and main purchase */}
      <div className="flex items-center justify-between mb-2">
        {/* Left - Name and owned count */}
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-sm font-medium text-lair-100">
              {dragon.name}
            </h3>
            <div className="text-xs text-lair-400">
              {formatNumber(owned, settings.numberFormat)} owned
            </div>
          </div>
        </div>

        {/* Right - Purchase controls */}
        <div className="flex items-center space-x-3">
          <div className="text-right text-sm">
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
      </div>

      {/* Bottom row - Description and production info */}
      <div className="flex items-center justify-between">
        {/* Left - Description */}
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-xs text-lair-400 leading-relaxed">
            {dragon.description}
          </p>
        </div>

        {/* Right - Production info and bulk buttons */}
        <div className="flex items-center space-x-4">
          {/* Production info */}
          <div className="text-xs text-lair-300 text-right">
            <div>
              {formatNumber(dragon.production.baseRate, settings.numberFormat)} {dragon.production.resource}/sec each
            </div>
            {owned > 0 && (
              <div className="text-dragon-400 font-medium">
                Total: {formatNumber(totalProduction, settings.numberFormat)}/sec
              </div>
            )}
          </div>

          {/* Bulk purchase buttons */}
          {maxAffordable > 1 && (
            <div className="flex gap-1">
              <button
                onClick={handlePurchaseHalf}
                className="px-2 py-1 rounded text-xs font-medium bg-dragon-700 hover:bg-dragon-800 text-white transition-colors duration-200"
              >
                Half ({Math.max(1, Math.floor(maxAffordable / 2))})
              </button>
              <button
                onClick={handlePurchaseMax}
                className="px-2 py-1 rounded text-xs font-medium bg-dragon-800 hover:bg-dragon-900 text-white transition-colors duration-200"
              >
                Max ({maxAffordable})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
