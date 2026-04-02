import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENE } from '../constants';

export class TitleScene extends Phaser.Scene {
  private scottBike!: Phaser.GameObjects.Image;

  constructor() { super({ key: SCENE.TITLE }); }

  create(): void {
    // Background skyline
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'skyline');

    // Logo panel
    this.add.image(GAME_WIDTH / 2, 140, 'logo_panel');

    // Title text
    this.add.text(GAME_WIDTH / 2, 100, 'CORK CYCLE ADVENTURE', {
      fontSize:   '42px',
      fontFamily: 'Arial',
      fontStyle:  'bold',
      color:      '#ffd60a',
      stroke:     '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 152, 'Starring: SCOTT', {
      fontSize:   '22px',
      fontFamily: 'Arial',
      fontStyle:  'italic',
      color:      '#ffffff',
      stroke:     '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 180, 'Explore Cork City on two wheels!', {
      fontSize:   '16px',
      fontFamily: 'Arial',
      color:      '#aaddff',
      stroke:     '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Animated Scott bike (cycles across the bottom)
    this.scottBike = this.add.image(-60, 520, 'bike_bmx').setScale(1.4);
    this.tweens.add({
      targets:  this.scottBike,
      x:        GAME_WIDTH + 60,
      duration: 4000,
      ease:     'Linear',
      repeat:   -1,
    });

    // Blinking "Press Enter" prompt
    const prompt = this.add.text(GAME_WIDTH / 2, 300, '🚲  PRESS ENTER OR CLICK TO RIDE!', {
      fontSize:   '24px',
      fontFamily: 'Arial',
      fontStyle:  'bold',
      color:      '#ffffff',
      stroke:     '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets:  prompt,
      alpha:    0.1,
      duration: 700,
      yoyo:     true,
      repeat:   -1,
    });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 380, [
      '🏁  Visit all 8 Cork attractions',
      '⬆⬇⬅➡  Arrow keys to ride',
      '⎵  Space + arrow for TRICKS',
      '🏆  Collect stamps for your passport',
    ].join('     '), {
      fontSize:   '13px',
      fontFamily: 'Arial',
      color:      '#ccffcc',
      align:      'center',
      wordWrap:   { width: GAME_WIDTH - 80 },
    }).setOrigin(0.5);

    // Bike selection hint
    this.add.text(GAME_WIDTH / 2, 430, '5 bikes to choose from — pick your style at The Bike Shed!', {
      fontSize:   '15px',
      fontFamily: 'Arial',
      color:      '#ffd60a',
      stroke:     '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // High score snippet
    this.showHighScore();

    // Input
    const enter = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enter.once('down', this.startGame, this);
    this.input.once('pointerdown', this.startGame, this);
  }

  private showHighScore(): void {
    try {
      const scores = JSON.parse(localStorage.getItem('cca_scores') ?? '[]') as Array<{ name: string; score: number }>;
      if (scores.length > 0) {
        const top = scores[0];
        this.add.text(GAME_WIDTH / 2, 470, `🏆 Best: ${top.name} — ${top.score.toLocaleString()} pts`, {
          fontSize:   '14px',
          fontFamily: 'Arial',
          color:      '#ffd60a',
          stroke:     '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);
      }
    } catch { /* nothing */ }
  }

  private startGame(): void {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE.SHOP, { level: 1 });
    });
  }
}
