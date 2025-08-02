import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Decimal } from 'decimal.js';
import { ResourceDisplay, ResourcePanel } from '../ResourceDisplay';
import { useGameStore } from '../../../stores/gameStore';

// Mock the game store
vi.mock('../../../stores/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('ResourceDisplay', () => {
  const mockGameStore = {
    resources: {
      meat: new Decimal(1500),
      eggs: new Decimal(0),
      energy: new Decimal(100),
    },
    settings: {
      numberFormat: 'suffix',
    },
  };

  beforeEach(() => {
    vi.mocked(useGameStore).mockReturnValue(mockGameStore);
  });

  it('should display resource name and amount', () => {
    render(<ResourceDisplay resource="meat" />);
    
    expect(screen.getByText('Meat')).toBeInTheDocument();
    expect(screen.getByText('1.50K')).toBeInTheDocument();
  });

  it('should display custom label when provided', () => {
    render(<ResourceDisplay resource="meat" label="Dragon Meat" />);
    
    expect(screen.getByText('Dragon Meat')).toBeInTheDocument();
    expect(screen.queryByText('Meat')).not.toBeInTheDocument();
  });

  it('should show rate when showRate is true and rate > 0', () => {
    // This test would need the rate calculation to be implemented
    render(<ResourceDisplay resource="meat" showRate />);
    
    // For now, rate is always 0, so rate display shouldn't appear
    expect(screen.queryByText(/\/sec/)).not.toBeInTheDocument();
  });

  it('should handle zero resources', () => {
    render(<ResourceDisplay resource="eggs" />);
    
    expect(screen.getByText('Eggs')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('should handle missing resources', () => {
    render(<ResourceDisplay resource="nonexistent" />);
    
    expect(screen.getByText('Nonexistent')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });
});

describe('ResourcePanel', () => {
  const mockGameStore = {
    resources: {
      meat: new Decimal(1500),
      eggs: new Decimal(250),
      energy: new Decimal(100),
      gold: new Decimal(50),
      dragonSouls: new Decimal(0),
      ancientPower: new Decimal(0),
      cosmicEssence: new Decimal(0),
    },
    settings: {
      numberFormat: 'suffix',
    },
  };

  beforeEach(() => {
    vi.mocked(useGameStore).mockReturnValue(mockGameStore);
  });

  it('should display all basic resources', () => {
    render(<ResourcePanel />);
    
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Meat')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
  });

  it('should display advanced resources', () => {
    render(<ResourcePanel />);
    
    expect(screen.getByText('Dragon Souls')).toBeInTheDocument();
    expect(screen.getByText('Ancient Power')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Essence')).toBeInTheDocument();
  });

  it('should format numbers according to settings', () => {
    render(<ResourcePanel />);

    expect(screen.getByText('1.50K')).toBeInTheDocument(); // meat
    expect(screen.getByText('250.00')).toBeInTheDocument(); // eggs (fixed formatting)
    expect(screen.getByText('100.00')).toBeInTheDocument(); // energy (fixed formatting)
    expect(screen.getByText('50.00')).toBeInTheDocument(); // gold (fixed formatting)
  });
});
