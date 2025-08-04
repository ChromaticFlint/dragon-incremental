import React from 'react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-lair-600 ${className}`}>
      <nav className="flex flex-wrap gap-1 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'bg-dragon-700 text-white border border-dragon-500'
                  : 'text-lair-300 hover:text-lair-100 hover:bg-lair-700 border border-transparent'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-lair-600 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
