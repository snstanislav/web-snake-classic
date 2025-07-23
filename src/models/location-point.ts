export class LocationPoint {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x;
    }

    set x(newX: number) {
        this._x = newX;
    }

    get y(): number {
        return this._y;
    }

    set y(newY: number) {
        this._y = newY;
    }
}
