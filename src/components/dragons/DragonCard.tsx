import React from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from '../../stores/gameStore';
import { formatNumber } from '../../utils/formatNumber';
import type { DragonConfig } from '../../types/game';

interface DragonCardProps {
  dragon: DragonConfig;
  className?: string;
}

export const DragonCard: React.FC<DragonCardProps> = ({ dragon, className = '' }) => {
  const { dragons, canAfford, settings } = useGameStore();
  const owned = dragons[dragon.id] || 0;
  
  // Calculate current cost based on owned count
  const currentCost = new Decimal(dragon.baseCost).mul(
    new Decimal(dragon.costMultiplier).pow(owned)
  );
  
  const canPurchase = canAfford({ [dragon.costResource]: currentCost.toNumber() });
  
  const handlePurchase = () => {
    if (canPurchase) {
      // TODO: Implement actual purchase logic
      console.log(`Purchasing ${dragon.name} for ${currentCost} ${dragon.costResource}`);
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
            Total: {formatNumber(new Decimal(dragon.production.baseRate).mul(owned), settings.numberFormat)} {dragon.production.resource}/sec
          </div>
        )}
      </div>
      
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
  // TODO: Load dragons from configuration
  const sampleDragons: DragonConfig[] = [
    {
      id: 'hatchling',
      name: 'Dragon Hatchling',
      description: 'A small but eager young dragon that produces meat.',
      baseCost: 15,
      costResource: 'meat',
      costMultiplier: 1.15,
      production: {
        resource: 'meat',
        baseRate: 0.1,
      },
      category: 'basic',
      rarity: 1,
    },
    {
      id: 'egg_layer',
      name: 'Egg Layer',
      description: 'A specialized dragon that focuses on egg production.',
      baseCost: 100,
      costResource: 'meat',
      costMultiplier: 1.15,
      production: {
        resource: 'eggs',
        baseRate: 0.5,
      },
      category: 'basic',
      rarity: 1,
    },
  ];

  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-dragon font-semibold mb-4 text-dragon-400">
        Dragons
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleDragons.map((dragon) => (
          <DragonCard key={dragon.id} dragon={dragon} />
        ))}
      </div>
    </div>
  );
};
