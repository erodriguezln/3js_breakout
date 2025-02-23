import * as THREE from 'three';

export class Arrow {
  constructor(Actor) {
    this.dir = new THREE.Vector3(0, 1, 0).normalize();
    const origin = new THREE.Vector3(
        Actor.getPosition().x,
        Actor.getPosition().y,
        0,
    );
    const length = 3;
    const hex = 0xffff00;

    this.actor = Actor;
    this.arrowHelper = new THREE.ArrowHelper(this.dir, origin, length, hex);

    this.keys = {
      q: false,
      e: false,
    };

    this.rotationSpeed = Math.PI / 36; // 5 degrees in radians
    this.minAngle = THREE.MathUtils.degToRad(15); // Minimum angle (0 degrees)
    this.maxAngle = THREE.MathUtils.degToRad(165); // Maximum angle (180
                                                   // degrees)
    this.rotation = new THREE.Euler(0, 0, Math.PI / 2, 'XYZ');

    this.bindKeyEvents();

  }

  show() {
    this.arrowHelper.visible = true;
  }

  hide() {
    this.arrowHelper.visible = false;
  }

  reset() {
    this.rotation = new THREE.Euler(0, 0, Math.PI / 2, 'XYZ');
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

  getArrow() {
    return this.arrowHelper;
  }

  getArrowDirection() {
    return this.dir;
  }

  update(deltaTime) {
    const playerPosition = this.actor.getPosition();

    // Rotate the arrow based on key input
    if (this.keys.e) {
      this.rotation.z -= this.rotationSpeed; // Rotate clockwise
    }
    if (this.keys.q) {
      this.rotation.z += this.rotationSpeed; // Rotate counter-clockwise
    }

    // Clamp the rotation to the range [minAngle, maxAngle]
    this.rotation.z = THREE.MathUtils.clamp(this.rotation.z, this.minAngle,
        this.maxAngle);

    // Calculate the direction vector based on the clamped rotation
    this.dir.set(1, 0, 0).applyEuler(this.rotation).normalize();
    //console.log(`rotation.z: ${this.rotation.z}`)
    //console.log(THREE.MathUtils.radToDeg(this.rotation.z))

    //this.dir.x = Math.round(this.dir.x * 1e10) / 1e10;
    //this.dir.y = Math.round(this.dir.y * 1e10) / 1e10;
    //this.dir.z = Math.round(this.dir.z * 1e10) / 1e10;

    // Update the arrow's position and direction
    this.arrowHelper.position.copy(playerPosition);
    this.arrowHelper.setDirection(this.dir);

  }

}