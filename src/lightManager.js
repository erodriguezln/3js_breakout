import * as THREE from 'three';

export class LightManager {
  constructor() {
    this._ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this._directionalLight = new THREE.DirectionalLight(0xffffff, 1);

    this._directionalLight.position.set(0, 10, 10);

    this._directionalLight.castShadow = true;

    this._lightGroup = new THREE.Group();
    this._lightGroup.add(this._ambientLight);
    this._lightGroup.add(this._directionalLight);
  }

  getLights() {
    return this._lightGroup;
  }

}