import * as THREE from 'three';

export class Rectangle {
  constructor(width, height, speed = 10, bounds) {
    this.geometry = new THREE.BoxGeometry(width, height, 1);
    this.material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.bounds = bounds;

    this.speed = speed;

    this.geometry.computeBoundingBox();

    this.mesh.position.y = bounds.bottom + this.getHeight() * 2;

    this.bindKeyEvents();

    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      a: false,
      d: false,
    };

  }

  getMesh() {
    return this.mesh;
  }

  getPosition() {
    return this.mesh.position;
  }

  getWidth() {
    return this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x;
  }

  getHeight() {
    return this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y;
  }

  getDepth() {
    return this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z;
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
    if (this.keys.ArrowUp) {
      //this.mesh.position.y += this.speed * deltaTime;
    }
    if (this.keys.ArrowDown) {
      //this.mesh.position.y -= this.speed * deltaTime;
    }
    if (this.keys.a) {
      this.mesh.position.x -= this.speed * deltaTime;
      if (this.mesh.position.x <= this.bounds.left + this.getWidth() / 2) {
        this.mesh.position.x = this.bounds.left + this.getWidth() / 2;
      }
    }
    if (this.keys.d) {
      this.mesh.position.x += this.speed * deltaTime;
      if (this.mesh.position.x >= this.bounds.right - this.getWidth() / 2) {
        this.mesh.position.x = this.bounds.right - this.getWidth() / 2;
      }
    }
  }
}