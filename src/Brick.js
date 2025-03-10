import * as THREE from 'three';
import { EventType } from './eventTypes.js';

export class Brick {

  constructor(life, eventSystem) {
    this._name = 'Brick';
    this._width = 1.5;
    this._height = 0.5;
    this._geometry = new THREE.BoxGeometry(this._width, this._height, 1);
    this._material = new THREE.MeshStandardMaterial({color: 0x0000FF});
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._life = life;
    this.onDestroy = null;

    this._mesh.geometry.computeBoundingBox();

    eventSystem.subscribe(EventType.BALL_HIT_BRICK, this.onBrickHit.bind(this));

    eventSystem.subscribe(EventType.BRICK_DESTROYED, this.onBrickDestroyed.bind(this));

  }

  onBrickHit(brick) {
    console.log(brick)
    brick.damage();
  }

  onBrickDestroyed(brick) {
    this._geometry.dispose();
    this._material.dispose();
    //this._mesh = null;
    //console.log(brick)
  }

  getName() {
    return this._name;
  }

  getLife() {
    return this._life;
  }

  damage() {
    //console.log('DAMAGE');
    this._life -= 1;
  }

  destroy() {
    console.log('DESTROY');
    this._geometry.dispose();
    this._material.dispose();

    // Call the destroy callback if it exists
    if (typeof this.onDestroy === 'function') {
      this.onDestroy(this);
    }

    this._mesh = null;
  }

  getWidth() {
    return this._geometry.parameters.width;
  }

  getHeight() {
    return this._geometry.parameters.height;
  }

  getDepth() {
    return this._geometry.parameters.depth;
  }

  get mesh() {
    return this._mesh;
  }

  getMesh() {
    return this._mesh;
  }

  setPosition(newPosition) {
    this._mesh.position.x = newPosition.x;
    this._mesh.position.y = newPosition.y;
    this._mesh.position.z = newPosition.z;
  }

  getPosition() {
    return this._mesh.position;
  }

}