import Phaser from 'phaser';
import {
  TILE, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT,
  SCENE, SCOTT_START_WORLD_X, SCOTT_START_WORLD_Y,
} from '../constants';
import { Bike }             from '../objects/Bike';
import { Chaser }           from '../objects/Chaser';
import { TrickSystem }      from '../systems/TrickSystem';
import { generateMap, RAMP_ZONES } from '../data/mapData';
import { ATTRACTIONS, Attraction, attractionWorldX, attractionWorldY } from '../data/attractions';
import { getLevelConfig, MAX_LEVEL } from '../data/levels';
import SaveManager          from '../utils/SaveManager';

const CATCH_RADIUS = 40;
const VISIT_RADIUS = 96;

interface GameData { bikeId: string; level: number; }

export class GameScene extends Phaser.Scene {
  private bike!:        Bike;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private cursors!:     Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!:    Phaser.Input.Keyboard.Key;
  private escKey!:      Phaser.Input.Keyboard.Key;
  private trickSystem!: TrickSystem;

  private score             = 0;
  private startTime         = 0;
  private visitedSet        = new Set<string>();
  private currentLevel      = 1;
  private activeAttractions: Attraction[] = [];

  private shamrocks!: Phaser.Physics.Arcade.StaticGroup;
  private rampZones!: Phaser.Physics.Arcade.StaticGroup;
  private chasers:    Chaser[] = [];
  private caught      = false;

  // Weather
  private weatherTimer   = 0;
  private weatherEffects = ['☀️ Lovely Day!', '🌧️ Grand soft day!', '💨 Windy enough!', '🌤️ Grand', '🌦️ Showers!'];
  private currentWeather = '☀️ Lovely Day!';
  private windX = 0;
  private windY = 0;

  constructor() { super({ key: SCENE.GAME }); }

  create(data: GameData): void {
    this.currentLevel = data.level ?? 1;
    const lvl = getLevelConfig(this.currentLevel);
    this.activeAttractions = ATTRACTIONS.filter(a => lvl.attractionIds.includes(a.id));

    SaveManager.clearStamps();
    this.score      = 0;
    this.startTime  = this.time.now;
    this.visitedSet = new Set();
    this.caught     = false;
    this.chasers    = [];

    this.buildTilemap();
    this.buildBike(data.bikeId);
    this.buildSkatepark();
    this.buildAttractions();
    this.buildRamps();
    this.buildShamrocks();
    this.buildChasers();
    this.buildCollisions();
    this.setupCamera();
    this.setupInput();

    this.trickSystem = new TrickSystem(this);

    this.bike.onTrick = (result) => {
      this.score += result.score;
      this.trickSystem.showTrick(result, this.bike.x, this.bike.y);
    };

    this.cameras.main.fadeIn(600);
    this.showWelcome(lvl.name, lvl.subtitle, this.activeAttractions.length, lvl.chasers.length);
    this.scene.launch(SCENE.UI, { gameScene: this });
    this.weatherTimer = 15000;

    this.time.delayedCall(100, () => {
      this.events.emit('score',  this.score);
      this.events.emit('stamps', [...this.visitedSet]);
      this.events.emit('bikeId', data.bikeId);
      this.events.emit('level',  this.currentLevel);
    });
  }

  // ── Build helpers ─────────────────────────────────────────────────────────

  private buildTilemap(): void {
    const tileData   = generateMap(this.currentLevel);
    const map        = this.make.tilemap({ data: tileData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset    = map.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE, 0, 0)!;
    this.groundLayer = map.createLayer(0, tileset, 0, 0)!;
    this.groundLayer.setCollision([TILE.BUILDING, TILE.WATER]);
    this.groundLayer.setDepth(0);
  }

  private buildBike(bikeId: string): void {
    this.bike = new Bike(this, SCOTT_START_WORLD_X, SCOTT_START_WORLD_Y, bikeId);
    this.add.existing(this.bike);
    this.physics.add.existing(this.bike);
    (this.bike.body as Phaser.Physics.Arcade.Body)
      .setSize(24, 38)
      .setOffset(20, 13)
      .setCollideWorldBounds(true);
    this.bike.setDepth(10);
  }

  private buildSkatepark(): void {
    const sx = 16 * TILE_SIZE + TILE_SIZE / 2;
    const sy = 28 * TILE_SIZE + TILE_SIZE / 2;
    this.add.image(sx, sy, 'skatepark').setDepth(2);
    this.add.text(sx, sy - 76, '🛹 Fitzgerald Skate Park', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd60a', stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000088', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(9);
  }

  private buildAttractions(): void {
    for (const att of this.activeAttractions) {
      const wx = attractionWorldX(att);
      const wy = attractionWorldY(att);

      const marker = this.add.image(wx, wy, `marker_${att.id}`).setDepth(8);
      this.tweens.add({
        targets: marker, scaleX: 1.25, scaleY: 1.25,
        duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      this.add.text(wx, wy + 48, att.shortName, {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000000', strokeThickness: 3,
        backgroundColor: '#00000077', padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(9);
    }
  }

  private buildRamps(): void {
    this.rampZones = this.physics.add.staticGroup();
    for (const rz of RAMP_ZONES) {
      const wx = rz.col * TILE_SIZE + TILE_SIZE / 2;
      const wy = rz.row * TILE_SIZE + TILE_SIZE / 2;
      if (!rz.label.startsWith('Skate Park')) {
        this.add.image(wx + 20, wy, 'ramp').setDepth(2).setAlpha(0.85);
      }
      const zone = this.add.rectangle(wx, wy, 80, 60, 0xffd60a, 0).setDepth(1);
      this.physics.add.existing(zone, true);
      this.rampZones.add(zone);
    }
  }

  private buildShamrocks(): void {
    this.shamrocks = this.physics.add.staticGroup();
    const positions = [
      [41,10],[41,22],[41,30],[41,44],[41,50],
      [20,25],[20,43],
      [8,38],
      [10,5],[35,5],[60,5],
      [10,18],[55,18],
      [12,35],[52,35],
    ];
    for (const [col, row] of positions) {
      const wx = col * TILE_SIZE + TILE_SIZE / 2;
      const wy = row * TILE_SIZE + TILE_SIZE / 2;
      const s  = this.shamrocks.create(wx, wy, 'shamrock') as Phaser.Physics.Arcade.Image;
      s.setDepth(3);
      this.tweens.add({
        targets: s, y: wy - 8, duration: 600 + Math.random() * 400,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  private buildChasers(): void {
    const lvl = getLevelConfig(this.currentLevel);
    for (const def of lvl.chasers) {
      const c = new Chaser(
        this, def.startCol, def.startRow,
        def.key, def.name, def.catchMsg,
        def.speed, this.groundLayer,
      );
      this.chasers.push(c);
    }
  }

  private buildCollisions(): void {
    this.physics.add.collider(this.bike, this.groundLayer, () => {
      (this.bike.body as Phaser.Physics.Arcade.Body).velocity.scale(0.25);
    });
    this.physics.add.overlap(this.bike, this.shamrocks, (_b, s) => {
      (s as Phaser.GameObjects.Image).destroy();
      this.score += 25;
      this.showFloatingText(this.bike.x, this.bike.y - 30, '+25 🍀', '#52b788');
    });
    this.physics.add.overlap(this.bike, this.rampZones, () => {
      if (!this.bike.isJumping && Math.abs(this.bike.speed) > 70) {
        this.bike.launchJump();
      }
    });
  }

  private setupCamera(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1.4);
    this.cameras.main.centerOn(this.bike.x, this.bike.y);
    this.cameras.main.startFollow(this.bike, true, 0.12, 0.12);
  }

  private setupInput(): void {
    this.cursors  = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey   = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  // ── Update loop ───────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    if (this.caught) return;

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToShop();
      return;
    }

    this.bike.update(this.cursors, this.spaceKey, delta);
    this.applyTileSpeedUnderBike();
    this.applyWindForce();
    this.updateWeather(delta);
    this.checkAttractionProximity();

    const elapsed = this.getElapsedSeconds();
    for (const chaser of this.chasers) {
      chaser.update(this.bike.x, this.bike.y, delta, elapsed);
      if (chaser.distanceTo(this.bike.x, this.bike.y) < CATCH_RADIUS) {
        this.caughtByChaser(chaser);
        return;
      }
    }

    this.events.emit('score',  this.score);
    this.events.emit('speed',  Math.abs(this.bike.speed));
    this.events.emit('combo',  this.bike.combo);
    this.events.emit('bikePos', { x: this.bike.x, y: this.bike.y });
  }

  private applyTileSpeedUnderBike(): void {
    const tile = this.groundLayer.getTileAtWorldXY(this.bike.x, this.bike.y);
    if (tile) this.bike.applyTileSpeed(tile.index);
  }

  private applyWindForce(): void {
    if (this.windX === 0 && this.windY === 0) return;
    const body = this.bike.body as Phaser.Physics.Arcade.Body;
    body.velocity.x += this.windX * 0.04;
    body.velocity.y += this.windY * 0.04;
  }

  private updateWeather(delta: number): void {
    this.weatherTimer -= delta;
    if (this.weatherTimer > 0) return;
    this.weatherTimer = 20000 + Math.random() * 20000;
    const prev = this.currentWeather;
    while (this.currentWeather === prev) {
      this.currentWeather = this.weatherEffects[Math.floor(Math.random() * this.weatherEffects.length)];
    }
    this.windX = this.currentWeather.includes('💨') ? (Math.random() - 0.5) * 30 : 0;
    this.windY = this.currentWeather.includes('💨') ? (Math.random() - 0.5) * 20 : 0;
    this.events.emit('weather', this.currentWeather);
  }

  private checkAttractionProximity(): void {
    for (const att of this.activeAttractions) {
      if (this.visitedSet.has(att.id)) continue;
      const dist = Phaser.Math.Distance.Between(
        this.bike.x, this.bike.y,
        attractionWorldX(att), attractionWorldY(att),
      );
      if (dist < VISIT_RADIUS) this.visitAttraction(att.id);
    }
  }

  private visitAttraction(id: string): void {
    const att = this.activeAttractions.find(a => a.id === id)!;
    this.visitedSet.add(id);
    SaveManager.addStamp(id);
    this.score += att.points;

    this.cameras.main.shake(300, 0.012);
    this.cameras.main.flash(200, 255, 220, 50, false);

    const txt = this.add.text(
      this.bike.x, this.bike.y - 60,
      `${att.emoji}  STAMP!\n${att.name}\n+${att.points} pts`,
      {
        fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#ffd60a', stroke: '#000000', strokeThickness: 5,
        align: 'center', backgroundColor: '#00000099',
        padding: { x: 12, y: 8 },
      },
    ).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: txt, y: txt.y - 90, alpha: 0,
      duration: 2200, ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });

    this.time.delayedCall(600, () =>
      this.showFloatingText(this.bike.x, this.bike.y - 20, att.visitMsg, '#ffffff'),
    );

    this.events.emit('stamps', [...this.visitedSet]);
    this.events.emit('score',  this.score);

    if (this.visitedSet.size >= this.activeAttractions.length) {
      this.time.delayedCall(2500, () => this.gameComplete());
    }
  }

  private caughtByChaser(chaser: Chaser): void {
    this.caught = true;
    this.scene.stop(SCENE.UI);

    (this.bike.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.cameras.main.stopFollow();
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(250, 255, 0, 0, false);

    const W  = this.scale.width;
    const H  = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    const overlay = this.add.rectangle(cx, cy, W, H, 0x000000, 0)
      .setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: overlay, alpha: 0.78, duration: 700 });

    this.add.text(cx, cy - 80, '🚨 CAUGHT! 🚨', {
      fontSize: '38px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff4444', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    this.add.text(cx, cy - 28, chaser.chaserName, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd60a', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    this.add.text(cx, cy + 14, `"${chaser.catchMsg}"`, {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'italic',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    this.add.text(cx, cy + 58, `Score: ${this.score.toLocaleString()} pts  ·  Level ${this.currentLevel}`, {
      fontSize: '15px', fontFamily: 'Arial', color: '#cccccc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    const bikeId = this.bike.bikeId;
    const level  = this.currentLevel;

    const btnRetry = this.add.text(cx - 120, cy + 108, '[ TRY AGAIN ]', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#52b788', stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000088', padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    btnRetry.on('pointerover', () => btnRetry.setColor('#ffffff'));
    btnRetry.on('pointerout',  () => btnRetry.setColor('#52b788'));
    btnRetry.on('pointerdown', () => this.scene.start(SCENE.GAME, { bikeId, level }));

    const btnShop = this.add.text(cx + 110, cy + 108, '[ CHANGE BIKE ]', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#2a78c7', stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000088', padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    btnShop.on('pointerover', () => btnShop.setColor('#ffffff'));
    btnShop.on('pointerout',  () => btnShop.setColor('#2a78c7'));
    btnShop.on('pointerdown', () => this.scene.start(SCENE.SHOP, { level }));

    this.input.keyboard!.once('keydown-ENTER', () => this.scene.start(SCENE.GAME, { bikeId, level }));
    this.input.keyboard!.once('keydown-ESC',   () => this.scene.start(SCENE.SHOP, { level }));
  }

  private gameComplete(): void {
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.scene.stop(SCENE.UI);
    this.scene.start(SCENE.PASSPORT, {
      score: this.score, stamps: [...this.visitedSet],
      bikeId: this.bike.bikeId, elapsedSec: elapsed,
      level: this.currentLevel,
    });
  }

  private returnToShop(): void {
    this.scene.stop(SCENE.UI);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () =>
      this.scene.start(SCENE.SHOP, { level: this.currentLevel }),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private showWelcome(levelName: string, subtitle: string, attCount: number, chaserCount: number): void {
    const chaserLine = chaserCount === 0
      ? "No family around — enjoy the freedom! 🎉"
      : `Watch out! ${chaserCount} family member${chaserCount > 1 ? 's are' : ' is'} after you!`;

    const msg = this.add.text(
      SCOTT_START_WORLD_X, SCOTT_START_WORLD_Y - 130,
      `${levelName}: ${subtitle}\nVisit ${attCount} attractions!\n${chaserLine}`,
      {
        fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000000', strokeThickness: 4,
        backgroundColor: '#00000099', padding: { x: 16, y: 10 },
        align: 'center',
      },
    ).setDepth(70).setOrigin(0.5);

    this.time.delayedCall(4500, () => {
      this.tweens.add({ targets: msg, alpha: 0, duration: 800, onComplete: () => msg.destroy() });
    });
  }

  showFloatingText(x: number, y: number, text: string, color: string): void {
    const t = this.add.text(x, y, text, {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3, align: 'center',
    }).setOrigin(0.5).setDepth(55);

    this.tweens.add({
      targets: t, y: y - 55, alpha: 0, duration: 1100,
      ease: 'Cubic.easeOut', onComplete: () => t.destroy(),
    });
  }

  getElapsedSeconds(): number {
    return Math.floor((this.time.now - this.startTime) / 1000);
  }

  getCurrentLevel(): number { return this.currentLevel; }
}
