import * as THREE from 'three';
import { EventType } from './eventTypes.js';

export class SpatialHashing {

  constructor(ball, bounds, cellSize, eventSystem) {
    this._player = ball;
    this._bounds = bounds;
    this._cellSize = cellSize;
    this._cells = new Map();
    this._radarBounds = {w: 6, h: 6};

    // assumes bounds calculated from center
    this._cols = Math.ceil((bounds.right - bounds.left) / cellSize);
    this._rows = Math.ceil((bounds.top - bounds.bottom) / cellSize);

    this._generateGrid();

    eventSystem.subscribe(EventType.BRICK_DESTROYED,
        this.removeFromCells.bind(this));
  }

  getRadarBounds() {
    return this._radarBounds;
  }

  getCellSize() {
    return this._cellSize;
  }

  getCols() {
    return this._cols;
  }

  getRows() {
    return this._rows;
  }

  get cells() {
    return this._cells;
  }

  _generateGrid() {
    for (let i = 0; i < this._cols; i++) {
      for (let j = 0; j < this._rows; j++) {
        this._cells.set(`${i}_${j}`, new Set());
      }
    }
    //console.log(this._cells);
  }

  getCellIndex(position) {
    // takes position subtracts from bounds and divides by cell size
    // to get the cell index in the grid
    let rawX = Math.floor((position.x - this._bounds.left) / this._cellSize);
    let rawY = Math.floor((position.y - this._bounds.bottom) / this._cellSize);

    //prevents out of bounds indexing by clamping it to the grid
    // TODO olvide esto, recordar bien porque menos 1
    const x = Math.max(0, Math.min(this._cols - 1, rawX));
    const y = Math.max(0, Math.min(this._rows - 1, rawY));

    if (rawX !== x || rawY !== y) {
      console.warn(
          `Object at (${position.x}, ${position.y}) is outside the grid bounds and was clamped to cell (${x}, ${y}).`);
    }

    return {x, y};
  }

  findNeighbors(position, bounds) {

    const halfWidth = bounds.w / 2;
    const halfHeight = bounds.h / 2;

    const bottomLeftCorner = this.getCellIndex({
      x: position.x - halfWidth, y: position.y - halfHeight,
    });

    const topRightCorner = this.getCellIndex({
      x: position.x + halfWidth, y: position.y + halfHeight,
    });

    const xMin = bottomLeftCorner.x;
    const xMax = topRightCorner.x;
    const yMin = bottomLeftCorner.y;
    const yMax = topRightCorner.y;
    //console.log(`xMin: ${xMin}, xMax: ${xMax}, yMin: ${yMin}, yMax: ${yMax}`);
    const localCells = new Set();

    // TODO entender bien esta abstraccion
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const key = `${x}_${y}`;
        //console.log(key);
        if (this._cells.has(key)) {
          const cellSet = this._cells.get(key);

          cellSet.forEach(element => {
            localCells.add(element);
          });
        }
      }
    }

    localCells.forEach(brick => {
      const isCollision = this._player.checkCollisionBetweenSphereAndBox(
          this._player, brick);
      if (isCollision) {
        this._player.boundDirectionAfterCollision(this._player, brick,
            isCollision);
      }
    });

  }

  insertIntoCell(object) {
    const meshPosition = object.getPosition();
    const {x, y} = this.getCellIndex(meshPosition, this._bounds);
    const key = `${x}_${y}`;

    if (this._cells.has(key)) {
      this._cells.get(key).add(object);
    } else {
      console.warn(`Object outside the grid bounds: ${key}`);
    }

  }

  removeFromCells(object) {
    const meshPosition = object.getPosition();
    const {x, y} = this.getCellIndex(meshPosition, this._bounds);
    const key = `${x}_${y}`;

    if (this._cells.has(key)) {
      const containerCell = this._cells.get(key);
      containerCell.delete(object);

    } else {
      console.error(`Object not in cells map.`);
    }
  }

  update() {
    this.findNeighbors(this._player.getPosition(), this._radarBounds);
  }
}