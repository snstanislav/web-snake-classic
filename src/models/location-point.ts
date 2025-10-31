/**
 * Represents the basic entity of the game. 
 * Describes simple 2D-point with x and y coordinates.
 * 
 * @class LocationPoint
 * @author Stanislav Snisar
 * @version 1.0.0
 * @created 07.2024
 * @module models/location-point
 */

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
