import { useEffect } from 'react';
import { Decimal } from 'decimal.js';
import { useGameStore } from './stores/gameStore';
import { ResourcePanel } from './components/ui/ResourceDisplay';
import { DragonPanel } from './components/dragons/DragonCard';
import { DragonService } from './services/dragonService';

function App() {
  const { tick, addResource, resetGame } = useGameStore();

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

            {/* Admin controls for testing */}
            <div className="card">
              <h3 className="text-lg font-dragon font-semibold mb-3 text-dragon-400">
                Admin Controls
              </h3>
              <div className="space-y-2">
                <button onClick={handleGenerateMeat} className="btn-primary w-full">
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
                <p>Use these controls to test game progression:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Generate resources to buy first dragons</li>
                  <li>Reset to test early game balance</li>
                  <li>Watch unlock progression</li>
                </ul>
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
