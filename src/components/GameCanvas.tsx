import React, { useRef, useEffect, useCallback, useState } from 'react';
import { colors } from '../constants/colors';
import { type Duck, updatePhysics, checkClusters } from './DuckPhysics';
import WinScreen from './WinScreen';

interface GameCanvasProps {
  numColors: number;
  numDucks: number;
  currentSeed: string;
  onDailySeed: () => void;
  onRandomSeed: () => void;
  onPlayAgain: () => void;
}

export default function GameCanvas({
  numColors,
  numDucks,
  currentSeed,
  onDailySeed,
  onRandomSeed,
  onPlayAgain,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ducksRef = useRef<Duck[]>([]);
  const gameActiveRef = useRef(false);
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });
  const [startTime, setStartTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [gameResult, setGameResult] = useState<{ time: string; seed: string } | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  function sfc32(seed: string): () => number {
    let a = parseInt(seed, 10);
    let b = 0x9e3779b9, c = 0x9e3779b9, d = 0x9e3779b9;
    return function () {
      a |= 0; b |= 0; c |= 0; d |= 0;
      const t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newDucks: Duck[] = [];
    const seededRandom = sfc32(currentSeed);

    for (let i = 0; i < numDucks; i++) {
      let pos: { x: number; y: number };
      do {
        pos = {
          x: seededRandom() * (canvas.width - 40) + 20,
          y: seededRandom() * (canvas.height - 40) + 20,
        };
      } while (newDucks.some(b => Math.hypot(b.x - pos.x, b.y - pos.y) < 40));

      newDucks.push({
        x: pos.x,
        y: pos.y,
        vx: 0,
        vy: 0,
        color: colors[i % numColors],
        radius: 20,
      });
    }

    ducksRef.current = newDucks;
    gameActiveRef.current = true;
    setStartTime(Date.now());
    setShowControls(false);
  }, [numColors, numDucks, currentSeed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      setMousePos({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      });
    }
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActiveRef.current) {
      const currentDucks = [...ducksRef.current];
      updatePhysics(currentDucks, mousePos, canvas);

      ducksRef.current = currentDucks;

      if (numColors < numDucks && checkClusters(currentDucks)) {
        gameActiveRef.current = false;
        const endTime = Date.now();
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        setGameResult({ time: timeTaken, seed: currentSeed });
        setShowControls(true);
      }
    }

    ducksRef.current.forEach(duck => {
      ctx.beginPath();
      ctx.arc(duck.x, duck.y, duck.radius, 0, Math.PI * 2);
      ctx.fillStyle = duck.color;
      ctx.fill();
      ctx.closePath();
    });

    if (mousePos.x >= 0 && mousePos.y >= 0) {
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [mousePos, startTime, currentSeed, numColors, numDucks]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-700"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      />
      {showControls && gameResult && (
        <WinScreen
          gameResult={gameResult}
          onDailySeed={onDailySeed}
          onRandomSeed={onRandomSeed}
          onPlayAgain={onPlayAgain}
        />
      )}
    </>
  );
}