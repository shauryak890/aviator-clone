import React from 'react';
import { GameProvider } from './context/GameContext';
import GameHeader from './components/GameHeader';
import GameBoard from './components/GameBoard';
import BettingPanel from './components/BettingPanel';
import GameHistory from './components/GameHistory';
import ActiveBets from './components/ActiveBets';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-cosmic-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <GameHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <GameBoard />
            </div>

            <div className="flex flex-col space-y-4">
              <BettingPanel />
              <GameHistory />
            </div>
          </div>

          <ActiveBets />

          <footer className="mt-8 text-center text-cosmic-text/50 text-sm">
            <p>Cosmic Flyer Game - A fun gaming experience</p>
            <p className="mt-1">Disclaimer: This is a demo game. No real money is involved.</p>
          </footer>
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
