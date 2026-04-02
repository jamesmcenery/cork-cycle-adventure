import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENE } from '../constants';
import { ATTRACTIONS } from '../data/attractions';
import { getLevelConfig, MAX_LEVEL } from '../data/levels';
import SaveManager from '../utils/SaveManager';

interface PassportData {
  score:      number;
  stamps:     string[];
  bikeId:     string;
  elapsedSec: number;
  level:      number;
}

export class PassportScene extends Phaser.Scene {
  constructor() { super({ key: SCENE.PASSPORT }); }

  create(data: PassportData): void {
    // Dim background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Passport page
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'passport_bg');

    // Confetti burst
    this.spawnConfetti();

    // Header
    const isGameWon = data.level >= MAX_LEVEL;
    const headerTxt = isGameWon ? '🏆 CORK CONQUERED! 🏆' : `🏆 LEVEL ${data.level} COMPLETE! 🏆`;
    this.add.text(GAME_WIDTH / 2, 38, headerTxt, {
      fontSize:   '26px', fontFamily: 'Arial', fontStyle: 'bold',
      color:      '#ffd60a', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    const lvlCfg = getLevelConfig(data.level);
    this.add.text(GAME_WIDTH / 2, 64, lvlCfg.subtitle, {
      fontSize:   '14px', fontFamily: 'Arial', fontStyle: 'italic',
      color:      '#aaddff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Score & time
    const mins = Math.floor(data.elapsedSec / 60).toString().padStart(2, '0');
    const secs = (data.elapsedSec % 60).toString().padStart(2, '0');
    this.add.text(GAME_WIDTH / 2, 84, `Score: ${data.score.toLocaleString()} pts   Time: ${mins}:${secs}`, {
      fontSize:   '15px', fontFamily: 'Arial',
      color:      '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Stamps grid — only show attractions for this level
    const activeAtts = ATTRACTIONS.filter(a => lvlCfg.attractionIds.includes(a.id));
    const cols   = 4;
    const startX = GAME_WIDTH / 2 - (cols - 1) * 80 - 40;
    activeAtts.forEach((att, i) => {
      const col   = i % cols;
      const row   = Math.floor(i / cols);
      const x     = startX + col * 160;
      const y     = 204 + row * 105;
      const got   = data.stamps.includes(att.id);
      const color = '#' + att.stamptint.toString(16).padStart(6, '0');

      // Stamp circle
      const g = this.add.graphics();
      g.fillStyle(got ? att.stamptint : 0x333333, got ? 1 : 0.5);
      g.fillCircle(x, y, 36);
      g.lineStyle(2, got ? 0xffd60a : 0x666666, 1);
      g.strokeCircle(x, y, 38);

      // Emoji
      this.add.text(x, y - 4, att.emoji, {
        fontSize: '28px', fontFamily: 'Arial',
      }).setOrigin(0.5);

      // Name
      this.add.text(x, y + 46, att.shortName, {
        fontSize:   '11px',
        fontFamily: 'Arial',
        color:      got ? color : '#555555',
        fontStyle:  got ? 'bold' : 'normal',
        align:      'center',
        wordWrap:   { width: 120 },
      }).setOrigin(0.5);

      // Tick / cross
      if (got) {
        this.add.text(x + 28, y - 28, '✓', {
          fontSize: '16px', fontFamily: 'Arial', color: '#00ff88',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5);
      }
    });

    // Save score
    this.promptNameEntry(data);

    // Buttons
    this.buildButtons(data.bikeId, data.level ?? 1);
  }

  private promptNameEntry(data: PassportData): void {
    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 130, 'Enter your name for the leaderboard:', {
      fontSize: '14px', fontFamily: 'Arial', color: '#cccccc',
    }).setOrigin(0.5);

    // HTML input overlay
    const el = this.add.dom(GAME_WIDTH / 2, GAME_HEIGHT - 105).createFromHTML(
      '<input id="nameInput" type="text" maxlength="12" placeholder="SCOTT" ' +
      'style="font-size:18px;padding:6px 12px;width:160px;border-radius:8px;' +
      'border:2px solid #ffd60a;background:#111;color:#ffd60a;text-align:center;" />'
    );

    const saveBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 75, '[ SAVE SCORE ]', {
      fontSize:   '16px',
      fontFamily: 'Arial',
      fontStyle:  'bold',
      color:      '#ffd60a',
      stroke:     '#000000',
      strokeThickness: 3,
      backgroundColor: '#00000088',
      padding:    { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    saveBtn.on('pointerover', () => saveBtn.setColor('#ffffff'));
    saveBtn.on('pointerout',  () => saveBtn.setColor('#ffd60a'));
    saveBtn.on('pointerdown', () => {
      const input = document.getElementById('nameInput') as HTMLInputElement;
      const name  = (input?.value || 'SCOTT').toUpperCase().slice(0, 12);
      SaveManager.addScore({
        name,
        score:  data.score,
        bikeId: data.bikeId,
        date:   new Date().toLocaleDateString('en-IE'),
      });
      el.destroy();
      label.destroy();
      saveBtn.destroy();
      this.showLeaderboard();
    });
  }

  private showLeaderboard(): void {
    const scores = SaveManager.getScores().slice(0, 5);
    if (scores.length === 0) return;

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 135, '🏆 TOP SCORES', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffd60a',
    }).setOrigin(0.5);

    scores.forEach((s, i) => {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 110 + i * 18,
        `${i + 1}. ${s.name.padEnd(12)} ${s.score.toLocaleString().padStart(8)} — ${s.bikeId} — ${s.date}`,
        {
          fontSize: '13px', fontFamily: 'Courier New', color: i === 0 ? '#ffd60a' : '#cccccc',
        },
      ).setOrigin(0.5);
    });
  }

  private buildButtons(bikeId: string, level: number): void {
    const isGameWon  = level >= MAX_LEVEL;
    const nextLevel  = level + 1;

    // Next Level / Play Again button
    const mainLabel  = isGameWon ? '[ PLAY AGAIN (LVL 1) ]' : `[ NEXT LEVEL → LVL ${nextLevel} ]`;
    const mainColor  = isGameWon ? '#ffd60a' : '#52b788';
    const mainBtn = this.add.text(GAME_WIDTH / 2 - 120, GAME_HEIGHT - 30, mainLabel, {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold',
      color: mainColor, stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000088', padding: { x: 10, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    mainBtn.on('pointerover', () => mainBtn.setColor('#ffffff'));
    mainBtn.on('pointerout',  () => mainBtn.setColor(mainColor));
    mainBtn.on('pointerdown', () => {
      SaveManager.clearStamps();
      this.scene.start(SCENE.GAME, { bikeId, level: isGameWon ? 1 : nextLevel });
    });

    // Change Bike button (keeps same level)
    const shopBtn = this.add.text(GAME_WIDTH / 2 + 120, GAME_HEIGHT - 30, '[ CHANGE BIKE ]', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#2a78c7', stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000088', padding: { x: 10, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    shopBtn.on('pointerover', () => shopBtn.setColor('#ffffff'));
    shopBtn.on('pointerout',  () => shopBtn.setColor('#2a78c7'));
    shopBtn.on('pointerdown', () => this.scene.start(SCENE.SHOP, { level: isGameWon ? 1 : nextLevel }));
  }

  private spawnConfetti(): void {
    const colors = ['#ffd60a', '#e63946', '#52b788', '#2a78c7', '#ff9f1c'];
    for (let i = 0; i < 60; i++) {
      const x  = Math.random() * GAME_WIDTH;
      const g  = this.add.rectangle(x, -20, 8, 8, parseInt(colors[i % colors.length].slice(1), 16)).setDepth(90);
      this.tweens.add({
        targets:  g,
        y:        GAME_HEIGHT + 20,
        x:        x + (Math.random() - 0.5) * 200,
        angle:    Math.random() * 720,
        delay:    Math.random() * 2000,
        duration: 2000 + Math.random() * 2000,
        ease:     'Quad.easeIn',
        onComplete: () => g.destroy(),
      });
    }
  }
}
