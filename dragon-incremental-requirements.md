# Incremental - Project Requirements

## Project Overview

**Project Name**: Dragon Incremental  
**Type**: Incremental/Idle Game  
**Theme**: Dragon management with exponential progression  
**Target Platform**: Modern web browsers (desktop + mobile)  
**License**: MIT License

## Core Game Mechanics

### Resource System
- **Primary Resources**: Meat, Eggs, Energy
- **Secondary Resources**: Unlocked through progression
- **Idle Generation**: Resources generate automatically over time
- **Exponential Growth**: Resource generation scales exponentially
- **Resource Caps**: Optional limits that can be upgraded

### Unit System
- **Unit Types**: Different creatures with unique abilities
- **Cost Scaling**: Exponential cost increases (e.g., base_cost * multiplier^owned)
- **Production Rates**: Each unit produces resources at different rates
- **Unlock Conditions**: Units unlock based on resource thresholds or achievements

### Upgrade System
- **Upgrade Categories**: Production multipliers, efficiency improvements, new mechanics
- **One-time Purchases**: Permanent improvements
- **Scaling Costs**: Exponential cost progression
- **Prerequisite System**: Some upgrades require others or specific conditions

### Progression Mechanics
- **Achievements**: Milestone rewards for reaching specific goals
- **Prestige System**: Reset progress for permanent bonuses (Ascension)
- **Unlock Tiers**: New content unlocks as player progresses
- **Meta-progression**: Long-term goals spanning multiple prestige cycles
- **Territory Management**: Expand and upgrade dragon lairs as well as taking additional territories for additional resources/gold
- **Sub games**: Mini-games that can be played to earn resources/gold
  - **Black-jack**: Bet existing gold based on table limits (that can be upgraded) by playing black-jack

### Dragon Evolution System
- **Evolution Trees**: Dragons can evolve into more powerful variants with branching paths
- **Evolution Costs**: Require specific resources and conditions to unlock evolutions
- **Special Abilities**: Evolved dragons gain unique production bonuses and abilities
- **Bloodline Traits**: Inherited characteristics that affect future generations

### Advanced Progression Systems
- **Multiple Prestige Layers**:
  - Soft Reset (keep some progress)
  - Hard Reset (full restart with major bonuses)
  - Ascension (transcendent progression layer)
- **Prestige Currencies**: Dragon Souls, Ancient Power, Cosmic Essence
- **Research System**: Technology trees for unlocking new mechanics
  - Dragon Genetics research
  - Territory Expansion research
  - Resource Efficiency research
- **Meta-upgrades**: Permanent improvements affecting all future runs

### Lair Management System
- **Multiple Lairs**: Different lair types with unique production capabilities
- **Lair Upgrades**: Enhance production rates, capacity, and unlock new features
- **Lair Specialization**: Focus lairs on specific dragon types or resources
- **Territory Expansion**: Claim new territories with different resource bonuses

### Quality of Life Features
- **Automation Systems**:
  - Auto-purchase toggles for dragons/upgrades
  - Smart purchasing algorithms
  - Bulk purchase options with quantity selectors
- **Customization**:
  - Theme selection (Dark Dragon, Light Dragon, Ancient themes)
  - Number format preferences (scientific, suffix, full)
  - UI layout options
  - Sound/music toggle
- **Advanced Statistics**:
  - Detailed analytics dashboard
  - Progress tracking over time
  - Efficiency metrics and optimization suggestions
  - Dragons per second calculations

### Social and Competitive Features
- **Leaderboards**: Global rankings for various metrics (optional, can be disabled)
- **Achievement Showcases**: Share notable accomplishments
- **Export Features**: Share progress screenshots and milestone exports
- **Community Challenges**: Optional weekly/monthly objectives

### Additional Mechanics
- **Statistics Tracking**: Comprehensive player performance metrics
- **Export/Import**: Save data for backup and sharing with validation
- **Accessibility**: Keyboard navigation, screen reader support, color contrast, reduced motion
- **Analytics**: Configurable tracking for player behavior and performance (privacy-focused)
- **Monetization Framework**: Scaffolded but disabled by default
  - Optional cosmetic themes
  - Tip jar functionality
  - Premium statistics dashboard
  - All core gameplay remains free


## Technical Requirements

### Frontend Architecture
```
Framework: React 18+ with TypeScript
State Management: Zustand or Redux Toolkit
Styling: Tailwind CSS
Build Tool: Vite
Testing: Vitest + React Testing Library
```

### Core Systems to Implement

#### Game Engine
- **Game Loop**: 60fps update cycle for smooth animations
- **Save System**: Local storage with export/import and cloud save framework
- **Number Handling**: Support for very large numbers (use Decimal.js or BigInt)
- **Time Management**: Handle offline progression calculations with configurable efficiency caps
- **Performance Optimization**: Web Workers for heavy calculations, efficient rendering

#### UI Components
- **Resource Display**: Real-time updating counters with formatting
- **Purchase Buttons**: Show costs, availability, and effects
- **Progress Bars**: Visual feedback for goals and achievements
- **Notification System**: Achievement unlocks, milestone alerts

#### Data Management
- **Game Configuration**: JSON/YAML files for dragons, upgrades, achievements, evolutions
- **Type Safety**: TypeScript interfaces for all game data
- **Validation**: Runtime validation for save data and configurations
- **Modding Support**: Plugin architecture for community content (future consideration)
- **Balance Framework**: Configuration-driven balance parameters for easy tuning

## Feature Specifications

### Number Formatting
```typescript
// Support for scientific notation and custom suffixes
formatNumber(1234567) // "1.23M"
formatNumber(1e15) // "1.00Qa" or "1.00e15"
```

### Save System
- **Auto-save**: Every 30 seconds
- **Manual Export**: JSON string for backup
- **Import Validation**: Verify save integrity
- **Migration**: Handle version updates gracefully

### Offline Progression
- **Time Calculation**: Calculate resources earned while away
- **Efficiency Caps**: Configurable limits on offline gains to prevent exploitation
- **Welcome Back**: Show detailed summary of offline progress
- **Offline Events**: Simulate random events and discoveries while away
- **Smart Calculations**: Optimize offline calculation algorithms for performance

### Achievement System
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (gameState: GameState) => boolean;
  reward?: {
    type: 'multiplier' | 'unlock' | 'resource' | 'evolution' | 'research';
    value: number;
    target?: string; // For specific dragon types or resources
  };
  category: 'production' | 'evolution' | 'territory' | 'prestige' | 'special';
  hidden?: boolean; // Secret achievements
}
```

### Dragon Evolution System
```typescript
interface DragonEvolution {
  id: string;
  name: string;
  description: string;
  baseType: string; // Base dragon type required
  requirements: {
    resources?: Record<string, number>;
    achievements?: string[];
    dragonCount?: number;
  };
  bonuses: {
    productionMultiplier?: number;
    specialAbility?: string;
    newResource?: string;
  };
}
```

## Development Phases

### Phase 1: Core Engine (Weeks 1-2)
- [ ] Basic React app setup with TypeScript and Vite
- [ ] Game state management (Zustand store)
- [ ] Number handling system (Decimal.js integration)
- [ ] Game loop implementation
- [ ] Basic save/load functionality
- [ ] Core dragon and resource data structures

### Phase 2: Basic Gameplay (Weeks 3-4)
- [ ] Resource system implementation (Meat, Eggs, Energy)
- [ ] Dragon purchasing mechanics
- [ ] Cost calculation and scaling
- [ ] Basic UI for resources and dragons
- [ ] Simple upgrade system
- [ ] Basic lair management

### Phase 3: Enhanced Features (Weeks 5-6)
- [ ] Achievement system with categories
- [ ] Offline progression with efficiency caps
- [ ] Number formatting and display
- [ ] UI polish and animations
- [ ] Notification system
- [ ] Basic automation features

### Phase 4: Advanced Systems (Weeks 7-8)
- [ ] Dragon evolution system
- [ ] Prestige mechanics (Ascension)
- [ ] Advanced upgrades and research trees
- [ ] Statistics tracking and analytics dashboard
- [ ] Export/import functionality
- [ ] Territory expansion mechanics

### Phase 5: Quality of Life (Weeks 9-10)
- [ ] Advanced automation systems
- [ ] Customization options (themes, number formats)
- [ ] Enhanced accessibility features
- [ ] Performance optimization
- [ ] Comprehensive testing

### Phase 6: Polish & Launch (Weeks 11-12)
- [ ] Bug fixes and balancing
- [ ] Documentation and help system
- [ ] Deployment setup
- [ ] Optional analytics integration
- [ ] Community features preparation

## Game Balance Framework

### Cost Scaling Formula
```typescript
const calculateCost = (baseCost: number, owned: number, multiplier: number = 1.15) => {
  return baseCost * Math.pow(multiplier, owned);
};
```

### Production Scaling
```typescript
const calculateProduction = (baseRate: number, owned: number, upgrades: number[] = []) => {
  const upgradeMultiplier = upgrades.reduce((acc, mult) => acc * mult, 1);
  return baseRate * owned * upgradeMultiplier;
};
```

## Technical Considerations

### Performance
- **Efficient Calculations**: Minimize expensive operations in game loop
- **Virtual Scrolling**: For large lists of units/upgrades
- **Memoization**: Cache expensive calculations
- **Bundle Size**: Keep initial load under 500KB

### Accessibility
- **Keyboard Navigation**: Full game playable without mouse
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG 2.1 AA compliance
- **Reduced Motion**: Respect user preferences
- **High Contrast Mode**: Enhanced visibility options
- **Font Scaling**: Adjustable text sizes
- **Colorblind Support**: Colorblind-friendly design patterns

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Desktop Focus**: Optimized for desktop experience
- **Progressive Enhancement**: Core functionality without JavaScript
- **Future Mobile**: Logic designed for potential mobile port

## Data Structure Examples

### Game State
```typescript
interface GameState {
  resources: Record<string, Decimal>;
  dragons: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  evolutions: string[];
  research: string[];
  lairs: Record<string, LairData>;
  territories: string[];
  settings: {
    autoSave: boolean;
    theme: string;
    numberFormat: string;
    soundEnabled: boolean;
  };
  statistics: {
    totalClicks: number;
    totalTime: number;
    prestigeCount: number;
    dragonsHatched: number;
    territoriesConquered: number;
    evolutionsUnlocked: number;
  };
  lastSave: number;
  version: string;
}
```

### Dragon Configuration
```typescript
interface DragonConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costResource: string;
  costMultiplier: number;
  production: {
    resource: string;
    baseRate: number;
  };
  unlockCondition?: {
    type: 'resource' | 'dragon' | 'achievement' | 'territory';
    target: string;
    value: number;
  };
  evolutionPath?: string[]; // Available evolutions
  category: 'basic' | 'advanced' | 'legendary' | 'mythical';
}
```

### Lair Configuration
```typescript
interface LairConfig {
  id: string;
  name: string;
  description: string;
  capacity: number;
  productionBonus: number;
  specialization?: string; // Dragon type or resource
  upgrades: string[];
  unlockCondition?: {
    type: 'territory' | 'achievement' | 'research';
    target: string;
    value: number;
  };
}
```

## Success Metrics

### Player Engagement
- Session length > 15 minutes average
- Return rate > 40% day 1, > 25% day 7
- Progression through at least 3 ascension cycles
- Achievement completion rate > 60% for basic achievements
- Evolution system engagement > 80% of players

### Technical Performance
- First Contentful Paint < 2 seconds
- Lighthouse Performance Score > 90
- Zero critical bugs in production
- 99.9% uptime
- Memory usage stable during long sessions
- Smooth 60fps performance during gameplay

### Content Engagement
- Players discover > 50% of available dragon types
- Territory expansion engagement > 70%
- Research tree progression > 60%
- Automation feature adoption > 80%

## Getting Started

1. **Setup Development Environment**
   ```bash
   npm create vite@latest dragon-incremental -- --template react-ts
   cd dragon-incremental
   npm install decimal.js zustand tailwindcss @types/node
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```

2. **Project Structure**
   ```
   src/
   ├── components/     # React components
   │   ├── dragons/    # Dragon-related components
   │   ├── lairs/      # Lair management components
   │   ├── ui/         # Reusable UI components
   │   └── layout/     # Layout components
   ├── stores/         # Zustand stores
   │   ├── gameStore.ts
   │   ├── settingsStore.ts
   │   └── statisticsStore.ts
   ├── types/          # TypeScript interfaces
   ├── utils/          # Helper functions
   ├── data/           # Game configuration
   │   ├── dragons.json
   │   ├── achievements.json
   │   ├── evolutions.json
   │   └── research.json
   ├── hooks/          # Custom React hooks
   └── services/       # Game logic services
   ```

3. **First Implementation Steps**
   - Set up basic game state with Zustand
   - Implement number handling with Decimal.js
   - Create resource display component
   - Add simple dragon purchasing logic
   - Implement basic lair system
   - Set up achievement framework

## Design Philosophy

### Dragon Theme Integration
- **Consistent Theming**: All mechanics should feel authentically dragon-themed
- **Lore Integration**: Rich backstory for dragon types, territories, and evolution paths
- **Visual Cohesion**: Art and UI should reinforce the dragon management fantasy
- **Meaningful Progression**: Each upgrade should feel like meaningful growth in dragon power

### Player Experience Focus
- **Incremental Game Fans**: Target experienced players who understand the genre
- **Respectful Monetization**: Keep all core gameplay free, optional cosmetics only
- **Long-term Engagement**: Design for players who will play for months
- **Quality over Quantity**: Fewer, well-designed features over many shallow ones

### Technical Excellence
- **Performance First**: Smooth experience even with large numbers and long sessions
- **Accessibility**: Ensure the game is playable by users with disabilities
- **Future-Proof**: Architecture that can support mobile port and additional features
- **Community Ready**: Design with potential modding and community features in mind

## Notes

- Focus on clean, maintainable code over feature completeness initially
- Test core mechanics thoroughly before adding complexity
- Consider player feedback early and often
- Keep the original game's addictive progression curve while making it uniquely dragon-themed
- Build with incremental game fans in mind - they appreciate depth and complexity
- Scaffold monetization features but keep them disabled by default
- Design for desktop first, but keep mobile port possibilities in mind

---

*This document serves as a living specification. Update it as the project evolves and new requirements emerge.*