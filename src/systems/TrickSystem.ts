import Phaser from 'phaser';
import { type TrickResult } from '../objects/Bike';

// Manages trick-text popups and the combo bar UI
export class TrickSystem {
  private scene:       Phaser.Scene;
  private popups:      Phaser.GameObjects.Text[] = [];
  private totalTricks  = 0;

  // The combo label lives in screen-space via the UI scene,
  // so we emit events on the scene's EventEmitter
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Call this from GameScene when the Bike emits a trick result */
  showTrick(result: TrickResult, worldX: number, worldY: number): void {
    this.totalTricks++;

    // Popup text in world space (floating up)
    const mult  = result.score > 300 ? '🔥' : result.score > 150 ? '⚡' : '';
    const label = `${mult}${result.name}\n+${result.score.toLocaleString()}`;

    const txt = this.scene.add.text(worldX, worldY - 30, label, {
      fontSize:   '22px',
      fontFamily: 'Arial',
      fontStyle:  'bold',
      color:      '#ffd60a',
      stroke:     '#000000',
      strokeThickness: 4,
      align:      'center',
    }).setOrigin(0.5, 1).setDepth(50);

    this.scene.tweens.add({
      targets:  txt,
      y:        worldY - 120,
      alpha:    0,
      duration: 1200,
      ease:     'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });

    this.popups.push(txt);

    // Combo starburst for high combos
    if (result.score > 400) {
      this.scene.cameras.main.shake(80, 0.006);
    }

    // Notify UI scene
    this.scene.events.emit('trick', result);
  }

  get count() { return this.totalTricks; }
}
