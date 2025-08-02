import { useEffect } from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from './stores/gameStore';
import { ResourcePanel } from './components/ui/ResourceDisplay';
import { DragonPanel } from './components/dragons/DragonCard';
import { DragonService } from './services/dragonService';

function App() {
  const { tick, addResource } = useGameStore();

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const dragonConfigs = DragonService.getAllDragons().map(dragon => ({
        id: dragon.id,
        production: dragon.production,
      }));
      tick(dragonConfigs);
    }, 1000); // 1 second intervals for now

    return () => clearInterval(gameLoop);
  }, [tick]);

  // Manual resource generation for testing
  const handleGenerateMeat = () => {
    addResource('meat', new Decimal(1));
  };

  const handleGenerateEnergy = () => {
    addResource('energy', new Decimal(5));
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

            {/* Temporary manual controls for testing */}
            <div className="card">
              <h3 className="text-lg font-dragon font-semibold mb-3 text-dragon-400">
                Manual Controls (Testing)
              </h3>
              <div className="space-y-2">
                <button onClick={handleGenerateMeat} className="btn-primary w-full">
                  Generate Meat (+1)
                </button>
                <button onClick={handleGenerateEnergy} className="btn-secondary w-full">
                  Generate Energy (+5)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Dragons */}
          <div className="lg:col-span-2">
            <DragonPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
