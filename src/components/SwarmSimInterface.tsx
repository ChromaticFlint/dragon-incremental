import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { DragonService } from '../services/dragonService';
import { TabNavigation, type Tab } from './ui/TabNavigation';
import { DragonRow } from './dragons/DragonRow';

export const SwarmSimInterface: React.FC = () => {
  const gameState = useGameStore();
  const { dragons } = gameState;
  const [activeTab, setActiveTab] = useState('eggs'); // Start with eggs since that's what we produce first

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

  // Create tabs based on what resources are produced (like SwarmSim)
  const resourceLabels: Record<string, string> = {
    meat: 'Meat Producers',
    eggs: 'Egg Producers',
    hatchlings: 'Hatchling Producers',
    young_dragons: 'Young Dragon Producers',
    adult_dragons: 'Adult Dragon Producers',
    elder_dragons: 'Elder Dragon Producers',
    energy: 'Energy Producers',
  };

  const tabs: Tab[] = Object.entries(dragonsByProducedResource)
    .map(([resource, dragons]) => ({
      id: resource,
      label: resourceLabels[resource] || resource,
      count: dragons.length,
    }))
    .sort((a, b) => {
      // Sort tabs in logical progression order
      const order = ['eggs', 'meat', 'hatchlings', 'young_dragons', 'adult_dragons', 'elder_dragons', 'energy'];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });

  // Get dragons for the active tab
  const activeDragons = dragonsByProducedResource[activeTab] || [];

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
            <p>No {resourceLabels[activeTab] || activeTab} available.</p>
            <p className="text-sm mt-2">
              {activeTab === 'meat'
                ? 'Hatch some eggs to get your first meat-producing hatchlings!'
                : activeTab === 'eggs'
                ? 'You start with an Egg Layer! It should appear here.'
                : `Unlock dragons that produce ${activeTab} to see them here.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer with summary */}
      <div className="bg-lair-800 px-4 py-2 border-t border-lair-600">
        <div className="flex justify-between items-center text-xs text-lair-400">
          <span>
            Total Dragons: {Object.values(dragons).reduce((sum, count) => sum + count, 0)}
          </span>
          <span>
            {activeDragons.length} {resourceLabels[activeTab] || activeTab}{activeDragons.length !== 1 ? '' : ''} available
          </span>
        </div>
      </div>
    </div>
  );
};
