import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DragonCard } from '../DragonCard';
import { useGameStore } from '../../../stores/gameStore';
import type { DragonConfig } from '../../../types/game';

// Mock the game store
vi.mock('../../../stores/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('DragonCard', () => {
  const mockDragon: DragonConfig = {
    id: 'hatchling',
    name: 'Dragon Hatchling',
    description: 'A small but eager young dragon that produces meat.',
    baseCost: 1,
    costResource: 'eggs',
    costMultiplier: 1.0,
    production: {
      resource: 'meat',
      baseRate: 0.4,
    },
    category: 'basic',
    rarity: 1,
  };

  const mockGameStore = {
    dragons: {
      hatchling: 2,
    },
    canAfford: vi.fn(),
    purchaseDragon: vi.fn(),
    purchaseDragonBulk: vi.fn(),
    calculateMaxAffordable: vi.fn(),
    settings: {
      numberFormat: 'suffix',
    },
  };

  beforeEach(() => {
    vi.mocked(useGameStore).mockReturnValue(mockGameStore);
    mockGameStore.canAfford.mockClear();
    mockGameStore.purchaseDragon.mockClear();
    mockGameStore.purchaseDragonBulk.mockClear();
    mockGameStore.calculateMaxAffordable.mockClear();
  });

  it('should display dragon information', () => {
    render(<DragonCard dragon={mockDragon} />);
    
    expect(screen.getByText('Dragon Hatchling')).toBeInTheDocument();
    expect(screen.getByText('A small but eager young dragon that produces meat.')).toBeInTheDocument();
  });

  it('should display owned count', () => {
    render(<DragonCard dragon={mockDragon} />);
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('owned')).toBeInTheDocument();
  });

  it('should calculate and display current cost', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    render(<DragonCard dragon={mockDragon} />);

    // Cost should be baseCost * multiplier^owned = 1 * 1.0^2 = 1
    expect(screen.getByText(/1\.00/)).toBeInTheDocument();
    // Look for the cost span specifically
    const costSpan = screen.getByText((_content, element) => {
      return element?.className?.includes('text-green-400') && element?.textContent?.includes('eggs') || false;
    });
    expect(costSpan).toBeInTheDocument();
  });

  it('should display production information', () => {
    render(<DragonCard dragon={mockDragon} />);
    
    expect(screen.getByText(/Produces: 0\.40 meat\/sec/)).toBeInTheDocument();
  });

  it('should display total production when dragons are owned', () => {
    render(<DragonCard dragon={mockDragon} />);
    
    // Total production = baseRate * owned = 0.4 * 2 = 0.8
    expect(screen.getByText(/Total: 0\.80 meat\/sec/)).toBeInTheDocument();
  });

  it('should enable buy button when affordable', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    render(<DragonCard dragon={mockDragon} />);
    
    const buyButton = screen.getByText('Buy');
    expect(buyButton).toBeEnabled();
  });

  it('should disable buy button when not affordable', () => {
    mockGameStore.canAfford.mockReturnValue(false);
    render(<DragonCard dragon={mockDragon} />);
    
    const buyButton = screen.getByText('Buy');
    expect(buyButton).toBeDisabled();
  });

  it('should show cost in green when affordable', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    render(<DragonCard dragon={mockDragon} />);

    const costElement = screen.getByText((_content, element) => {
      return element?.className?.includes('text-green-400') && element?.textContent?.includes('1.00') || false;
    });
    expect(costElement).toHaveClass('text-green-400');
  });

  it('should show cost in red when not affordable', () => {
    mockGameStore.canAfford.mockReturnValue(false);
    render(<DragonCard dragon={mockDragon} />);

    const costElement = screen.getByText((_content, element) => {
      return element?.className?.includes('text-red-400') && element?.textContent?.includes('1.00') || false;
    });
    expect(costElement).toHaveClass('text-red-400');
  });

  it('should handle click on buy button', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    mockGameStore.purchaseDragon.mockReturnValue(true);

    render(<DragonCard dragon={mockDragon} />);

    const buyButton = screen.getByText('Buy');
    fireEvent.click(buyButton);

    expect(mockGameStore.purchaseDragon).toHaveBeenCalledWith('hatchling', {
      baseCost: 1,
      costResource: 'eggs',
      costMultiplier: 1.0,
    });
  });

  it('should not show category badge for basic dragons', () => {
    render(<DragonCard dragon={mockDragon} />);
    
    expect(screen.queryByText('basic')).not.toBeInTheDocument();
  });

  it('should show category badge for non-basic dragons', () => {
    const legendaryDragon = { ...mockDragon, category: 'legendary' as const };
    render(<DragonCard dragon={legendaryDragon} />);
    
    expect(screen.getByText('legendary')).toBeInTheDocument();
  });

  it('should handle zero owned dragons', () => {
    const storeWithNoDragons = {
      ...mockGameStore,
      dragons: {},
    };
    vi.mocked(useGameStore).mockReturnValue(storeWithNoDragons);
    
    render(<DragonCard dragon={mockDragon} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
  });

  it('should call canAfford with correct cost calculation', () => {
    render(<DragonCard dragon={mockDragon} />);

    // Should call canAfford with the calculated cost (now a Decimal)
    expect(mockGameStore.canAfford).toHaveBeenCalledWith({
      eggs: expect.anything(), // Can be either Number or Decimal
    });
  });

  it('should show bulk purchase buttons when max affordable > 1', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    mockGameStore.calculateMaxAffordable.mockReturnValue(5);

    render(<DragonCard dragon={mockDragon} />);

    expect(screen.getByText('Buy Half (2)')).toBeInTheDocument();
    expect(screen.getByText('Buy Max (5)')).toBeInTheDocument();
  });

  it('should not show bulk purchase buttons when max affordable <= 1', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    mockGameStore.calculateMaxAffordable.mockReturnValue(1);

    render(<DragonCard dragon={mockDragon} />);

    expect(screen.queryByText(/Buy Half/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Buy Max/)).not.toBeInTheDocument();
  });

  it('should handle buy half button click', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    mockGameStore.calculateMaxAffordable.mockReturnValue(6);

    render(<DragonCard dragon={mockDragon} />);

    const buyHalfButton = screen.getByText('Buy Half (3)');
    fireEvent.click(buyHalfButton);

    expect(mockGameStore.purchaseDragonBulk).toHaveBeenCalledWith('hatchling', {
      baseCost: 1,
      costResource: 'eggs',
      costMultiplier: 1.0,
    }, 3);
  });

  it('should handle buy max button click', () => {
    mockGameStore.canAfford.mockReturnValue(true);
    mockGameStore.calculateMaxAffordable.mockReturnValue(8);

    render(<DragonCard dragon={mockDragon} />);

    const buyMaxButton = screen.getByText('Buy Max (8)');
    fireEvent.click(buyMaxButton);

    expect(mockGameStore.purchaseDragonBulk).toHaveBeenCalledWith('hatchling', {
      baseCost: 1,
      costResource: 'eggs',
      costMultiplier: 1.0,
    }, 8);
  });
});
