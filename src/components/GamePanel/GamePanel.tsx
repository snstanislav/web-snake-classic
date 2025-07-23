import React, { useEffect } from 'react';
import './GamePanel.scss';

export function GamePanel({ canvasRef, gameAreaSize }: { canvasRef: React.RefObject<HTMLCanvasElement | null>, gameAreaSize: number }) {
  useEffect(() => {
    if (!canvasRef.current) return;
  }, [canvasRef]);

  return (
    <div id="game-panel">
      <canvas ref={canvasRef} id="game-canvas" width={gameAreaSize} height={gameAreaSize} tabIndex={0}></canvas>
    </div>
  );
}