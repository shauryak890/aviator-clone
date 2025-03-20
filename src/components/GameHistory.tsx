import React from 'react';
import { useGameContext } from '../context/GameContext';

const GameHistory: React.FC = () => {
  const { history, lastCrashValue } = useGameContext();

  // Function to determine the color class for each multiplier
  const getMultiplierColorClass = (multiplier: number): string => {
    if (multiplier >= 10) {
      return 'bg-cosmic-green text-cosmic-background';
    } else if (multiplier >= 5) {
      return 'bg-cosmic-yellow text-cosmic-background';
    } else if (multiplier >= 2) {
      return 'bg-cosmic-accent text-cosmic-background';
    } else if (multiplier === 1.00) {
      return 'bg-cosmic-red text-cosmic-text';
    } else {
      return 'bg-cosmic-primary text-cosmic-text';
    }
  };

  // Function to highlight the last crash value
  const getLastCrashClass = (multiplier: number, index: number): string => {
    if (index === 0) {
      // This is the most recent value
      return 'border-2 border-cosmic-accent shadow-lg shadow-cosmic-accent/20 scale-110';
    }
    return '';
  };

  return (
    <div className="bg-cosmic-surface rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-cosmic-text">Round History</h3>

        <div className="flex items-center">
          <span className="text-sm text-cosmic-text/70 mr-2">Last Crash:</span>
          <span className={`rounded-md px-3 py-1 text-sm font-medium ${getMultiplierColorClass(lastCrashValue)}`}>
            {lastCrashValue.toFixed(2)}x
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.rounds.map((multiplier, index) => (
          <div
            key={index}
            className={`rounded-md px-2 py-1 text-sm font-medium ${getMultiplierColorClass(multiplier)} ${getLastCrashClass(multiplier, index)} transition-all`}
          >
            {multiplier.toFixed(2)}x
          </div>
        ))}
      </div>

      {/* Top multipliers from history */}
      <div className="mt-4">
        <div className="text-sm text-cosmic-text/70 mb-2">Top Multipliers</div>
        <div className="flex gap-2">
          {[...history.rounds]
            .sort((a, b) => b - a)
            .slice(0, 5)
            .map((multiplier, index) => (
              <div
                key={`top-${index}`}
                className={`rounded-md px-2 py-1 text-sm font-medium ${getMultiplierColorClass(multiplier)}`}
              >
                {multiplier.toFixed(2)}x
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
