import { useEffect } from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from './stores/gameStore';
import { ResourcePanel } from './components/ui/ResourceDisplay';

import { SwarmSimInterface } from './components/SwarmSimInterface';
import { EvolutionPanel } from './components/evolution/EvolutionPanel';
import { DragonService } from './services/dragonService';

function App() {
  const { tick, addResource, resetGame, hatchEgg } = useGameStore();

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const dragonConfigs = DragonService.getAllDragons().map(dragon => ({
        id: dragon.id,
        production: dragon.production,
      }));
      tick(dragonConfigs);
    }, 500); // 500ms intervals for faster early game

    return () => clearInterval(gameLoop);
  }, [tick]);

  // Manual resource generation for testing
  const handleGenerateMeat = () => {
    addResource('meat', new Decimal(1));
  };

  const handleGenerateEnergy = () => {
    addResource('energy', new Decimal(5));
  };

  const handleResetGame = () => {
    const confirmed = window.confirm('Are you sure you want to reset the game? This will delete all progress!');
    if (confirmed) {
      resetGame();
    }
  };

  const handleHatchEgg = () => {
    hatchEgg('hatchling', 1);
  };

  return (
    <div className="min-h-screen bg-lair-900 text-lair-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-dragon font-bold text-dragon-400 mb-2">
            Dragon Incremental
          </h1>
          <p className="text-lair-300">
            Build your dragon empire and conquer the realms
          </p>
        </header>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Resources */}
          <div className="lg:col-span-1">
            <ResourcePanel className="mb-6" />

            {/* Evolution Panel */}
            <EvolutionPanel />

            {/* Admin controls for testing */}
            <div className="card">
              <h3 className="text-lg font-dragon font-semibold mb-3 text-dragon-400">
                Admin Controls
              </h3>
              <div className="space-y-2">
                <button onClick={handleHatchEgg} className="btn-primary w-full">
                  Hatch Egg → Hatchling
                </button>
                <button onClick={handleGenerateMeat} className="btn-secondary w-full">
                  Generate Meat (+1)
                </button>
                <button onClick={handleGenerateEnergy} className="btn-secondary w-full">
                  Generate Energy (+5)
                </button>
                <button
                  onClick={handleResetGame}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Reset Game
                </button>
              </div>
              <div className="mt-3 text-xs text-lair-400">
                <p>SwarmSim-Style Interface & Progression:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Tabbed interface: Units organized by resource type</li>
                  <li>Row layout: Efficient information density</li>
                  <li>Bulk purchasing: Buy Half/Max for rapid scaling</li>
                  <li>Perfect tier progression: Each tier amplifies the previous</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Dragons */}
          <div className="lg:col-span-2">
            <SwarmSimInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
