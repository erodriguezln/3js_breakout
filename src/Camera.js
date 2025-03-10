import * as THREE from 'three';

export class Camera {
  constructor() {
    this.aspecRatio = window.innerWidth / window.innerHeight;
    this.frustumSize = 20;

    this.perspectiveCamera = new THREE.PerspectiveCamera(
        75,
        this.aspecRatio,
        0.001,
        1000,
    );
    this.perspectiveCamera.position.z = 20;

    this.orthographicCamera = new THREE.OrthographicCamera(
        -this.frustumSize * this.aspecRatio / 2,
        this.frustumSize * this.aspecRatio / 2,
        this.frustumSize / 2,
        -this.frustumSize / 2,
        0.001,
        1000,
    );
    this.orthographicCamera.position.z = 1;

    this.activeCamera = this.orthographicCamera;
    this.addCameraSwitchListener();
  }

  addCameraSwitchListener() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'c') {
        this.switchCamera();
      }
    });
  }

  switchCamera() {
    this.activeCamera = (this.activeCamera === this.orthographicCamera) ?
        this.perspectiveCamera :
        this.orthographicCamera;
  }

  getActiveCamera() {
    return this.activeCamera;
  }
}