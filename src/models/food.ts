import { LocationPoint } from './location-point';

export class Food {
    private _location: LocationPoint;

    get location(): LocationPoint {
        return this._location;
    }
    constructor(fieldSellSize: number, limit: number) {
        this._location = new LocationPoint(0, 0);
        this.generateNewFoodLocation(fieldSellSize, limit);
    }

    generateNewFoodLocation(fieldSellSize: number, limit: number): void {
        this._location.x = Math.abs((Math.round(Math.random() * limit / fieldSellSize) * fieldSellSize) - fieldSellSize);
        this._location.y = Math.abs((Math.round(Math.random() * limit / fieldSellSize) * fieldSellSize) - fieldSellSize);
    }
}