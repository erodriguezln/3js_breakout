import * as THREE from 'three';

export class Player {
  constructor(width, height, speed = 14, bounds) {
    this._name = 'Player';
    this._lives = 2;
    this._score = 0;

    this.geometry = new THREE.BoxGeometry(width, height, 1);
    this.material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.bounds = bounds;

    this.speed = speed;

    this.mesh.position.y = bounds.bottom + 1;

    this.bindKeyEvents();

    this.keys = {
      w: false, s: false, a: false, d: false,
    };

    this.mesh.geometry.computeBoundingBox();

    this.box3 = new THREE.Box3();
    this.box3.setFromObject(this.mesh);
    this.box3.visible = true;

  }

  getName() {
    return this._name;
  }

  getLives() {
    return this._lives;
  }

  getScore() {
    return this._score;
  }

  setLives(n) {
    this._lives += n;
  }

  setScore(n) {
    this._score += n;
  }

  getMesh() {
    return this.mesh;
  }

  getPosition() {
    return this.mesh.position;
  }

  getWidth() {
    return this.geometry.parameters.width;
  }

  getHeight() {
    return this.geometry.parameters.height;
  }

  getDepth() {
    return this.geometry.parameters.depth;
  }

  bindKeyEvents() {
    window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    window.addEventListener('keyup', (event) => this.handleKeyUp(event));

  }

  handleKeyDown(event) {
    if (this.keys.hasOwnProperty(event.key)) {
      this.keys[event.key] = true;
    }
  }

  handleKeyUp(event) {
    if (this.keys.hasOwnProperty(event.key)) {
      this.keys[event.key] = false;
    }
  }

  update(deltaTime) {
    const xMinPosition = this.bounds.left + this.getWidth() / 2;
    const xMaxPosition = this.bounds.right - this.getWidth() / 2;
    const currentPosition = this.mesh.position;

    if (this.keys.w) {
      currentPosition.y += this.speed * deltaTime;
    }
    if (this.keys.s) {
      currentPosition.y -= this.speed * deltaTime;
    }
    if (this.keys.a) {
      currentPosition.x -= this.speed * deltaTime;
      // prevents going out of bounds
      currentPosition.x = Math.max(xMinPosition, currentPosition.x);
    }
    if (this.keys.d) {
      currentPosition.x += this.speed * deltaTime;
      // prevents going out of bounds
      currentPosition.x = Math.min(xMaxPosition, currentPosition.x);
    }

    this.box3.setFromObject(this.mesh);

  }
}