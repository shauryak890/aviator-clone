// Game mechanics utilities

// Generate a random multiplier value following the typical "crash" game probability
export const generateMultiplier = (): number => {
  // Random value between 0 and 1
  const r = Math.random();

  // Formula based on typical crash game mechanics
  // This creates an exponential distribution with house edge
  const houseEdge = 0.05; // 5% house edge
  if (r < houseEdge) return 1.0; // Forced crash at 1.0 (house edge)

  // Otherwise, generate exponential distribution
  const baseMultiplier = 0.9 / (1 - r);

  // With small random chance of very high multipliers (like the 42.58x in the screenshot)
  if (Math.random() < 0.02) {
    return baseMultiplier * (1 + Math.random() * 10); // Higher potential for big multipliers
  }

  return Math.min(Math.max(baseMultiplier, 1.01), 200.0); // Allow up to 200x multiplier
};

// Format multiplier to display with "x" suffix
export const formatMultiplier = (multiplier: number): string => {
  return `${multiplier.toFixed(2)}x`;
};

// Calculate payout based on bet amount and multiplier
export const calculatePayout = (betAmount: number, multiplier: number): number => {
  return betAmount * multiplier;
};

// Generate a list of random past rounds for history display
export const generatePastRounds = (count: number): number[] => {
  const rounds: number[] = [];
  for (let i = 0; i < count; i++) {
    rounds.push(Number(generateMultiplier().toFixed(2)));
  }
  return rounds;
};

// Get the maximum bet amount (implemented for high rollers)
export const getMaxBet = (balance: number): number => {
  return Math.min(balance, 10000); // Maximum bet is 10,000 or the player's balance, whichever is lower
};
