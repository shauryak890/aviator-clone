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
    startTime: 0
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Constants for the game graphics
  const PLANE_SIZE = 80;
  const RAY_COLOR = '#FF2D55';
  const BG_START_COLOR = '#1A1A2E';
  const BG_END_COLOR = '#4B0082';
  const GRID_COLOR = 'rgba(255, 255, 255, 0.1)';
  const GRID_SIZE = 30; // Size of grid cells

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
      drawTrail(ctx, x, y, width, height);

      if (gameState === 'flying') {
        drawPlane(ctx, x, y);
      } else {
        drawExplosion(ctx, x, y);
      }
    } else {
      // Draw plane at starting position
      const startX = width * 0.1;
      const startY = height * 0.9;
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
    const size = 40; // Smaller, simpler plane

    // Save the current context state
    ctx.save();

    // Translate to the position
    ctx.translate(x, y);

    // Rotate slightly based on vertical oscillation for a more dynamic feel
    const tiltAngle = planeRef.current.isFlying ? 0.01 : 0;
    ctx.rotate(tiltAngle);

    // Draw a bright, simple plane
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FF2D55';
    ctx.lineWidth = 4;
    
    // Draw plane body (simple triangle)
    ctx.beginPath();
    ctx.moveTo(20, 0); // Nose
    ctx.lineTo(-20, 15); // Left wing
    ctx.lineTo(-10, 0); // Body
    ctx.lineTo(-20, -15); // Right wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add engine flames
    ctx.beginPath();
    ctx.fillStyle = '#FFDD00';
    ctx.arc(-15, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect
    ctx.shadowColor = '#FF2D55';
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Restore the context
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
    const width = canvas.width;
    const height = canvas.height;

    // Define fixed positions
    const startX = width * 0.1;
    const startY = height * 0.9;
    const targetX = width * 0.7;
    const targetY = height * 0.5;

    // Update plane position based on game state
    if (gameState === 'flying') {
      if (!planeRef.current.isFlying) {
        // Initialize flight
        planeRef.current = {
          x: startX,
          y: startY,
          isFlying: true,
          startTime: Date.now()
        };
      }

      // Calculate progress
      const elapsed = Date.now() - planeRef.current.startTime;
      const duration = 1500; // 1.5 seconds for initial flight
      const progress = Math.min(elapsed / duration, 1);

      // Calculate curved path
      const controlX = width * 0.4;
      const controlY = height * 0.7;
      const t = progress;

      if (progress < 1) {
        // Quadratic bezier curve for smooth path
        const oneMinusT = 1 - t;
        planeRef.current.x = oneMinusT * oneMinusT * startX + 
                            2 * oneMinusT * t * controlX + 
                            t * t * targetX;
        planeRef.current.y = oneMinusT * oneMinusT * startY + 
                            2 * oneMinusT * t * controlY + 
                            t * t * targetY;
      } else {
        // At target position, add oscillation and upward movement
        planeRef.current.x = targetX;
        const oscillation = Math.sin(Date.now() * 0.003) * 10;
        const heightOffset = (currentMultiplier - 1) * 25;
        planeRef.current.y = targetY - heightOffset + oscillation;
      }
    } else {
      // Reset to starting position
      planeRef.current = {
        x: startX,
        y: startY,
        isFlying: false,
        startTime: 0
      };
    }

    // Draw the current frame
    drawGame(canvas, currentMultiplier, gameState);

    // Request next frame
    requestAnimationFrame(animate);
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
    if (!isInitialized && canvasRef.current) {
      console.log("Initializing game after refresh");
      
      // Reset plane animation state
      resetPlaneAnimation();
      
      // Force a redraw with the current state
      drawGame(canvasRef.current, currentMultiplier, gameState);
      setIsInitialized(true);
      
      if (gameState === 'flying') {
        // If we're already in flying state, start the animation
        planeRef.current.isFlying = true;
        planeRef.current.startTime = Date.now();
      }
    }
  }, [isInitialized, gameState, currentMultiplier]);

  // Modify the resetPlaneAnimation function to be simpler
  const resetPlaneAnimation = () => {
    if (canvasRef.current) {
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      planeRef.current = {
        x: width * 0.1,
        y: height * 0.9,
        isFlying: false,
        startTime: 0
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

  // Add a separate function for explosion effect
  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#FF3333';
    ctx.fill();

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * 80,
        y + Math.sin(angle) * 80
      );
      ctx.strokeStyle = '#FFDD00';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  };

  // Add an effect to update the canvas when multiplier changes
  useEffect(() => {
    if (canvasRef.current) {
      drawGame(canvasRef.current, currentMultiplier, gameState);
    }
  }, [currentMultiplier, gameState]);

  // Update the animation effect
  useEffect(() => {
    if (!canvasRef.current) return;

    // Start animation loop
    const animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState]); // Only depend on gameState

  // Add this function before drawGame
  const drawTrail = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    // Draw the trail from start position to current plane position
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.9); // Start position
    
    // Use the same control point as the flight path
    const controlX = width * 0.4;
    const controlY = height * 0.8;
    
    ctx.quadraticCurveTo(
      controlX, controlY, // Control point
      x, y // Current plane position
    );
    
    // Style the trail
    ctx.strokeStyle = '#FF2D55';
    ctx.lineWidth = 10;
    
    // Add glow effect
    ctx.shadowColor = '#FF2D55';
    ctx.shadowBlur = 20;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  return (
    <div className={getContainerClass()} style={{ height: '380px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      <MultiplierDisplay />
      
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
