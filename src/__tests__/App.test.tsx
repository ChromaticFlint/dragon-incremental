import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Decimal } from 'decimal.js';
import App from '../App';
import { useGameStore } from '../stores/gameStore';

// Mock the game store
vi.mock('../stores/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock the DragonService
vi.mock('../services/dragonService', () => ({
  DragonService: {
    getAllDragons: vi.fn(() => []),
    getAvailableDragons: vi.fn(() => []),
    getProductionRate: vi.fn(() => ({})),
  },
}));

describe('App', () => {
  const mockGameStore = {
    resources: {
      meat: new Decimal(0),
      eggs: new Decimal(0),
      energy: new Decimal(100),
      gold: new Decimal(0),
      dragonSouls: new Decimal(0),
      ancientPower: new Decimal(0),
      cosmicEssence: new Decimal(0),
    },
    dragons: {
      egg_layer: 1,
    },
    settings: {
      numberFormat: 'suffix',
    },
    tick: vi.fn(),
    addResource: vi.fn(),
    resetGame: vi.fn(),
    hatchEgg: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useGameStore).mockReturnValue(mockGameStore);
    mockGameStore.tick.mockClear();
    mockGameStore.addResource.mockClear();
    mockGameStore.resetGame.mockClear();
    mockGameStore.hatchEgg.mockClear();
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the main game interface', () => {
    render(<App />);
    
    expect(screen.getByText('Dragon Incremental')).toBeInTheDocument();
    expect(screen.getByText('Build your dragon empire and conquer the realms')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Dragon Management')).toBeInTheDocument();
  });

  it('should render admin controls', () => {
    render(<App />);
    
    expect(screen.getByText('Admin Controls')).toBeInTheDocument();
    expect(screen.getByText('Hatch Egg → Hatchling')).toBeInTheDocument();
    expect(screen.getByText('Generate Meat (+1)')).toBeInTheDocument();
    expect(screen.getByText('Generate Energy (+5)')).toBeInTheDocument();
    expect(screen.getByText('Reset Game')).toBeInTheDocument();
  });

  it('should generate meat when meat button is clicked', () => {
    render(<App />);
    
    const meatButton = screen.getByText('Generate Meat (+1)');
    fireEvent.click(meatButton);
    
    expect(mockGameStore.addResource).toHaveBeenCalledWith('meat', new Decimal(1));
  });

  it('should generate energy when energy button is clicked', () => {
    render(<App />);
    
    const energyButton = screen.getByText('Generate Energy (+5)');
    fireEvent.click(energyButton);
    
    expect(mockGameStore.addResource).toHaveBeenCalledWith('energy', new Decimal(5));
  });

  it('should reset game when reset button is clicked and confirmed', () => {
    render(<App />);
    
    const resetButton = screen.getByText('Reset Game');
    fireEvent.click(resetButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to reset the game? This will delete all progress!'
    );
    expect(mockGameStore.resetGame).toHaveBeenCalled();
  });

  it('should not reset game when reset button is clicked but not confirmed', () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    
    render(<App />);
    
    const resetButton = screen.getByText('Reset Game');
    fireEvent.click(resetButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to reset the game? This will delete all progress!'
    );
    expect(mockGameStore.resetGame).not.toHaveBeenCalled();
  });

  it('should hatch egg when hatch button is clicked', () => {
    render(<App />);

    const hatchButton = screen.getByText('Hatch Egg → Hatchling');
    fireEvent.click(hatchButton);

    expect(mockGameStore.hatchEgg).toHaveBeenCalledWith('hatchling', 1);
  });

  it('should display admin control instructions', () => {
    render(<App />);

    expect(screen.getByText('SwarmSim-Style Interface & Progression:')).toBeInTheDocument();
    expect(screen.getByText('Tabbed interface: Units organized by resource type')).toBeInTheDocument();
    expect(screen.getByText('Row layout: Efficient information density')).toBeInTheDocument();
    expect(screen.getByText('Bulk purchasing: Buy Half/Max for rapid scaling')).toBeInTheDocument();
    expect(screen.getByText('Perfect tier progression: Each tier amplifies the previous')).toBeInTheDocument();
  });
});
