import { EventType } from './eventTypes.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';

export class ScoreManager {
  constructor(eventSystem) {
    this.score = 0;
    this.scoreText = new THREE.Object3D();
    this.font = null;

    this.fontLoader = new FontLoader();

    this.fontLoader.load('/JetBrains Mono_Regular.json', (font) => {
      this.font = font;
      this.updateScoreText(font);
    });

    eventSystem.subscribe(EventType.BRICK_DESTROYED,
        this.onBrickDestroyed.bind(this));
  }

  updateScoreText() {
    if (!this.font) return;

    while (this.scoreText.children.length > 0) {
      const child = this.scoreText.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      this.scoreText.remove(child);
    }

    const textGeometry = new TextGeometry(`Score: ${this.score}`, {
      font: this.font,
      size: 1,
      height: 0.1,
    });

    const textMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);


    // Add new text mesh to the container
    this.scoreText.add(textMesh);

    // Position the container
    this.scoreText.position.set(0, 5, -200); // Adjust position as needed
  }

  onBrickDestroyed(brick) {
    this.score += 10;
    this.updateScoreText();
    //console.log(`Score: ${this.score}`)
  }

  getScoreText() {
    return this.scoreText;
  }

  update() {
    this.updateScoreText();
  }

}