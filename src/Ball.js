import * as THREE from 'three';

export class Ball {
  constructor(Player, bounds, audioListener) {
    this.geometry = new THREE.SphereGeometry(0.4, 32, 16);
    this.material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.bounds = bounds;
    this.player = Player;
    this.START = false;
    this.arrowHelper = null;

    this.initialSpeed = 10;
    this.velocity = new THREE.Vector2(this.initialSpeed, this.initialSpeed);

    this.bindKeyEvents();

    this.geometry.computeBoundingBox();

    this.initialPosition(this.player.getPosition());

    this.audioLoader = new THREE.AudioLoader();
    this.sounds = {};

    this.loadSound('collision', '/ball-tap.wav', audioListener);

  }

  loadSound(name, path, audioListener) {
    this.audioLoader.load(path, (buffer) => {
      this.sounds[name] = new THREE.Audio(audioListener);
      this.sounds[name].setBuffer(buffer);
    });
  }

  playSound(name) {
    if (this.sounds[name] && !this.sounds[name].isPlaying) {
      this.sounds[name].play();
    }
  }

  setArrowHelper(helper) {
    this.arrowHelper = helper;
  }

  bindKeyEvents() {
    window.addEventListener('keydown', (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (!this.START && this.arrowHelper) {
      if (event.key === ' ') {
        this.START = true;

        // Get the arrow's direction vector
        const arrowDirection = this.arrowHelper.getArrowDirection();

        // Normalize the direction vector to get a unit vector
        const unitVector = arrowDirection.clone().normalize();

        // Scale the unit vector by the initial speed to set the velocity
        this.velocity.x = unitVector.x * this.initialSpeed;
        this.velocity.y = unitVector.y * this.initialSpeed;

        // Debugging: Verify the magnitude of the velocity vector
        const velocityMagnitude = Math.sqrt(
            this.velocity.x ** 2 + this.velocity.y ** 2);
      }
    }
  }

  getMesh() {
    return this.mesh;
  }

  getPosition() {
    return this.mesh.position;
  }

  getRadius() {
    return this.geometry.parameters.radius;
  }

  getVelocity() {
    return this.velocity;
  }

  initialPosition(PlayerPosition) {
    this.mesh.position.x = PlayerPosition.x;
    this.mesh.position.y = PlayerPosition.y + this.getRadius() +
        this.player.getHeight() / 2;
  }

  // TODO Rectangle y Ball must use their bounding box instead of their meshes
  checkBoundaryCollision() {
    const ballPosition = this.mesh.position;
    const ballRadius = this.getRadius();
    const leftBound = this.bounds.left;
    const rightBound = this.bounds.right;
    const topBound = this.bounds.top;

    // LEFT & RIGHT
    if (ballPosition.x + ballRadius >= rightBound) {
      this.velocity.x = -Math.abs(this.velocity.x);
      this.playSound('collision');
    } else if (ballPosition.x - ballRadius <= leftBound) {
      this.velocity.x = Math.abs(this.velocity.x);
      this.playSound('collision');
    }

    // TOP & BOTTOM
    if (ballPosition.y + ballRadius > topBound) {
      this.velocity.y = -Math.abs(this.velocity.y);
      this.playSound('collision');
    } else if (ballPosition.y + ballRadius < this.bounds.bottom) {
      this.resetBall();
    }

  }

  checkRectangleCollision() {
    const ballPosition = this.mesh.position;
    const rectPosition = this.player.getPosition();
    const ballRadius = this.getRadius();
    const rectWidth = this.player.getWidth();
    const rectHeight = this.player.getHeight();
    const rectDepth = this.player.getDepth();

    const rectMinX = rectPosition.x - rectWidth / 2;
    const rectMaxX = rectPosition.x + rectWidth / 2;

    const rectMinY = rectPosition.y - rectHeight / 2;
    const rectMaxY = rectPosition.y + rectHeight / 2;

    const rectMinZ = rectPosition.z - rectDepth / 2;
    const rectMaxZ = rectPosition.z + rectDepth / 2;

    // using Square distance instead of Euclidean Distance for optimization

    const closestX = Math.max(rectMinX, Math.min(ballPosition.x, rectMaxX));
    const closestY = Math.max(rectMinY, Math.min(ballPosition.y, rectMaxY));
    const closestZ = Math.max(rectMinZ, Math.min(ballPosition.z, rectMaxZ));

    const dx = closestX - ballPosition.x;
    const dy = closestY - ballPosition.y;
    const dz = closestZ - ballPosition.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;

    if (distanceSquared < ballRadius * ballRadius) {
      const hitPosition = (ballPosition.x - rectPosition.x) / (rectWidth / 2);
      const bounceAngle = hitPosition * Math.PI / 3; // max angle 60 degree

      const speed = Math.sqrt(
          this.velocity.x * this.velocity.x +
          this.velocity.y * this.velocity.y,
      );
      console.log(`Speed before collision: ${speed}`);

      // moves it out of the rect body to avoid stuck
      this.mesh.position.y = rectPosition.y + rectHeight / 2 + this.getRadius();
      this.velocity.x = Math.sin(bounceAngle) * speed;
      this.velocity.y = Math.cos(bounceAngle) * speed;

      this.velocity.x = parseFloat(this.velocity.x.toFixed(6));
      this.velocity.y = parseFloat(this.velocity.y.toFixed(6));

      const newSpeed = Math.sqrt(
          this.velocity.x * this.velocity.x +
          this.velocity.y * this.velocity.y,
      );
      console.log(`Speed after collision: ${newSpeed}`);
    }

  }

  update(deltaTime) {

    if (this.START) {
      this.mesh.position.x += this.velocity.x * deltaTime;
      this.mesh.position.y += this.velocity.y * deltaTime;

      this.arrowHelper.hide();
      this.arrowHelper.reset();

      this.checkBoundaryCollision();
      this.checkRectangleCollision();
    } else {
      this.resetBall();
    }

    //console.log(this.velocity)
  }

  resetBall() {

    this.initialPosition(this.player.getPosition());
    this.START = false;
    this.velocity.y = this.initialSpeed;
    this.arrowHelper.show();
  }

}