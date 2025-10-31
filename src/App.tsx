/**
 * Main application component for the Snake game.
 * Manages game loop, keyboard controls and provides the core UI layout
 * 
 * @author Stanislav Snisar
 * @version 1.0.0
 * @created 07.2024
 * @module App
 */

import { useContext, useState, useRef } from 'react';
import { GameProvider, GameContext, Directions, LevelSleepIntervals, CONTINUE_MSG, PAUSE_MSG, GAME_OVER } from './GameContext';

import './styles/global.scss';
import { MenuPanel } from './components/MenuPanel/MenuPanel';
import { PauseBar } from './components/PauseBar/PauseBar';
import { GamePanel } from './components/GamePanel/GamePanel';
import { RecordPanel } from './components/RecordPanel/RecordPanel';
import { SpeedScorePanel } from './components/SpeedScorePanel/SpeedScorePanel';
import { TippsPanel } from './components/TippsPanel/TippsPanel';

/**
 * Root component that wraps the application with GameProvider context
 */
export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

/**
 * Main game component containing core game logic and UI layout
 * Handles:
 * - Keyboard input for movement and pause
 * - Game loop timing and updates
 * - Score and speed tracking
 * - UI state management
 */
function AppContent() {
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error("Loading failed");
  }
  
  const [pauseMsg, setPauseMsg] = useState("");
  const [record, setRecord] = useState(Number(localStorage.getItem("bestScore")));
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  let movingFunc = gameContext.moveUp;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Pauses the game and updates UI message
   */
  function pause() {
    setPauseMsg(CONTINUE_MSG);
    gameContext?.clearMovementState();
  }

  /**
   * Initializes and starts the main game loop
   * Sets up keyboard listeners and interval-based updates
   */
  const startGameLoop = () => {
    setSpeed(Object.values(LevelSleepIntervals).filter(value => typeof value === "number").indexOf(gameContext.currentSpeedLevel.current) + 1)

    setPauseMsg(PAUSE_MSG);
    if (gameContext && gameContext.movementDirection.current !== 0 && gameContext.isKeyPressAllowed.current) {

      const handleKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();

        switch (event.key) {
          case 'ArrowUp':
          case 'w':
            if (gameContext.currentSnake.snakeBody[0].y <= gameContext.currentSnake.snakeBody[1].y) {
              gameContext.movementDirection.current = Directions.Up;
              movingFunc = gameContext.moveUp;
              setPauseMsg(PAUSE_MSG);
            }
            break;
          case 'ArrowDown':
          case 's':
            if (gameContext.currentSnake.snakeBody[0].y >= gameContext.currentSnake.snakeBody[1].y) {
              gameContext.movementDirection.current = Directions.Down;
              movingFunc = gameContext.moveDown;
              setPauseMsg(PAUSE_MSG);
            }
            break;
          case 'ArrowLeft':
          case 'a':
            if (gameContext.currentSnake.snakeBody[0].x <= gameContext.currentSnake.snakeBody[1].x) {
              gameContext.movementDirection.current = Directions.Left;
              movingFunc = gameContext.moveLeft;
              setPauseMsg(PAUSE_MSG);
            }
            break;
          case 'ArrowRight':
          case 'd':
            if (gameContext.currentSnake.snakeBody[0].x >= gameContext.currentSnake.snakeBody[1].x) {
              gameContext.movementDirection.current = Directions.Right;
              movingFunc = gameContext.moveRight;
              setPauseMsg(PAUSE_MSG);
            }
            break;
          case ' ':
            // Spacebar (pause)
            pause();
            break;
          default:
            break;
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      intervalRef.current = setInterval(() => {
        setScore(gameContext.currentScore.current);
        if (gameContext.isKeyPressAllowed.current) {
          movingFunc();
          gameContext.drawSnake();
        } else {
          if (intervalRef.current) {
            setRecord(Number(localStorage.getItem("bestScore")));
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setPauseMsg(GAME_OVER);
          }
          window.removeEventListener('keydown', handleKeyDown);
        }
      }, gameContext.currentSpeedLevel.current);
    }
  }

  /**
   * Cleans up game loop interval if running
   */
  const clearGameLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    <div id="main-wrapper">
      <div id="main-game-container">
        <MenuPanel startGameLoop={startGameLoop} clearGameLoop={clearGameLoop} pause={pause} refreshRecordPanel={setRecord} />
        <PauseBar msg={pauseMsg} />
        <GamePanel canvasRef={gameContext.canvasRef} gameAreaSize={gameContext.gameAreaSize} />
        <RecordPanel currentRecord={record} />
        <SpeedScorePanel speed={speed} score={score} />
        <TippsPanel /></div>
    </div>
  );
}
