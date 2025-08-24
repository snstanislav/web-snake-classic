import React, { createContext, useState, useRef, useEffect } from 'react';
import { Food } from './models/food';
import { Snake } from './models/snake';

let gamePanelDimension: number = 400;
let fieldSell: number = 10;
let singleSell: number = 9;
let initSnakeLocX: number = 100;
let initSnakeLocY: number = 100;

export function initDimensions() {
  gamePanelDimension = Math.round(window.innerHeight / 100) * 100 - 100;
  fieldSell = Math.round(gamePanelDimension / 1000) * 1000 / 40 || fieldSell;
  singleSell = Math.round(fieldSell * 0.9) || singleSell;
  initSnakeLocX = gamePanelDimension / 2;
  initSnakeLocY = gamePanelDimension / 2
}
initDimensions();

export const Borders = { Top: 0, Bottom: gamePanelDimension, Left: 0, Right: gamePanelDimension }
export enum LevelSleepIntervals { First = 400, Second = 300, Third = 200, Fourth = 150, Fifth = 100, Sixth = 50 }
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

// Create Context
export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Properties
  const [gameAreaSize/*, setGameAreaSize*/] = useState(gamePanelDimension);
  const [currentFieldSell/*, setCurrentFieldSell*/] = useState(fieldSell);
  const [currentSingleSell/*, setCurrentSingleSell*/] = useState(singleSell);
  const [currentFood/*, setCurrentFood*/] = useState(new Food(fieldSell, gameAreaSize));
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
  const clearMovementState = () => {
    movementDirection.current = Directions.None;
  }

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

  const endGame = () => {
    clearMovementState();
    isKeyPressAllowed.current = false;
    setIsRefreshAllowed(isKeyPressAllowed.current);
    processGameResult();
  }

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

  const checkCatchFood = () => {
    if (currentSnake.isFoodCatched(currentFood.location)) {
      currentSnake.growSnake();
      currentScore.current += 1;
      manageNewFoodLocation();
    }
  }

  const manageNewFoodLocation = () => {
    currentFood.generateNewFoodLocation(fieldSell, gameAreaSize);
    if (currentSnake.isNewFoodAppearsOnSnakeBody(currentFood.location)) {
      manageNewFoodLocation();
    }
  }

  const drawFood = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#00ECFF";
      ctx.fillRect(currentFood.location.x, currentFood.location.y, singleSell, singleSell);
    }
  }

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