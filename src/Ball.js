import * as THREE from 'three';
import { EventType } from './eventTypes.js';
import { Arrow } from './Arrow.js';

export class Ball {
  constructor(Player, bounds, speed = 18, eventSystem) {
    this.eventSystem = eventSystem;
    this._name = 'Ball';
    this.geometry = new THREE.SphereGeometry(0.2, 32, 16);
    this.material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.bounds = bounds;
    this.player = Player;
    this.START = false;
    this.arrowHelper = new Arrow(this);

    this.initialSpeed = speed;
    this.velocity = new THREE.Vector2(this.initialSpeed, this.initialSpeed);

    this.bindKeyEvents();

    this.initialPosition(this.player.getPosition());

  }

  getArrow() {
    return this.arrowHelper.getArrow();
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

        // Normalize the direction vector to get a unit vector since we only
        // care about the direction
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

  setVelocity(newVelocity) {
    this.velocity.x = newVelocity.x;
    this.velocity.y = newVelocity.y;
    this.velocity.z = newVelocity.z;
  }

  setPosition(newPosition) {
    this.mesh.position.x = newPosition.x;
    this.mesh.position.y = newPosition.y;
    this.mesh.position.z = newPosition.z;
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
      this.eventSystem.triggerEvent(EventType.BALL_HIT_WALL, null);
    } else if (ballPosition.x - ballRadius <= leftBound) {
      this.velocity.x = Math.abs(this.velocity.x);
      this.eventSystem.triggerEvent(EventType.BALL_HIT_WALL, null);
    }

    // TOP & BOTTOM
    if (ballPosition.y + ballRadius >= topBound) {
      this.velocity.y = -Math.abs(this.velocity.y);
      this.eventSystem.triggerEvent(EventType.BALL_HIT_WALL, null);
    } else if (ballPosition.y + ballRadius < this.bounds.bottom) {
      this.resetBall();
    }
  }

  checkCollisionBetweenSphereAndBox(sphere, box) {
    const spherePosition = sphere.getPosition();
    const boxPosition = box.getPosition();
    const boxWidth = box.getWidth();
    const boxHeight = box.getHeight();
    const boxDepth = box.getDepth();
    const sphereRadius = sphere.getRadius();

    const rectMinX = boxPosition.x - boxWidth / 2;
    const rectMaxX = boxPosition.x + boxWidth / 2;
    const rectMinY = boxPosition.y - boxHeight / 2;
    const rectMaxY = boxPosition.y + boxHeight / 2;
    const rectMinZ = boxPosition.z - boxDepth / 2;
    const rectMaxZ = boxPosition.z + boxDepth / 2;

    const closestX = Math.max(rectMinX, Math.min(spherePosition.x, rectMaxX));
    const closestY = Math.max(rectMinY, Math.min(spherePosition.y, rectMaxY));
    const closestZ = Math.max(rectMinZ, Math.min(spherePosition.z, rectMaxZ));

    // Calculate distance vector from sphere center to closest point on the box
    const dx = closestX - spherePosition.x;
    const dy = closestY - spherePosition.y;
    const dz = closestZ - spherePosition.z;

    const distanceSquared = dx * dx + dy * dy + dz * dz;

    // Using Square distance instead of Euclidean Distance for optimization
    // Check if the squared distance is less than the sphere's squared radius
    const isColliding = distanceSquared < sphereRadius *
        sphereRadius;

    if (!isColliding) {
      return null;
    }

    const distance = Math.sqrt(distanceSquared);

    // todo check in which case this happens
    if (distance < 0.0001) {
      console.error(
          'Collision detected but distance is too small to calculate');
      // Default normal if too close to calculate
      // this seems redundant, since getVelocity brings this.velocity
      const velocity = sphere.getVelocity() ?
          sphere.getVelocity() :
          this.velocity;

      return {
        normal: {
          x: -Math.sign(velocity.x) || -1, // or to avoid 0
          y: -Math.sign(velocity.y) || -1, // or to avoid 0
          z: 0, // 0 cuz i'm only using x,y
        },
        dx, dy, dz,
      };
    }

    // since these normals point from the sphere to the box
    // we need to negate them to get the normal pointing from
    // the box to the sphere
    const normal = {
      x: -dx / distance,
      y: -dy / distance,
      z: 0,
    };

    return {normal, dx, dy, dz};

  }

  // TODO hace rlogica para bricks por separado y mantener paddle
  // TODO ver si usar law of reflection o implementar de otra forma.
  boundDirectionAfterCollisionWithPlayer(sphere, box, collisionData) {

    const {normal, dx, dy, dz} = collisionData;
    //console.log(normal);
    // This is intended for 2D, hence no z consideration
    const spherePosition = sphere.getPosition();
    const sphereVelocity = sphere.getVelocity();
    const sphereRadius = sphere.getRadius();

    const boxPosition = box.getPosition();
    const boxHeight = box.getHeight();
    const boxWidth = box.getWidth();

    const maxBounceAngle = Math.PI / 3; // max angle 60 degree

    const normalizedHitPosition = (spherePosition.x - boxPosition.x) /
        (boxWidth / 2);
    const bounceAngle = normalizedHitPosition * maxBounceAngle;

    // magnitude of the velocity vector
    const speed = Math.hypot(sphereVelocity.x, sphereVelocity.y);

    // moves it out of the rect body to avoid stuck
    sphere.setPosition({
      x: spherePosition.x,
      y: (boxPosition.y + boxHeight / 2 + sphereRadius),
      z: spherePosition.z,
    });

    sphere.setVelocity({
      x: Math.sin(bounceAngle) * speed,
      y: Math.cos(bounceAngle) * speed,
      z: sphereVelocity.z,
    });
  }

  boundDirectionAfterCollision(sphere, box, collisionData) {

    const {normal, dx, dy, dz} = collisionData;
    console.log(normal);
    // this seems redundant, since getVelocity brings this.velocity
    const velocity = sphere.getVelocity() ?
        sphere.getVelocity() :
        this.velocity;

    // dot product of velocity and normal
    const dotProduct = velocity.x * normal.x + velocity.y * normal.y;

    // reflection = v - 2(v dot n)n
    let reflectedVx = velocity.x - 2 * dotProduct * normal.x;
    console.log(reflectedVx);
    let reflectedVy = velocity.y - 2 * dotProduct * normal.y;

    const maxSpeed = 48; // or any other value
    const speed = Math.hypot(reflectedVx, reflectedVy);
    //console.log(speed);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      reflectedVx *= scale;
      reflectedVy *= scale;
    }

    sphere.setVelocity({
      x: reflectedVx,
      y: reflectedVy,
      z: velocity.z,
    });

// Prevent ball from getting stuck inside the brick
    const spherePosition = sphere.getPosition();
    const sphereRadius = sphere.getRadius();

    // Calculate penetration depth
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const penetrationDepth = sphereRadius - distance;

    //Push the ball out along the normal by the penetration depth
    //console.log(
    //    `penetrationDepth: ${penetrationDepth}, normal: ${normal.x},
    // ${normal.y}`);
    if (penetrationDepth > 0) {
      const newPosition = {
        x: spherePosition.x + normal.x * penetrationDepth * 1.01,
        y: spherePosition.y + normal.y * penetrationDepth * 1.01,
        z: spherePosition.z,
      };
      sphere.setPosition(newPosition);
    }

    // TODO la collision esta siendo detectada dos veces... probablemente
    // necesita mas distancia?

    if (box.getName() === 'Brick') {
      this.eventSystem.triggerEvent(EventType.BALL_HIT_BRICK, box);

      if (box.getLife() <= 0) {
        this.eventSystem.triggerEvent(EventType.BRICK_DESTROYED, box);
      }
    }

  }

  update(deltaTime) {

    if (this.START) {
      this.mesh.position.x += this.velocity.x * deltaTime;
      this.mesh.position.y += this.velocity.y * deltaTime;

      this.arrowHelper.hide();
      this.arrowHelper.reset();

      this.checkBoundaryCollision();

      const isCollision = this.checkCollisionBetweenSphereAndBox(
          this, this.player);
      if (isCollision) {
        this.boundDirectionAfterCollisionWithPlayer(this, this.player,
            isCollision);
      }
    } else {
      this.resetBall();
    }
    this.arrowHelper.update(deltaTime);

  }

  resetBall() {

    this.initialPosition(this.player.getPosition());
    this.velocity.y = this.initialSpeed;
    this.arrowHelper.show();
    //this.START = true;
    this.START = false;
  }

}