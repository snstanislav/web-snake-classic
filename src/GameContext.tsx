import React, { createContext, useState, useRef } from 'react';
import { Food } from './models/food';
import { Snake } from './models/snake';

let gamePanelDimension: number;
let fieldSell: number;
let singleSell: number;
(() => {
  gamePanelDimension = Math.round(window.innerHeight / 100) * 100 - 100;
  fieldSell = Math.round(gamePanelDimension / 30 / 10) * 10;
  singleSell = Math.round(fieldSell * 0.9);
})();

export enum Borders { Top = 0, Bottom = gamePanelDimension, Left = 0, Right = gamePanelDimension }
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
  const [gameAreaSize, setGameAreaSize] = useState(gamePanelDimension);
  const [currentFieldSell, setFieldSell] = useState(fieldSell);
  const [currentSingleSell, setSingleSell] = useState(singleSell);
  const [currentFood, setCurrentFood] = useState(new Food(fieldSell, gameAreaSize));
  const [currentSnake, setCurrentSnake] = useState(new Snake(3, 100, 200, fieldSell));

  const currentRecord = useRef(Number(localStorage.getItem("bestScore")));
  const currentSpeedLevel = useRef(LevelSleepIntervals.First);
  const currentScore = useRef(0);
  const isKeyPressAllowed = useRef(false);
  const movementDirection = useRef(Directions.None);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Functions
  const clearMovementState = () => {
    movementDirection.current = Directions.None;
  }

  const initGame = (selectedSpeed: LevelSleepIntervals) => {
    setCurrentSnake(new Snake(3, 100, 200, fieldSell));
    manageNewFoodLocation();
    currentScore.current = 0;
    currentSpeedLevel.current = selectedSpeed;
    isKeyPressAllowed.current = true;
    // Initial movement
    movementDirection.current = Directions.Up;
  }

  const endGame = () => {
    debugger;
    processGameResult();
    clearMovementState();
    isKeyPressAllowed.current = false;
  }

  const processGameResult = () => {
    let resutlMsg = "\n\nGAME OVER!\n\nScore: " + currentScore.current;
    let storedRecord = Number(localStorage.getItem("bestScore"));
    if (!storedRecord || storedRecord < currentScore.current) {
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