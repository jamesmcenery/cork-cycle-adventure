import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENE, WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE } from '../constants';
import { ATTRACTIONS, attractionWorldX, attractionWorldY } from '../data/attractions';
import { GameScene } from './GameScene';

interface UIData { gameScene: GameScene; level: number; }

export class UIScene extends Phaser.Scene {
  private scoreText!:    Phaser.GameObjects.Text;
  private timeText!:     Phaser.GameObjects.Text;
  private speedText!:    Phaser.GameObjects.Text;
  private comboText!:    Phaser.GameObjects.Text;
  private weatherText!:  Phaser.GameObjects.Text;
  private bikeText!:     Phaser.GameObjects.Text;
  private levelText!:    Phaser.GameObjects.Text;
  private stampDots:     Phaser.GameObjects.Text[] = [];
  private trickBanner!:  Phaser.GameObjects.Text;
  private trickTween:    Phaser.Tweens.Tween | null = null;
  private miniDot!:      Phaser.GameObjects.Image;
  private chaserDots:    Phaser.GameObjects.Arc[] = [];
  private attDots:       Phaser.GameObjects.Graphics[] = [];
  private gameScene!:    GameScene;

  // Nearest-attraction compass
  private compassArrow!:    Phaser.GameObjects.Graphics;
  private compassLabel!:    Phaser.GameObjects.Text;
  private compassDist!:     Phaser.GameObjects.Text;
  private visitedIds:       string[] = [];
  private activeIds:        string[] = [];
  private currentPos        = { x: 0, y: 0 };

  // Controls hint (fades after first movement)
  private controlsHint!:    Phaser.GameObjects.Container;
  private hasMoved          = false;

  constructor() { super({ key: SCENE.UI }); }

  create(data: UIData): void {
    this.gameScene = data.gameScene;

    this.buildScorePanel();
    this.buildStampsPanel();
    this.buildTrickBanner();
    this.buildMiniMap();
    this.buildWeatherLabel();
    this.buildCompass();
    if (data.level === 1) this.buildControlsHint();

    const gs = this.scene.get(SCENE.GAME);
    gs.events.on('score',   (v: number)   => this.scoreText.setText(`🏆 ${v.toLocaleString()} pts`));
    gs.events.on('speed',   (v: number)   => { this.speedText.setText(`⚡ ${Math.round(v)} km/h`); if (v > 20 && !this.hasMoved) this.fadeControlsHint(); });
    gs.events.on('combo',   (v: number)   => this.updateCombo(v));
    gs.events.on('stamps',  (v: string[]) => { this.visitedIds = v; this.updateStamps(v); });
    gs.events.on('activeAttractions', (ids: string[]) => {
      this.activeIds = ids;
      this.rebuildStampDots(ids);
      this.buildMinimapAttractionDots(ids);
    });
    gs.events.on('chaserPositions', (positions: { x: number; y: number; tint: number }[]) => {
      // Grow/shrink chaser dot array to match
      while (this.chaserDots.length < positions.length) {
        const dot = this.add.circle(0, 0, 3, 0xff4444).setDepth(6);
        this.chaserDots.push(dot);
      }
      while (this.chaserDots.length > positions.length) {
        this.chaserDots.pop()!.destroy();
      }
      positions.forEach((p, i) => {
        const rx = (p.x / WORLD_WIDTH)  * 160;
        const ry = (p.y / WORLD_HEIGHT) * 120;
        this.chaserDots[i].setPosition(rx, GAME_HEIGHT - 120 + ry).setFillStyle(p.tint);
      });
    });
    gs.events.on('trick',   (r: { name: string; score: number }) => this.flashTrick(r));
    gs.events.on('weather', (w: string)   => this.weatherText.setText(w));
    gs.events.on('bikeId',  (id: string)  => this.bikeText.setText(`🚲 ${id.toUpperCase()}`));
    gs.events.on('level',   (v: number)   => this.levelText.setText(`LVL ${v}`));
    gs.events.on('bikePos', (p: { x: number; y: number }) => {
      this.currentPos = p;
      this.updateMiniDot(p);
      this.updateCompass(p);
    });

    this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        const s = this.gameScene.getElapsedSeconds();
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        this.timeText.setText(`⏱ ${m}:${sec}`);
      },
    });
  }

  // ── Top score bar ─────────────────────────────────────────────────────────
  private buildScorePanel(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.60);
    bg.fillRect(0, 0, GAME_WIDTH, 48);

    this.scoreText = this.add.text(10, 13, '🏆 0 pts', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd60a', stroke: '#000', strokeThickness: 3,
    });
    this.timeText = this.add.text(175, 13, '⏱ 00:00', {
      fontSize: '17px', fontFamily: 'Arial',
      color: '#ffffff', stroke: '#000', strokeThickness: 3,
    });
    this.speedText = this.add.text(320, 13, '⚡ 0 km/h', {
      fontSize: '17px', fontFamily: 'Arial',
      color: '#aaddff', stroke: '#000', strokeThickness: 3,
    });
    this.bikeText = this.add.text(480, 13, '🚲 BMX', {
      fontSize: '17px', fontFamily: 'Arial',
      color: '#ccffcc', stroke: '#000', strokeThickness: 3,
    });
    this.comboText = this.add.text(660, 13, '', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff9f1c', stroke: '#000', strokeThickness: 3,
    });
    this.levelText = this.add.text(GAME_WIDTH - 72, 13, 'LVL 1', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd60a', stroke: '#000', strokeThickness: 3,
    });
    this.add.text(GAME_WIDTH - 10, 13, 'ESC = Shop', {
      fontSize: '12px', fontFamily: 'Arial', color: '#666',
    }).setOrigin(1, 0);
  }

  // ── Bottom-right stamps row ───────────────────────────────────────────────
  private buildStampsPanel(): void {
    const panW = 240, panH = 52;
    const px = GAME_WIDTH - panW;
    const py = GAME_HEIGHT - panH;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.60);
    bg.fillRect(px, py, panW, panH);

    this.add.text(px + 8, py + 6, 'PASSPORT STAMPS', {
      fontSize: '10px', fontFamily: 'Arial', color: '#888',
    });

    for (let i = 0; i < ATTRACTIONS.length; i++) {
      const x = px + 10 + i * 27;
      const y = py + 32;
      const dot = this.add.text(x, y, '○', {
        fontSize: '19px', fontFamily: 'Arial', color: '#444',
      }).setOrigin(0, 0.5);
      this.stampDots.push(dot);
    }
  }

  // ── Trick name banner (centre top) ───────────────────────────────────────
  private buildTrickBanner(): void {
    this.trickBanner = this.add.text(GAME_WIDTH / 2, 75, '', {
      fontSize: '26px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd60a', stroke: '#000', strokeThickness: 5, align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(80);
  }

  // ── Mini-map (bottom-left) ────────────────────────────────────────────────
  private buildMiniMap(): void {
    this.add.image(80, GAME_HEIGHT - 60, 'minimap_bg');
    this.miniDot = this.add.image(80, GAME_HEIGHT - 60, 'minimap_dot').setDepth(5);

    // Attraction dots drawn later via rebuildStampDots / activeAttractions event

    this.add.text(5, GAME_HEIGHT - 122, 'MAP', {
      fontSize: '10px', fontFamily: 'Arial', color: '#888',
    });
  }

  private buildMinimapAttractionDots(activeIds: string[]): void {
    this.attDots.forEach(d => d.destroy());
    this.attDots = [];
    for (const att of ATTRACTIONS.filter(a => activeIds.includes(a.id))) {
      const rx = (attractionWorldX(att) / WORLD_WIDTH)  * 160;
      const ry = (attractionWorldY(att) / WORLD_HEIGHT) * 120;
      const dot = this.add.graphics().setDepth(4);
      dot.fillStyle(att.stamptint, 0.9);
      dot.fillCircle(rx, GAME_HEIGHT - 120 + ry, 2);
      this.attDots.push(dot);
    }
  }

  // ── Weather label (bottom centre) ────────────────────────────────────────
  private buildWeatherLabel(): void {
    this.weatherText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, '☀️ Lovely Day!', {
      fontSize: '13px', fontFamily: 'Arial',
      color: '#ffffcc', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1);
  }

  // ── Nearest-attraction compass (right side) ───────────────────────────────
  private buildCompass(): void {
    const cx = GAME_WIDTH - 48;
    const cy = 130;

    // Background circle
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.55);
    bg.fillCircle(cx, cy, 38);
    bg.lineStyle(2, 0xffd60a, 0.8);
    bg.strokeCircle(cx, cy, 38);

    this.add.text(cx, cy - 50, 'NEXT', {
      fontSize: '10px', fontFamily: 'Arial', color: '#aaa', align: 'center',
    }).setOrigin(0.5);

    // Rotating arrow drawn with Graphics
    this.compassArrow = this.add.graphics();
    this.compassArrow.setPosition(cx, cy);

    this.compassLabel = this.add.text(cx, cy + 46, '', {
      fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd60a', stroke: '#000', strokeThickness: 2, align: 'center',
      wordWrap: { width: 100 },
    }).setOrigin(0.5);

    this.compassDist = this.add.text(cx, cy + 60, '', {
      fontSize: '10px', fontFamily: 'Arial', color: '#cccccc', align: 'center',
    }).setOrigin(0.5);
  }

  // ── Controls hint (bottom-centre, fades on first movement) ───────────────
  private buildControlsHint(): void {
    const lines = [
      '↑  Ride forward      ↓  Brake',
      '←  →  Steer          ESC  Back to shop',
      'SPACE  Wheelie   SPACE + ↑↓←→  Air tricks on ramps',
    ];

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.70);
    bg.fillRoundedRect(GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 + 30, 440, 74, 10);
    bg.lineStyle(1, 0xffd60a, 0.5);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 + 30, 440, 74, 10);

    const texts = lines.map((line, i) =>
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 46 + i * 20, line, {
        fontSize: '13px', fontFamily: 'Arial', color: '#ffffff',
        stroke: '#000', strokeThickness: 2, align: 'center',
      }).setOrigin(0.5),
    );

    const header = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 33, 'CONTROLS', {
      fontSize: '11px', fontFamily: 'Arial', color: '#ffd60a',
    }).setOrigin(0.5);

    this.controlsHint = this.add.container(0, 0, [bg, header, ...texts]);

    // Auto-fade after 6 seconds regardless
    this.time.delayedCall(6000, () => this.fadeControlsHint());
  }

  private fadeControlsHint(): void {
    if (this.hasMoved) return;
    this.hasMoved = true;
    this.tweens.add({
      targets: this.controlsHint,
      alpha: 0,
      duration: 600,
      onComplete: () => this.controlsHint.destroy(),
    });
  }

  // ── Combo display ─────────────────────────────────────────────────────────
  private updateCombo(count: number): void {
    if (count > 1) {
      this.comboText.setText(`${count}x COMBO!`);
      this.comboText.setColor(count > 3 ? '#ff4444' : '#ff9f1c');
    } else {
      this.comboText.setText('');
    }
  }

  // ── Stamp dots ────────────────────────────────────────────────────────────
  private updateStamps(ids: string[]): void {
    this.stampDots.forEach((dot, i) => {
      const attId = this.activeIds[i];
      if (attId && ids.includes(attId)) {
        dot.setText('●').setColor('#ffd60a');
        this.tweens.add({ targets: dot, scaleX: 1.6, scaleY: 1.6, duration: 220, yoyo: true });
      }
    });
  }

  // ── Trick banner ──────────────────────────────────────────────────────────
  private flashTrick(result: { name: string; score: number }): void {
    if (this.trickTween) this.trickTween.stop();
    this.trickBanner.setText(`${result.name}   +${result.score.toLocaleString()}`).setAlpha(1);
    this.trickTween = this.tweens.add({ targets: this.trickBanner, alpha: 0, delay: 1400, duration: 500 });
  }

  // ── Mini-map dot ──────────────────────────────────────────────────────────
  private updateMiniDot(pos: { x: number; y: number }): void {
    const rx = (pos.x / WORLD_WIDTH)  * 160;
    const ry = (pos.y / WORLD_HEIGHT) * 120;
    this.miniDot.setPosition(rx, GAME_HEIGHT - 120 + ry);
  }

  // ── Rebuild stamp dots to match only the active attractions ─────────────
  private rebuildStampDots(activeIds: string[]): void {
    this.stampDots.forEach(d => d.destroy());
    this.stampDots = [];

    const panW = 240 + Math.max(0, activeIds.length - 8) * 20;
    const panH = 52;
    const px   = GAME_WIDTH - panW;
    const py   = GAME_HEIGHT - panH;

    for (let i = 0; i < activeIds.length; i++) {
      const x   = px + 10 + i * Math.min(27, (panW - 20) / activeIds.length);
      const dot = this.add.text(x, py + 32, '○', {
        fontSize: '19px', fontFamily: 'Arial', color: '#444',
      }).setOrigin(0, 0.5);
      this.stampDots.push(dot);
    }
  }

  // ── Compass pointing to nearest unvisited ACTIVE attraction ──────────────
  private updateCompass(pos: { x: number; y: number }): void {
    const remaining = ATTRACTIONS.filter(a =>
      this.activeIds.includes(a.id) && !this.visitedIds.includes(a.id)
    );
    if (remaining.length === 0) {
      this.compassArrow.clear();
      this.compassLabel.setText('ALL DONE! 🏆');
      this.compassDist.setText('');
      return;
    }

    // Find nearest
    let nearest = remaining[0];
    let minDist = Infinity;
    for (const att of remaining) {
      const dx = attractionWorldX(att) - pos.x;
      const dy = attractionWorldY(att) - pos.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) { minDist = d; nearest = att; }
    }

    // Angle from Scott to attraction
    const dx    = attractionWorldX(nearest) - pos.x;
    const dy    = attractionWorldY(nearest) - pos.y;
    const angle = Math.atan2(dy, dx);

    // Draw rotating arrow
    this.compassArrow.clear();
    const len = 26;
    const tipX  = Math.cos(angle) * len;
    const tipY  = Math.sin(angle) * len;
    const left  = angle + (2.4);
    const right = angle - (2.4);
    const baseLen = 12;

    this.compassArrow.fillStyle(nearest.stamptint, 1);
    this.compassArrow.beginPath();
    this.compassArrow.moveTo(tipX, tipY);
    this.compassArrow.lineTo(Math.cos(left) * baseLen, Math.sin(left) * baseLen);
    this.compassArrow.lineTo(Math.cos(right) * baseLen, Math.sin(right) * baseLen);
    this.compassArrow.closePath();
    this.compassArrow.fillPath();

    // Centre dot
    this.compassArrow.fillStyle(0xffffff, 0.8);
    this.compassArrow.fillCircle(0, 0, 4);

    // Labels
    this.compassLabel.setText(nearest.emoji + ' ' + nearest.shortName);
    const distTiles = Math.round(minDist / TILE_SIZE);
    this.compassDist.setText(`~${distTiles} tiles`);
  }
}
