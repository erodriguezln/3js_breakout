import * as THREE from 'three';
import { EventType } from './eventTypes.js';

export class SoundManager {
  constructor(eventSystem) {
    this.audioListener = new THREE.AudioListener();
    this.audioLoader = new THREE.AudioLoader();
    this.sounds = {};

    this.loadSound('collision', '/ball-tap.wav', this.audioListener);

    eventSystem.subscribe(EventType.BALL_HIT_WALL, this.playSoundHitBrick.bind(this));
    eventSystem.subscribe(EventType.BALL_HIT_BRICK, this.playSoundHitBrick.bind(this));
  }

  getAudioLoader() {
    return this.audioLoader;
  }

  loadSound(name, path, audioListener) {
    this.audioLoader.load(path, (buffer) => {
      this.sounds[name] = new THREE.Audio(audioListener);
      this.sounds[name].setBuffer(buffer);
    });
  }

  playSound(name) {
    //if (this.sounds[name] && !this.sounds[name].isPlaying) {
    if (this.sounds[name]) {
      this.sounds[name].play();
    }
  }

  playSoundHitBrick(){
    const sound = this.sounds['collision'];
    if(sound.isPlaying){
      sound.stop()
    }
      sound.play()
  }
}