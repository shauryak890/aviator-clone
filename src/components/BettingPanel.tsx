import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

const BettingPanel: React.FC = () => {
  const {
    gameState,
    currentBet,
    setCurrentBet,
    autoCashoutMultiplier,
    setAutoCashoutMultiplier,
    isAutoBet,
    setIsAutoBet,
    placeBet,
    cashout,
    settings,
    user,
    maxBet
  } = useGameContext();

  const [betInputValue, setBetInputValue] = useState<string>(currentBet.toString());
  const [autoCashoutValue, setAutoCashoutValue] = useState<string>(autoCashoutMultiplier.toString());

  // Handle bet input change
  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= settings.minBet && numValue <= maxBet) {
      setCurrentBet(numValue);
    }
  };

  // Handle auto cashout input change
  const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAutoCashoutValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1.01) {
      setAutoCashoutMultiplier(numValue);
    }
  };

  // Handle predefined bet button click
  const handleBetOptionClick = (value: number) => {
    // Don't allow setting bet higher than balance
    if (value > user.balance) {
      alert('Insufficient balance!');
      return;
    }

    setBetInputValue(value.toString());
    setCurrentBet(value);
  };

  // Set max bet amount
  const handleMaxBetClick = () => {
    const maxBetValue = Math.floor(user.balance);
    setBetInputValue(maxBetValue.toString());
    setCurrentBet(maxBetValue);
  };

  // Determine if bet button should be disabled
  const isBetDisabled = () => {
    return (
      gameState !== 'waiting' ||
      currentBet < settings.minBet ||
      currentBet > user.balance ||
      user.balance <= 0
    );
  };

  // Determine if cashout button should be disabled
  const isCashoutDisabled = () => {
    // Only enable if we're in flying state and user has an active bet
    return gameState !== 'flying';
  };

  // Update bet input value when currentBet changes externally
  useEffect(() => {
    setBetInputValue(currentBet.toString());
  }, [currentBet]);

  // Update auto cashout value when autoCashoutMultiplier changes externally
  useEffect(() => {
    setAutoCashoutValue(autoCashoutMultiplier.toString());
  }, [autoCashoutMultiplier]);

  return (
    <div className="bg-cosmic-surface rounded-lg p-5 text-cosmic-text">
      <h3 className="text-lg font-semibold mb-4">Place Your Bet</h3>

      <div className="flex flex-col space-y-4">
        {/* Bet Amount and Auto Cashout Inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bet Amount */}
          <div className="space-y-2">
            <label className="block text-sm text-cosmic-text/70">
              Bet Amount ({settings.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                value={betInputValue}
                onChange={handleBetInputChange}
                min={settings.minBet}
                max={maxBet}
                className="w-full bg-cosmic-background border border-cosmic-primary/40 rounded px-3 py-2 text-cosmic-text focus:outline-none focus:ring-2 focus:ring-cosmic-primary"
              />
              <button
                onClick={handleMaxBetClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-cosmic-primary/20 text-cosmic-accent px-2 py-1 rounded"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Auto Cashout */}
          <div className="space-y-2">
            <label className="block text-sm text-cosmic-text/70">
              Auto Cashout At (Multiplier)
            </label>
            <div className="relative">
              <input
                type="number"
                value={autoCashoutValue}
                onChange={handleAutoCashoutChange}
                min={1.01}
                step={0.01}
                className="w-full bg-cosmic-background border border-cosmic-primary/40 rounded px-3 py-2 text-cosmic-text focus:outline-none focus:ring-2 focus:ring-cosmic-primary"
              />
            </div>
          </div>
        </div>

        {/* Predefined bet options */}
        <div className="grid grid-cols-4 gap-2">
          {settings.betOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleBetOptionClick(option)}
              className={`bg-cosmic-background hover:bg-cosmic-primary/20 border ${
                currentBet === option
                  ? 'border-cosmic-accent text-cosmic-accent'
                  : 'border-cosmic-primary/40'
              } rounded px-3 py-2 text-sm transition-colors`}
            >
              {option} {settings.currency}
            </button>
          ))}
        </div>

        {/* Auto bet toggle */}
        <div className="flex items-center mt-1">
          <input
            type="checkbox"
            id="autoBet"
            checked={isAutoBet}
            onChange={(e) => setIsAutoBet(e.target.checked)}
            className="h-4 w-4 accent-cosmic-accent"
          />
          <label htmlFor="autoBet" className="ml-2 text-sm">
            Auto Cashout
          </label>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={placeBet}
            disabled={isBetDisabled()}
            className={`py-3 px-6 rounded-md font-semibold ${
              isBetDisabled()
                ? 'bg-cosmic-primary/30 cursor-not-allowed'
                : 'bg-cosmic-primary hover:bg-cosmic-primary/80'
            } transition-colors`}
          >
            Place Bet
          </button>

          <button
            type="button"
            onClick={cashout}
            disabled={isCashoutDisabled()}
            className={`py-3 px-6 rounded-md font-semibold ${
              isCashoutDisabled()
                ? 'bg-cosmic-green/30 cursor-not-allowed'
                : 'bg-cosmic-green hover:bg-cosmic-green/80'
            } transition-colors`}
          >
            Cash Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;
