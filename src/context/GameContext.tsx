import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GameState, User, Bet, GameHistory, GameSettings } from '../types/gameTypes';
import { generateMultiplier, generatePastRounds, getMaxBet } from '../utils/gameUtils';

interface GameContextType {
  gameState: GameState;
  currentMultiplier: number;
  currentBet: number;
  currentRoundId: number;
  autoCashoutMultiplier: number;
  isAutoBet: boolean;
  history: GameHistory;
  user: User;
  bets: Bet[];
  settings: GameSettings;
  setCurrentBet: (bet: number) => void;
  setAutoCashoutMultiplier: (multiplier: number) => void;
  setIsAutoBet: (isAuto: boolean) => void;
  placeBet: () => void;
  cashout: () => void;
  resetGame: () => void;
  maxBet: number;
  lastCrashValue: number;
}

// Default settings for the game
const defaultSettings: GameSettings = {
  currency: 'USD',
  minBet: 1,
  maxBet: 10000,
  defaultBet: 10,
  betOptions: [1, 5, 10, 50, 100, 500, 2000]
};

// Mock user data
const mockUser: User = {
  id: 'user123',
  name: 'Cosmic Player',
  avatar: '/avatar.png',
  balance: 3000
};

// Create initial history with random past rounds
const initialHistory: GameHistory = {
  rounds: generatePastRounds(20)
};

// Create the context with a default undefined value
const GameContext = createContext<GameContextType | undefined>(undefined);

// Custom hook to use the game context
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// Game provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [currentBet, setCurrentBet] = useState<number>(defaultSettings.defaultBet);
  const [currentRoundId, setCurrentRoundId] = useState<number>(1);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState<number>(2.0);
  const [isAutoBet, setIsAutoBet] = useState<boolean>(false);
  const [history, setHistory] = useState<GameHistory>(initialHistory);
  const [user, setUser] = useState<User>(mockUser);
  const [bets, setBets] = useState<Bet[]>([]);
  const [settings] = useState<GameSettings>(defaultSettings);

  const [targetMultiplier, setTargetMultiplier] = useState<number>(1.0);
  const [gameInterval, setGameInterval] = useState<number | null>(null);
  const [autoCashedOut, setAutoCashedOut] = useState<boolean>(false);
  const [maxBet, setMaxBet] = useState<number>(getMaxBet(user.balance));
  const [lastCrashValue, setLastCrashValue] = useState<number>(1.0);

  // At the top of GameProvider component
  const resetGameRef = useRef<() => void>(() => {});
  const startNewRoundRef = useRef<() => void>(() => {});
  const countdownActiveRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  // Helper function to clear all timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current = [];
    if (gameInterval) {
      clearInterval(gameInterval);
      setGameInterval(null);
    }
  };

  // Define resetGame first
  const resetGame = useCallback(() => {
    console.log("Resetting game");

    clearAllTimeouts();

    // Update history
    if (currentMultiplier > 1.0) {
      setLastCrashValue(currentMultiplier);
      setHistory(prev => ({
        rounds: [parseFloat(currentMultiplier.toFixed(2)), ...prev.rounds.slice(0, 19)]
      }));
    }

    // Reset state
    setCurrentMultiplier(1.0);
    setCurrentRoundId(prev => prev + 1);
    setBets([]);
    setAutoCashedOut(false);

    // Schedule next round with a delay
    const timeoutId = window.setTimeout(() => {
      startNewRoundRef.current();
    }, 2000);

    timeoutsRef.current.push(timeoutId);
  }, [currentMultiplier]);

  // Then define startNewRound
  const startNewRound = useCallback(() => {
    console.log("Starting new round with flying state");
    
    if (countdownActiveRef.current) {
      console.log("Countdown already active, skipping");
      return;
    }

    clearAllTimeouts();
    countdownActiveRef.current = true;
    
    // Generate and set target multiplier at the start
    const newTarget = generateMultiplier();
    setTargetMultiplier(newTarget);
    console.log("New target multiplier:", newTarget);
    
    // Set initial state
    setGameState('waiting');
    setCurrentMultiplier(1.0);

    console.log("Starting countdown");
    const countdownId = window.setTimeout(() => {
      console.log("Countdown complete, transitioning to flying");
      setGameState('flying');
      countdownActiveRef.current = false;

      // Start multiplier increase
      const startTime = Date.now();
      const growthRate = 0.1; // Adjust this value to control speed
      
      const newInterval = window.setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000; // Time in seconds
        const newMultiplier = 1 + (elapsedTime * growthRate);
        
        setCurrentMultiplier(Number(newMultiplier.toFixed(2)));

        if (newMultiplier >= newTarget) {
          clearInterval(newInterval);
          setGameInterval(null);
          setGameState('crashed');
          setCurrentMultiplier(newTarget);
          
          const crashTimeoutId = window.setTimeout(() => {
            resetGameRef.current();
          }, 1000);
          timeoutsRef.current.push(crashTimeoutId);
        }
      }, 50); // Update every 50ms

      setGameInterval(newInterval);
    }, 5000);

    timeoutsRef.current.push(countdownId);
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Update refs
  useEffect(() => {
    resetGameRef.current = resetGame;
    startNewRoundRef.current = startNewRound;
  }, [resetGame, startNewRound]);

  // Initial game start
  useEffect(() => {
    const initialTimeoutId = window.setTimeout(() => {
      console.log("Initial game start");
      startNewRoundRef.current();
    }, 1000);

    timeoutsRef.current.push(initialTimeoutId);
    return () => clearAllTimeouts();
  }, []);

  // Update max bet when user balance changes
  useEffect(() => {
    setMaxBet(getMaxBet(user.balance));
  }, [user.balance]);

  // Place a bet
  const placeBet = useCallback(() => {
    if (gameState !== 'waiting' || currentBet <= 0) {
      return;
    }

    // Validate bet amount
    if (currentBet > user.balance) {
      alert('Insufficient balance!');
      return;
    }

    // Create new bet
    const newBet: Bet = {
      userId: user.id,
      amount: currentBet,
      timestamp: Date.now()
    };

    // Add bet to list
    setBets(prevBets => [...prevBets, newBet]);

    // Deduct bet amount from user balance
    setUser(prevUser => ({
      ...prevUser,
      balance: prevUser.balance - currentBet
    }));
  }, [gameState, currentBet, user.balance, user.id]);

  // Cash out current bet
  const cashout = useCallback(() => {
    if (gameState !== 'flying') {
      return;
    }

    // Find user's bet for this round
    const userBet = bets.find(bet => bet.userId === user.id && !bet.cashoutMultiplier);

    if (!userBet) {
      return;
    }

    // Update bet with cashout multiplier
    const updatedBets = bets.map(bet => {
      if (bet.userId === user.id && !bet.cashoutMultiplier) {
        const payout = bet.amount * currentMultiplier;
        return {
          ...bet,
          cashoutMultiplier: currentMultiplier,
          payout
        };
      }
      return bet;
    });

    setBets(updatedBets);

    // Add winnings to user balance
    const winnings = userBet.amount * currentMultiplier;
    setUser(prevUser => ({
      ...prevUser,
      balance: prevUser.balance + winnings
    }));
  }, [gameState, bets, user.id, currentMultiplier]);

  // Auto cashout logic
  useEffect(() => {
    if (gameState === 'flying' && isAutoBet && !autoCashedOut && currentMultiplier >= autoCashoutMultiplier) {
      cashout();
      setAutoCashedOut(true);
    }
  }, [gameState, currentMultiplier, isAutoBet, autoCashoutMultiplier, autoCashedOut, cashout]);

  // Create the context value object with all state and functions
  const contextValue: GameContextType = {
    gameState,
    currentMultiplier,
    currentBet,
    currentRoundId,
    autoCashoutMultiplier,
    isAutoBet,
    history,
    user,
    bets,
    settings,
    setCurrentBet,
    setAutoCashoutMultiplier,
    setIsAutoBet,
    placeBet,
    cashout,
    resetGame,
    maxBet,
    lastCrashValue
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
