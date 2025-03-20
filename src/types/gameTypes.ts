// Game types

export type GameState = 'waiting' | 'flying' | 'crashed';

export interface User {
  id: string;
  name: string;
  avatar: string;
  balance: number;
}

export interface Bet {
  userId: string;
  amount: number;
  cashoutMultiplier?: number;
  payout?: number;
  timestamp: number;
}

export interface Round {
  id: number;
  startTime: number;
  endTime?: number;
  crashMultiplier: number;
  bets: Bet[];
}

export interface GameHistory {
  rounds: number[];
}

export interface GameSettings {
  currency: string;
  minBet: number;
  maxBet: number;
  defaultBet: number;
  betOptions: number[];
}
