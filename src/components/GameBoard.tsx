import React, { useRef, useEffect, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { formatMultiplier } from '../utils/gameUtils';
import MultiplierDisplay from './MultiplierDisplay';

const GameBoard: React.FC = () => {
  const { gameState, currentMultiplier, currentRoundId } = useGameContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastAnimationFrameRef = useRef<number>(0);
  const gridOffsetRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const planeRef = useRef({
    x: 0,
    y: 0,
    isFlying: false,
    startTime: 0,
    hasReachedCenter: false
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const animationFrameRef = useRef<number>();
  const isInitializedRef = useRef(false);

  // Constants for the game graphics
  const PLANE_SIZE = 80;
  const RAY_COLOR = '#FF2D55';
  const BG_START_COLOR = '#1A1A2E';
  const BG_END_COLOR = '#4B0082';
  const GRID_COLOR = 'rgba(255, 255, 255, 0.1)';
  const GRID_SIZE = 30; // Size of grid cells

  // Add explosion animation state
  const explosionRef = useRef({
    isExploding: false,
    startTime: 0,
    x: 0,
    y: 0
  });

  // Draw the game on canvas
  const drawGame = (canvas: HTMLCanvasElement, multiplier: number, gameState: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background gradient with grid
    drawBackground(ctx, width, height);

    // Draw plane and trail
    if (gameState === 'flying' || gameState === 'crashed') {
      const { x, y } = planeRef.current;

      // Draw trail
      drawTrail(ctx, x, y, width * 0.1, height * 0.8);

      if (gameState === 'flying') {
        drawPlane(ctx, x, y);
      } else {
        drawExplosion(ctx, x, y, 0);
      }
    } else {
      // Draw plane at starting position
      const startX = width * 0.1;
      const startY = height * 0.8;
      drawPlane(ctx, startX, startY);
    }
  };

  // Draw the background with a moving grid
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background gradient
    const gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, width * 0.7
    );
    gradient.addColorStop(0, BG_START_COLOR);
    gradient.addColorStop(1, BG_END_COLOR);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw rays emanating from bottom left
    const centerX = width * 0.1;
    const centerY = height * 0.9;
    const rayCount = 12;

    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI) / (rayCount / 2);
      const rayLength = Math.max(width, height) * 1.5;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * rayLength,
        centerY - Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }

    // Draw moving grid with enhanced speed based on game state
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;

    // Increase grid offset for animation - make it move faster when flying
    if (gameState === 'flying') {
      // Move the grid faster as the multiplier increases
      // Enhanced grid speed to create a stronger sense of movement
      const gridSpeed = 1.0 + (currentMultiplier * 0.1); // Increased base speed and multiplier effect
      gridOffsetRef.current += gridSpeed;
    } else if (gameState === 'waiting') {
      // Slow movement during waiting state
      gridOffsetRef.current += 0.2;
    }

    const offset = gridOffsetRef.current % GRID_SIZE;

    // Draw vertical lines - moving backwards to create illusion of forward movement
    for (let x = width + offset; x > -GRID_SIZE; x -= GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines - also moving backwards
    for (let y = height + offset; y > -GRID_SIZE; y -= GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Reset alpha
    ctx.globalAlpha = 1.0;
  };

  // Draw the ray path from origin to current position
  const drawRay = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    // Create a gradient for the ray
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, '#FF2D55');
    gradient.addColorStop(1, '#FF0055');

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    // Create a slight curve for the path
    const controlX = startX + (endX - startX) * 0.3;
    const controlY = startY - 20;

    ctx.quadraticCurveTo(controlX, controlY, endX, endY);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 10; // Much thicker line
    ctx.stroke();
    
    // Add stronger glow effect to the ray
    ctx.shadowColor = '#FF2D55';
    ctx.shadowBlur = 20;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  // Draw the plane at the specified position
  const drawPlane = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Add glow effect
    ctx.shadowColor = '#FF2D55';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#FF2D55';
    ctx.lineWidth = 2;

    // Main body
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.moveTo(25, 0);  // Nose of the plane
    ctx.lineTo(15, -8); // Top of cockpit
    ctx.lineTo(-20, -8); // Top of body
    ctx.lineTo(-25, -15); // Tail top
    ctx.lineTo(-30, -8); // Back of tail
    ctx.lineTo(-20, -8); // Connect back to body
    ctx.lineTo(-15, 0);  // Bottom of body
    ctx.lineTo(-20, 8);  // Bottom curve
    ctx.lineTo(-30, 8);  // Bottom tail
    ctx.lineTo(-25, 15); // Tail bottom
    ctx.lineTo(-20, 8);  // Back to body
    ctx.lineTo(15, 8);   // Bottom of cockpit
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wings
    ctx.beginPath();
    ctx.moveTo(5, -5);   // Wing start
    ctx.lineTo(-5, -25); // Wing tip
    ctx.lineTo(-15, -5); // Wing back
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bottom wing
    ctx.beginPath();
    ctx.moveTo(5, 5);    // Wing start
    ctx.lineTo(-5, 25);  // Wing tip
    ctx.lineTo(-15, 5);  // Wing back
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit window
    ctx.beginPath();
    ctx.fillStyle = '#88CCFF';
    ctx.moveTo(15, -4);
    ctx.lineTo(5, -4);
    ctx.lineTo(5, 4);
    ctx.lineTo(15, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Engine glow
    const gradient = ctx.createRadialGradient(-25, 0, 0, -25, 0, 10);
    gradient.addColorStop(0, 'rgba(255, 45, 85, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 45, 85, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(-25, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Draw the multiplier text with enhanced visual effects
  const drawMultiplier = (ctx: CanvasRenderingContext2D, width: number, height: number, multiplier: number) => {
    // Format multiplier to 2 decimal places
    const formattedMultiplier = multiplier.toFixed(2) + 'x';
    
    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (gameState === 'flying') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px Arial';
      // Position multiplier higher in the screen (30% from top)
      ctx.fillText(formattedMultiplier, width * 0.5, height * 0.3);
    } else if (gameState === 'crashed') {
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 64px Arial';
      ctx.fillText(formattedMultiplier, width * 0.5, height * 0.3);
    } else {
      ctx.fillStyle = '#AAAAAA';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('1.00x', width * 0.5, height * 0.3);
    }
  };

  // Update the animate function
  const animate = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas.width, canvas.height);

    // Define positions
    const startX = canvas.width * 0.1;
    const startY = canvas.height * 0.8;
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.5;

    if (gameState === 'flying') {
      // Start new flight
      if (!planeRef.current.isFlying) {
        console.log('Starting new flight');
        planeRef.current = {
          x: startX,
          y: startY,
          isFlying: true,
          startTime: Date.now(),
          hasReachedCenter: false
        };
      }

      const elapsed = Date.now() - planeRef.current.startTime;
      const duration = 3000; // 3 seconds to reach center
      const progress = Math.min(elapsed / duration, 1);

      if (!planeRef.current.hasReachedCenter) {
        // Move to center with easing
        const eased = 1 - Math.pow(1 - progress, 3);
        planeRef.current.x = startX + (centerX - startX) * eased;
        planeRef.current.y = startY + (centerY - startY) * eased;

        if (progress >= 1) {
          planeRef.current.hasReachedCenter = true;
        }
      } else {
        // Modified oscillation at center
        const centerX = canvas.width * 0.5;
        const centerY = canvas.height * 0.5;
        
        // Keep X position fixed at center
        planeRef.current.x = centerX;
        
        // Constrained oscillation
        const oscillationAmplitude = 30; // Maximum pixels to move up/down
        const oscillation = Math.sin(Date.now() * 0.004) * oscillationAmplitude;
        const maxUpwardOffset = canvas.height * 0.3; // Maximum upward movement (30% of canvas)
        const heightOffset = Math.min((currentMultiplier - 1) * 40, maxUpwardOffset);
        
        // Ensure plane stays within canvas bounds
        const newY = centerY - heightOffset + oscillation;
        planeRef.current.y = Math.max(50, Math.min(newY, canvas.height - 50));
      }

      // Draw trail and plane
      drawTrail(ctx, planeRef.current.x, planeRef.current.y, startX, startY);
      drawPlane(ctx, planeRef.current.x, planeRef.current.y);
    } else if (gameState === 'crashed' && !explosionRef.current.isExploding) {
      // Start explosion animation
      explosionRef.current = {
        isExploding: true,
        startTime: Date.now(),
        x: planeRef.current.x,
        y: planeRef.current.y
      };
      drawExplosion(ctx, planeRef.current.x, planeRef.current.y, 0);
    } else if (gameState === 'crashed' && explosionRef.current.isExploding) {
      // Continue explosion animation
      const explosionProgress = (Date.now() - explosionRef.current.startTime) / 1000; // 1 second animation
      if (explosionProgress < 1) {
        drawExplosion(ctx, explosionRef.current.x, explosionRef.current.y, explosionProgress);
      }
    } else {
      // Reset states
      explosionRef.current.isExploding = false;
      drawPlane(ctx, startX, startY);
    }

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle window resize
  const handleResize = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;

    if (parent) {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      // Adjust plane position for new dimensions
      if (planeRef.current.isFlying) {
        const ratioX = canvas.width / oldWidth;
        const ratioY = canvas.height / oldHeight;
        planeRef.current.x *= ratioX;
        planeRef.current.y *= ratioY;
      }
    }

    // Redraw with new dimensions
    drawGame(canvas, currentMultiplier, gameState);
  };

  // Handle countdown timer
  useEffect(() => {
    // Reset countdown when game state changes to waiting
    if (gameState === 'waiting') {
      console.log('Game state changed to waiting, starting countdown');
      
      // Start with 5 seconds
      setCountdown(5);

      // Start countdown with precise timing
      const startTime = Date.now();
      const countdownDuration = 5000; // 5 seconds
      
      const countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const secondsRemaining = 5 - Math.floor(elapsed / 1000);
        
        if (secondsRemaining > 0) {
          setCountdown(secondsRemaining);
        } else {
          clearInterval(countdownInterval);
          setCountdown(null);
        }
      }, 200); // Check more frequently for smoother updates

      return () => {
        console.log('Cleaning up countdown interval');
        clearInterval(countdownInterval);
      };
    } else {
      // Reset countdown when not in waiting state
      setCountdown(null);
    }
  }, [gameState, currentRoundId]);

  // Initialize canvas and animation
  useEffect(() => {
    if (!canvasRef.current) return;

    // Set initial canvas size
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Start animation loop
    lastAnimationFrameRef.current = performance.now();
    const animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle state updates
  useEffect(() => {
    if (gameState === 'crashed') {
      // Reset the grid offset on crash
      gridOffsetRef.current = 0;
    }
  }, [gameState]);

  // Modify the existing effect to force multiple redraws when game state changes
  useEffect(() => {
    console.log("Game state changed to:", gameState);
    
    if (gameState === 'flying') {
      // Start flying
      planeRef.current.isFlying = true;
      planeRef.current.startTime = Date.now();
    } else if (gameState === 'waiting') {
      // Reset plane position when waiting
      resetPlaneAnimation();
    }
    
    // Force a redraw
    if (canvasRef.current) {
      drawGame(canvasRef.current, currentMultiplier, gameState);
    }
  }, [gameState]);

  // Modify the initialization effect
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('Initializing game board');
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const startX = canvas.width * 0.1;
        const startY = canvas.height * 0.8;
        
        // Set initial position
        planeRef.current = {
          x: startX,
          y: startY,
          isFlying: false,
          startTime: 0,
          hasReachedCenter: false
        };

        // Start animation
        animationFrameRef.current = requestAnimationFrame(animate);
      }
      isInitializedRef.current = true;
    }
  }, []);

  // Modify the resetPlaneAnimation function to be simpler
  const resetPlaneAnimation = () => {
    if (canvasRef.current) {
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      planeRef.current = {
        x: width * 0.1,
        y: height * 0.8,
        isFlying: false,
        startTime: 0,
        hasReachedCenter: false
      };
    }
  };

  // Define container class based on game state
  const getContainerClass = () => {
    const baseClass = 'relative rounded-lg overflow-hidden';

    switch (gameState) {
      case 'waiting':
        return `${baseClass} bg-cosmic-surface`;
      case 'flying':
        return `${baseClass}`;
      case 'crashed':
        return `${baseClass}`;
      default:
        return baseClass;
    }
  };

  // Debug state
  const [showDebug, setShowDebug] = useState(true);

  // Toggle debug with 'D' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add this to your component, near the debug state
  const [forceShowPlane, setForceShowPlane] = useState(false);

  // Add explosion drawing function
  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) => {
    ctx.save();
    
    // Explosion size grows with progress
    const size = 50 + (progress * 100);
    const opacity = 1 - progress;
    
    // Outer glow
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `rgba(255, 69, 0, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(255, 165, 0, ${opacity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particles
    const particleCount = 12;
    const angleStep = (Math.PI * 2) / particleCount;
    
    ctx.fillStyle = `rgba(255, 69, 0, ${opacity})`;
    for (let i = 0; i < particleCount; i++) {
      const angle = i * angleStep;
      const particleX = x + Math.cos(angle) * size * 0.8 * progress;
      const particleY = y + Math.sin(angle) * size * 0.8 * progress;
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Add an effect to update the canvas when multiplier changes
  useEffect(() => {
    if (canvasRef.current) {
      drawGame(canvasRef.current, currentMultiplier, gameState);
    }
  }, [currentMultiplier, gameState]);

  // Update the animation effect
  useEffect(() => {
    // Start animation if not already running
    if (!animationFrameRef.current) {
      console.log('Starting animation');
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Reset plane position on state change
    if (gameState === 'waiting' && canvasRef.current) {
      console.log('Resetting plane position');
      const canvas = canvasRef.current;
      planeRef.current = {
        x: canvas.width * 0.1,
        y: canvas.height * 0.8,
        isFlying: false,
        startTime: 0,
        hasReachedCenter: false
      };
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [gameState, currentMultiplier]);

  // Update the drawTrail function for better visibility
  const drawTrail = (ctx: CanvasRenderingContext2D, x: number, y: number, startX: number, startY: number) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#FF2D55';
    ctx.lineWidth = 6; // Thicker trail
    ctx.shadowColor = '#FF2D55';
    ctx.shadowBlur = 20; // More glow
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // Add effect to reset plane position when game state changes
  useEffect(() => {
    if (gameState === 'waiting' || gameState === 'crashed') {
      planeRef.current = {
        x: canvasRef.current?.width ? canvasRef.current.width * 0.1 : 0,
        y: canvasRef.current?.height ? canvasRef.current.height * 0.8 : 0,
        isFlying: false,
        startTime: 0,
        hasReachedCenter: false
      };
    }
  }, [gameState]);

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height: '380px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      <div className="absolute top-0 right-0 p-6">
        <div className="w-40 h-20">
          <MultiplierDisplay />
        </div>
      </div>
      
      {showDebug && (
        <div className="absolute top-2 left-2 bg-black/70 text-white p-2 text-xs rounded">
          <div>Game State: {gameState}</div>
          <div>Multiplier: {currentMultiplier.toFixed(2)}x</div>
          <div>Countdown: {countdown !== null ? countdown : 'None'}</div>
          <button 
            className="mt-2 bg-cosmic-primary text-white px-2 py-1 rounded text-xs"
            onClick={() => {
              if (canvasRef.current) {
                console.log("Forcing plane to appear");
                drawGame(canvasRef.current, 2.0, 'flying');
              }
            }}
          >
            Force Show Plane
          </button>
        </div>
      )}

      {/* Fallback countdown display */}
      {countdown !== null && gameState === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center">
            <div className="text-white text-3xl mb-4">NEXT ROUND IN</div>
            <div className="text-9xl font-bold text-cosmic-primary animate-pulse">{countdown}</div>
            <div className="mt-8 text-white text-xl">Get ready to fly!</div>
          </div>
        </div>
      )}

      {gameState === 'waiting' && countdown === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-cosmic-text text-center">
            <div className="text-2xl mb-4">Ready to Launch</div>
            <div className="text-cosmic-accent">Place your bets!</div>
          </div>
        </div>
      )}

      {gameState === 'crashed' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-cosmic-text text-center">
            <div className="text-5xl font-bold text-cosmic-red mb-4">CRASHED!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
