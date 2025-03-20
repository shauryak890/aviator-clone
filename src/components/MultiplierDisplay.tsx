import React, { useRef, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

const MultiplierDisplay: React.FC = () => {
  const { gameState, currentMultiplier } = useGameContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawMultiplier = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Format multiplier
    const formattedMultiplier = currentMultiplier.toFixed(2) + 'x';
    
    // Set text properties
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    
    if (gameState === 'flying') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      // Add stronger glow effect
      ctx.shadowColor = '#FF2D55';
      ctx.shadowBlur = Math.min(currentMultiplier * 5, 30);
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else if (gameState === 'crashed') {
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 48px Arial';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = '#AAAAAA';
      ctx.font = 'bold 42px Arial';
    }

    // Position in top-right corner with more padding
    const padding = 30;
    
    // Draw text with outline for better visibility
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(formattedMultiplier, width - padding, padding);
    ctx.fillText(formattedMultiplier, width - padding, padding);
    
    // Reset shadow effects
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  // Update canvas size
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
  }, []);

  // Draw multiplier
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMultiplier(ctx, canvas.width, canvas.height);
  }, [currentMultiplier, gameState]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ zIndex: 10 }}
      />
    </div>
  );
};

export default MultiplierDisplay; 