import './style.css';
import * as THREE from 'three';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Camera } from './Camera.js';
import { SpatialHashing } from './SpatialHashing.js';
import { Wall } from './Wall.js';
import { EventSystem } from './EventSystem.js';
import { ScoreManager } from './scoreManager.js';
import { EventType } from './eventTypes.js';
import { SoundManager } from './soundManager.js';
import { Debug } from './Debug.js';
import { BrickManager } from './brickManager.js';
import { LightManager } from './lightManager.js';

const ballSpeed = 24;
const playerSpeed = 32;

const frustumSize = 20;
const aspectRatio = window.innerWidth / window.innerHeight;
const bounds = {
  top: frustumSize / 2,
  left: -frustumSize * aspectRatio / 2,
  right: frustumSize * aspectRatio / 2,
  bottom: -frustumSize / 2,
};

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const eventSystem = new EventSystem();
const camera = new Camera();
const lightManager = new LightManager();
const scoreManager = new ScoreManager(eventSystem);
const soundManager = new SoundManager(eventSystem);
const player = new Player(3, 0.5, playerSpeed, bounds);
const ball = new Ball(player, bounds, ballSpeed, eventSystem);
const wall = new Wall(bounds);
const brickManager = new BrickManager(bounds, eventSystem);
const spatialHashing = new SpatialHashing(ball, bounds, 4, eventSystem);
const debug = new Debug(bounds, spatialHashing, ball);

scene.add(
    scoreManager.getScoreText(),
    lightManager.getLights(),
    player.getMesh(),
    ball.getMesh(),
    ball.getArrow(),
    wall.getWall(),
    //debug.generateDebugGrid(),
    //debug.getRadar(),
);

let bricks = brickManager.getBricks();
bricks.forEach(brick => {
  scene.add(brick.getMesh());
});

eventSystem.subscribe(EventType.BRICK_DESTROYED, (brick) => {
  console.log(brick);
  scene.remove(brick.getMesh());
  bricks = bricks.filter(b => b !== brick);
});

function animate() {
  const deltaTime = clock.getDelta();

  player.update(deltaTime);
  ball.update(deltaTime);

  debug.update(deltaTime);

  bricks.forEach(brick => {
    spatialHashing.insertIntoCell(brick);
  });

  spatialHashing.update();

  renderer.render(scene, camera.getActiveCamera());
}