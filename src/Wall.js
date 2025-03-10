import * as THREE from 'three';

export class Wall {
  constructor(bounds) {
    this._xMin = bounds.left + 1;
    this._yMin = bounds.bottom;
    this._xMax = bounds.right - 1;
    this._yMax = bounds.top - 1;
    this._wall = this.generateWall();
  //console.log(this._wall)

  }

  getWall() {
    return this._wall;
  }

  generateWall() {
    const points = [
      new THREE.Vector3(this._xMax, this._yMin, 0),
      new THREE.Vector3(this._xMax, this._yMax, 0),
      new THREE.Vector3(this._xMin, this._yMax, 0),
      new THREE.Vector3(this._xMin, this._yMin, 0)];

    const material = new THREE.LineBasicMaterial({color: 0x00FFFF});
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return new THREE.Line(geometry, material);
  }
}