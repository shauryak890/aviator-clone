import React from 'react';
import { useGameContext } from '../context/GameContext';

const GameHeader: React.FC = () => {
  const { user, settings } = useGameContext();

  return (
    <header className="bg-cosmic-surface rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent text-transparent bg-clip-text">
          Cosmic Flyer
        </div>
        <button
          type="button"
          className="ml-4 text-sm bg-cosmic-primary/20 hover:bg-cosmic-primary/30 text-cosmic-accent rounded-md px-3 py-1 transition-colors"
        >
          How to Play?
        </button>
      </div>

      <div className="flex items-center">
        <div className="text-cosmic-text mr-4">
          <span className="text-sm text-cosmic-text/70 mr-1">Balance:</span>
          <span className="font-semibold">{user.balance.toLocaleString()} {settings.currency}</span>
        </div>

        <div className="h-8 w-8 rounded-full bg-cosmic-primary flex items-center justify-center text-cosmic-text font-semibold">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
