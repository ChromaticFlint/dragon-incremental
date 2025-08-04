import React, { useState } from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from '../stores/gameStore';
import { DragonService } from '../services/dragonService';
import { TabNavigation, type Tab } from './ui/TabNavigation';
import { DragonRow } from './dragons/DragonRow';
import { formatNumber } from '../utils/formatNumber';

export const SwarmSimInterface: React.FC = () => {
  const gameState = useGameStore();
  const { dragons, settings } = gameState;
  const [activeTab, setActiveTab] = useState('basic'); // Start with basic resources

  // Get all available dragons
  const availableDragons = DragonService.getAvailableDragons(gameState);

  // Group dragons by what resource they produce (SwarmSim style)
  const dragonsByProducedResource = availableDragons.reduce((acc, dragon) => {
    const producedResource = dragon.production.resource;
    if (!acc[producedResource]) {
      acc[producedResource] = [];
    }
    acc[producedResource].push(dragon);
    return acc;
  }, {} as Record<string, typeof availableDragons>);

  // Create resource-focused tabs (what you want to get, not what produces it)
  const resourceTabs: Record<string, { label: string; resources: string[]; priority: number }> = {
    basic: {
      label: 'Basic Resources',
      resources: ['eggs', 'meat'],
      priority: 1
    },
    dragons: {
      label: 'Dragon Production',
      resources: ['hatchlings', 'young_dragons', 'adult_dragons', 'elder_dragons', 'ancient_dragons', 'primordial_dragons', 'cosmic_dragons', 'void_dragons'],
      priority: 2
    },
    energy: {
      label: 'Energy',
      resources: ['energy'],
      priority: 3
    },
    souls: {
      label: 'Dragon Souls',
      resources: ['dragonSouls'],
      priority: 4
    },
    gold: {
      label: 'Gold',
      resources: ['gold'],
      priority: 5
    }
  };

  // Build tabs based on what dragons are available for each resource category
  const tabs: Tab[] = Object.entries(resourceTabs)
    .map(([tabId, tabConfig]) => {
      const dragonsInTab = tabConfig.resources.flatMap(resource =>
        dragonsByProducedResource[resource] || []
      );

      return {
        id: tabId,
        label: tabConfig.label,
        count: dragonsInTab.length,
        priority: tabConfig.priority
      };
    })
    .filter(tab => tab.count > 0) // Only show tabs with available dragons
    .sort((a, b) => a.priority - b.priority);

  // Get dragons for the active tab
  const activeTabConfig = resourceTabs[activeTab];
  const activeDragons = activeTabConfig
    ? activeTabConfig.resources.flatMap(resource => dragonsByProducedResource[resource] || [])
    : [];

  return (
    <div className="bg-lair-900 rounded-lg border border-lair-600 overflow-hidden">
      {/* Header */}
      <div className="bg-lair-800 px-4 py-3 border-b border-lair-600">
        <h2 className="text-lg font-bold text-dragon-400">Dragon Management</h2>
        <p className="text-sm text-lair-300">Manage your dragon empire across different resource types</p>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="bg-lair-800"
      />

      {/* Dragon List */}
      <div className="bg-lair-900">
        {activeDragons.length > 0 ? (
          <div className="divide-y divide-lair-700">
            {activeDragons.map((dragon) => (
              <DragonRow
                key={dragon.id}
                dragon={dragon}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-lair-400">
            <p>No dragons available in {activeTabConfig?.label || activeTab}.</p>
            <p className="text-sm mt-2">
              {activeTab === 'basic'
                ? 'You start with an Egg Layer! Hatch eggs to get hatchlings for meat production.'
                : activeTab === 'dragons'
                ? 'Build up your basic dragons to unlock higher tier dragon production.'
                : activeTab === 'souls'
                ? 'Reach Elder Dragons or Dragon Lords to start generating Dragon Souls.'
                : `Unlock dragons in this category to see them here.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer with summary */}
      <div className="bg-lair-800 px-4 py-2 border-t border-lair-600">
        <div className="flex justify-between items-center text-xs text-lair-400">
          <span>
            Total Dragons: {formatNumber(
              Object.values(dragons).reduce((sum, count) => sum.add(count), new Decimal(0)),
              settings.numberFormat
            )}
          </span>
          <span>
            {activeDragons.length} dragon{activeDragons.length !== 1 ? 's' : ''} in {activeTabConfig?.label || activeTab}
          </span>
        </div>
      </div>
    </div>
  );
};
