import { LocationPoint } from './location-point';

export class Snake {
    private _snakeBody: LocationPoint[];
    private _initLength: number;
    private _singleCellSize: number;

    get snakeBody(): LocationPoint[] {
        return [...this._snakeBody];
    }
    set snakeBody(newSnakeBody: LocationPoint[]) {
        this._snakeBody = newSnakeBody;
    }

    get initLength(): number {
        return this._initLength;
    }
    set initLength(newInitLength: number) {
        this._initLength = newInitLength;
    }

    get singleCellSize(): number {
        return this._singleCellSize;
    }
    set singleCellSize(newSingleCellSize: number) {
        this._singleCellSize = newSingleCellSize;
    }

    constructor(newInitLength: number, initX: number, initY: number, newSingleCellSize: number) {
        this._snakeBody = [];
        this._initLength = newInitLength;
        this._singleCellSize = newSingleCellSize;
        for (let i = 0; i < this._initLength; i++) {
            this._snakeBody.push(new LocationPoint(initX, initY + i * newSingleCellSize));
        }
    }

    makeOneStepUp(): void {
        for (let i = this._snakeBody.length - 1; i >= 1; --i) {
            this._snakeBody[i].y = this._snakeBody[i - 1].y;
            this._snakeBody[i].x = this._snakeBody[i - 1].x;
        }
        this._snakeBody[0].y -= this._singleCellSize;
    }

    makeOneStepDown(): void {
        for (let i = this._snakeBody.length - 1; i >= 1; --i) {
            this._snakeBody[i].y = this._snakeBody[i - 1].y;
            this._snakeBody[i].x = this._snakeBody[i - 1].x;
        }
        this._snakeBody[0].y += this._singleCellSize;
    }

    makeOneStepLeft(): void {
        for (let i = this._snakeBody.length - 1; i >= 1; --i) {
            this._snakeBody[i].x = this._snakeBody[i - 1].x;
            this._snakeBody[i].y = this._snakeBody[i - 1].y;
        }
        this._snakeBody[0].x -= this._singleCellSize;
    }

    makeOneStepRight(): void {
        for (let i = this._snakeBody.length - 1; i >= 1; --i) {
            this._snakeBody[i].x = this._snakeBody[i - 1].x;
            this._snakeBody[i].y = this._snakeBody[i - 1].y;
        }
        this._snakeBody[0].x += this._singleCellSize;
    }

    growSnake(): void {
        const newTailPoint = new LocationPoint(
            this._snakeBody[this._snakeBody.length - 1].x + this._singleCellSize,
            this._snakeBody[this._snakeBody.length - 1].y + this._singleCellSize);
        this._snakeBody.push(newTailPoint);
    }

    isSelfCollided(): boolean {
        for (let j = 1; j < this._snakeBody.length - 1; j++) {
            if (this._snakeBody[0].x === this._snakeBody[j].x &&
                this._snakeBody[0].y === this._snakeBody[j].y) {
                return true;
            }
        }
        return false;
    }

    isFoodCatched(foodLocation: LocationPoint): boolean {
        return this._snakeBody[0].x === foodLocation.x && this._snakeBody[0].y === foodLocation.y;
    }

    isNewFoodAppearsOnSnakeBody(foodLocation: LocationPoint): boolean {
        for (let i = 0; i < this._snakeBody.length - 1; ++i) {
            if (this._snakeBody[i].x === foodLocation.x &&
                this._snakeBody[i].y === foodLocation.y) {
                return true;
            }
        }
        return false;
    }
}