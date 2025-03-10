import { Brick } from './Brick.js';
import { Group } from 'three';

export class BrickManager {
  constructor(bounds, eventSystem) {
    this._bounds = bounds;
    this._eventSystem = eventSystem;

    this._brickWidth = 1.5;
    this._brickHeight = 0.5;
    this._brickPadding = 0.1;

    this._brick = new Brick(1, eventSystem);

    // TODO usar algun json para ir definiendo cantidad de blocks por nivel
    this._brickGroup = this.generateBricks(12, 4)

  }

  getBricks() {
    return this._brickGroup
  }

  generateBricks(col, row) {
    const total = (col * this._brickWidth + ((col - 1) * this._brickPadding));
    const brickGroup = new Group();

    const bricks = [];
    for (let i = 0; i < col * row; i++) {
      bricks.push(new Brick(1, this._eventSystem));
    }

    // start from negative half of the total width to center around origin
    // (0,0,0)
    let posX = -total / 2;
    let posY = 0;

    // start from the left edge of the first brick
    posX = posX + (this._brickWidth / 2);

    bricks.forEach((brick, index) => {
      if (index % col === 0) {
        posY += this._brickHeight + this._brickPadding;
        posX = -total / 2;
        posX = posX + (this._brickWidth / 2);

      }
      brick.setPosition({
        x: posX,
        y: posY,
        z: 0,
      });
      brickGroup.add(brick.getMesh());

      posX += this._brickWidth + this._brickPadding;
    });

    //brickGroup.position.set(0, 0, 0);

    return bricks;

  }

}