import Phaser from 'phaser';
import { TextureFactory } from '../utils/TextureFactory';
import { SCENE } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: SCENE.BOOT }); }

  create(): void {
    // All textures are generated programmatically — no external files needed
    new TextureFactory(this).createAll();
    this.scene.start(SCENE.TITLE);
  }
}
