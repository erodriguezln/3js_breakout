import './style.css';
import * as THREE from 'three';
import { Rectangle } from './Rectangle.js';
import { Ball } from './Ball.js';
import { Arrow } from '../Arrow.js';

const scene = new THREE.Scene();
const clock = new THREE.Clock();

const frustumSize = 20;
const aspectRatio = window.innerWidth / window.innerHeight;
const bounds = {
  top: frustumSize / 2,
  left: -frustumSize * aspectRatio / 2,
  right: frustumSize * aspectRatio / 2,
  bottom: -frustumSize / 2,
};

const camera = new THREE.OrthographicCamera(
    -frustumSize * aspectRatio / 2,
    frustumSize * aspectRatio / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.001,
    1000,
);
camera.position.z = 1;

const listener = new THREE.AudioListener();
camera.add(listener);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light from above
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

const Player = new Rectangle(2, 0.5, 10, bounds);
const PlayBall = new Ball(Player, bounds, listener);

scene.add(Player.getMesh());
scene.add(PlayBall.getMesh());

const ArrowHelper = new Arrow(PlayBall);
scene.add(ArrowHelper.getArrow());

// arrowHelper
PlayBall.setArrowHelper(ArrowHelper);

function animate() {
  //console.log(clock.getDelta());
  const deltaTime = clock.getDelta();

  Player.update(deltaTime);
  PlayBall.update(deltaTime);
  //console.log(PlayBall.getVelocity())
  ArrowHelper.update(deltaTime);
  //console.log('Direction:', ArrowHelper.getArrowDirection());

  renderer.render(scene, camera);
}