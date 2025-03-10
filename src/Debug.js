import * as THREE from 'three';
import { SpatialHashing } from './SpatialHashing.js';

export class Debug {
  constructor(bounds, SpatialHashing, player) {
    this._player = player;
    this._spatialHashing = SpatialHashing;
    this._bounds = bounds;
    this._cellSize = SpatialHashing.getCellSize();
    this._cols = SpatialHashing.getCols();
    this._rows = SpatialHashing.getRows();

    this._grid = this.generateDebugGrid;
    this._radar = this.generateDebugRadar(this._player.getPosition(),
        this._spatialHashing.getRadarBounds());
  }

  getGrid() {
    return this._grid;
  }

  getRadar(){
    return this._radar
  }

  generateDebugGrid() {
    const material = new THREE.LineBasicMaterial(
        {color: 0x00FF00, linewidth: 1});
    let debugLines = new THREE.Group();

    let colOffset = this._bounds.left + this._cellSize;
    for (let i = 0; i < this._cols; i++) {
      const points = [];
      points.push(new THREE.Vector3(colOffset, this._bounds.top, 0));
      points.push(new THREE.Vector3(colOffset, this._bounds.bottom, 0));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      debugLines.add(line);
      //scene.add(line);
      colOffset += this._cellSize;
    }

    let rowOffset = this._bounds.top - this._cellSize;
    for (let i = 0; i < this._rows; i++) {
      const points = [];
      points.push(new THREE.Vector3(this._bounds.left, rowOffset, 0));
      points.push(new THREE.Vector3(this._bounds.right, rowOffset, 0));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      debugLines.add(line);

      //scene.add(line);
      rowOffset -= this._cellSize;
    }
    return debugLines;
  }

  generateDebugRadar(position, bounds) {
    const halfWidth = bounds.w / 2;
    const halfHeight = bounds.h / 2;

    const radarGroup = new THREE.Group();

    // Calculate vertices relative to (0, 0)
    const points = [
      new THREE.Vector3(-halfWidth, -halfHeight, 0), // Bottom-left
      new THREE.Vector3(halfWidth, -halfHeight, 0),  // Bottom-right
      new THREE.Vector3(halfWidth, halfHeight, 0),   // Top-right
      new THREE.Vector3(-halfWidth, halfHeight, 0),  // Top-left
      new THREE.Vector3(-halfWidth, -halfHeight, 0), // Close the rectangle
    ];

    const material = new THREE.LineBasicMaterial({color: 0x00FFFF});
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    radarGroup.add(new THREE.Line(geometry, material));
    radarGroup.position.set(position.x, position.y, 0.5);

    return radarGroup;
  }

  update(){
    const playerPosition = this._player.getPosition();
    this._radar.position.set(playerPosition.x, playerPosition.y, 0.5);
  }
}