import React from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from '../../stores/gameStore';
import { formatNumber } from '../../utils/formatNumber';

interface ResourceDisplayProps {
  resource: string;
  label?: string;
  showRate?: boolean;
  className?: string;
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  resource,
  label,
  showRate = false,
  className = '',
}) => {
  const { resources, settings } = useGameStore();
  const amount = resources[resource] || new Decimal(0);
  
  // TODO: Calculate production rate when we implement dragon production
  const rate = new Decimal(0);

  const displayLabel = label || resource.charAt(0).toUpperCase() + resource.slice(1);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-lair-300">{displayLabel}</span>
        {showRate && rate.gt(0) && (
          <span className="text-xs text-lair-400">
            +{formatNumber(rate, settings.numberFormat)}/sec
          </span>
        )}
      </div>
      <div className="resource-display">
        {formatNumber(amount, settings.numberFormat)}
      </div>
    </div>
  );
};

interface ResourcePanelProps {
  className?: string;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <h2 className="text-xl font-dragon font-semibold mb-4 text-dragon-400">
        Resources
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResourceDisplay resource="meat" showRate />
        <ResourceDisplay resource="eggs" showRate />
        <ResourceDisplay resource="energy" showRate />
        <ResourceDisplay resource="gold" showRate />
      </div>
      
      {/* Advanced resources - only show if player has any */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <ResourceDisplay resource="dragonSouls" label="Dragon Souls" />
        <ResourceDisplay resource="ancientPower" label="Ancient Power" />
        <ResourceDisplay resource="cosmicEssence" label="Cosmic Essence" />
      </div>
    </div>
  );
};
