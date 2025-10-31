/**
 * Manages core state and logic for the Snake game.
 * Provides game control and rendering.
 * 
 * @author Stanislav Snisar
 * @version 1.0.0
 * @created 07.2024
 * @module GameContext
 */

import React, { createContext, useState, useRef, useEffect } from 'react';
import { Food } from './models/food';
import { Snake } from './models/snake';

let gamePanelDimension: number = 400;
let fieldSell: number = 10;
let singleSell: number = 9;
let initSnakeLocX: number = 100;
let initSnakeLocY: number = 100;

/**
 * Compute and initialize layout-related dimensions based on the current window size.
 * This updates module-scoped variables used to size the canvas and game cells.
 */
export function initDimensions() {
  gamePanelDimension = Math.round(window.innerHeight / 100) * 100 - 100;
  fieldSell = Math.round(gamePanelDimension / 1000) * 1000 / 40 || fieldSell;
  singleSell = Math.round(fieldSell * 0.9) || singleSell;
  initSnakeLocX = gamePanelDimension / 2;
  initSnakeLocY = gamePanelDimension / 2
}
initDimensions();

/**
 * Rectangle describing the play area's borders in pixels.
 */
export const Borders = { Top: 0, Bottom: gamePanelDimension, Left: 0, Right: gamePanelDimension }

/**
 * Preset game speed levels (milliseconds between steps).
 */
export enum LevelSleepIntervals { First = 400, Second = 300, Third = 200, Fourth = 150, Fifth = 100, Sixth = 50 }

/**
 * Movement directions used by the snake.
 */
export enum Directions { None, Up, Down, Left, Right }

export const PAUSE_MSG: string = "Press Space to pause";
export const CONTINUE_MSG: string = "Press control key to continue";
export const GAME_OVER: string = "GAME OVER";

interface GameState {
  gameAreaSize: number;
  currentFieldSell: number;
  currentSingleSell: number;
  currentFood: Food;
  currentSnake: Snake;

  currentRecord: React.RefObject<number>,
  currentSpeedLevel: React.RefObject<LevelSleepIntervals>,
  currentScore: React.RefObject<number>;
  isKeyPressAllowed: React.RefObject<boolean>;
  movementDirection: React.RefObject<Directions>;

  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Public context API surface provided to consumers of GameContext.
 */
interface GameContextType extends GameState {
  clearMovementState: () => void;

  initGame: (selectedSpeed: LevelSleepIntervals) => void;
  endGame: () => void;
  processGameResult: () => void;
  checkCatchFood: () => void;
  manageNewFoodLocation: () => void;
  drawFood: () => void;
  drawSnake: () => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

/** Create Context */
export const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Provider component that holds the game's state and logic.
 *
 * Exposes methods to control game flow (init, end), rendering helpers (drawFood, drawSnake),
 * movement commands (moveUp/Down/Left/Right) and various refs used by UI components.
 */
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Properties
  const [gameAreaSize] = useState(gamePanelDimension);
  const [currentFieldSell] = useState(fieldSell);
  const [currentSingleSell] = useState(singleSell);
  const [currentFood] = useState(new Food(fieldSell, gameAreaSize));
  const [currentSnake, setCurrentSnake] = useState(new Snake(3, initSnakeLocX, initSnakeLocY, fieldSell));
  const currentRecord = useRef(Number(localStorage.getItem("bestScore")));
  const currentSpeedLevel = useRef(LevelSleepIntervals.First);
  const currentScore = useRef(0);
  const isKeyPressAllowed = useRef(false);
  const movementDirection = useRef(Directions.None);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isRefreshAllowed, setIsRefreshAllowed] = useState(isKeyPressAllowed.current);

  // Refresh by resizing if game is not running
  useEffect(() => {
    const handleResize = () => { window.location.reload(); };
    if (isRefreshAllowed === false) {
      window.addEventListener("resize", handleResize);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isRefreshAllowed]);

  // Functions

  /**
   * Reset the current movement direction to None.
   */
  const clearMovementState = () => {
    movementDirection.current = Directions.None;
  }

  /**
   * Initialize a new game:
   * - reset snake and food
   * - reset score and speed
   * - allow keyboard input and set initial movement
   *
   * @param selectedSpeed - one of LevelSleepIntervals to control game pace
   */
  const initGame = (selectedSpeed: LevelSleepIntervals) => {
    setCurrentSnake(new Snake(3, initSnakeLocX, initSnakeLocY, fieldSell));
    manageNewFoodLocation();
    currentScore.current = 0;
    currentSpeedLevel.current = selectedSpeed;
    isKeyPressAllowed.current = true;
    setIsRefreshAllowed(isKeyPressAllowed.current);
    // Initial movement
    movementDirection.current = Directions.Up;
  }

  /**
   * End the current game:
   * - stop movement and input
   * - evaluate and persist results
   */
  const endGame = () => {
    clearMovementState();
    isKeyPressAllowed.current = false;
    setIsRefreshAllowed(isKeyPressAllowed.current);
    processGameResult();
  }

  /**
   * Handle game over logic:
   * - compare score vs stored best and persist if new record
   * - show a brief alert with the final score and status
   */
  const processGameResult = () => {
    let resutlMsg = "\n\nGAME OVER!\n\nScore: " + currentScore.current;
    let storedRecord = Number(localStorage.getItem("bestScore"));
    if (currentScore.current > 0 && storedRecord < currentScore.current) {
      localStorage.setItem("bestScore", currentScore.current.toString());
      resutlMsg += "\n\nCongrats! You've got a new record";
    }
    currentRecord.current = storedRecord;
    alert(resutlMsg);
  }

  /**
   * Verify whether the snake has eaten the current food.
   * If eaten, grow the snake, increment the score and spawn new food.
   */
  const checkCatchFood = () => {
    if (currentSnake.isFoodCatched(currentFood.location)) {
      currentSnake.growSnake();
      currentScore.current += 1;
      manageNewFoodLocation();
    }
  }

  /**
   * Place a new food token at a random valid location.
   * If generated location overlaps the snake body, retry.
   */
  const manageNewFoodLocation = () => {
    currentFood.generateNewFoodLocation(fieldSell, gameAreaSize);
    if (currentSnake.isNewFoodAppearsOnSnakeBody(currentFood.location)) {
      manageNewFoodLocation();
    }
  }

  /**
   * Draw the current food on the canvas.
   * No-op if the canvas reference or 2D context is unavailable.
   */
  const drawFood = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#00ECFF";
      ctx.fillRect(currentFood.location.x, currentFood.location.y, singleSell, singleSell);
    }
  }

  /**
   * Render the entire playfield:
   * - clear to background color
   * - draw food and snake body segments
   *
   * Guarded against missing canvas/context.
   */
  const drawSnake = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      drawFood();
      ctx.fillStyle = "#FF00DC";
      ctx.fillRect(currentSnake.snakeBody[0].x, currentSnake.snakeBody[0].y, singleSell, singleSell);

      for (let i = 0; i < currentSnake.snakeBody.length; i += 1) {
        if (currentSnake.snakeBody[i] != null) {
          ctx.fillRect(currentSnake.snakeBody[i].x, currentSnake.snakeBody[i].y, singleSell, singleSell);
        }
      }
    }
  }

  /**
   * Move handlers: check allowed direction, evaluate collisions / borders,
   * check for food capture and perform one movement step.
   *
   * Each handler ends the game on collision or advances the snake otherwise.
   */
  const moveUp = () => {
    if (movementDirection.current === Directions.Up) {
      checkCatchFood();
      // Top border or self collision check
      if (currentSnake.snakeBody[0].y === Borders.Top
        || currentSnake.isSelfCollided()) {
        endGame();
      } else {
        currentSnake.makeOneStepUp();
      }
    }
  }
  const moveDown = () => {
    if (movementDirection.current === Directions.Down) {
      checkCatchFood();
      // Top border or self collision check
      if (currentSnake.snakeBody[0].y === Borders.Bottom - fieldSell
        || currentSnake.isSelfCollided()) {
        endGame();
      } else {
        currentSnake.makeOneStepDown();
      }
    }
  }
  const moveLeft = () => {
    if (movementDirection.current === Directions.Left) {
      checkCatchFood();
      // Top border or self collision check
      if (currentSnake.snakeBody[0].x === Borders.Left
        || currentSnake.isSelfCollided()) {
        endGame();
      } else {
        currentSnake.makeOneStepLeft();
      }
    }
  }
  const moveRight = () => {
    if (movementDirection.current === Directions.Right) {
      checkCatchFood();
      // Top border or self collision check
      if (currentSnake.snakeBody[0].x === Borders.Right - fieldSell
        || currentSnake.isSelfCollided()) {
        endGame();
      } else {
        currentSnake.makeOneStepRight();
      }
    }
  }

  return (
    <GameContext.Provider
      value={{
        gameAreaSize,
        currentFieldSell,
        currentSingleSell,
        currentFood,
        currentSnake,
        currentRecord,
        currentSpeedLevel,
        currentScore,
        isKeyPressAllowed,
        movementDirection,
        canvasRef,

        clearMovementState,
        endGame,
        processGameResult,
        checkCatchFood,
        manageNewFoodLocation,
        drawFood,
        drawSnake,
        moveUp,
        moveDown,
        moveLeft,
        moveRight,
        initGame
      }}>
      {children}
    </GameContext.Provider>
  );
};