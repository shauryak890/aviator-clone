import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Bet } from '../types/gameTypes';

const ActiveBets: React.FC = () => {
  const { bets, settings } = useGameContext();

  // Generate random user avatars for the bet list
  const getAvatarClass = (userId: string): string => {
    const colors = ['bg-cosmic-primary', 'bg-cosmic-secondary', 'bg-cosmic-accent', 'bg-cosmic-yellow'];
    // Use a hash of the userId to select a consistent color
    const colorIndex = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  // Format user ID for display (e.g., "u***3")
  const formatUserId = (userId: string): string => {
    if (userId.length <= 4) return userId;
    return `${userId.substring(0, 1)}***${userId.substring(userId.length - 1)}`;
  };

  return (
    <div className="bg-cosmic-surface rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-cosmic-text">Active Bets</h3>

      <div className="overflow-y-auto max-h-64">
        <table className="w-full text-left text-cosmic-text">
          <thead className="text-sm text-cosmic-text/70 border-b border-cosmic-background">
            <tr>
              <th className="pb-2">User</th>
              <th className="pb-2">Bet {settings.currency}</th>
              <th className="pb-2">Multiplier</th>
              <th className="pb-2">Payout</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet: Bet, index: number) => (
              <tr key={index} className="border-b border-cosmic-background/30">
                <td className="py-2 flex items-center">
                  <div className={`h-6 w-6 rounded-full ${getAvatarClass(bet.userId)} flex items-center justify-center text-xs font-semibold text-cosmic-text`}>
                    {bet.userId.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2">{formatUserId(bet.userId)}</span>
                </td>
                <td className="py-2">{bet.amount.toFixed(2)}</td>
                <td className="py-2">
                  {bet.cashoutMultiplier ? (
                    <span className="text-cosmic-green">{bet.cashoutMultiplier.toFixed(2)}x</span>
                  ) : (
                    <span className="text-cosmic-yellow">Active</span>
                  )}
                </td>
                <td className="py-2">
                  {bet.payout ? (
                    <span className="text-cosmic-green">+{bet.payout.toFixed(2)}</span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}

            {/* If no bets, show placeholder message */}
            {bets.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-cosmic-text/50">
                  No active bets. Be the first to place a bet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveBets;
